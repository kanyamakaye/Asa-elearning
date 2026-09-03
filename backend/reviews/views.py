from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError

from enrollments.models import Enrollment

from .models import CourseReview, Wishlist
from .serializers import CourseReviewSerializer, WishlistSerializer


class CourseReviewViewSet(viewsets.ModelViewSet):
    serializer_class = CourseReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = CourseReview.objects.select_related('student', 'course')
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        if self.action == 'list':
            qs = qs.filter(status=CourseReview.Status.APPROVED)
        return qs

    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        if not Enrollment.objects.filter(student=self.request.user, course=course).exists():
            raise ValidationError('You must be enrolled in this course to leave a review.')
        serializer.save(student=self.request.user)


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(student=self.request.user).select_related('course')

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
