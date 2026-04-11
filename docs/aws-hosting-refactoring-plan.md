# AWS Hosting Refactoring Plan

## Overview

This document outlines the steps to refactor and deploy the ETAL Electronics application to AWS using:
- **CloudFront + S3** for static frontend hosting
- **API Gateway + Lambda** for stateless backend services
- **RDS PostgreSQL** for database (or Aurora Serverless for better scalability)

## Current Architecture Analysis

The current application consists of:
- **Frontend**: React SPA served by Vite dev server
- **Backend**: Node.js/Express API with PostgreSQL database
- **Database**: Local PostgreSQL instance
- **File Storage**: Local file system for uploads

## Target AWS Architecture

```
Internet
    ↓
[CloudFront Distribution]
    ↓
[S3 Bucket] (Static Frontend)
    ↓
[API Gateway]
    ↓
[Lambda Functions] (Backend Logic)
    ↓
[Aurora(Database)
    ↓
[S3 Bucket] (File Storage)
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Node.js** and **npm** for building
4. **Git** for version control
5. **Database migration tools** (if needed)

## Step 1: Backend Refactoring for Serverless

### 1.1 Make Backend Stateless

**Current Issues:**
- Express server maintains state
- File uploads stored locally
- Database connections persistent

**Required Changes:**

#### 1.1.1 Environment Variables
Update all hardcoded values to use environment variables:

```javascript
// In all backend files, replace:
const connectionString = process.env.DATABASE_URL || 'postgresql://...'

// With:
const connectionString = process.env.DATABASE_URL // Required in Lambda
```

#### 1.1.2 File Upload Handling
Replace local file storage with S3:

```javascript
// Install aws-sdk
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Replace local file operations with S3 operations
const uploadToS3 = async (file, key) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };
  return s3.upload(params).promise();
};
```

#### 1.1.3 Database Connection
Use connection pooling suitable for serverless:

```javascript
// Update dbInit.js
const { Pool } = require('pg');

// For Lambda, use connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Important for Lambda
  min: 0,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### 1.1.4 CORS Configuration
Update CORS to allow CloudFront domain:

```javascript
// In index.js or middleware
const corsOptions = {
  origin: [
    'http://localhost:5173', // For development
    process.env.FRONTEND_URL, // CloudFront distribution URL
  ],
  credentials: true,
};
```

### 1.2 Create Lambda Handler

Create a new entry point for Lambda:

```javascript
// lambda.js
const serverless = require('serverless-http');
const app = require('./src/index');

module.exports.handler = serverless(app);
```

### 1.3 Update Package.json for Lambda

```json
{
  "scripts": {
    "build": "npm install --production && npm run build-lambda",
    "build-lambda": "esbuild src/index.js --bundle --platform=node --target=node18 --outfile=dist/index.js --external:aws-sdk"
  },
  "dependencies": {
    "serverless-http": "^3.1.0",
    "aws-sdk": "^2.1400",
    "esbuild": "^0.17.0"
  }
}
```

## Step 2: Database Migration

### 2.1 Set Up RDS PostgreSQL

1. Create RDS instance or Aurora cluster
2. Configure security groups for Lambda access
3. Set up database and run migrations
4. Update connection string in environment variables

### 2.2 Database Backup

```bash
# Export current database
pg_dump -h localhost -U postgres ETALDB > etal_backup.sql
```

### 2.3 Restore to RDS

```bash
# Import to RDS
psql -h <rds-endpoint> -U <username> -d <database> < etal_backup.sql
```

## Step 3: Frontend Build Configuration

### 3.1 Update API Base URL

```javascript
// In frontend/src/main.jsx or config
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// For production:
const API_BASE_URL = import.meta.env.VITE_API_URL; // Set to API Gateway URL
```

### 3.2 Update Axios Configuration

```javascript
// Update axios base URL
axios.defaults.baseURL = API_BASE_URL;
```

### 3.3 Build for Production

```json
// In frontend/package.json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Step 4: AWS Infrastructure Setup

### 4.1 S3 Buckets

Create two S3 buckets:
1. **Frontend bucket**: Public access for static files
2. **Uploads bucket**: For file uploads from backend

### 4.2 Lambda Function

1. Create Lambda function with Node.js runtime
2. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `S3_BUCKET_NAME`
   - `FRONTEND_URL`
3. Configure VPC if using RDS (for security)

### 4.3 API Gateway

1. Create REST API or HTTP API
2. Configure routes to match Express routes
3. Enable CORS
4. Set up custom domain (optional)

### 4.4 CloudFront Distribution

1. Create distribution with S3 origin
2. Configure custom domain (optional)
3. Set up SSL certificate
4. Configure caching rules

## Step 5: Deployment Process

### 5.1 Backend Deployment

```bash
# Build Lambda package
cd backend
npm run build

# Deploy to Lambda (using AWS CLI or CDK)
aws lambda update-function-code \
  --function-name etal-backend \
  --zip-file fileb://dist/lambda.zip
```

### 5.2 Frontend Deployment

```bash
# Build frontend
cd frontend
npm run build

# Sync to S3
aws s3 sync dist/ s3://etal-frontend-bucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

## Step 6: Environment Variables

### 6.1 Lambda Environment Variables

```
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/database
JWT_SECRET=your-secure-jwt-secret
S3_BUCKET_NAME=etal-uploads-bucket
FRONTEND_URL=https://your-cloudfront-domain.com
ADMIN_USER=admin
ADMIN_PASSWORD=secure-admin-password
```

### 6.2 Frontend Environment Variables

```bash
# .env.production
VITE_API_URL=https://your-api-gateway-url.com
```

## Step 7: Security Considerations

### 7.1 Authentication
- Ensure JWT tokens are properly validated
- Implement proper CORS policies
- Use HTTPS everywhere

### 7.2 Database Security
- Use IAM authentication for RDS
- Restrict database access to Lambda functions only
- Encrypt sensitive data

### 7.3 File Storage Security
- Configure S3 bucket policies
- Use pre-signed URLs for secure uploads
- Implement proper ACLs

## Step 8: Monitoring and Logging

### 8.1 CloudWatch
- Set up Lambda function logging
- Monitor API Gateway metrics
- Configure alarms for errors

### 8.2 X-Ray (Optional)
- Enable X-Ray tracing for performance monitoring
- Set up custom metrics

## Step 9: Cost Optimization

### 9.1 Lambda
- Monitor function duration and memory usage
- Optimize bundle size
- Use provisioned concurrency if needed

### 9.2 RDS
- Consider Aurora Serverless for variable workloads
- Set up auto-scaling
- Monitor connection usage

### 9.3 CloudFront
- Configure appropriate cache behaviors
- Use compression
- Monitor data transfer costs

## Step 10: Testing and Validation

### 10.1 Pre-deployment Testing
- Test Lambda function locally using SAM CLI
- Validate API Gateway integration
- Test S3 file operations

### 10.2 Post-deployment Testing
- Test all frontend functionality
- Validate authentication flow
- Check file upload/download
- Monitor error logs

## Step 11: Rollback Plan

1. Keep previous deployment versions
2. Have database backup ready
3. Monitor error rates closely after deployment
4. Prepare quick rollback scripts

## Code Refactoring Status

✅ **COMPLETED**: Backend refactored for serverless deployment
- Removed local file storage, implemented S3 uploads
- Updated database connection for Lambda (connection pooling)
- Added environment variable configuration
- Created serverless-http handler (lambda.js)
- Updated CORS for CloudFront domain
- Added AWS SDK dependencies

✅ **COMPLETED**: Frontend updated for cloud deployment
- Replaced hardcoded localhost URLs with environment variables
- Updated AdminPresenter.js and ProductPresenter.js
- Removed local uploads proxy from Vite config
- Added .env.example with required variables

✅ **COMPLETED**: Build configuration updated
- Added Lambda build scripts with esbuild
- Updated package.json dependencies
- Created environment variable templates

## Next Steps for Deployment

---

**Note**: This plan assumes basic AWS knowledge. Consider using AWS CDK or Serverless Framework for infrastructure as code to simplify deployment and management.</content>
<parameter name="filePath">c:\Users\PIU\Desktop\Personal Folder 23Oct2023\Quantic Work\ETAL Project\docs\aws-hosting-refactoring-plan.md