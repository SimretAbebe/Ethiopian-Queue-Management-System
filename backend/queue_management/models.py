from django.db import models


class Office(models.Model):
    """
    Government offices that provide services to citizens.
    Examples: Passport Office, Tax Office, License Office
    """
    name = models.CharField(
        max_length=200,
        unique=True,
        help_text="Official name of the government office"
    )
    code = models.CharField(
        max_length=10,
        unique=True,
        help_text="Short code for the office (e.g., 'PO' for Passport Office)"
    )
    address = models.TextField(
        help_text="Physical address of the office"
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        help_text="Contact phone number"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this office is currently operational"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Government Office"
        verbose_name_plural = "Government Offices"

    def __str__(self):
        return f"{self.name} ({self.code})"


class Service(models.Model):
    """
    Types of services offered by government offices.
    Examples: Passport Renewal, New Passport Application, Tax Filing
    """
    SERVICE_TYPES = [
        ('citizenship', 'Citizenship Services'),
        ('passport', 'Passport Services'),
        ('tax', 'Tax Services'),
        ('license', 'License Services'),
        ('registration', 'Registration Services'),
        ('other', 'Other Services'),
    ]

    name = models.CharField(
        max_length=200,
        help_text="Name of the service (e.g., 'Passport Renewal')"
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        help_text="Short code for the service (e.g., 'PASS_RENEW')"
    )
    description = models.TextField(
        blank=True,
        help_text="Detailed description of the service"
    )
    service_type = models.CharField(
        max_length=20,
        choices=SERVICE_TYPES,
        help_text="Category of the service"
    )
    office = models.ForeignKey(
        Office,
        on_delete=models.CASCADE,
        related_name='services',
        help_text="Office that provides this service"
    )
    estimated_duration = models.PositiveIntegerField(
        help_text="Estimated service duration in minutes",
        default=30
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this service is currently available"
    )
    priority = models.PositiveIntegerField(
        default=1,
        help_text="Priority level (lower numbers = higher priority)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['priority', 'name']
        unique_together = ['office', 'code']  # Same code can't exist twice in same office
        verbose_name = "Service Type"
        verbose_name_plural = "Service Types"

    def __str__(self):
        return f"{self.name} - {self.office.name}"


class Queue(models.Model):
    """
    Represents a citizen's position in a queue for a government service.

    Queue entries go through different states:
    - waiting: Citizen is waiting to be called
    - called: Citizen has been called and has limited time to respond
    - serving: Citizen is currently being served
    - completed: Service has been completed successfully
    - no_show: Citizen didn't respond to being called
    - cancelled: Queue entry was cancelled
    """

    QUEUE_STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('called', 'Called'),
        ('serving', 'Serving'),
        ('completed', 'Completed'),
        ('no_show', 'No Show'),
        ('cancelled', 'Cancelled'),
    ]

    # Citizen information
    citizen_name = models.CharField(max_length=200)
    citizen_phone = models.CharField(max_length=20, blank=True)

    # Queue details
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='queues')
    number = models.PositiveIntegerField()  # Sequential number for the day
    status = models.CharField(
        max_length=20,
        choices=QUEUE_STATUS_CHOICES,
        default='waiting'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    called_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Officer information
    called_by = models.CharField(max_length=100, blank=True)  # Officer name
    served_by = models.CharField(max_length=100, blank=True)  # Officer name

    class Meta:
        ordering = ['created_at']
        # Note: We enforce unique numbers per service per day in the service layer
        # Django doesn't support date lookups in unique_together
        indexes = [
            models.Index(fields=['service', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['service', 'number']),  # For performance
        ]

    def __str__(self):
        return f"Queue {self.number} - {self.citizen_name} ({self.service.name})"

    @property
    def is_active(self):
        """Check if queue is still active (not completed, cancelled, or no-show)"""
        return self.status in ['waiting', 'called', 'serving']

    @property
    def office(self):
        """Get the office through the service relationship"""
        return self.service.office

    @property
    def estimated_wait_time(self):
        """Calculate estimated wait time based on position in queue"""
        if not self.is_active:
            return 0

        # Count people ahead in queue
        ahead_count = Queue.objects.filter(
            service=self.service,
            status__in=['waiting', 'called'],
            created_at__lt=self.created_at
        ).count()

        # Assume 15 minutes per person
        return ahead_count * 15
