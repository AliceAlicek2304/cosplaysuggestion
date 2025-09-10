#!/bin/bash

echo "🚀 Starting deployment on EC2..."

# Update system
sudo yum update -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -a -G docker ec2-user
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create deployment directory
mkdir -p ~/cosplay-deploy
cd ~/cosplay-deploy

# Download files from S3
echo "📥 Downloading files from S3..."
aws s3 cp s3://cosplay-suggestion-files/deploy/cosplay-backend.tar ./
aws s3 cp s3://cosplay-suggestion-files/deploy/docker-compose.yml ./
aws s3 cp s3://cosplay-suggestion-files/deploy/nginx.conf ./

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Load Docker image
echo "📦 Loading Docker image..."
docker load -i cosplay-backend.tar

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Check status
echo "✅ Deployment completed!"
echo "📊 Container status:"
docker ps

echo "🌐 Application should be running at:"
echo "   Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
echo "   Nginx: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"

echo "📋 To check logs:"
echo "   docker logs cosplay-backend"
echo "   docker logs cosplay-nginx"
