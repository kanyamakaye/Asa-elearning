from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdmin
from enrollments.models import Enrollment

from .models import Payment, Refund
from .serializers import PaymentSerializer, RefundSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Payment.objects.select_related('student', 'course')
        if user.user_type == 'admin' or user.is_staff:
            return qs
        return qs.filter(student=user)

    def perform_create(self, serializer):
        # No external payment gateway is wired up yet, so a created payment is
        # immediately marked successful and the student is auto-enrolled —
        # this keeps the checkout flow usable end-to-end for now.
        payment = serializer.save(
            student=self.request.user,
            payment_status=Payment.Status.SUCCESSFUL,
            payment_date=timezone.now(),
        )
        Enrollment.objects.get_or_create(student=self.request.user, course=payment.course)


class RefundViewSet(viewsets.ModelViewSet):
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Refund.objects.select_related('payment', 'student')
        if user.user_type == 'admin' or user.is_staff:
            return qs
        return qs.filter(student=user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def process(self, request, pk=None):
        refund = self.get_object()
        new_status = request.data.get('status')
        if new_status not in (Refund.Status.APPROVED, Refund.Status.REJECTED, Refund.Status.COMPLETED):
            return Response({'detail': 'Invalid status.'}, status=400)
        refund.refund_status = new_status
        refund.processed_by = request.user
        refund.processed_at = timezone.now()
        refund.save()
        if new_status == Refund.Status.COMPLETED:
            refund.payment.payment_status = Payment.Status.REFUNDED
            refund.payment.save(update_fields=['payment_status'])
        return Response(RefundSerializer(refund).data)
