# Food Website Deployment Guide

This guide will help you deploy your food website to Render (backend) and Vercel (frontend).

## Prerequisites

1. **MongoDB Atlas Account**: Create a free MongoDB Atlas cluster
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
4. **GitHub Repository**: Push your code to GitHub

## Step 1: Deploy Backend to Render

### 1.1 Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier)
3. Create a database user
4. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/database`)

### 1.2 Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `food-website-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 1.3 Set Environment Variables in Render

In your Render service dashboard, go to "Environment" tab and add:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/food-website
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Important**: Replace the values with your actual MongoDB connection string and a strong JWT secret.

### 1.4 Deploy

Click "Deploy" and wait for the deployment to complete. Note down the Render URL (e.g., `https://food-website-backend.onrender.com`).

## Step 2: Deploy Frontend to Vercel

### 2.1 Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.2 Set Environment Variables in Vercel

In your Vercel project dashboard, go to "Settings" → "Environment Variables" and add:

```
VITE_API_URL=https://your-render-backend-url.onrender.com
```

**Important**: Replace with your actual Render backend URL.

### 2.3 Deploy

Click "Deploy" and wait for the deployment to complete. Note down the Vercel URL (e.g., `https://your-app.vercel.app`).

## Step 3: Update CORS Configuration

### 3.1 Update Backend CORS

1. Go back to your Render service
2. Update the environment variable `FRONTEND_URL` with your actual Vercel URL
3. Redeploy the service

### 3.2 Update Vercel Environment

1. Go to your Vercel project settings
2. Update the `VITE_API_URL` with your Render backend URL
3. Redeploy the frontend

## Step 4: Test Your Deployment

1. Visit your Vercel frontend URL
2. Try to register/login
3. Test creating recipes
4. Test favoriting recipes

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your `FRONTEND_URL` in Render matches your Vercel URL exactly
2. **API Connection Issues**: Verify your `VITE_API_URL` in Vercel points to your Render backend
3. **Database Connection**: Check your MongoDB Atlas connection string and network access settings
4. **Build Failures**: Check the build logs in both Render and Vercel dashboards

### Environment Variables Checklist

**Render (Backend)**:
- ✅ `MONGO_URI` - Your MongoDB Atlas connection string
- ✅ `JWT_SECRET` - A strong secret key for JWT tokens
- ✅ `NODE_ENV` - Set to `production`
- ✅ `FRONTEND_URL` - Your Vercel frontend URL

**Vercel (Frontend)**:
- ✅ `VITE_API_URL` - Your Render backend URL

## URLs After Deployment

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **API Health Check**: `https://your-backend.onrender.com/api/health`

## Security Notes

1. **JWT Secret**: Use a strong, random secret key
2. **MongoDB**: Enable network access restrictions in Atlas
3. **Environment Variables**: Never commit `.env` files to version control
4. **CORS**: Only allow your specific frontend domain

## Monitoring

- **Render**: Monitor your backend service health and logs
- **Vercel**: Check your frontend deployment status
- **MongoDB Atlas**: Monitor database performance and usage

## Cost

- **Render**: Free tier available (with limitations)
- **Vercel**: Free tier available (with limitations)
- **MongoDB Atlas**: Free tier available (512MB storage)

## Support

If you encounter issues:
1. Check the deployment logs in both Render and Vercel
2. Verify all environment variables are set correctly
3. Test the API endpoints directly using tools like Postman
4. Check MongoDB Atlas connection and network access settings
