# Deploying Payroll Pro to Render.com

This guide provides step-by-step instructions for deploying the Payroll Pro application to Render.com.

## Option 1: Blueprint Deployment (Recommended)

1. Push your code to GitHub, GitLab, or Bitbucket
2. Sign up or log in to [Render.com](https://render.com)
3. Click "New +" and select "Blueprint"
4. Connect your repository
5. Render will detect the `render.yaml` file and set up both services

## Option 2: Manual Deployment

If the Blueprint deployment doesn't work, you can deploy each service manually:

### Step 1: Deploy the Backend API

1. Sign up or log in to [Render.com](https://render.com)
2. Click "New +" and select "Web Service"
3. Connect your repository
4. Configure the service:
   - **Name**: `payroll-pro-api`
   - **Environment**: Python
   - **Build Command**: `chmod +x ./conda-setup.sh && ./conda-setup.sh`
   - **Start Command**: `source ~/miniconda3/bin/activate payroll-env && cd backend && python main.py`
   - **Plan**: Free
5. Click "Create Web Service"
6. Wait for the deployment to complete and note the URL (e.g., `https://payroll-pro-api.onrender.com`)

### Step 2: Deploy the Frontend

1. Click "New +" and select "Static Site"
2. Connect the same repository
3. Configure the service:
   - **Name**: `payroll-pro-web`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**: Add `VITE_API_URL` with the value of your backend URL from Step 1
4. Click "Create Static Site"
5. Wait for the deployment to complete

## Troubleshooting

### Backend Issues

- Check the logs in the Render dashboard for any errors
- The deployment uses Miniconda to create a Python environment with pre-built packages
- This approach avoids the need to build packages like numpy from source
- If you encounter issues with the Conda setup, you can try using a Docker-based deployment instead

### Frontend Issues

- Check that the `VITE_API_URL` environment variable is correctly set
- Verify that the build process completes successfully
- Check for any CORS issues in the browser console

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
