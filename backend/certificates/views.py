from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from common.responses import success_response
from enrollments.models import Enrollment
from progress import badges

from .expiry import compute_expiry
from .models import Badge, Certificate, UserBadge
from .rendering import generate_certificate_file
from .serializers import BadgeSerializer, CertificateSerializer, CertificateVerifySerializer, UserBadgeSerializer


class CertificateViewSet(viewsets.ModelViewSet):
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Certificate.objects.select_related('student', 'course')
        if user.user_type in ('admin', 'instructor') or user.is_staff:
            course_id = self.request.query_params.get('course')
            return qs.filter(course_id=course_id) if course_id else qs
        return qs.filter(student=user)

    def create(self, request, *args, **kwargs):
        if request.user.user_type not in ('instructor', 'admin') and not request.user.is_staff:
            raise PermissionDenied('Only instructors or admins can issue certificates.')

        enrollment_id = request.data.get('enrollment')
        enrollment = Enrollment.objects.filter(pk=enrollment_id).select_related('course', 'student').first()
        if not enrollment:
            raise ValidationError({'enrollment': 'Enrollment not found.'})
        if not enrollment.course.certificate_enabled:
            raise ValidationError('Certificates are not enabled for this course.')
        if Certificate.objects.filter(student=enrollment.student, course=enrollment.course).exists():
            raise ValidationError('A certificate has already been issued for this enrollment.')

        certificate = Certificate.objects.create(
            student=enrollment.student, course=enrollment.course, enrollment=enrollment,
            expires_at=compute_expiry(enrollment.course, timezone.localdate()),
        )
        generate_certificate_file(certificate)
        certificate.save(update_fields=['certificate_file'])
        enrollment.certificate_issued = True
        enrollment.save(update_fields=['certificate_issued'])
        badges.check_certificate_badge(enrollment.student, enrollment.course)
        return Response(self.get_serializer(certificate).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        """Pushes an expired (or expiring) certificate's validity window out
        another full term from today, regenerating the certificate file so
        the printed/downloaded version reflects the new date."""
        certificate = self.get_object()
        if request.user.user_type not in ('instructor', 'admin') and not request.user.is_staff:
            raise PermissionDenied('Only instructors or admins can renew certificates.')
        if not certificate.course.certificate_validity_months:
            raise ValidationError('This course issues certificates that never expire — nothing to renew.')

        certificate.expires_at = compute_expiry(certificate.course, timezone.localdate())
        certificate.renewed_at = timezone.now()
        certificate.renewal_count += 1
        if certificate.status == Certificate.Status.EXPIRED:
            certificate.status = Certificate.Status.ACTIVE
        certificate.save(update_fields=['expires_at', 'renewed_at', 'renewal_count', 'status'])
        generate_certificate_file(certificate)
        certificate.save(update_fields=['certificate_file'])
        return success_response(self.get_serializer(certificate).data, 'Certificate renewed successfully.')


class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """The catalog of badges a student can earn — read-only, awarding is
    rule-based (see progress.badges), never a manual write."""

    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = UserBadge.objects.select_related('badge', 'course')
        user_id = self.request.query_params.get('user')
        if user_id and (user.user_type in ('admin', 'instructor') or user.is_staff):
            return qs.filter(user_id=user_id)
        return qs.filter(user=user)


class VerifyCertificateView(APIView):
    """Public endpoint — anyone with a verification code can confirm a certificate is genuine."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CertificateVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        certificate = Certificate.objects.filter(
            verification_code=serializer.validated_data['verification_code']
        ).select_related('student', 'course').first()
        if not certificate:
            return Response({'valid': False, 'detail': 'No certificate found for this code.'}, status=404)

        certificate_data = CertificateSerializer(certificate, context={'request': request}).data
        if certificate.status != Certificate.Status.ACTIVE:
            return Response({
                'valid': False,
                'status': certificate.status,
                'detail': f'This certificate has been {certificate.get_status_display().lower()} and is no longer valid.',
                'certificate': certificate_data,
            })
        if certificate.is_expired:
            return Response({
                'valid': False,
                'status': 'expired',
                'detail': f'This certificate expired on {certificate.expires_at.strftime("%B %d, %Y")} and is no longer valid.',
                'certificate': certificate_data,
            })
        return Response({'valid': True, 'status': certificate.status, 'certificate': certificate_data})
