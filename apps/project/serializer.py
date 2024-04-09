from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from apps.project.models import Project, Entry


class ProjectSerializer(ModelSerializer):

    created_at = serializers.DateTimeField()
    registered_time = serializers.SerializerMethodField()

    class Meta:
        model = Project

        fields = ('id', 'team', 'title', 'created_by', 'created_at', 'registered_time',)

    def get_registered_time(self, obj):
        return sum(entry.minutes for entry in obj.entries.filter(status=Entry.ACCEPTED))


class ReportProjectSerializer(ModelSerializer):

    registered_time = serializers.SerializerMethodField()

    class Meta:
        model = Project

        fields = ('id', 'title', 'registered_time',)

    def get_registered_time(self, obj):
        return sum(entry.minutes for entry in obj.entries.filter(status=Entry.ACCEPTED))


class EntrySerializer(ModelSerializer):
    # Additive fields
    readable_date = serializers.SerializerMethodField()

    class Meta:
        model = Entry
        fields = ('id',
                  'created_by',
                  'team',
                  'project',
                  'minutes',
                  'is_tracked',
                  'status',
                  'created_by',
                  'created_at',
                  'readable_date',)

    def get_readable_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
