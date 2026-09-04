from django.urls import path

from . import views

urlpatterns = [
    path('admin/', views.AdminDashboardView.as_view(), name='dashboard-admin'),
    path('academic/', views.AcademicManagerDashboardView.as_view(), name='dashboard-academic'),
    path('instructor/', views.InstructorDashboardView.as_view(), name='dashboard-instructor'),
    path('student/', views.StudentDashboardView.as_view(), name='dashboard-student'),
    path('content/', views.ContentManagerDashboardView.as_view(), name='dashboard-content'),
    path('support/', views.SupportDashboardView.as_view(), name='dashboard-support'),
]
