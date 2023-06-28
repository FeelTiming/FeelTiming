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
    
class reportZone(models.Model):
    gu = models.CharField(max_length=10)
    gubun = models.CharField(max_length=10)
    type = models.CharField(max_length=10)
    location = models.CharField(max_length=200)
    manage = models.CharField(max_length=200)

    def __str__(self):
        return self.manage

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
    
class PlacePost(models.Model) : 
    # address = ?
<<<<<<< HEAD
    PlaceName = models.CharField(max_length=50, null=True)
    PlaceExplain = models.TextField(null=True)
    PlacePhoto = models.ImageField(upload_to='request/', null=True)
    #이미지 uploadto주소부분
=======
    PlaceName = models.CharField(max_length=50)
    PlaceExplain = models.TextField()
    PlacePhoto = models.ImageField(upload_to='request/')
    #이미지 uploadto주소부분
>>>>>>> 91049e2f1409f8eb106479ab07d4fbaef801f587
