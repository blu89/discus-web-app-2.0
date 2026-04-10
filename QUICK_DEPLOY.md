# Quick Deployment Checklist for Render & Vercel

## Step 1: Prepare Your Code
```bash
# Make sure all your code is committed
git status
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## Step 2: Deploy Backend to Render

### Option A: Using render.yaml (Recommended)
1. Push your repo with the `render.yaml` file
2. Go to https://dashboard.render.com
3. Click "New +" → "Web Service"
4. Select "Connect a Git repository"
5. Find your repository and select it
6. It will automatically detect `render.yaml`
7. Click "Create Web Service"
8. **Important:** Go to Environment tab and add these variables:
   - `SUPABASE_URL` = (copy from your .env)
   - `SUPABASE_KEY` = (copy from your .env)
   - `SUPABASE_ADMIN_KEY` = (copy from your .env)
   - `JWT_SECRET` = (copy from your .env)
   - `CLOUDINARY_CLOUD_NAME` = (copy from your .env)
   - `CLOUDINARY_API_KEY` = (copy from your .env)
   - `CLOUDINARY_API_SECRET` = (copy from your .env)
   - `FRONTEND_URL` = (your future Vercel URL, e.g., https://myapp.vercel.app)

### Option B: Manual Configuration
Same as Option A, but create web service manually without render.yaml

**After Backend Deployment:**
- Your backend URL: `https://your-service-name.onrender.com`
- Wait for "Build in progress" → "Live" status

---

## Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Find your GitHub repo
5. Configure:
   - **Framework:** Vite
   - **Root Directory:** `./frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
6. Click "Deploy"
7. **Important:** After deployment, go to Settings → Environment Variables
8. Add:
   - `VITE_API_URL` = `https://your-backend-service.onrender.com/api`

**After Frontend Deployment:**
- Your frontend URL will be shown (e.g., https://myapp.vercel.app)
- Update backend's `FRONTEND_URL` environment variable with this URL

---

## Step 4: Final Configuration

### Update Backend FRONTEND_URL
1. Go to Render dashboard → your backend service → Environment
2. Update `FRONTEND_URL` with your Vercel frontend URL
3. Click "Save Changes" (Render will redeploy automatically)

### Test Connectivity
1. Open your Vercel frontend URL
2. Try to log in or register
3. Check browser console (F12) for any CORS errors
4. If errors, verify:
   - Backend URL is correct (no /api at the end when setting FRONTEND_URL)
   - Environment variables are set
   - Backend is running ("Live" status on Render)

---

## Environment Variable Reference

### Backend (Render)
```
SUPABASE_URL=https://qpdjwtetrghxttipfyba.supabase.co
SUPABASE_KEY=sb_publishable_...
SUPABASE_ADMIN_KEY=sb_secret_...
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=doqzc3md2
CLOUDINARY_API_KEY=272118437965427
CLOUDINARY_API_SECRET=FwQPsrzNQZVc0Z...
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-service.onrender.com/api
```

---

## Useful Commands

### Test Backend Locally
```bash
cd backend
npm install
npm run dev
```

### Test Frontend Locally
```bash
cd frontend
npm install
npm run dev
```

### Test API Connection from Frontend
```bash
# Open browser console and run:
fetch('https://your-backend.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS Error | Make sure FRONTEND_URL is set in backend .env |
| 404 on API calls | Verify VITE_API_URL in frontend includes `/api` |
| Build fails | Check logs in Vercel/Render dashboard |
| Environmental variables not found | Redeploy after adding variables |
| Free Render instance sleeps | Consider upgrading to paid plan for production |

---

## Need Help?

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Check deployment logs in dashboard for error messages**
