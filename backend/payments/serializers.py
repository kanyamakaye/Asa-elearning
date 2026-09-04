from rest_framework import serializers

from accounts.serializers import UserPublicSerializer
from courses.serializers import CourseListSerializer

from .models import Payment, Refund


class PaymentSerializer(serializers.ModelSerializer):
    course_detail = CourseListSerializer(source='course', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'course', 'course_detail', 'transaction_reference', 'amount', 'currency',
            'payment_method', 'payment_provider', 'payment_status', 'payment_date',
            'provider_reference', 'created_at',
        ]
        read_only_fields = [
            'id', 'student', 'transaction_reference', 'payment_status', 'payment_date',
            'provider_reference', 'created_at',
        ]


class RefundSerializer(serializers.ModelSerializer):
    student = UserPublicSerializer(read_only=True)

    class Meta:
        model = Refund
        fields = [
            'id', 'payment', 'student', 'refund_amount', 'refund_reason', 'refund_status',
            'processed_by', 'requested_at', 'processed_at',
        ]
        read_only_fields = ['id', 'student', 'refund_status', 'processed_by', 'requested_at', 'processed_at']
