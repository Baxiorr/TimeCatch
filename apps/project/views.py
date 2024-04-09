from datetime import datetime
from datetime import date
from django.utils.timezone import make_aware

from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404

from rest_framework.response import Response
from rest_framework.status import (
    HTTP_204_NO_CONTENT,
    HTTP_403_FORBIDDEN,
    HTTP_401_UNAUTHORIZED,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST
 )
from rest_framework.viewsets import ViewSet

from apps.accounts.models import UserAccount
from apps.project.models import Project, Entry
from apps.project.serializer import ProjectSerializer, EntrySerializer
from apps.team.models import Team


class ProjectViewSet(ViewSet):
    serializer_class = ProjectSerializer

    @staticmethod
    def list(request, *args, **kwargs):
        queryset = Project.objects.all()
        serializer = ProjectSerializer(queryset, many=True)
        return Response(serializer.data)

    @staticmethod
    def retrieve(request, pk=None):
        queryset = Project.objects.get(id=pk)
        serializer = ProjectSerializer(queryset)
        return Response(serializer.data)

    @staticmethod
    def destroy(request, pk=None):
        """
        Delete project
        :param request: DELETE request, with data
            {
            requested_by: id of user that requested this function
            }
        :param pk: project id
        :return:
            HTTP 204: project deleted successfully
            HTTP 401: user specified in requested_by does not exist
            HTTP 404: delete requested by user that is not owner of the team or project
                   OR project to delete does not exist
        """

        project = get_object_or_404(Project, id=pk)
        team = get_object_or_404(Team, id=project.team_id)
        requester = request.data.get('requested_by')
        authorized_users = [project.created_by.id, team.created_by.id]

        if requester in authorized_users:
            project.delete()
        else:
            return Response(status=HTTP_401_UNAUTHORIZED, data={'reason': "This user cannot perform this action"})

        return Response(status=HTTP_204_NO_CONTENT)

    @action(methods=['post'], detail=False)
    def add(self, request):
        """
        Add team to database and activates this team for user
        :param request: POST request, with data
            {
            team_id: id of active team, project added to that team
            title: name of a project
            requested_by: id of user that requested this function
            }
        :return:
        """
        team = get_object_or_404(Team, id=request.data.get('team_id'))
        user_account = get_object_or_404(UserAccount, id=request.data.get('requested_by'))
        title = request.data.get('title')

        if title:
            project = Project.objects.create(team=team, title=title, created_by=user_account)

        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    @action(methods=['post'], detail=False)
    def get_projects_for_team(self, request):
        team = get_object_or_404(Team, id=request.data.get('team_id'))
        user_account = get_object_or_404(UserAccount, id=request.data.get('requested_by'))

        queryset = Project.objects.filter(team_id=team.id)

        serializer = ProjectSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(methods=['post'], detail=False)
    def edit_name(self, request):
        project = None
        title = request.data.get('title')
        if title:
            project_id = request.data.get('project_id')
            project = Project.objects.get(id=project_id)
            team = Team.objects.get(id=project.team_id)

            requester = request.data.get('requested_by')
            authorized_users = [project.created_by.id, team.created_by.id]

            if requester in authorized_users:
                project.title = title
                project.save()
            else:
                return Response(status=HTTP_401_UNAUTHORIZED, data={'reason': "This user cannot perform this action"})
        else:
            return Response(status=HTTP_400_BAD_REQUEST)

        serializer = ProjectSerializer(project)
        return Response(serializer.data)


class EntryViewSet(ViewSet):

    @staticmethod
    def list(request, *args, **kwargs):
        queryset = Entry.objects.all()
        serializer = EntrySerializer(queryset, many=True)
        return Response(serializer.data)

    @staticmethod
    def destroy(request, pk=None):
        """
        Delete entry
        :param request: DELETE request, with data
            {
            requested_by: id of user that requested this function
            }
        :param pk: entry id
        :return:
            HTTP 204: entry deleted successfully
            HTTP 401: user specified in requested_by does not exist
            HTTP 404: delete requested by user that doesn't create entry
                   OR entry to delete does not exist
        """

        entry = get_object_or_404(Entry, id=pk, status=Entry.AWAITING)
        requester_id = request.data.get('requested_by')

        if requester_id == entry.created_by.id:
            entry.delete()
        else:
            return Response(status=HTTP_401_UNAUTHORIZED, data={'reason': "This user cannot perform this action"})

        return Response(status=HTTP_204_NO_CONTENT)

    @action(methods=['post'], detail=False)
    def add(self, request):
        hours, minutes = map(int, request.data.get('time').split(':'))
        created_at = datetime.combine(date.fromisoformat(request.data.get("date")), make_aware(datetime.now().time()))
        team_id = request.data.get('team_id')
        project_id = request.data.get('project_id')
        requester = request.data.get('requested_by')
        minutes_total = hours * 60 + minutes

        user_account = get_object_or_404(UserAccount, id=requester)

        if team_id == user_account.active_team_id:
            team = get_object_or_404(Team, id=user_account.active_team_id)
            project = get_object_or_404(Project, id=project_id, team_id=team_id)
        else:
            return Response(status=HTTP_400_BAD_REQUEST)

        entry = Entry.objects.create(team=team,
                                     project=project,
                                     minutes=minutes_total,
                                     created_at=created_at,
                                     created_by=user_account,
                                     is_tracked=True)
        serializer = EntrySerializer(entry)
        return Response(serializer.data)

    @action(methods=['post'], detail=False)
    def get_entries(self, request):
        project_id = request.data.get('project_id')
        requester_id = request.data.get('requested_by')

        user_account = get_object_or_404(UserAccount, id=requester_id)
        team = get_object_or_404(Team, id=user_account.active_team_id)
        project = get_object_or_404(Project, id=project_id)
        if requester_id == project.created_by.id or requester_id == team.created_by.id:
            entries = Entry.objects.filter(project=project, is_tracked=True)
        else:
            entries_accepted = Entry.objects.filter(status=Entry.ACCEPTED, project=project, is_tracked=True)
            entries_mine = Entry.objects.filter(created_by=user_account, project=project, is_tracked=True)
            entries = entries_accepted | entries_mine

        serializer = EntrySerializer(entries, many=True)
        return Response(serializer.data)

    @action(methods=['post'], detail=False)
    def change_status(self, request):
        project_id = request.data.get('project_id')
        entry_id = request.data.get('entry_id')
        requester_id = request.data.get('requested_by')
        status = request.data.get('status')

        user_account = get_object_or_404(UserAccount, id=requester_id)
        team = get_object_or_404(Team, id=user_account.active_team_id)
        project = get_object_or_404(Project, id=project_id)

        if requester_id == project.created_by.id or requester_id == team.created_by.id:
            entry = get_object_or_404(Entry, id=entry_id, is_tracked=True)
            if status == 'accepted':
                entry.status = Entry.ACCEPTED
            elif status == 'denied':
                entry.status = Entry.DENIED
            else:
                return Response(status=HTTP_400_BAD_REQUEST)
            entry.save()
        else:
            return Response(status=HTTP_400_BAD_REQUEST)

        serializer = EntrySerializer(entry)
        return Response(serializer.data)

    @action(methods=['post'], detail=False)
    def create_untracked_entry(self, request):
        created_at = make_aware(datetime.now())
        requester_id = request.data.get('requested_by')

        user_account = get_object_or_404(UserAccount, id=requester_id)

        team = get_object_or_404(Team, id=user_account.active_team_id)

        is_working_in_another_team = Entry.objects.filter(is_tracked=False, created_by=user_account)
        if is_working_in_another_team:
            return Response(status=HTTP_403_FORBIDDEN, data={"message": "Stop timer in another team!"})

        entry = Entry.objects.create(team=team,
                                     project=None,
                                     minutes=0,
                                     created_at=created_at,
                                     created_by=user_account,
                                     is_tracked=False)
        serializer = EntrySerializer(entry)
        return Response(serializer.data)

    @action(methods=['post'], detail=False)
    def get_untracked_time(self, request):
        # check for team
        # use when navbar reload, return minutes from created at
        # in js start timer from minutes returned
        requester_id = request.data.get("requested_by")
        user_account = get_object_or_404(UserAccount, id=requester_id)
        team = get_object_or_404(Team, id=user_account.active_team_id)

        # entry = get_object_or_404(Entry, is_tracked=False, created_by=user_account, team=team)
        try:
            entry = Entry.objects.get(is_tracked=False, created_by=user_account, team=team)
        except Entry.DoesNotExist:
            entry = None
        if not entry:
            return Response(status=HTTP_204_NO_CONTENT)
        time_from_created_at = int((make_aware(datetime.now()) - entry.created_at).total_seconds())
        return Response({"time_since": time_from_created_at})

    @action(methods=['post'], detail=False)
    def save_untracked_entry(self, request):
        hours, minutes, seconds = map(int, request.data.get('time').split(':'))
        project_id = request.data.get("project")
        requester_id = request.data.get("requested_by")

        user_account = get_object_or_404(UserAccount, id=requester_id)
        team = get_object_or_404(Team, id=user_account.active_team_id)
        entry = get_object_or_404(Entry, is_tracked=False, created_by=user_account, team=team)
        project = get_object_or_404(Project, id=project_id)

        entry.minutes = 60 * hours + minutes
        entry.project = project
        entry.is_tracked = True
        entry.save()
        return Response(status=HTTP_201_CREATED)

    @action(methods=['delete'], detail=False)
    def discard_untracked_entry(self, request):
        requester_id = request.data.get("requested_by")
        user_account = get_object_or_404(UserAccount, id=requester_id)
        team = get_object_or_404(Team, id=user_account.active_team_id)

        entry = get_object_or_404(Entry, is_tracked=False, created_by=user_account, team=team)
        entry.delete()
        return Response(status=HTTP_204_NO_CONTENT)



