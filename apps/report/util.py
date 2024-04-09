from django.http import HttpResponse

from .fpdf_table.create_table_fpdf2 import PDF
import csv
from django.db.models import Sum
from ..project.models import Project, Entry
from ..accounts.models import UserAccount
from ..team.models import Team
from ..project.serializer import ReportProjectSerializer, EntrySerializer


class Report:
    def __init__(self, members, projects, team) -> None:
        self.members = [int(x) for x in members.split(',') if x]
        self.projects = [int(x) for x in projects.split(',') if x]
        self.team = int(team)
        super().__init__()

    def __str__(self) -> str:
        return f'M: {self.members} P: {self.projects}'

    def create_pdf(self):
        team_info = Team.objects.get(id=self.team)
        queryset_team_minutes = Entry.objects.filter(team=self.team, status=Entry.ACCEPTED)
        team_minutes = queryset_team_minutes.aggregate(Sum('minutes'))
        pdf = PDF()
        pdf.add_page()
        pdf.set_font('courier', 'B', 16)
        pdf.cell(40, 10, team_info.title, 0, 1)
        pdf.cell(40, 10, '', 0, 1)
        pdf.set_font('courier', '', 12)
        for proj in self.projects:
            project_name = Project.objects.get(id=proj).title
            temp = {
                "User": [],
                "Time": [],
                "Project Time %": [],
                "Team Time %": []
            }
            user = []
            time = []
            perct_time_proj = []
            perct_time_team = []
            queryset_all_minutes = Entry.objects.filter(project=proj, status=Entry.ACCEPTED)
            queryset_users = team_info.members.filter(id__in=self.members)
            if queryset_all_minutes:
                project_minutes = queryset_all_minutes.aggregate(Sum('minutes'))
            else:
                temp["Time"] = ["0"] * len(queryset_users)
                temp["Project Time %"] = ["0"] * len(queryset_users)
                temp["Team Time %"] = ["0"] * len(queryset_users)

            for member in queryset_users:
                queryset_minutes = Entry.objects.filter(created_by=member.id, project=proj, status=Entry.ACCEPTED)
                user.append(str(member))
                if queryset_minutes:
                    member_minutes = queryset_minutes.aggregate(Sum('minutes'))
                    time.append("%02d:%02d" % (divmod(member_minutes['minutes__sum'], 60)))
                    perct_time_proj.append(str(round(member_minutes['minutes__sum']/project_minutes['minutes__sum'], 2) * 100))
                    perct_time_team.append(str(round(member_minutes['minutes__sum']/team_minutes['minutes__sum'], 2) * 100))

            temp["User"] = user
            temp["Time"] = time
            temp["Project Time %"] = perct_time_proj
            temp["Team Time %"] = perct_time_team
            pdf.create_table(table_data=temp, title=str(project_name), cell_width=[65, 19, 40, 32])
            pdf.ln()

        return bytes(pdf.output())

    def create_csv(self):
        team_info = Team.objects.get(id=self.team)
        queryset_team_minutes = Entry.objects.filter(team=self.team, status=Entry.ACCEPTED)
        team_minutes = queryset_team_minutes.aggregate(Sum('minutes'))
        response = HttpResponse(
            content_type='text/csv',
            headers={'Content-Disposition': f'attachment; filename="file.csv"'},
        )
        writer = csv.writer(response, delimiter=";")
        for proj in self.projects:
            project_name = Project.objects.get(id=proj).title
            temp = {
                "User": [],
                "Time": [],
                "Project Time %": [],
                "Team Time %": []
            }
            user = []
            time = []
            perct_time_proj = []
            perct_time_team = []
            queryset_all_minutes = Entry.objects.filter(project=proj, status=Entry.ACCEPTED)
            queryset_users = team_info.members.filter(id__in=self.members)
            if queryset_all_minutes:
                project_minutes = queryset_all_minutes.aggregate(Sum('minutes'))
            else:
                temp["Time"] = ["0"] * len(queryset_users)
                temp["Project Time %"] = ["0"] * len(queryset_users)
                temp["Team Time %"] = ["0"] * len(queryset_users)

            for member in queryset_users:
                queryset_minutes = Entry.objects.filter(created_by=member.id, project=proj, status=Entry.ACCEPTED)
                user.append(str(member))
                if queryset_minutes:
                    member_minutes = queryset_minutes.aggregate(Sum('minutes'))
                    time.append("%02d:%02d" % (divmod(member_minutes['minutes__sum'], 60)))
                    perct_time_proj.append(str(round(member_minutes['minutes__sum']/project_minutes['minutes__sum'], 2) * 100))
                    perct_time_team.append(str(round(member_minutes['minutes__sum']/team_minutes['minutes__sum'], 2) * 100))

            temp["User"] = user
            temp["Time"] = time
            temp["Project Time %"] = perct_time_proj
            temp["Team Time %"] = perct_time_team

            writer.writerow([project_name])
            writer.writerow(temp.keys())
            writer.writerows(zip(*[temp[key] for key in temp.keys()]))
        return response
