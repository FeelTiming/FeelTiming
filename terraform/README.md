# FeelTiming Django Application - Terraform Deployment

이 Terraform 구성은 FeelTiming Django 애플리케이션을 AWS EC2 환경에 자동으로 배포합니다.

## 🏗️ 아키텍처 개요

```
Internet Gateway
       |
   Load Balancer (ALB)
       |
   Auto Scaling Group
       |
   EC2 Instances (Ubuntu 22.04)
       |
   Django Application (Gunicorn + Nginx)
```

## 📋 사전 요구사항

1. **AWS 계정** 및 적절한 권한을 가진 IAM 사용자
2. **Terraform >= 1.0** 설치
3. **AWS CLI** 설치 및 구성
4. **EC2 Key Pair** 생성 (AWS Console에서)

### AWS 권한 요구사항

다음 AWS 서비스에 대한 권한이 필요합니다:
- EC2 (인스턴스, 보안 그룹, 키 페어)
- VPC (서브넷, 라우팅 테이블, 인터넷 게이트웨이)
- IAM (역할, 정책, 인스턴스 프로필)
- Application Load Balancer
- Auto Scaling
- CloudWatch

## 🚀 배포 단계

### 1. 저장소 클론 및 디렉토리 이동

```bash
git clone <your-repository-url>
cd FeelTiming/terraform
```

### 2. Terraform 변수 설정

`terraform.tfvars.example`을 복사하여 `terraform.tfvars` 생성:

```bash
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars` 파일을 편집하여 실제 값 입력:

```hcl
# 필수 설정
project_name = "feeltiming"
environment  = "prod"
aws_region   = "ap-northeast-2"  # 서울 리전

# EC2 설정
key_name      = "your-key-pair-name"  # AWS에서 생성한 키 페어 이름
instance_type = "t3.micro"            # 프리티어

# Django 설정
django_secret_key     = "your-50-character-secret-key-here"
django_debug         = false
django_allowed_hosts = "your-domain.com,*.amazonaws.com"
kakao_map_api_key    = "your-kakao-map-api-key"

# 선택적 설정
enable_monitoring      = true
backup_retention_days = 7
```

### 3. Terraform 초기화

```bash
terraform init
```

### 4. 배포 계획 확인

```bash
terraform plan
```

### 5. 인프라 배포

```bash
terraform apply
```

배포 완료 후 출력되는 정보:
- **Application URL**: Django 애플리케이션 접속 주소
- **Admin URL**: Django 관리자 페이지 주소
- **기본 관리자 계정**: admin / changeme123!

## 📁 프로젝트 구조

```
terraform/
├── main.tf                    # 메인 Terraform 구성
├── variables.tf               # 변수 정의
├── outputs.tf                # 출력 변수
├── terraform.tfvars.example  # 변수 예시 파일
├── modules/                   # 모듈 디렉토리
│   ├── vpc/                  # VPC 모듈
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── security/             # 보안 그룹 모듈
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── compute/              # EC2 및 오토스케일링 모듈
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── scripts/                  # 배포 스크립트
│   └── deploy_django.sh      # Django 애플리케이션 배포 스크립트
└── README.md                 # 이 파일
```

## 🔧 주요 컴포넌트

### VPC 모듈
- **VPC**: 10.0.0.0/16 CIDR 블록
- **Public Subnets**: 2개 AZ에 걸친 퍼블릭 서브넷
- **Private Subnets**: 2개 AZ에 걸친 프라이빗 서브넷
- **NAT Gateways**: 각 AZ별 NAT 게이트웨이
- **Internet Gateway**: 인터넷 연결

### Security 모듈
- **Web Security Group**: HTTP(80), HTTPS(443), SSH(22), Django(8000)
- **Database Security Group**: MySQL(3306), PostgreSQL(5432)
- **ALB Security Group**: HTTP(80), HTTPS(443)

### Compute 모듈
- **Launch Template**: Ubuntu 22.04 AMI 기반
- **Auto Scaling Group**: 1-3 인스턴스 자동 조절
- **Application Load Balancer**: 트래픽 분산
- **CloudWatch Alarms**: CPU 사용률 기반 스케일링

## 🎯 배포 후 확인사항

### 1. 애플리케이션 접속 확인

```bash
# Terraform 출력에서 URL 확인
terraform output application_url

# 브라우저에서 접속하거나 curl로 테스트
curl -I $(terraform output -raw application_url)
```

### 2. 관리자 페이지 접속

```bash
# 관리자 페이지 URL
terraform output admin_url

# 기본 계정: admin / changeme123!
```

### 3. 서버 상태 확인

EC2 인스턴스에 SSH 접속 후:

```bash
# 애플리케이션 상태 확인
sudo feeltiming-status

# 개별 서비스 상태 확인
sudo supervisorctl status feeltiming
sudo systemctl status nginx
```

## 📊 모니터링 및 로그

### CloudWatch Metrics
- CPU 사용률
- 네트워크 I/O
- ELB 헬스체크 상태

### 로그 파일 위치
- **애플리케이션 로그**: `/var/log/feeltiming.log`
- **배포 로그**: `/var/log/django_deployment.log`
- **Nginx 로그**: `/var/log/nginx/`

## 🔒 보안 고려사항

### 1. SSH 접근 제한

프로덕션 환경에서는 특정 IP에서만 SSH 접근 허용:

```hcl
# modules/security/main.tf 수정
ingress {
  description = "SSH"
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["YOUR_IP/32"]  # 특정 IP만 허용
}
```

### 2. HTTPS 설정

프로덕션에서는 SSL 인증서 적용 권장:

```bash
# Let's Encrypt 인증서 설치 (EC2 인스턴스에서)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. 환경 변수 보안

민감한 정보는 AWS Secrets Manager 또는 Systems Manager Parameter Store 사용 권장.

## 🛠️ 유지보수

### 애플리케이션 업데이트

```bash
# EC2 인스턴스에서
sudo -u ubuntu git pull origin main
sudo supervisorctl restart feeltiming
```

### 스케일링 정책 조정

```bash
# Auto Scaling Group 용량 조정
aws autoscaling update-auto-scaling-group \\
  --auto-scaling-group-name $(terraform output -raw auto_scaling_group_name) \\
  --desired-capacity 2
```

### 인스턴스 교체

```bash
# Launch Template 업데이트 후 인스턴스 새로 고침
aws autoscaling start-instance-refresh \\
  --auto-scaling-group-name $(terraform output -raw auto_scaling_group_name)
```

## 💰 비용 최적화

### 1. 인스턴스 타입 조정

개발/테스트 환경에서는 t3.micro 사용:

```hcl
instance_type = "t3.micro"  # 프리티어 대상
```

### 2. 스케줄링 기반 Auto Scaling

업무 시간에만 인스턴스 실행하도록 스케줄 설정 가능.

### 3. 불필요한 리소스 정리

```bash
# 인프라 삭제
terraform destroy
```

## 🐛 문제 해결

### 1. 배포 실패 시

```bash
# EC2 인스턴스 로그 확인
ssh -i your-key.pem ubuntu@<instance-ip>
sudo tail -f /var/log/django_deployment.log
```

### 2. 애플리케이션 접속 불가

```bash
# 보안 그룹 확인
aws ec2 describe-security-groups --group-ids $(terraform output -raw web_security_group_id)

# ALB 상태 확인
aws elbv2 describe-load-balancers
```

### 3. 데이터베이스 연결 오류

```bash
# Django 설정 확인
sudo -u ubuntu cat /opt/feeltiming/.env
```

## 📞 지원

문제가 발생하거나 질문이 있으시면:

1. **로그 확인**: 위의 로그 파일들 확인
2. **AWS 콘솔**: CloudWatch, EC2 대시보드에서 리소스 상태 확인
3. **Terraform 상태**: `terraform state list`, `terraform show` 명령어 활용

## 🔄 다음 단계

1. **도메인 연결**: Route 53으로 사용자 정의 도메인 설정
2. **SSL 인증서**: ACM(AWS Certificate Manager)으로 HTTPS 설정
3. **데이터베이스**: RDS로 관리형 데이터베이스 구성
4. **CDN**: CloudFront로 정적 파일 배포 최적화
5. **모니터링**: 상세한 애플리케이션 모니터링 구성