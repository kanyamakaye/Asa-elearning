import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0004_backfill_course_units'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='coursemodule',
            name='course',
        ),
        migrations.AlterField(
            model_name='coursemodule',
            name='unit',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='modules', to='courses.courseunit'),
        ),
    ]
