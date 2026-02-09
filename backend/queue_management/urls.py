from django.urls import path
from . import views

# URL patterns for the queue_management app
# These define the secure API endpoints with role-based access
urlpatterns = [
    # Office management (authenticated users)
    path('offices/', views.office_list, name='office-list'),

    # Queue operations
    path('queues/create/', views.create_queue, name='create-queue'),
    path('queues/<int:queue_id>/status/', views.queue_status, name='queue-status'),

    # Service information (authenticated users)
    path('services/', views.service_list, name='service-list'),

    # Officer operations
    path('queues/call/', views.call_next_queue, name='call-next-queue'),
    path('queues/<int:queue_id>/start/', views.start_service, name='start-service'),
    path('queues/<int:queue_id>/complete/', views.complete_service, name='complete-service'),
    path('queues/<int:queue_id>/no-show/', views.mark_no_show, name='mark-no-show'),
    path('queues/<int:queue_id>/cancel/', views.cancel_queue, name='cancel-queue'),

    # Analytics endpoints (officers and admins)
    path('offices/<int:office_id>/queue-status/', views.office_queue_status, name='office-queue-status'),
]