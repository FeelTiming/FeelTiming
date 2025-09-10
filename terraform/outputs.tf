# Terraform Outputs for FeelTiming Application

# Network Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

# Security Outputs
output "web_security_group_id" {
  description = "ID of the web security group"
  value       = module.security.web_security_group_id
}

output "database_security_group_id" {
  description = "ID of the database security group"
  value       = module.security.database_security_group_id
}

# Compute Outputs
output "application_url" {
  description = "URL of the Django application"
  value       = "http://${module.compute.load_balancer_dns_name}"
}

output "load_balancer_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.compute.load_balancer_dns_name
}

output "admin_url" {
  description = "URL of the Django admin interface"
  value       = "http://${module.compute.load_balancer_dns_name}/admin"
}

output "auto_scaling_group_name" {
  description = "Name of the Auto Scaling Group"
  value       = module.compute.auto_scaling_group_name
}

# Deployment Information
output "deployment_info" {
  description = "Deployment information and next steps"
  value = {
    application_url     = "http://${module.compute.load_balancer_dns_name}"
    admin_url          = "http://${module.compute.load_balancer_dns_name}/admin"
    admin_credentials  = "admin / changeme123!"
    health_check_url   = "http://${module.compute.load_balancer_dns_name}"
    environment        = var.environment
    region            = var.aws_region
  }
}

# SSH Access Information
output "ssh_access_info" {
  description = "Information for SSH access to instances"
  value = {
    key_name           = var.key_name
    security_group_id  = module.security.web_security_group_id
    connection_note    = "SSH access is available on port 22. Use your EC2 key pair to connect."
  }
}

# Monitoring Information
output "monitoring_info" {
  description = "CloudWatch monitoring information"
  value = {
    auto_scaling_group = module.compute.auto_scaling_group_name
    cloudwatch_alarms  = ["high-cpu", "low-cpu"]
    log_groups        = ["/aws/ec2/feeltiming"]
  }
}