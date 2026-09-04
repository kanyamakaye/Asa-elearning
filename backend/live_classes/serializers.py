from rest_framework import serializers

from accounts.serializers import UserPublicSerializer

from .models import Attendance, LiveSession


class LiveSessionSerializer(serializers.ModelSerializer):
    instructor = UserPublicSerializer(read_only=True)
    meeting_url = serializers.URLField(required=True)

    class Meta:
        model = LiveSession
        fields = [
            'id', 'course', 'instructor', 'title', 'description', 'meeting_platform', 'meeting_url',
            'meeting_id', 'meeting_password', 'scheduled_date', 'start_time', 'end_time', 'timezone',
            'capacity', 'status', 'recording_url', 'created_at',
        ]
        read_only_fields = ['id', 'instructor', 'created_at']

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError('This field is required.')
        return value

    def validate(self, attrs):
        start = attrs.get('start_time', getattr(self.instance, 'start_time', None))
        end = attrs.get('end_time', getattr(self.instance, 'end_time', None))
        if not start:
            raise serializers.ValidationError({'start_time': 'This field is required.'})
        if not end:
            raise serializers.ValidationError({'end_time': 'This field is required.'})
        if end <= start:
            raise serializers.ValidationError({'end_time': 'Must be after the start time.'})
        scheduled_date = attrs.get('scheduled_date', getattr(self.instance, 'scheduled_date', None))
        if not scheduled_date:
            raise serializers.ValidationError({'scheduled_date': 'This field is required.'})
        return attrs


class AttendanceSerializer(serializers.ModelSerializer):
    student = UserPublicSerializer(read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'course', 'student', 'session', 'attendance_date', 'attendance_status',
            'check_in_time', 'remarks', 'recorded_by',
        ]
        read_only_fields = ['id', 'attendance_date', 'recorded_by']
