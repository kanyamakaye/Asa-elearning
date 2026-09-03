from rest_framework import serializers

from accounts.serializers import UserPublicSerializer
from courses.serializers import CourseListSerializer

from .models import CourseReview, Wishlist


class CourseReviewSerializer(serializers.ModelSerializer):
    student = UserPublicSerializer(read_only=True)

    class Meta:
        model = CourseReview
        fields = ['id', 'course', 'student', 'rating', 'review_text', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'student', 'status', 'created_at', 'updated_at']


class WishlistSerializer(serializers.ModelSerializer):
    course_detail = CourseListSerializer(source='course', read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'student', 'course', 'course_detail', 'created_at']
        read_only_fields = ['id', 'student', 'created_at']
