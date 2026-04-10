# Deployment Guide for Discus E-commerce Platform

## Backend Deployment on Render

### Prerequisites
- Render account (https://render.com)
- Git repository with your code pushed to GitHub

### Steps:

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Render Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Choose the repository and branch (main)
   - Set up the service:
     * **Name:** discus-ecommerce-backend
     * **Environment:** Node
     * **Build Command:** `cd backend && npm install`
     * **Start Command:** `cd backend && npm start`
     * **Plan:** Free (or Starter for production)

3. **Add Environment Variables**
   In Render dashboard, go to Environment and add:
   ```
   SUPABASE_URL: your_supabase_url
   SUPABASE_KEY: your_supabase_key
   SUPABASE_ADMIN_KEY: your_supabase_admin_key
   JWT_SECRET: your_jwt_secret
   CLOUDINARY_CLOUD_NAME: your_cloudinary_name
   CLOUDINARY_API_KEY: your_cloudinary_api_key
   CLOUDINARY_API_SECRET: your_cloudinary_api_secret
   FRONTEND_URL: https://your-frontend-domain.vercel.app
   NODE_ENV: production
   PORT: 5000
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your backend
   - Your backend URL will be: `https://discus-ecommerce-backend.onrender.com`

5. **Update CORS in Backend**
   Ensure your ```FRONTEND_URL``` environment variable is set correctly for CORS to work.

---

## Frontend Deployment on Vercel

### Prerequisites
- Vercel account (https://vercel.com)
- Git repository with your code pushed to GitHub

### Steps:

1. **Install Vercel CLI (optional)**
   ```bash
   npm install -g vercel
   ```

2. **Deploy using Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - **Framework Preset:** Vite
   - **Root Directory:** `./frontend`
   - Configure build settings:
     * **Build Command:** `npm run build`
     * **Output Directory:** `dist`
     * **Install Command:** `npm install`

3. **Add Environment Variables**
   In Vercel project settings → Environment Variables, add:
   ```
   VITE_API_URL: https://discus-ecommerce-backend.onrender.com/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - Your frontend URL will be shown in the dashboard

---

## Update API Calls in Frontend

Make sure your frontend API calls use the environment variable:

### In `src/services/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
});
```

---

## Environment Variable Configuration Summary

### Backend (.env on Render)
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_ADMIN_KEY=your_supabase_admin_key
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=https://your-vercel-frontend.vercel.app
NODE_ENV=production
```

### Frontend (.env on Vercel)
```
VITE_API_URL=https://discus-ecommerce-backend.onrender.com/api
```

---

## Post-Deployment Checklist

- [ ] Backend runs without errors on Render
- [ ] Frontend builds successfully on Vercel
- [ ] API endpoints are accessible from frontend
- [ ] CORS is properly configured
- [ ] Environment variables are all set
- [ ] Database connections work (Supabase)
- [ ] File uploads work (Cloudinary)
- [ ] Authentication endpoints work (JWT)
- [ ] Test a complete user flow (register → login → browse → order)

---

## Troubleshooting

### Backend Issues on Render
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure Node version compatibility
- Check CORS configuration for your frontend URL

### Frontend Issues on Vercel
- Check build logs in Vercel dashboard
- Verify VITE_API_URL is correctly set
- Ensure all API calls use the environment variable
- Check browser console for CORS errors

### Connection Issues
- Verify backend URL in frontend VITE_API_URL
- Check CORS on backend includes your Vercel domain
- Test API endpoints directly using Postman/cURL
- Check network tab in browser DevTools

---

## Cost Considerations

**Render:** Free tier includes 1 free web service, but may sleep after 15 minutes of inactivity
**Vercel:** Free tier includes 1 concurrent deployment, good for production use

For production, consider upgrading to paid plans for better uptime and performance.
