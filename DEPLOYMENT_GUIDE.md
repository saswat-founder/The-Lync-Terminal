# 🚀 PRODUCTION DEPLOYMENT GUIDE
## Startup Intel Platform - Ready to Deploy

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before deploying, ensure you have:

- [ ] **MongoDB Atlas Account** (Free tier available)
  - Sign up: https://cloud.mongodb.com
  - Create cluster (M0 Free tier is fine for MVP)
  - Create database user
  - Whitelist IP addresses (or use 0.0.0.0/0 for now)
  - Get connection string

- [ ] **Resend Account** (Free tier: 100 emails/day)
  - Sign up: https://resend.com
  - Get API key from dashboard
  - Verify sender domain (optional, can use resend.dev for testing)

- [ ] **Domain Names** (Optional but recommended)
  - Frontend: app.yourdomain.com
  - Backend: api.yourdomain.com
  - OR use Emergent's provided domains

- [ ] **Production SECRET_KEY Generated**
  ```bash
  python3 -c "import secrets; print(secrets.token_urlsafe(32))"
  ```

---

## 🎯 DEPLOYMENT METHOD: EMERGENT NATIVE

**Emergent provides the easiest deployment path:**

### Step 1: Prepare for Deployment

1. **Generate New SECRET_KEY:**
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   # Copy this - you'll need it in environment variables
   ```

2. **Set up MongoDB Atlas:**
   - Create free cluster at https://cloud.mongodb.com
   - Create database: `startup_intel_production`
   - Create user with read/write permissions
   - Get connection string (replace <password> with actual password)
   - Example: `mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

3. **Set up Resend (Email):**
   - Get API key from https://resend.com/api-keys
   - Note: Free tier allows 100 emails/day (sufficient for MVP)

### Step 2: Deploy Using Emergent

**Option A: Use Emergent's "Deploy" Button** (Recommended)
1. Click the "Deploy" button in the Emergent interface
2. Emergent will handle:
   - Setting up HTTPS
   - Providing domain names
   - Auto-scaling
   - Zero-downtime deployments

**Option B: GitHub Integration**
1. Save your work to GitHub using Emergent's "Save to GitHub" feature
2. Deploy from GitHub repository

### Step 3: Set Environment Variables in Emergent

When prompted, add these environment variables:

**Backend Environment Variables:**
```
SECRET_KEY=<your-generated-32-char-string>
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/startup_intel_production
DB_NAME=startup_intel_production
CORS_ORIGINS=https://your-frontend-domain.com
RESEND_API_KEY=re_your_resend_key
SENDER_EMAIL=onboarding@yourdomain.com
FRONTEND_URL=https://your-frontend-domain.com
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=60
```

**Frontend Environment Variables:**
```
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

### Step 4: Verify Deployment

Once deployed, verify:

1. **Health Check:**
   ```bash
   curl https://your-backend-domain.com/api/health
   # Should return: {"status": "healthy", "database": "connected"}
   ```

2. **Frontend Loads:**
   - Visit: https://your-frontend-domain.com
   - Should see login page

3. **Test Login:**
   - Use admin credentials: admin@startupintel.com / admin123
   - Should successfully login and see portfolio dashboard

4. **Test Admin Onboarding:**
   - Go to /admin/onboarding
   - Complete all 6 steps
   - Should create workspace in MongoDB
   - Should send email invitation (check spam folder)

---

## 🔧 ALTERNATIVE: MANUAL DEPLOYMENT (Railway/Heroku/Vercel)

### Backend Deployment (Railway/Heroku)

1. **Install CLI:**
   ```bash
   # Railway
   npm install -g railway
   
   # OR Heroku
   npm install -g heroku
   ```

2. **Deploy Backend:**
   ```bash
   cd /app/backend
   
   # Railway
   railway login
   railway init
   railway up
   
   # OR Heroku
   heroku login
   heroku create startup-intel-api
   git push heroku main
   ```

3. **Set Environment Variables:**
   ```bash
   # Railway
   railway variables set SECRET_KEY="your-key"
   railway variables set MONGO_URL="your-mongo-url"
   # ... (all other variables)
   
   # OR Heroku
   heroku config:set SECRET_KEY="your-key"
   heroku config:set MONGO_URL="your-mongo-url"
   # ... (all other variables)
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Build Frontend:**
   ```bash
   cd /app/frontend
   yarn build
   ```

2. **Deploy:**
   ```bash
   # Vercel
   npm install -g vercel
   vercel --prod
   
   # OR Netlify
   npm install -g netlify-cli
   netlify deploy --prod --dir=build
   ```

3. **Set Environment Variable:**
   - Add `REACT_APP_BACKEND_URL` in deployment dashboard

---

## 📊 POST-DEPLOYMENT VERIFICATION

### Functional Tests

**1. Authentication:**
```bash
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@startupintel.com","password":"admin123"}'
  
# Should return JWT token
```

**2. Admin Onboarding:**
- Login as admin
- Navigate to /admin/onboarding
- Complete all steps
- Verify workspace created in MongoDB
- Check email received (if team invited)

**3. Founder Onboarding:**
- Admin invites founder
- Check founder email inbox
- Click invitation link
- Complete onboarding
- Login as founder

**4. Portfolio Dashboard:**
- View portfolio overview
- Click on startup
- Verify metrics display
- Check integrations page

### Monitor Logs

**Check for errors:**
- Backend errors in deployment platform dashboard
- Frontend console errors in browser DevTools
- MongoDB connection issues
- Email delivery failures

---

## 🐛 TROUBLESHOOTING

### Issue: Backend 500 Error
**Solution:** Check environment variables are set correctly
```bash
# Verify SECRET_KEY is set
echo $SECRET_KEY

# Verify MongoDB connection
curl https://api.yourdomain.com/api/health
```

### Issue: CORS Error
**Solution:** Update CORS_ORIGINS to include frontend domain
```bash
CORS_ORIGINS="https://app.yourdomain.com"
```

### Issue: Emails Not Sending
**Solution:** 
1. Verify RESEND_API_KEY is correct
2. Check Resend dashboard for delivery status
3. Verify sender email is configured
4. Check spam folder

### Issue: MongoDB Connection Failed
**Solution:**
1. Verify connection string format
2. Check MongoDB Atlas IP whitelist
3. Verify database user credentials
4. Test connection locally first

---

## 🎉 SUCCESS CRITERIA

Your deployment is successful when:

- ✅ Health check returns `{"status": "healthy"}`
- ✅ Frontend loads without errors
- ✅ Admin can login
- ✅ Admin onboarding creates workspace
- ✅ Email invitations are sent and received
- ✅ Founder can complete onboarding
- ✅ Portfolio dashboard shows real data
- ✅ No console errors in browser
- ✅ Backend logs show no errors

---

## 📈 MONITORING & MAINTENANCE

### Set Up Monitoring

1. **Uptime Monitoring:**
   - UptimeRobot (free): https://uptimerobot.com
   - Monitor: /api/health endpoint

2. **Error Tracking:**
   - Sentry (free tier): https://sentry.io
   - Integrates with FastAPI & React

3. **Database Monitoring:**
   - MongoDB Atlas built-in monitoring
   - Set up alerts for high CPU/memory

### Regular Maintenance

- **Weekly:** Check error logs
- **Monthly:** Review API usage, email quota
- **Quarterly:** Update dependencies, security patches

---

## 🔐 SECURITY CHECKLIST

Before going live:

- [x] SECRET_KEY is unique and secure (32+ characters)
- [x] CORS restricted to specific domains (not "*")
- [x] Rate limiting enabled
- [x] HTTPS enabled (handled by deployment platform)
- [x] MongoDB authentication enabled
- [x] Environment variables not committed to git
- [ ] Set up backup strategy for MongoDB
- [ ] Configure firewall rules (if applicable)
- [ ] Set up SSL for custom domains

---

## 📞 SUPPORT

**Emergent Platform:**
- Documentation: https://docs.emergent.sh
- Support: Via Emergent dashboard

**MongoDB Atlas:**
- Docs: https://docs.atlas.mongodb.com
- Support: https://support.mongodb.com

**Resend:**
- Docs: https://resend.com/docs
- Support: support@resend.com

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

1. **Test with Real Users:**
   - Invite 5-10 early adopters
   - Gather feedback
   - Monitor usage patterns

2. **Iterate Based on Feedback:**
   - Add most-requested features
   - Fix reported bugs
   - Optimize performance

3. **Scale Gradually:**
   - Monitor MongoDB performance
   - Upgrade email plan if needed
   - Add caching if necessary

4. **Add Remaining Features:**
   - Wire Alerts, Reports, Live Feed pages
   - Add PDF export for reports
   - Implement real-time updates

---

**🚀 You're ready to deploy! Good luck!**

For Emergent deployment, use the "Deploy" button and follow the prompts.
For manual deployment, follow the steps above for your chosen platform.
