import csv
import os
import django
import sys

sys.path.append("C:/Users/User/Desktop/FeelTiming/")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "feeltiming.settings")
django.setup()

from main.models import smoking_area

CSV_PATH = 'C:/Users/User/Desktop/FeelTiming/smoking_area.csv'

with open(CSV_PATH, newline='') as csvfile:
	data_reader = csv.DictReader(csvfile)
	for row in data_reader:
		print(row)
		smoking_area.objects.create(
                        region            = row['자치구'],
                        facility_name     = row['시설 구분'],
                        facility_type     = row['시설형태'],
                        location          = row['설치 위치'],
                        size              = row['규모'],
                        date              = row['설치일'],
                        subject           = row['설치 주체'],
                        management_status = row['관리여부'],
                        management        = row['관리'],

                  )