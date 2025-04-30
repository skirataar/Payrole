# Cloud Deployment Guide for Payroll Pro

This guide provides detailed instructions for deploying the Payroll Pro application to various cloud platforms.

## Deploying to Render.com

Render.com offers a simple way to deploy both the frontend and backend components of the application.

### Frontend Deployment

1. **Create a Static Site on Render**
   - Sign in to your Render account
   - Click "New" and select "Static Site"
   - Connect your GitHub repository
   - Configure the build settings:
     - Build Command: `npm run build`
     - Publish Directory: `dist`
   - Click "Create Static Site"

2. **Environment Variables**
   - Add the following environment variables:
     - `VITE_API_URL`: URL of your backend API (e.g., `https://your-backend.onrender.com`)

### Backend Deployment

1. **Create a Web Service on Render**
   - Click "New" and select "Web Service"
   - Connect your GitHub repository
   - Configure the build settings:
     - Runtime: Python 3
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `cd backend && gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT`
   - Click "Create Web Service"

2. **Environment Variables**
   - Add the following environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `SECRET_KEY`: A secure random string for JWT encryption
     - `ENVIRONMENT`: Set to `production`
     - `CORS_ORIGINS`: Your frontend URL (e.g., `https://your-frontend.onrender.com`)

### Database Setup

1. **Create a PostgreSQL Database on Render**
   - Click "New" and select "PostgreSQL"
   - Configure your database settings
   - Note the connection details provided by Render

2. **Connect Your Backend to the Database**
   - Use the connection string provided by Render in your backend's `DATABASE_URL` environment variable

## Deploying to Vercel + Railway

This approach uses Vercel for the frontend and Railway for the backend and database.

### Frontend Deployment on Vercel

1. **Deploy to Vercel**
   - Sign in to your Vercel account
   - Import your GitHub repository
   - Configure the build settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Click "Deploy"

2. **Environment Variables**
   - Add the following environment variables:
     - `VITE_API_URL`: URL of your Railway backend API

### Backend Deployment on Railway

1. **Deploy to Railway**
   - Sign in to your Railway account
   - Create a new project
   - Add a service from GitHub
   - Configure the build settings:
     - Start Command: `cd backend && gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT`
   - Click "Deploy"

2. **Add a PostgreSQL Database**
   - In your Railway project, click "New"
   - Select "Database" and then "PostgreSQL"
   - Railway will automatically add the database connection variables to your project

3. **Environment Variables**
   - Add the following environment variables:
     - `SECRET_KEY`: A secure random string for JWT encryption
     - `ENVIRONMENT`: Set to `production`
     - `CORS_ORIGINS`: Your Vercel frontend URL

## Deployment Best Practices

1. **Use Environment Variables**
   - Never hardcode sensitive information
   - Use platform-specific environment variable management

2. **Set Up Proper CORS**
   - Ensure your backend allows requests from your frontend domain
   - Configure `CORS_ORIGINS` appropriately

3. **Database Backups**
   - Set up regular database backups
   - Test the restore process periodically

4. **Monitoring**
   - Set up monitoring for your application
   - Configure alerts for critical issues

5. **CI/CD Pipeline**
   - Set up continuous integration and deployment
   - Automate testing before deployment

## Troubleshooting Cloud Deployments

### Common Issues with Render.com

1. **Build Failures**
   - Check build logs for specific errors
   - Ensure all dependencies are properly specified
   - Verify that your build commands are correct

2. **Database Connection Issues**
   - Confirm that your `DATABASE_URL` is correctly formatted
   - Check if your database service is running
   - Verify network rules allow connections

### Common Issues with Vercel/Railway

1. **Frontend-Backend Communication**
   - Ensure CORS is properly configured
   - Verify that environment variables are set correctly
   - Check network requests in the browser console

2. **Build Size Limitations**
   - Vercel has deployment size limits
   - Optimize your build to reduce size
   - Consider using asset optimization techniques

3. **Railway Service Scaling**
   - Monitor resource usage
   - Scale services as needed
   - Set up auto-scaling if available
