# Render Deployment Guide

This guide explains how to deploy the Flex Living Reviews Dashboard backend API to Render.

## Prerequisites

- A Render account (sign up at https://render.com)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Environment variables ready (API keys, etc.)

## Deployment Steps

### Option 1: Deploy via Render Dashboard (Recommended)

1. **Log in to Render Dashboard**
   - Go to https://dashboard.render.com
   - Sign in or create an account

2. **Create a New Web Service**
   - Click "New +" button
   - Select "Web Service"

3. **Connect Your Repository**
   - Connect your GitHub/GitLab/Bitbucket account
   - Select your repository
   - Click "Connect"

4. **Configure the Service**
   - **Name**: `flex-living-reviews-api` (or your preferred name)
   - **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `Reviews-Dashboard/backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid plan for better performance)

5. **Add Environment Variables**
   Click "Advanced" and add these environment variables:
   
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render's default)
   - `HOSTAWAY_API_KEY` = `your_hostaway_api_key`
   - `HOSTAWAY_ACCOUNT_ID` = `your_hostaway_account_id`
   - `HOSTAWAY_API_BASE_URL` = `https://api.hostaway.com/v1`
   - `GOOGLE_PLACES_API_KEY` = `your_google_api_key` (optional)

6. **Configure Health Check**
   - **Health Check Path**: `/health`

7. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - Wait for deployment to complete (usually 2-5 minutes)

### Option 2: Deploy via render.yaml (Infrastructure as Code)

1. **Use the provided render.yaml**
   - The `render.yaml` file is already configured in the backend directory
   - Push your code to your Git repository

2. **Create Blueprint**
   - In Render Dashboard, go to "Blueprints"
   - Click "New Blueprint Instance"
   - Connect your repository
   - Select the repository and branch
   - Render will detect the `render.yaml` file

3. **Set Environment Variables**
   - You'll be prompted to set the environment variables marked as `sync: false`
   - Add your API keys and credentials

4. **Deploy**
   - Click "Apply" to deploy
   - Render will create the service based on the YAML configuration

## Post-Deployment

### 1. Verify Deployment

Once deployed, your API will be available at:
```
https://flex-living-reviews-api.onrender.com
```

Test the health endpoint:
```bash
curl https://your-service-name.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 2. Test API Endpoints

```bash
# Get Hostaway reviews
curl https://your-service-name.onrender.com/api/reviews/hostaway

# Get all reviews
curl https://your-service-name.onrender.com/api/reviews

# Get stats
curl https://your-service-name.onrender.com/api/reviews/stats
```

### 3. Update Frontend Configuration

Update your frontend's API base URL to point to your Render deployment:

In `Reviews-Dashboard/frontend/.env`:
```
VITE_API_BASE_URL=https://your-service-name.onrender.com
```

## Important Notes

### Free Tier Limitations

- **Spin Down**: Free tier services spin down after 15 minutes of inactivity
- **Cold Start**: First request after spin down takes 30-60 seconds
- **Upgrade**: Consider upgrading to a paid plan for production use

### CORS Configuration

The backend is already configured to accept requests from any origin. If you need to restrict CORS:

Edit `Reviews-Dashboard/backend/src/server.ts`:
```typescript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

### Environment Variables

Never commit sensitive environment variables to Git. Always use Render's environment variable management.

## Troubleshooting

### Build Fails

- Check build logs in Render Dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles locally: `npm run build`

### Service Won't Start

- Check start logs in Render Dashboard
- Verify `npm start` works locally
- Ensure PORT environment variable is set to 10000

### API Returns Errors

- Check service logs in Render Dashboard
- Verify environment variables are set correctly
- Test endpoints locally first

## Monitoring

- **Logs**: View real-time logs in Render Dashboard
- **Metrics**: Monitor CPU, memory, and bandwidth usage
- **Alerts**: Set up email alerts for service failures

## Updating Your Deployment

Render automatically deploys when you push to your connected branch:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render will detect the push and automatically rebuild and redeploy.

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Render Status: https://status.render.com

