from django.shortcuts import render, redirect
from .models import *
import csv
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

def create_data(request):
    CSV_PATH = 'C:/Users/User/Desktop/FeelTiming/static/main/data/total_data.csv'
    with open(CSV_PATH, newline='') as csvfile:
        print("afdadfsfsdfsd")
        data_reader = csv.DictReader(csvfile)
        for row in data_reader:
            smoking_area.objects.create(
                                region            = row['자치구'],
                                address           = row['설치주소'],
                                location          = row['설치위치'],
                                management        = row['운영관리'],
                        )
    return redirect('/')
