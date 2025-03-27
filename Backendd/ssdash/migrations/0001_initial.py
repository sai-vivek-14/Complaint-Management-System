# Generated by Django 5.1.2 on 2025-03-24 18:21

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Complaint',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('complaint_name', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('room_number', models.CharField(max_length=50)),
                ('complaint_category', models.CharField(choices=[('Electrical', 'Electrical'), ('Plumbing', 'Plumbing'), ('Carpenting', 'Carpenting'), ('Water Filter', 'Water Filter'), ('Bathroom Clogging', 'Bathroom Clogging')], max_length=50)),
                ('status', models.CharField(choices=[('Pending', 'Pending'), ('Resolved', 'Resolved'), ('In Progress', 'In Progress')], default='Pending', max_length=50)),
                ('place', models.CharField(max_length=255)),
                ('attachment', models.FileField(blank=True, null=True, upload_to='complaints/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
