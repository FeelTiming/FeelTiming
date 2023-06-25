from django.db import models

# Create your models here.
class smokingZone(models.Model):
    gu = models.CharField(max_length=10)
    gubun = models.CharField(max_length=10)
    type = models.CharField(max_length=10)
    location = models.CharField(max_length=200)
    manage = models.CharField(max_length=200)

    def __str__(self):
        return self.manage