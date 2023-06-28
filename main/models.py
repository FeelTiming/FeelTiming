from django.db import models

# Create your models here.
class PlacePost(models.Model) : 
    # address = ?
    PlaceName = models.CharField(max_length=50, null=True)
    PlaceExplain = models.TextField(null=True)
    PlacePhoto = models.ImageField(upload_to='request/', null=True)
    #이미지 uploadto주소부분