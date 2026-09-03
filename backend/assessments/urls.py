from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('quizzes/questions', views.QuizQuestionViewSet, basename='quiz-question')
router.register('quizzes/attempts', views.QuizAttemptViewSet, basename='quiz-attempt')
router.register('quizzes', views.QuizViewSet, basename='quiz')
router.register('exams', views.ExamViewSet, basename='exam')
router.register('grades', views.GradeViewSet, basename='grade')

urlpatterns = [
    path('', include(router.urls)),
]
