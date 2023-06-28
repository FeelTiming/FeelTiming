from django.db import models

# Create your models here.
class PlacePost(models.Model) : 
    # address = ?
    PlaceName = models.CharField(max_length=50)
    PlaceExplain = models.TextField()
    PlacePhoto = models.ImageField(upload_to='request/')
    #이미지 uploadto주소부분