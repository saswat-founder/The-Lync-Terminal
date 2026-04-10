# Onboarding and Invite Flow Guide

## Overview
The Startup Progress Intelligence Platform supports multiple onboarding paths based on user role and whether they have an invite link.

---

## 🔗 Invite Links for New Funds

### Admin/Investor Onboarding Invite Link
```
https://your-app.emergentagent.com/admin/onboarding?invite=YOUR_INVITE_CODE
```

**Usage:**
- Share this link with new fund managers or investors
- They can create an account and complete the 6-step admin onboarding
- Sets up workspace, adds companies, invites team members

### Founder Onboarding Invite Link
```
https://your-app.emergentagent.com/founder/onboarding?invite=YOUR_INVITE_CODE
```

**Usage:**
- Share with founders to onboard their startup
- They create an account and complete founder workspace setup
- Connects data sources and configures reporting

---

## 📋 Registration Flow Logic

### New User Signup (Without Invite Link)

**Investor Signup:**
1. User registers with role = "investor"
2. After successful registration → Automatically redirected to `/admin/onboarding`
3. Completes 6-step admin onboarding flow:
   - Step 1: Workspace Setup
   - Step 2: Add Companies
   - Step 3: Team Invitations
   - Step 4: Notification Preferences
   - Step 5: Integrations
   - Step 6: Review & Launch

**Founder Signup:**
1. User registers with role = "founder"
2. After successful registration → Automatically redirected to `/founder/onboarding`
3. Completes founder onboarding flow:
   - Connect data sources (Zoho Books, HubSpot, GitHub, etc.)
   - Configure workspace settings
   - Set reporting preferences

**Admin Signup:**
1. User registers with role = "admin"
2. After successful registration → Automatically redirected to `/admin/onboarding`
3. Same as investor flow

---

## 🎯 Onboarding Routes

### Admin Onboarding
**Route:** `/admin/onboarding`

**Features:**
- 6-step guided setup wizard
- Workspace configuration
- Company portfolio addition
- Team member invitations
- Integration setup
- Notification preferences

**Access:** Automatically shown after investor/admin signup

### Founder Onboarding
**Route:** `/founder/onboarding`

**Features:**
- Data source connections
- Workspace customization
- Reporting schedule setup
- Integration configuration

**Access:** Automatically shown after founder signup

---

## 🏠 Founder Workspace Branding

The founder workspace now displays:
- **Startup Name** as the main heading (instead of "Founder Workspace")
- **Startup Logo** (first letter of startup name in a badge)
- **Subtitle:** "Founder Dashboard • Your operating command center"

**Example:**
```
[T]  TechFlow AI
     Founder Dashboard • Your operating command center
```

---

## 📧 Invite Code Generation (Future Enhancement)

To generate invite codes, admins can use the Admin dashboard:

1. Go to Admin section
2. Navigate to "Team Management"
3. Click "Generate Invite Link"
4. Select role (Investor/Founder/Admin)
5. Copy and share the generated link

**Current Workflow:**
Since invite code generation is not yet implemented, admins can manually share onboarding links:
- For investors: Share `/admin/onboarding` link
- For founders: Share `/founder/onboarding` link

---

## 🎨 UI Updates Made

### Footer Update
- ❌ Removed: "Built for StartupTN Portfolio Monitoring"
- ✅ Updated to: "Portfolio Intelligence Platform for VCs and Founders"
- Now generic and applicable to any VC firm

### Cohort Names Updated
- ❌ Removed: "StartupTN Batch 2025/2024/2023"
- ✅ Updated to: "Q1 2025 Portfolio", "Q2 2024 Portfolio", etc.
- Generic naming for any fund

### Founder Workspace
- ✅ Shows actual startup name as main heading
- ✅ Shows startup logo (first letter badge)
- ❌ No longer shows generic "Founder Workspace"

---

## 📊 New Investor Profile Created

**Investor:** James Wilson  
**Email:** james.wilson@venture.capital  
**Password:** investor123  
**Portfolio:** 25 startups  
**Reports:** 97 total reports  
**Alerts:** 10 active alerts

**Login and view:**
1. Go to `/login`
2. Email: `james.wilson@venture.capital`
3. Password: `investor123`
4. View portfolio dashboard with all 25 startups

---

## 📄 PDF Export Feature

**New Capability:**
- Export any report as a professional PDF
- Click the download icon on any report card
- PDF includes:
  - Report header with startup name and period
  - Summary metrics table (revenue, growth, runway, etc.)
  - All report sections with content
  - Section-specific metrics
  - Generated timestamp

**Backend API:**
```
GET /api/reports/{report_id}/export/pdf
```

**Frontend Usage:**
```javascript
await api.reports.exportPDF(reportId);
```

---

## 🚀 Quick Start for New Funds

### Step 1: Deploy the Platform
Deploy to Emergent or your preferred hosting platform

### Step 2: First Admin Setup
1. Register as an investor/admin
2. Complete admin onboarding
3. Add your portfolio companies

### Step 3: Invite Founders
1. Share founder onboarding link
2. Founders complete setup
3. They connect data sources

### Step 4: Monitor Portfolio
1. View portfolio dashboard
2. Access reports (97 sample reports available)
3. Monitor alerts and activities
4. Export reports as PDF

---

## ✨ Summary of Changes

1. ✅ Created new investor profile (james.wilson@venture.capital) with 25 startups
2. ✅ Generated 97 dummy reports across all startups
3. ✅ Added PDF export functionality for reports
4. ✅ Removed "StartupTN" branding - now generic platform
5. ✅ Auto-redirect to onboarding based on role (investor → admin onboarding, founder → founder onboarding)
6. ✅ Founder workspace shows startup name and logo instead of "Founder Workspace"
7. ✅ Updated footer to be platform-generic
8. ✅ Updated cohort names to be fund-agnostic

---

**For Questions or Custom Invite Flow:**
Refer to `/admin/onboarding` and `/founder/onboarding` routes in the application.
