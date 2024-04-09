import datetime

from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404

from rest_framework.response import Response
from rest_framework.status import HTTP_204_NO_CONTENT, HTTP_403_FORBIDDEN, HTTP_401_UNAUTHORIZED, HTTP_201_CREATED, \
    HTTP_400_BAD_REQUEST
from rest_framework.viewsets import ViewSet

from .models import Team, Invitation, Absence
from ..accounts.models import UserAccount
from .serializers import TeamSerializer, InvitationSerializer, AbsenceSerializer


# Create your views here.
from ..accounts.serializers import UserSerializer


class TeamViewSet(ViewSet):
    serializer_class = TeamSerializer

    @staticmethod
    def list(request, *args, **kwargs):
        queryset = Team.objects.all()
        serializer = TeamSerializer(queryset, many=True)
        return Response(serializer.data)

    @staticmethod
    def retrieve(request, pk=None):
        queryset = Team.objects.all()
        team = get_object_or_404(queryset, status=Team.ACTIVE, pk=pk)
        serializer = TeamSerializer(team)
        return Response(serializer.data)

    @action(methods=['post'], detail=False)
    def get_active_team(self, request):
        user_account = get_object_or_404(UserAccount, id=request.data.get('requested_by'))
        team = get_object_or_404(Team, id=user_account.active_team_id)

        serializer = TeamSerializer(team)
        return Response(serializer.data)

    @staticmethod
    def destroy(request, pk=None):
        """
        Delete team - set status to DELETED
        :param request: DELETE request, with data
            {
            requested_by: id of user that requested this function
            }
        :param pk: team id
        :return:
            HTTP 204: team deleted successfully
            HTTP 401: user specified in requested_by does not exist
            HTTP 404: delete requested by user that is not owner of the team
                   OR team to delete does not exist
        """
        try:
            user_account = UserAccount.objects.get(id=request.data.get("requested_by"))
        except UserAccount.DoesNotExist:
            return Response(status=HTTP_401_UNAUTHORIZED, data={'reason': "This user cannot perform this action"})
        queryset = Team.objects.filter(status=Team.ACTIVE)
        team = get_object_or_404(queryset, pk=pk, created_by=user_account)
        for member in team.members.all():
            if member.active_team_id == team.id:
                member.active_team_id = 0
                member.save()
        team.status = Team.DELETED
        team.save()
        return Response(status=HTTP_204_NO_CONTENT)

    # return list of teams that you are member of
    @action(methods=['post'], detail=False)
    def my_teams(self, request):
        """
        List of ACTIVE teams that you are member of
        :param request: POST request, with data
            {
            requested_by: id of user that requested this function
            }
        :return: List of teams
        """
        queryset = Team.objects.filter(status=Team.ACTIVE)
        user_account = UserAccount.objects.get(id=request.data.get("requested_by"))
        my_teams = []
        for team in queryset:
            for member in team.members.all():
                if member.id == user_account.id:
                    my_teams.append(team)
                    break

        serializer = TeamSerializer(my_teams, many=True)
        return Response(serializer.data)

    @action(methods=['post'], detail=False)
    def add(self, request):
        """
        Add team to database and activates this team for user
        :param request: POST request, with data
            {
            title: name of a team
            requested_by: id of user that requested this function
            }
        :return:
        """
        team = None
        title = request.data.get('title')

        if title:
            user_account = UserAccount.objects.get(id=request.data.get('requested_by'))
            team = Team.objects.create(title=title, created_by=user_account)
            team.members.add(user_account)
            team.save()

            user_account.active_team_id = team.id
            user_account.save()

        serializer = TeamSerializer(team)
        return Response(serializer.data)

    @action(methods=['post'], detail=False)
    def activate(self, request):
        """
        :param request: POST request, with data
            {
            team_id: id of a team to activate
            requested_by: id of user that requested this function
            }
        :return:
            HTTP 404: invalid team_id
                   OR user not a member of a team
                   OR team is not ACTIVE
        """
        user_account = UserAccount.objects.get(id=request.data.get('requested_by'))
        team_id = request.data.get('team_id')
        team = get_object_or_404(Team, pk=team_id, status=Team.ACTIVE, members__in=[user_account])
        user_account.active_team_id = team.id
        user_account.save()

        serializer = TeamSerializer(team)
        return Response(serializer.data)

    # all details of given team if user is member
    @action(methods=['get', 'post'], detail=True)
    def details(self, request, pk=None):
        user_account = UserAccount.objects.get(id=request.data.get('user_id'))
        team = get_object_or_404(Team, pk=pk, status=Team.ACTIVE, members__in=[user_account])

        serializer = TeamSerializer(team)
        return Response(serializer.data)

    @action(methods=['post'], detail=False)
    def edit_name(self, request):
        team = None
        title = request.data.get('title')
        if title:
            team_id = request.data.get('team_id')
            team = get_object_or_404(Team, pk=team_id, status=Team.ACTIVE, created_by=request.data.get('requested_by'))
            team.title = title
            team.save()

        serializer = TeamSerializer(team)
        return Response(serializer.data)

    # remove user from existing team
    @action(methods=['post'], detail=False)
    def remove_user(self, request):
        user_to_remove = UserAccount.objects.get(id=request.data.get('user_to_remove_id'))
        team_id = request.data.get('team_id')
        team = get_object_or_404(Team, pk=team_id, status=Team.ACTIVE, created_by=request.data.get('requested_by'))
        team.members.remove(user_to_remove)
        team.save()

        user_to_remove.active_team_id = 0
        user_to_remove.save()

        serializer = TeamSerializer(team)
        return Response(serializer.data)


class InviteViewSet(ViewSet):
    serializer_class = InvitationSerializer

    @staticmethod
    def list(request, *args, **kwargs):
        queryset = Invitation.objects.all()
        serializer = InvitationSerializer(queryset, many=True)
        return Response(serializer.data)

    # return list of teams that you are member of
    @action(methods=['post'], detail=False)
    def list_team_invitations(self, request):
        user_account = get_object_or_404(UserAccount, id=request.data.get('requested_by'))
        team_id = request.data.get('team_id')
        team = get_object_or_404(Team, pk=team_id, status=Team.ACTIVE, created_by=request.data.get('requested_by'))

        invitations = Invitation.objects.filter(team=team, status=Invitation.INVITED)
        serializer = InvitationSerializer(invitations, many=True)
        return Response(serializer.data)

    @action(methods=['post'], detail=True)
    def invite(self, request, pk=None):
        user_email = request.data.get('email')
        user_to_invite = get_object_or_404(UserAccount, email=user_email)
        team = get_object_or_404(Team, pk=pk, status=Team.ACTIVE,
                                 created_by=request.data.get('requested_by'))

        invitation = Invitation.objects.filter(team=team, email=user_email, status=Invitation.INVITED)
        if not invitation:
            Invitation.objects.create(team=team, email=user_email)
            return Response(status=HTTP_201_CREATED)
        else:
            return Response(status=HTTP_403_FORBIDDEN, data={'reason': "Duplicate invite"})

    @action(methods=['post'], detail=False)
    def list_my_invites(self, request):
        user_account = get_object_or_404(UserAccount, id=request.data.get('requested_by'))
        invitation = Invitation.objects.filter(email=user_account.email, status=Invitation.INVITED)

        serializer = InvitationSerializer(invitation, many=True)
        return Response(serializer.data)

    @action(methods=['post'], detail=True)
    def accept_invitation(self, request, pk=None):
        requested_by = request.data.get('requested_by')

        user_account = get_object_or_404(UserAccount, id=requested_by)
        invitation = Invitation.objects.get(id=pk)

        invitation.status = Invitation.ACCEPTED
        invitation.save()

        team = invitation.team
        team.members.add(user_account)
        team.save()

        return Response(status=HTTP_201_CREATED)

    @action(methods=['post'], detail=True)
    def decline_invitation(self, request, pk=None):
        requested_by = request.data.get('requested_by')

        user_account = get_object_or_404(UserAccount, id=requested_by)
        invitation = Invitation.objects.get(id=pk)

        invitation.delete()

        return Response(status=HTTP_204_NO_CONTENT)


class AbsenceViewSet(ViewSet):
    serializer_class = AbsenceSerializer

    @staticmethod
    def list(request, *args, **kwargs):
        queryset = Absence.objects.all()
        serializer = AbsenceSerializer(queryset, many=True)
        return Response(serializer.data)

    @staticmethod
    def create(request, *args, **kwargs):
        requested_by = request.data.get('requested_by')
        start_at = request.data.get('start_at')
        end_at = request.data.get('end_at')

        user_account = get_object_or_404(UserAccount, id=requested_by)
        team = get_object_or_404(Team, pk=user_account.active_team_id, status=Team.ACTIVE, members__in=[user_account])
        Absence.objects.create(team=team, user=user_account, start_at=start_at, end_at=end_at)

        return Response(status=HTTP_201_CREATED)

    @staticmethod
    def destroy(request, pk=None):
        """
        Delete absence
        :param request: DELETE request, with data
            {
            requested_by: id of user that requested this function
            }
        :param pk: absence id
        :return:
            HTTP 204: absence deleted successfully
            HTTP 401: user specified in requested_by does not exist
            HTTP 404: delete requested by user that doesn't create absence
                   OR absence to delete does not exist
        """

        absence = get_object_or_404(Absence, id=pk, status=Absence.AWAITING)
        requester_id = request.data.get('requested_by')

        if requester_id == absence.user.id:
            absence.delete()
        else:
            return Response(status=HTTP_401_UNAUTHORIZED, data={'reason': "This user cannot perform this action"})

        return Response(status=HTTP_204_NO_CONTENT)

    @action(methods=['post'], detail=False)
    def get_absences(self, request):
        status = request.data.get('status')
        requested_by = request.data.get('requested_by')

        today = datetime.date.today()
        month_ago = today - datetime.timedelta(days=30)

        user_account = get_object_or_404(UserAccount, id=requested_by)
        team = get_object_or_404(Team, id=user_account.active_team_id)
        if status == 'accepted':
            absences = Absence.objects.filter(team=team, status=Absence.ACCEPTED, end_at__gte=today)
        else:
            if requested_by == team.created_by.id:
                absences = Absence.objects.filter(team=team, status=Absence.AWAITING)
            else:
                absences = Absence.objects.filter(user=user_account, team_id=user_account.active_team_id,
                                                  status__in=[Absence.AWAITING, Absence.DENIED], end_at__gte=month_ago)

        serializer = AbsenceSerializer(absences, many=True)
        return Response(serializer.data)

    @action(methods=['post'], detail=False)
    def change_status(self, request):
        absence_id = request.data.get('absence_id')
        requester_id = request.data.get('requested_by')
        status = request.data.get('status')

        user_account = get_object_or_404(UserAccount, id=requester_id)
        team = get_object_or_404(Team, id=user_account.active_team_id)

        if requester_id == team.created_by.id:
            absence = get_object_or_404(Absence, id=absence_id)
            if status == 'accepted':
                absence.status = Absence.ACCEPTED
            elif status == 'denied':
                absence.status = Absence.DENIED
            else:
                return Response(status=HTTP_400_BAD_REQUEST)
            absence.save()
        else:
            return Response(status=HTTP_400_BAD_REQUEST)

        serializer = AbsenceSerializer(absence)
        return Response(serializer.data)




