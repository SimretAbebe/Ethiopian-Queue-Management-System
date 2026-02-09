from django.db import models, transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Queue, Service


import logging

logger = logging.getLogger(__name__)


class QueueService:
    """Service layer for queue management business logic.Handles all queue operations and enforces business rules."""
    @staticmethod
    @transaction.atomic
    def create_queue(citizen_name, service_id, citizen_phone=''):
        """
        Create a new queue ticket for a citizen.

        Business Rules:
        1. Service must exist and be active
        2. Office must be active
        3. Generate sequential queue number for the day
        4. Queue numbers reset daily per service
        5. Maximum 999 tickets per service per day
        """
        try:
            service = Service.objects.get(id=service_id, is_active=True)
        except Service.DoesNotExist:
            raise ValidationError("Service not found or not available")

        if not service.office.is_active:
            raise ValidationError("Office is currently closed")

        # Calculate next queue number for this service today
        today = timezone.now().date()
        last_queue = Queue.objects.filter(
            service=service,
            created_at__date=today
        ).aggregate(models.Max('number'))['number__max'] or 0

        next_number = last_queue + 1

        if next_number > 999:
            raise ValidationError("Maximum queue capacity reached for today")

        # Create the queue entry
        queue = Queue.objects.create(
            citizen_name=citizen_name,
            citizen_phone=citizen_phone,
            service=service,
            number=next_number,
            status='waiting'
        )


        return queue

    @staticmethod
    @transaction.atomic
    def call_next_queue(officer_name, service_id):
        """
        Call the next citizen in queue for a specific service.

        Business Rules:
        1. Service must exist and be active
        2. Find the next waiting citizen (oldest first)
        3. Change status to 'called'
        4. Set called_at timestamp
        5. Record which officer called them
        6. Citizen has 5 minutes to respond or status becomes 'no_show'
        """
        try:
            service = Service.objects.get(id=service_id, is_active=True)
        except Service.DoesNotExist:
            raise ValidationError("Service not found or not available")

        # Find next waiting queue (oldest first)
        next_queue = Queue.objects.select_for_update().filter(
            service=service,
            status='waiting'
        ).order_by('created_at').first()

        if not next_queue:
            raise ValidationError("No citizens waiting in queue")

        # Update queue status
        next_queue.status = 'called'
        next_queue.called_at = timezone.now()
        next_queue.called_by = officer_name
        next_queue.save()


        return next_queue

    @staticmethod
    @transaction.atomic
    def start_service(queue_id, officer_name):
        """
        Mark a queue as being served.

        Business Rules:
        1. Queue must exist and be in 'called' status
        2. Change status to 'serving'
        3. Set started_at timestamp
        4. Record serving officer
        """
        try:
            queue = Queue.objects.select_for_update().get(
                id=queue_id,
                status='called'
            )
        except Queue.DoesNotExist:
            raise ValidationError("Queue not found or not in called status")

        queue.status = 'serving'
        queue.started_at = timezone.now()
        queue.served_by = officer_name
        queue.save()

        return queue

    @staticmethod
    @transaction.atomic
    def complete_service(queue_id):
        """
        Mark a queue service as completed.

        Business Rules:
        1. Queue must exist and be in 'serving' status
        2. Change status to 'completed'
        3. Set completed_at timestamp
        """
        try:
            queue = Queue.objects.select_for_update().get(
                id=queue_id,
                status='serving'
            )
        except Queue.DoesNotExist:
            raise ValidationError("Queue not found or not in serving status")

        queue.status = 'completed'
        queue.completed_at = timezone.now()
        queue.save()

        return queue

    @staticmethod
    @transaction.atomic
    def mark_no_show(queue_id):
        """
        Mark a called queue as no-show.

        Business Rules:
        1. Queue must exist and be in 'called' status
        2. Change status to 'no_show'
        """
        try:
            queue = Queue.objects.select_for_update().get(
                id=queue_id,
                status='called'
            )
        except Queue.DoesNotExist:
            raise ValidationError("Queue not found or not in called status")

        queue.status = 'no_show'
        queue.save()

        return queue

    @staticmethod
    @transaction.atomic
    def cancel_queue(queue_id, reason=''):
        """
        Cancel a queue entry.

        Business Rules:
        1. Queue must exist and be active (waiting/called/serving)
        2. Change status to 'cancelled'
        """
        try:
            queue = Queue.objects.select_for_update().get(
                id=queue_id,
                status__in=['waiting', 'called', 'serving']
            )
        except Queue.DoesNotExist:
            raise ValidationError("Queue not found or cannot be cancelled")

        queue.status = 'cancelled'
        queue.save()

        return queue

    @staticmethod
    def get_queue_status(queue_id):
        """
        Get current status of a queue entry.
        """
        try:
            return Queue.objects.get(id=queue_id)
        except Queue.DoesNotExist:
            raise ValidationError("Queue not found")

    @staticmethod
    def get_service_queue_status(service_id):
        """
        Get current queue status for a service.

        Returns counts by status for monitoring.
        """
        return Queue.objects.filter(
            service_id=service_id,
            created_at__date=timezone.now().date()
        ).values('status').annotate(
            count=models.Count('status')
        )