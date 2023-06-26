from django.shortcuts import render, redirect
from .models import *

import pandas as pd

def enroll(dir):
    data = pd.read_csv(f"static\main\data\{dir}.csv", encoding='cp949')

    for i in range(len(data)):
        gu = data.iloc[i, 0]
        gubun = data.iloc[i, 1]
        type = data.iloc[i, 2]
        location = data.iloc[i, 3]
        manage = data.iloc[i, 4]
        smokingZone.objects.update_or_create(gu=gu, gubun=gubun, type=type, location=location, manage=manage)

def main(request):
    zone = smokingZone.objects.all()
    if not zone:
        print("등록된 데이터 없음.")
        enroll("Seongbuk-gu")
        redirect('/')
    context = {'zone' : zone}
    return render(request, 'main/main.html', context)