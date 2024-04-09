from django.utils import timesince
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from .models import Team, Invitation, Absence
from ..accounts.serializers import UserCreateSerializer


class TeamSerializer(ModelSerializer):
    members = UserCreateSerializer(many=True)
    # created_by = PrimaryKeyRelatedField(many=True, read_only=True)
    created_at = serializers.DateTimeField()

    class Meta:
        model = Team

        fields = ('id', 'title', 'members', 'created_at', 'status', 'created_by',)


class InvitationSerializer(ModelSerializer):

    # Additive fields
    time_since = serializers.SerializerMethodField()
    team_name = serializers.SerializerMethodField()

    class Meta:
        model = Invitation

        fields = ('id', 'team', 'email', 'status', 'date_sent', 'time_since', 'team_name',)

    def get_time_since(self, obj):
        return timesince.timesince(obj.date_sent)

    def get_team_name(self, obj):
        return Team.objects.get(id=obj.team.id).title


class AbsenceSerializer(ModelSerializer):
    user_full_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    readable_date = serializers.SerializerMethodField()

    class Meta:
        model = Absence

        fields = ('id', 'team', 'user', 'user_full_name', 'user_email', 'created_at', 'start_at', 'end_at', 'status',
                  'readable_date',)

    def get_user_full_name(self, obj):
        return obj.user.get_full_name()

    def get_user_email(self, obj):
        return str(obj.user)

    def get_readable_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
