from rest_framework import serializers

from accounts.serializers import UserPublicSerializer

from .models import Attendance, LiveSession


class LiveSessionSerializer(serializers.ModelSerializer):
    instructor = UserPublicSerializer(read_only=True)

    class Meta:
        model = LiveSession
        fields = [
            'id', 'course', 'instructor', 'title', 'description', 'meeting_platform', 'meeting_url',
            'meeting_id', 'meeting_password', 'scheduled_date', 'start_time', 'end_time', 'status',
            'recording_url', 'created_at',
        ]
        read_only_fields = ['id', 'instructor', 'created_at']


class AttendanceSerializer(serializers.ModelSerializer):
    student = UserPublicSerializer(read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'course', 'student', 'session', 'attendance_date', 'attendance_status',
            'check_in_time', 'remarks', 'recorded_by',
        ]
        read_only_fields = ['id', 'attendance_date', 'recorded_by']
