from django.shortcuts import render
from .models import *

import pandas as pd

def enroll():
    seongbuk = pd.read_csv('main/static/main/data/Seongbuk-gu.csv', encoding='cp949')

    for i in range(len(seongbuk)):
        gu = seongbuk.iloc[i, 0]
        gubun = seongbuk.iloc[i, 1]
        type = seongbuk.iloc[i, 2]
        location = seongbuk.iloc[i, 3]
        manage = seongbuk.iloc[i, 4]
        smokingZone.objects.update_or_create(gu=gu, gubun=gubun, type=type, location=location, manage=manage)

def main(request):
    enroll()
    zone = smokingZone.objects.all()
    context = {'zone' : zone}
    return render(request, 'main/main.html', context)