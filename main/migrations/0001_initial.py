# Generated by Django 4.2.2 on 2023-07-05 07:45

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='PlacePost',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('PlaceAddress', models.CharField(max_length=100)),
                ('PlaceName', models.CharField(max_length=50)),
                ('PlaceExplain', models.TextField()),
                ('PlacePhoto', models.ImageField(upload_to='request/')),
            ],
        ),
        migrations.CreateModel(
            name='smoking_area',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('region', models.CharField(max_length=100, null=True)),
                ('address', models.CharField(max_length=200, null=True)),
                ('location', models.CharField(max_length=100, null=True)),
                ('management', models.CharField(max_length=100, null=True)),
            ],
        ),
    ]
