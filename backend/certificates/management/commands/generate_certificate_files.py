from django.core.management.base import BaseCommand

from certificates.models import Certificate
from certificates.rendering import generate_certificate_file


class Command(BaseCommand):
    help = 'Generates the certificate PDF for every certificate that does not already have one.'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Regenerate even for certificates that already have a file.')

    def handle(self, *args, **options):
        force = options['force']
        queryset = Certificate.objects.select_related('student', 'course', 'course__instructor')
        updated = 0
        for certificate in queryset:
            if certificate.certificate_file and not force:
                continue
            generate_certificate_file(certificate)
            certificate.save(update_fields=['certificate_file'])
            updated += 1

        self.stdout.write(self.style.SUCCESS(f'Generated certificate files for {updated} certificate(s).'))
