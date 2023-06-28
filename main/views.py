from django.shortcuts import render,get_object_or_404,redirect
from .models import PlacePost
# Create your views here.
def main(request):
    return render(request, 'main/main.html')

def placepost(request):
    Place = PlacePost()
    Place.PlaceName = request.POST.get('PlaceName')
    Place.PlaceExplain = request.POST.get('PlaceExpain')
    Place.PlacePhoto = request.POST.get('PlacePhoto')
    
    return render(request, 'request/request.html')