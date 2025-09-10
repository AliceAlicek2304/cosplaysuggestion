@echo off
REM AWS EC2 Deploy Script for Windows
REM Usage: deploy-backend.bat

echo 🚀 Starting deployment to AWS EC2...

REM Configuration
set EC2_IP=3.107.105.184
set EC2_USER=ec2-user  
set KEY_FILE=%USERPROFILE%\.ssh\cosplay-key.pem
set DOCKER_IMAGE=cosplay-backend
set CONTAINER_NAME=cosplay-backend

REM Step 1: Save Docker image to tar file
echo 📦 Saving Docker image...
docker save cosplaysuggestion-cosplay-backend:latest -o cosplay-backend.tar

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to save Docker image
    exit /b 1
)

REM Step 2: Upload files to EC2 using pscp (PuTTY) or scp if available
echo 📤 Uploading files to EC2...

REM Try using scp first (if WSL or Git Bash is available)
scp -i %KEY_FILE% cosplay-backend.tar %EC2_USER%@%EC2_IP%:~/
scp -i %KEY_FILE% docker-compose.yml %EC2_USER%@%EC2_IP%:~/
scp -i %KEY_FILE% nginx.conf %EC2_USER%@%EC2_IP%:~/

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to upload files. Please check SSH key and connectivity.
    echo 💡 Alternative: Use AWS Systems Manager Session Manager or EC2 Instance Connect
    exit /b 1
)

REM Step 3: Connect and deploy
echo 🔧 Deploying on EC2...
ssh -i %KEY_FILE% %EC2_USER%@%EC2_IP% "bash -s" < deploy-remote.sh

if %ERRORLEVEL% neq 0 (
    echo ❌ Deployment failed
    exit /b 1
)

echo ✅ Deployment completed!
echo 🌐 Backend should be running at: http://%EC2_IP%:8080
echo 📊 Check status: ssh -i %KEY_FILE% %EC2_USER%@%EC2_IP% "docker ps"

pause
