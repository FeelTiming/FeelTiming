import csv
import os
import django
import sys

sys.path.append("C:/Users/User/Desktop/FeelTiming/")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "feeltiming.settings")
django.setup()

from main.models import smoking_area

CSV_PATH = 'C:/Users/User/Desktop/FeelTiming/static/main/data/data_1/total_data.csv'

with open(CSV_PATH, newline='') as csvfile:
	data_reader = csv.DictReader(csvfile)
	for row in data_reader:
		print(row)
		smoking_area.objects.create(
                        region            = row['자치구'],

                        location          = row['설치위치'],

                        management        = row['운영관리'],

                  )