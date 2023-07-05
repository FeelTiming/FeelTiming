from django.db import models

# Create your models here.
class smoking_area(models.Model):
    region= models.CharField(max_length=100, null=True)
    address= models.CharField(max_length=200, null=True)
    location= models.CharField(max_length=100, null=True)
    management= models.CharField(max_length=100, null=True)

    def __str__(self):
        return self.location
    
class PlacePost(models.Model) : 
    PlaceAddress = models.CharField(max_length=100)
    PlaceName = models.CharField(max_length=50)
    PlaceExplain = models.TextField()
    PlacePhoto = models.ImageField(upload_to='request/')

    def __str__(self):
        return self.PlaceAddress
