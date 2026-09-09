from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from enrollments.models import Enrollment

from .models import Certificate
from .rendering import generate_certificate_file
from .serializers import CertificateSerializer, CertificateVerifySerializer


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
            student=enrollment.student, course=enrollment.course, enrollment=enrollment
        )
        generate_certificate_file(certificate)
        certificate.save(update_fields=['certificate_file'])
        enrollment.certificate_issued = True
        enrollment.save(update_fields=['certificate_issued'])
        return Response(self.get_serializer(certificate).data, status=status.HTTP_201_CREATED)


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
        return Response({'valid': True, 'status': certificate.status, 'certificate': certificate_data})
