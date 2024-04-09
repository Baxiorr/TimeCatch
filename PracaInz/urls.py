from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter

from apps.project.views import ProjectViewSet, EntryViewSet
from apps.report.views import ReportViewSet
from apps.team.views import TeamViewSet, InviteViewSet, AbsenceViewSet
from apps.accounts.views import UserViewSet

router = DefaultRouter()
router.register('teams', TeamViewSet, basename='teams')
router.register('users', UserViewSet, basename='users')
router.register('invite', InviteViewSet, basename='invite')
router.register('projects', ProjectViewSet, basename='projects')
router.register('entry', EntryViewSet, basename='entry')
router.register('absence', AbsenceViewSet, basename='absence')
router.register('report', ReportViewSet, basename='report')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('api/', include(router.urls))
]

urlpatterns += [re_path(r'^.*', TemplateView.as_view(template_name='index.html'), name='frontpage')]
