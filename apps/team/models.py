# Import Django

from django.contrib.auth.models import User
from django.db import models


# Models
from django.db.models.functions import Now

from apps.accounts.models import UserAccount


class Team(models.Model):

    ACTIVE = 'active'
    DELETED = 'deleted'

    CHOICES_STATUS = (
        (ACTIVE, 'Active'),
        (DELETED, 'Deleted')
    )

    #
    # Fields

    title = models.CharField(max_length=255)
    members = models.ManyToManyField(UserAccount, related_name='teams')
    created_by = models.ForeignKey(UserAccount, related_name='created_teams', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=CHOICES_STATUS, default=ACTIVE)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class Invitation(models.Model):

    INVITED = 'invited'
    ACCEPTED = 'accepted'

    CHOICES_STATUS = (
        (INVITED, 'Invited'),
        (ACCEPTED, 'Accepted')
    )

    team = models.ForeignKey(Team, related_name='invitations', on_delete=models.CASCADE)
    email = models.EmailField()
    status = models.CharField(max_length=20, choices=CHOICES_STATUS, default=INVITED)
    date_sent = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


class Absence(models.Model):

    ACCEPTED = 'accepted'
    AWAITING = 'awaiting'
    DENIED = 'denied'

    CHOICES_STATUS = (
        (ACCEPTED, 'Accepted'),
        (AWAITING, 'Awaiting'),
        (DENIED, 'Denied')
    )

    team = models.ForeignKey(Team, related_name='absences', on_delete=models.CASCADE)
    user = models.ForeignKey(UserAccount, related_name='absences', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    start_at = models.DateField()
    end_at = models.DateField()
    status = models.CharField(max_length=10, choices=CHOICES_STATUS, default=AWAITING)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                check=models.Q(start_at__lte=models.F('end_at')),
                name='correct_date',
            ),
        ]

    def __str__(self):
        return self.user.get_full_name() + ', ' + str(self.team)

