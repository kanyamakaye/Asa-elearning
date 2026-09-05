from django.db import migrations


def backfill_units(apps, schema_editor):
    Course = apps.get_model('courses', 'Course')
    CourseUnit = apps.get_model('courses', 'CourseUnit')
    CourseModule = apps.get_model('courses', 'CourseModule')

    for course in Course.objects.all():
        modules = list(CourseModule.objects.filter(course=course).order_by('order', 'id'))
        if not modules:
            continue
        unit = CourseUnit.objects.create(course=course, title='Lesson 1: Course Content', order=0)
        for module in modules:
            module.unit = unit
            module.save(update_fields=['unit'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0003_alter_coursemodule_course_courseunit_and_more'),
    ]

    operations = [
        migrations.RunPython(backfill_units, noop_reverse),
    ]
