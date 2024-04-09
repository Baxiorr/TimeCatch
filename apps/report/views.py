from django.shortcuts import render
from django.http import HttpResponse
from .util import Report

# Create your views here.
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action


class ReportViewSet(ViewSet):

    @staticmethod
    def list(request, *args, **kwargs):
        return Response({'a':'b'})

    @action(methods=['GET'], detail=False)
    def download(self, request):
        projects = request.query_params.get('projects')
        members = request.query_params.get('members')
        team = request.query_params.get('team')
        report_type = request.query_params.get('type')
        func_map = {'csv': Report.create_csv, 'pdf': Report.create_pdf}
        report = Report(members, projects, team)
        output = func_map[report_type](report)
        print(report)
        if report_type == 'pdf':
            return HttpResponse(output, content_type='application/pdf')
        else:
            return output


