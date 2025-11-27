#!/bin/bash

# AWS S3 and CloudFront Deployment Script for Frontend

set -e

# Configuration
AWS_REGION="us-east-1"
S3_BUCKET="business-analytics-app-frontend"
CLOUDFRONT_DISTRIBUTION_ID="YOUR_CLOUDFRONT_DISTRIBUTION_ID"
BUILD_DIR="build"

echo "Starting frontend deployment..."

# Navigate to frontend directory
cd frontend

# Install dependencies and build
echo "Installing dependencies and building..."
npm install
npm run build

# Check if bucket exists, create if it doesn't
echo "Checking S3 bucket..."
if ! aws s3 ls "s3://$S3_BUCKET" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "Bucket exists, syncing files..."
else
    echo "Creating S3 bucket..."
    aws s3 mb "s3://$S3_BUCKET" --region $AWS_REGION
fi

# Sync build files to S3
echo "Uploading files to S3..."
aws s3 sync $BUILD_DIR/ "s3://$S3_BUCKET" --delete --acl public-read

# Create/update S3 bucket policy for public read access
echo "Setting bucket policy..."
aws s3api put-bucket-policy --bucket $S3_BUCKET --policy '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::'$S3_BUCKET'/*"
        }
    ]
}'

# Configure S3 for static website hosting
echo "Configuring static website hosting..."
aws s3 website "s3://$S3_BUCKET" --index-document index.html --error-document index.html

# Invalidate CloudFront cache if distribution ID is provided
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo "Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*"
fi

echo "Frontend deployment completed successfully!"
echo "Website URL: http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"