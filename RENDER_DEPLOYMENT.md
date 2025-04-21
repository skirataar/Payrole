# Deploying Payroll Pro to Render.com

This guide provides step-by-step instructions for deploying the Payroll Pro application to Render.com using Docker.

## Option 1: Blueprint Deployment (Recommended)

1. Push your code to GitHub, GitLab, or Bitbucket
2. Sign up or log in to [Render.com](https://render.com)
3. Click "New +" and select "Blueprint"
4. Connect your repository
5. Render will detect the `render.yaml` file and set up the service

## Option 2: Manual Docker Deployment

If the Blueprint deployment doesn't work, you can deploy the Docker service manually:

### Deploy as a Docker Service

1. Sign up or log in to [Render.com](https://render.com)
2. Click "New +" and select "Web Service"
3. Connect your repository
4. Configure the service:
   - **Name**: `payroll-pro`
   - **Environment**: Docker
   - **Docker Build Context**: `.` (root of your repository)
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: Free
5. Click "Create Web Service"
6. Wait for the deployment to complete

The Docker deployment will build both the frontend and backend together and serve them from a single service. This approach avoids the numpy build issues by using Miniconda with pre-built packages.

## Troubleshooting

### Docker Build Issues

- Check the logs in the Render dashboard for any errors during the Docker build process
- The Docker build might take some time (10-15 minutes) on the first deployment
- If you encounter memory issues during the build, consider upgrading to a paid plan with more resources

### Runtime Issues

- Check the application logs in the Render dashboard
- Verify that the Conda environment is being activated correctly
- Check for any CORS issues in the browser console
- Make sure the backend API endpoints are accessible

## Important Notes

1. **Free Tier Limitations**:
   - Free tier services will "sleep" after 15 minutes of inactivity
   - The first request after sleep will take a few seconds to wake up the service

2. **Custom Domains**:
   - You can add custom domains in the Render dashboard
   - This requires a paid plan

3. **Automatic Deployments**:
   - Render automatically deploys when you push to your repository
   - You can disable this in the service settings if needed
