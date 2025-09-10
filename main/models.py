from django.db import models

# Create your models here.
class SmokingZone(models.Model):
    gu = models.CharField(max_length=10, verbose_name="구")
    gubun = models.CharField(max_length=10, verbose_name="구분")
    type = models.CharField(max_length=10, verbose_name="유형")
    location = models.CharField(max_length=200, verbose_name="위치")
    manage = models.CharField(max_length=200, verbose_name="관리")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일시")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일시")

    class Meta:
        verbose_name = "흡연구역"
        verbose_name_plural = "흡연구역들"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.gu} - {self.manage}"
    
class ReportZone(models.Model):
    gu = models.CharField(max_length=10, verbose_name="구")
    gubun = models.CharField(max_length=10, verbose_name="구분")
    type = models.CharField(max_length=10, verbose_name="유형")
    location = models.CharField(max_length=200, verbose_name="위치")
    manage = models.CharField(max_length=200, verbose_name="관리")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일시")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일시")

    class Meta:
        verbose_name = "신고구역"
        verbose_name_plural = "신고구역들"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.gu} - {self.manage}"