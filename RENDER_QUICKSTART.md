# Render Deployment - Quick Start

## 🚀 Deploy in 5 Minutes

### Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy to Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `flex-living-reviews-api`
   - **Root Directory**: `Reviews-Dashboard/backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 3: Add Environment Variables

In the Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=10000
HOSTAWAY_API_KEY=your_actual_api_key_here
HOSTAWAY_ACCOUNT_ID=your_actual_account_id_here
HOSTAWAY_API_BASE_URL=https://api.hostaway.com/v1
GOOGLE_PLACES_API_KEY=your_google_api_key_here
```

### Step 4: Deploy!

Click **"Create Web Service"** and wait 2-5 minutes for deployment.

## ✅ Verify Deployment

Your API will be at: `https://YOUR_SERVICE_NAME.onrender.com`

Test it:
```bash
curl https://YOUR_SERVICE_NAME.onrender.com/health
```

## 📝 Update Frontend

Update `Reviews-Dashboard/frontend/.env`:
```
VITE_API_BASE_URL=https://YOUR_SERVICE_NAME.onrender.com
```

## 🔄 Auto-Deploy

Render automatically redeploys when you push to your main branch:
```bash
git add .
git commit -m "Update"
git push
```

## 📚 Full Documentation

See `RENDER_DEPLOYMENT.md` for detailed instructions and troubleshooting.

## ⚠️ Important Notes

- **Free Tier**: Service spins down after 15 minutes of inactivity
- **Cold Start**: First request after spin down takes 30-60 seconds
- **Production**: Consider upgrading to a paid plan for better performance

## 🆘 Need Help?

- Check logs in Render Dashboard
- See `RENDER_DEPLOYMENT.md` for troubleshooting
- Visit https://render.com/docs

