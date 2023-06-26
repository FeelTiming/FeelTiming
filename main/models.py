from django.db import models

# Create your models here.

class smoking_area(models.Model):
    region= models.CharField(max_length=100, null=True)

    facility_name= models.CharField(max_length=100, null=True)

    facility_type= models.CharField(max_length=100, null=True)

    location= models.CharField(max_length=100, null=True)

    size= models.CharField(max_length=100, null=True)

    date= models.CharField(max_length=100, null=True)

    subject= models.CharField(max_length=100, null=True)

    management_status= models.CharField(max_length=100, null=True)

    management= models.CharField(max_length=100, null=True)