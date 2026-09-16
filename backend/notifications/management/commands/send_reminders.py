from django.core.management.base import BaseCommand

from notifications.reminders import run_all_reminders


class Command(BaseCommand):
    help = (
        'Scans for upcoming live classes, approaching assignment/quiz/exam due dates, '
        'inactive enrollments, and unresolved payments, and sends an in-app notification '
        'plus an email for anything not already reminded about recently. Intended to run '
        'on a schedule (cron, Windows Task Scheduler, a hosting platform\'s scheduled job) '
        '— e.g. once an hour.'
    )

    def handle(self, *args, **options):
        results = run_all_reminders()
        total = sum(results.values())
        for category, count in results.items():
            self.stdout.write(f'  {category}: {count}')
        self.stdout.write(self.style.SUCCESS(f'Sent {total} reminder(s).'))
