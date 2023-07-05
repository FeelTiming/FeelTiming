from django.shortcuts import render, redirect
from .models import *

def main(request):
    zone = smoking_area.objects.all()
    context = {'zone' : zone}
    return render(request, 'main/main.html', context)

def placepost(request):
    Place = PlacePost()
    Place.PlaceAddress = request.POST['PlaceAddress']
    Place.PlaceName = request.POST['PlaceName']
    Place.PlaceExplain = request.POST['PlaceExplain']
    Place.PlacePhoto = request.POST['PlacePhoto']
    Place.save()
    return redirect('/')
