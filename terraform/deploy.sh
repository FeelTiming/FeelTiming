#!/bin/bash

# FeelTiming Terraform Deployment Script
# This script automates the deployment of the Django application to AWS

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if terraform is installed
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install Terraform >= 1.0"
        exit 1
    fi
    
    # Check terraform version
    TERRAFORM_VERSION=$(terraform version -json | jq -r '.terraform_version')
    print_status "Terraform version: $TERRAFORM_VERSION"
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install AWS CLI"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure'"
        exit 1
    fi
    
    AWS_IDENTITY=$(aws sts get-caller-identity --query 'Account' --output text)
    print_status "AWS Account: $AWS_IDENTITY"
    
    # Check if terraform.tfvars exists
    if [[ ! -f "terraform.tfvars" ]]; then
        print_error "terraform.tfvars not found. Please create it from terraform.tfvars.example"
        exit 1
    fi
    
    print_success "Prerequisites check completed"
}

# Function to validate terraform configuration
validate_terraform() {
    print_status "Validating Terraform configuration..."
    
    terraform init -upgrade
    terraform validate
    
    print_success "Terraform configuration is valid"
}

# Function to plan deployment
plan_deployment() {
    print_status "Creating deployment plan..."
    
    terraform plan -out=tfplan
    
    print_success "Deployment plan created"
    
    read -p "Do you want to proceed with the deployment? (yes/no): " confirm
    if [[ $confirm != "yes" ]]; then
        print_warning "Deployment cancelled by user"
        exit 0
    fi
}

# Function to apply deployment
apply_deployment() {
    print_status "Applying deployment..."
    
    terraform apply tfplan
    
    print_success "Deployment completed successfully!"
}

# Function to display deployment information
show_deployment_info() {
    print_status "Deployment Information:"
    echo "=========================="
    
    APP_URL=$(terraform output -raw application_url 2>/dev/null || echo "Not available")
    ADMIN_URL=$(terraform output -raw admin_url 2>/dev/null || echo "Not available")
    LB_DNS=$(terraform output -raw load_balancer_dns_name 2>/dev/null || echo "Not available")
    
    echo "Application URL: $APP_URL"
    echo "Admin URL: $ADMIN_URL"
    echo "Load Balancer DNS: $LB_DNS"
    echo ""
    echo "Default Admin Credentials:"
    echo "Username: admin"
    echo "Password: changeme123!"
    echo ""
    echo "Note: It may take 5-10 minutes for the application to be fully available"
    echo "      as the EC2 instances need to download and configure the Django application."
}

# Function to test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    APP_URL=$(terraform output -raw application_url 2>/dev/null)
    
    if [[ -n "$APP_URL" ]]; then
        print_status "Waiting for application to become available..."
        
        # Wait up to 10 minutes for the application to be available
        for i in {1..60}; do
            if curl -s --head "$APP_URL" | head -n 1 | grep -q "200 OK"; then
                print_success "Application is responding!"
                break
            else
                echo -n "."
                sleep 10
            fi
        done
        echo ""
    else
        print_warning "Could not retrieve application URL for testing"
    fi
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up temporary files..."
    rm -f tfplan
    print_success "Cleanup completed"
}

# Main deployment function
main() {
    echo "========================================"
    echo "FeelTiming Django Deployment Script"
    echo "========================================"
    echo ""
    
    check_prerequisites
    validate_terraform
    plan_deployment
    apply_deployment
    show_deployment_info
    test_deployment
    cleanup
    
    print_success "Deployment process completed!"
    print_status "You can now access your Django application at the provided URL."
}

# Function to destroy infrastructure
destroy_infrastructure() {
    print_warning "This will destroy all AWS resources created by Terraform!"
    read -p "Are you sure you want to destroy the infrastructure? (yes/no): " confirm
    
    if [[ $confirm == "yes" ]]; then
        print_status "Destroying infrastructure..."
        terraform destroy -auto-approve
        print_success "Infrastructure destroyed successfully"
    else
        print_status "Destruction cancelled"
    fi
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "destroy")
        destroy_infrastructure
        ;;
    "plan")
        check_prerequisites
        validate_terraform
        terraform plan
        ;;
    "output")
        show_deployment_info
        ;;
    "test")
        test_deployment
        ;;
    *)
        echo "Usage: $0 {deploy|destroy|plan|output|test}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy the infrastructure (default)"
        echo "  destroy - Destroy the infrastructure"
        echo "  plan    - Show deployment plan without applying"
        echo "  output  - Show deployment information"
        echo "  test    - Test if the deployed application is working"
        exit 1
        ;;
esac