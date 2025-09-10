# Variables for FeelTiming Django Deployment

# General Configuration
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "feeltiming"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "owner" {
  description = "Owner of the resources"
  type        = string
  default     = "DevOps Team"
}

# AWS Configuration
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-northeast-2" # Seoul region
}

# Network Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# Compute Configuration
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
  
  validation {
    condition = contains([
      "t3.micro", "t3.small", "t3.medium",
      "t2.micro", "t2.small", "t2.medium"
    ], var.instance_type)
    error_message = "Instance type must be a valid t2 or t3 instance type."
  }
}

variable "key_name" {
  description = "Name of the AWS key pair for EC2 access"
  type        = string
  
  validation {
    condition     = length(var.key_name) > 0
    error_message = "Key name must not be empty."
  }
}

# Django Application Configuration
variable "django_secret_key" {
  description = "Django secret key"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.django_secret_key) >= 50
    error_message = "Django secret key must be at least 50 characters long."
  }
}

variable "django_debug" {
  description = "Django debug mode"
  type        = bool
  default     = false
}

variable "django_allowed_hosts" {
  description = "Django allowed hosts (comma-separated)"
  type        = string
  default     = "*"
}

variable "kakao_map_api_key" {
  description = "Kakao Map API key"
  type        = string
  sensitive   = true
  default     = ""
}

# Optional Configuration
variable "enable_monitoring" {
  description = "Enable CloudWatch monitoring"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
  
  validation {
    condition     = var.backup_retention_days >= 1 && var.backup_retention_days <= 35
    error_message = "Backup retention days must be between 1 and 35."
  }
}