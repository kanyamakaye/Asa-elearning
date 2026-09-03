from django.urls import path

from . import views

urlpatterns = [
    path('dashboard/admin/', views.AdminDashboardView.as_view(), name='report-admin-dashboard'),
    path('dashboard/instructor/', views.InstructorDashboardView.as_view(), name='report-instructor-dashboard'),
    path('dashboard/student/', views.StudentDashboardView.as_view(), name='report-student-dashboard'),
]
