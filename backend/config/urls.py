"""
URL configuration for the Asa Academy backend.

All application endpoints live under /api/v1/, split by domain to match the
Django app structure (see project stack.md).
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def api_root(request):
    return JsonResponse({
        'name': 'Asa Academy API',
        'version': 'v1',
        'docs': '/api/v1/ (DRF browsable API)',
        'admin': '/admin/',
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),

    path('api-auth/', include('rest_framework.urls')),

    path('api/v1/', include('accounts.urls')),
    path('api/v1/courses/', include('courses.urls')),
    path('api/v1/enrollments/', include('enrollments.urls')),
    path('api/v1/lessons/', include('lessons.urls')),
    # Mounted at the API root (not /api/v1/assessments/) so quizzes live at
    # /api/v1/quizzes/, matching course.md's spec — no other app claims the
    # quizzes/exams/grades prefixes, so this is a rename, not a duplicate route.
    path('api/v1/', include('assessments.urls')),
    path('api/v1/assignments/', include('assignments.urls')),
    path('api/v1/progress/', include('progress.urls')),
    path('api/v1/certificates/', include('certificates.urls')),
    path('api/v1/discussions/', include('discussions.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/messages/', include('messaging.urls')),
    path('api/v1/live-classes/', include('live_classes.urls')),
    path('api/v1/payments/', include('payments.urls')),
    path('api/v1/reviews/', include('reviews.urls')),
    path('api/v1/support/', include('support.urls')),
    path('api/v1/dashboard/', include('reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
