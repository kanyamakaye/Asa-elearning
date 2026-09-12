import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def migrate_course_fk_to_assignments(apps, schema_editor):
    """Preserve every existing StudentGroup.course value as an equivalent
    GroupCourseAssignment row before the column is dropped, so no existing
    group loses the course relationship it already had."""
    StudentGroup = apps.get_model('groups', 'StudentGroup')
    GroupCourseAssignment = apps.get_model('groups', 'GroupCourseAssignment')
    for group in StudentGroup.objects.exclude(course__isnull=True):
        GroupCourseAssignment.objects.get_or_create(group=group, course_id=group.course_id)


def noop_reverse(apps, schema_editor):
    # Nothing to reverse into — the old `course` column is recreated empty
    # by RemoveField's reverse (AddField); we don't attempt to pick a single
    # course back out of a group that may now have several assigned.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0007_course_certificate_validity_months_and_more'),
        ('groups', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='GroupCourseAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('assigned_at', models.DateTimeField(auto_now_add=True)),
                ('assigned_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='group_course_assignments_made', to=settings.AUTH_USER_MODEL)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='group_assignments', to='courses.course')),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='course_assignments', to='groups.studentgroup')),
            ],
            options={
                'ordering': ['-assigned_at'],
                'unique_together': {('group', 'course')},
            },
        ),
        migrations.AddField(
            model_name='studentgroup',
            name='courses',
            field=models.ManyToManyField(blank=True, related_name='student_groups', through='groups.GroupCourseAssignment', to='courses.course'),
        ),
        migrations.RunPython(migrate_course_fk_to_assignments, noop_reverse),
        migrations.RemoveField(
            model_name='studentgroup',
            name='course',
        ),
    ]
