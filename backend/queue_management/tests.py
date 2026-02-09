from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from accounts.models import User
from queue_management.models import Office, Service, Queue


class QueueManagementAPITests(APITestCase):

    # ---------- SETUP ----------
    def setUp(self):
        super().setUp()

        self.office = Office.objects.create(
            name='Test Office', code='TO', address='123 Test St'
        )

        self.service = Service.objects.create(
            name='Test Service',
            code='TS',
            service_type='other',
            office=self.office,
            estimated_duration=15
        )

        self.users = {
            'admin': self._user('admin_user', 'admin'),
            'officer': self._user('officer_user', 'officer'),
            'citizen': self._user('citizen_user', 'citizen'),
        }

        self.tokens = {
            k: str(AccessToken.for_user(v)) for k, v in self.users.items()
        }

        self.auth('citizen')

    # ---------- HELPERS ----------
    def _user(self, username, role):
        return User.objects.create_user(
            username=username,
            password='password123',
            email=f'{username}@example.com',
            first_name=username.split('_')[0].title(),
            last_name='User',
            role=role,
            office=self.office if role != 'citizen' else None
        )

    def auth(self, role):
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {self.tokens[role]}'
        )

    def unauth(self):
        self.client.credentials()

    def create_queue(self, name='Test Citizen'):
        return self.client.post(
            reverse('create-queue'),
            {'citizen_name': name, 'service_id': self.service.id},
            format='json'
        )

    # ---------- OFFICE & SERVICE ----------
    def test_list_offices_auth(self):
        res = self.client.get(reverse('office-list'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data[0]['name'], self.office.name)

    def test_list_offices_unauth(self):
        self.unauth()
        res = self.client.get(reverse('office-list'))
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_office_admin_only(self):
        self.auth('admin')
        res = self.client.post(reverse('office-list'), {
            'name': 'New Office', 'code': 'NO', 'address': 'Addr'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    # ---------- QUEUE CREATION ----------
    def test_citizen_create_queue(self):
        self.auth('citizen')
        res = self.create_queue('Alice')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['queue_number'], 1)

    def test_queue_capacity_limit(self):
        self.auth('citizen')
        today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)

        Queue.objects.bulk_create([
            Queue(
                citizen_name=f'C{i}',
                service=self.service,
                number=i + 1,
                status='waiting',
                created_at=today
            ) for i in range(999)
        ])

        res = self.create_queue('Overflow')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_officer_cannot_create_queue(self):
        self.auth('officer')
        res = self.create_queue()
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    # ---------- CALL / SERVE ----------
    def test_officer_calls_next_queue(self):
        self.auth('citizen')
        self.create_queue('A')
        self.create_queue('B')

        self.auth('officer')
        res = self.client.post(
            reverse('call-next-queue'),
            {'service_id': self.service.id}
        )

        self.assertEqual(res.data['queue_number'], 1)
        self.assertEqual(
            Queue.objects.get(id=res.data['queue_id']).status,
            'called'
        )

    def test_start_and_complete_service(self):
        self.auth('citizen')
        q = self.create_queue('C').data['queue_id']

        self.auth('officer')
        self.client.post(reverse('call-next-queue'), {'service_id': self.service.id})
        self.client.post(reverse('start-service', args=[q]))
        res = self.client.post(reverse('complete-service', args=[q]))

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(Queue.objects.get(id=q).status, 'completed')

    # ---------- CANCEL ----------
    def test_cancel_queue(self):
        self.auth('citizen')
        q = self.create_queue('Cancel').data['queue_id']
        res = self.client.post(reverse('cancel-queue', args=[q]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
