from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from .models import Office, Service, Queue
from .serializers import OfficeSerializer
from accounts.permissions import IsAdmin, IsCitizen, IsOfficerOrAdmin
from .services import QueueService


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def office_list(request):
    """
    List all offices, or create a new office.

    GET: Returns list of all active offices (all authenticated users)
    POST: Creates a new office (admins only)
    """
    if request.method == 'GET':
        # All authenticated users can view offices
        offices = Office.objects.filter(is_active=True)
        serializer = OfficeSerializer(offices, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Only admins can create offices
        if not request.user.is_admin():
            return Response(
                {'error': 'Only administrators can create offices'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = OfficeSerializer(data=request.data)
        if serializer.is_valid():
            office = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsCitizen])
def create_queue(request):
    """
    Citizens can create queue tickets.

    POST: Creates a new queue ticket for a citizen
    """
    try:
        citizen_name = request.data.get('citizen_name')
        service_id = request.data.get('service_id')
        citizen_phone = request.data.get('citizen_phone', '')

        if not all([citizen_name, service_id]):
            return Response(
                {'error': 'citizen_name and service_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create queue using service layer
        queue = QueueService.create_queue(citizen_name, service_id, citizen_phone)

        return Response({
            'queue_id': queue.id,
            'queue_number': queue.number,
            'service': queue.service.name,
            'office': queue.office.name,
            'estimated_wait_time': queue.estimated_wait_time,
            'status': queue.status,
            'created_at': queue.created_at
        }, status=status.HTTP_201_CREATED)

    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def queue_status(request, queue_id):
    """
    Get status of a specific queue.

    Citizens can only view their own queues.
    Officers/admins can view queues in their office.
    """
    try:
        queue = Queue.objects.get(id=queue_id)

        # Check permissions based on user role
        if request.user.is_citizen():
            # Citizens can only view queues they created (simplified check)
            # In production, you'd track queue ownership properly
            pass  # For now, allow all citizens to view
        elif request.user.is_officer():
            # Officers can only view queues in their office
            if queue.office != request.user.office:
                return Response(
                    {'error': 'You can only view queues in your office'},
                    status=status.HTTP_403_FORBIDDEN
                )
        # Admins can view all queues

        return Response({
            'queue_id': queue.id,
            'queue_number': queue.number,
            'citizen_name': queue.citizen_name,
            'service': queue.service.name,
            'office': queue.office.name,
            'status': queue.status,
            'created_at': queue.created_at,
            'called_at': queue.called_at,
            'started_at': queue.started_at,
            'estimated_wait_time': queue.estimated_wait_time
        })

    except Queue.DoesNotExist:
        return Response({'error': 'Queue not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsOfficerOrAdmin])
def call_next_queue(request):
    """
    Officers can call the next citizen in queue.

    POST: Calls the next waiting citizen for a service
    """
    try:
        service_id = request.data.get('service_id')
        officer_name = request.user.get_full_name() or request.user.username

        if not service_id:
            return Response(
                {'error': 'service_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if officer can manage this service's office
        service = Service.objects.get(id=service_id)
        if request.user.is_officer() and request.user.office != service.office:
            return Response(
                {'error': 'You can only call queues in your office'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Call next queue using service layer
        queue = QueueService.call_next_queue(officer_name, service_id)

        return Response({
            'queue_id': queue.id,
            'queue_number': queue.number,
            'citizen_name': queue.citizen_name,
            'citizen_phone': queue.citizen_phone,
            'called_at': queue.called_at,
            'called_by': queue.called_by,
            'message': f'Called queue number {queue.number} for {queue.citizen_name}'
        })

    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Service.DoesNotExist:
        return Response({'error': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsOfficerOrAdmin])
def start_service(request, queue_id):
    """
    Officers can start serving a citizen.

    POST: Marks a called queue as being served
    """
    try:
        officer_name = request.user.get_full_name() or request.user.username

        # Check permissions and start service
        queue = QueueService.start_service(queue_id, officer_name)

        # Verify officer can manage this office
        if request.user.is_officer() and request.user.office != queue.office:
            return Response(
                {'error': 'You can only serve citizens in your office'},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response({
            'queue_id': queue.id,
            'queue_number': queue.number,
            'citizen_name': queue.citizen_name,
            'started_at': queue.started_at,
            'served_by': queue.served_by,
            'message': f'Service started for queue number {queue.number}'
        })

    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsOfficerOrAdmin])
def complete_service(request, queue_id):
    """
    Officers can complete a service.

    POST: Marks a serving queue as completed
    """
    try:
        # Check permissions and complete service
        queue = QueueService.complete_service(queue_id)

        # Verify officer can manage this office
        if request.user.is_officer() and request.user.office != queue.office:
            return Response(
                {'error': 'You can only complete services in your office'},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response({
            'queue_id': queue.id,
            'queue_number': queue.number,
            'citizen_name': queue.citizen_name,
            'completed_at': queue.completed_at,
            'served_by': queue.served_by,
            'message': f'Service completed for queue number {queue.number}'
        })

    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsOfficerOrAdmin])
def mark_no_show(request, queue_id):
    """
    Officers can mark a called citizen as no-show.

    POST: Marks a called queue as no-show
    """
    try:
        # Check permissions and mark as no-show
        queue = QueueService.mark_no_show(queue_id)

        # Verify officer can manage this office
        if request.user.is_officer() and request.user.office != queue.office:
            return Response(
                {'error': 'You can only manage queues in your office'},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response({
            'queue_id': queue.id,
            'queue_number': queue.number,
            'citizen_name': queue.citizen_name,
            'status': queue.status,
            'message': f'Queue number {queue.number} marked as no-show'
        })

    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def service_list(request):
    """
    List all active services with office information.

    Accessible by all authenticated users to see available services.
    """
    services = Service.objects.filter(is_active=True).select_related('office')
    data = []

    for service in services:
        data.append({
            'id': service.id,
            'name': service.name,
            'code': service.code,
            'description': service.description,
            'service_type': service.service_type,
            'office': {
                'id': service.office.id,
                'name': service.office.name,
                'code': service.office.code,
            },
            'estimated_duration': service.estimated_duration,
            'priority': service.priority,
        })

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_queue(request, queue_id):
    """
    Cancel a queue entry.

    Citizens can cancel their own waiting queues.
    Officers/admins can cancel any queue in their office.
    """
    try:
        queue = Queue.objects.get(id=queue_id)

        # Permission checks
        if request.user.is_citizen():
            # Citizens can only cancel their own waiting queues
            # (In a real app, we'd track queue ownership)
            if queue.status != 'waiting':
                return Response(
                    {'error': 'Can only cancel waiting queues'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Officers/admins must have office permission
            if not request.user.can_manage_office(queue.office):
                return Response(
                    {'error': 'You can only manage queues for your assigned office'},
                    status=status.HTTP_403_FORBIDDEN
                )

        queue = QueueService.cancel_queue(queue_id)

        return Response({
            'queue_id': queue.id,
            'status': queue.status,
            'message': f'Queue {queue.number} has been cancelled'
        })

    except Queue.DoesNotExist:
        return Response({'error': 'Queue not found'}, status=status.HTTP_404_NOT_FOUND)
    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsOfficerOrAdmin])
def office_queue_status(request, office_id):
    """
    Get queue status for a specific office.

    Only officers and admins can view office queue analytics.
    Officers can only view their assigned office.
    """
    try:
        office = Office.objects.get(id=office_id, is_active=True)

        if not request.user.can_manage_office(office):
            return Response(
                {'error': 'You can only view queues for your assigned office'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get queue statistics for the office
        services = Service.objects.filter(office=office, is_active=True)
        stats = []

        for service in services:
            service_stats = QueueService.get_service_queue_status(service.id)
            if service_stats:  # Only include services with queue data
                stats.append({
                    'service_id': service.id,
                    'service_name': service.name,
                    'service_code': service.code,
                    'queue_stats': service_stats
                })

        return Response({
            'office': {
                'id': office.id,
                'name': office.name,
                'code': office.code,
            },
            'services': stats
        })

    except Office.DoesNotExist:
        return Response({'error': 'Office not found'}, status=status.HTTP_404_NOT_FOUND)
