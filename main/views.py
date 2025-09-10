from django.shortcuts import render, redirect
from django.contrib import messages
from django.conf import settings
from decouple import config
from .models import SmokingZone, ReportZone
from pathlib import Path
import pandas as pd
import logging

logger = logging.getLogger(__name__)

def enroll(dir_name):
    """흡연구역 데이터를 CSV 파일에서 로드하여 데이터베이스에 저장"""
    try:
        csv_path = Path(settings.BASE_DIR) / 'static' / 'main' / 'data' / f'{dir_name}.csv'
        if not csv_path.exists():
            logger.error(f"CSV 파일이 존재하지 않습니다: {csv_path}")
            return False
            
        data = pd.read_csv(csv_path, encoding='cp949')
        
        created_count = 0
        for i in range(len(data)):
            gu = data.iloc[i, 0]
            gubun = data.iloc[i, 1]
            type_field = data.iloc[i, 2]
            location = data.iloc[i, 3]
            manage = data.iloc[i, 4]
            
            obj, created = SmokingZone.objects.update_or_create(
                gu=gu, gubun=gubun, type=type_field, location=location,
                defaults={'manage': manage}
            )
            if created:
                created_count += 1
                
        logger.info(f"새로운 흡연구역 {created_count}개가 등록되었습니다.")
        return True
        
    except FileNotFoundError:
        logger.error(f"CSV 파일을 찾을 수 없습니다: {dir_name}.csv")
        return False
    except pd.errors.ParserError as e:
        logger.error(f"CSV 파일 파싱 오류: {e}")
        return False
    except Exception as e:
        logger.error(f"데이터 로드 중 오류 발생: {e}")
        return False

def main(request):
    """메인 페이지 뷰: 흡연구역 데이터를 로드하고 맵을 표시"""
    try:
        zones = SmokingZone.objects.all()
        
        # 데이터가 없는 경우 샘플 데이터 로드
        if not zones.exists():
            logger.info("등록된 흡연구역 데이터가 없습니다. 샘플 데이터를 로드합니다.")
            if enroll("Seongbuk-gu"):
                zones = SmokingZone.objects.all()
                messages.success(request, '성북구 흡연구역 데이터가 로드되었습니다.')
            else:
                messages.error(request, '데이터 로드 중 오류가 발생했습니다.')
                
        context = {
            'zones': zones,
            'zone_count': zones.count(),
            'kakao_map_api_key': config('KAKAO_MAP_API_KEY', default=''),
        }
        return render(request, 'main/main.html', context)
        
    except Exception as e:
        logger.error(f"메인 페이지 로드 중 오류: {e}")
        messages.error(request, '페이지 로드 중 오류가 발생했습니다.')
        return render(request, 'main/main.html', {
            'zones': SmokingZone.objects.none(),
            'kakao_map_api_key': config('KAKAO_MAP_API_KEY', default=''),
        })