from django.db import models
from apps.team.models import Team
from apps.accounts.models import UserAccount


# Create your models here.
class Project(models.Model):
    team = models.ForeignKey(Team, related_name='projects', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)

    created_by = models.ForeignKey(UserAccount, related_name='projects', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class Entry(models.Model):

    ACCEPTED = 'accepted'
    AWAITING = 'awaiting'
    DENIED = 'denied'

    CHOICES_STATUS = (
        (ACCEPTED, 'Accepted'),
        (AWAITING, 'Awaiting'),
        (DENIED, 'Denied')
    )

    team = models.ForeignKey(Team, related_name='entries', on_delete=models.CASCADE)
    project = models.ForeignKey(Project, related_name='entries', on_delete=models.CASCADE, blank=True, null=True)
    minutes = models.IntegerField(default=0)
    is_tracked = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=CHOICES_STATUS, default=AWAITING)
    created_by = models.ForeignKey(UserAccount, related_name='entries', on_delete=models.CASCADE)
    created_at = models.DateTimeField()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        if self.is_tracked:
            return f'{self.team.title} - {str(self.created_at)}'
        return f'{str(self.created_at)}'
