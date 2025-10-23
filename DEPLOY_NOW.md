# 🚀 Deploy Dinner Time to Netlify - Step by Step

Your app is **100% ready to deploy**! Follow these steps to get it live at dinnerti-me.netlify.app

---

## Step 1: Create GitHub Repository (5 minutes)

### Option A: Using GitHub CLI (Fastest)
```bash
# Install gh if you haven't
brew install gh  # macOS
# or download from https://cli.github.com/

# Login to GitHub
gh auth login

# Create repository and push
gh repo create dinner-time --public --source=. --remote=origin --push
```

### Option B: Using GitHub Website
1. Go to https://github.com/new
2. Repository name: `dinner-time` (or any name you want)
3. Choose Public or Private
4. **DO NOT** initialize with README (your project already has one)
5. Click "Create repository"

6. In your terminal, run:
```bash
git remote add origin https://github.com/YOUR-USERNAME/dinner-time.git
git branch -M main  # Rename to main if needed
git push -u origin 001-make-an-app
```

---

## Step 2: Connect to Netlify (3 minutes)

### If You Don't Have a Netlify Account:
1. Go to https://netlify.com
2. Click "Sign up" → Choose "Sign up with GitHub"
3. Authorize Netlify to access your GitHub

### Deploy Your Site:
1. Go to https://app.netlify.com/start
2. Click "Import from Git"
3. Click "GitHub"
4. Find and select your `dinner-time` repository
5. Configure build settings:
   - **Branch to deploy**: `001-make-an-app`
   - **Build command**: `npm run build:web`
   - **Publish directory**: `web-build`
6. Click "Deploy site"

---

## Step 3: Configure Custom Domain (2 minutes)

After deployment completes:

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Enter: `dinnerti-me.netlify.app`
4. Click "Verify" → "Add domain"

Your app will be live at: **https://dinnerti-me.netlify.app**

---

## Step 4: Enable Automatic Deployments

**Already configured!** Every time you push to GitHub:
```bash
git add .
git commit -m "Add new feature"
git push origin 001-make-an-app
```

Netlify will:
1. Detect the push (within seconds)
2. Run `npm run build:web`
3. Deploy the new version (2-3 minutes)
4. Update your live site automatically

---

## What You Get

✅ **Live web app** at dinnerti-me.netlify.app
✅ **Automatic HTTPS** (free SSL certificate)
✅ **Automatic deployments** on every git push
✅ **Deploy previews** for pull requests
✅ **Rollback** to any previous version
✅ **Free hosting** (300 build minutes/month)

---

## Testing Your Deployment

Once live, your web app will have:
- User profile creation and selection
- User dashboard with quick actions
- SQLite data stored in browser (IndexedDB)
- Responsive design for desktop and mobile web
- Production-optimized bundle (443 KiB)

---

## Next Steps After Deployment

### Immediate (Optional):
```bash
# Merge to main branch
git checkout main
git merge 001-make-an-app
git push origin main

# Update Netlify to deploy from 'main' instead
```

### Future Updates:
```bash
# Add new features
# Edit src/App.web.tsx or other files

# Commit and push
git add .
git commit -m "Add new feature"
git push

# Netlify auto-deploys in 2-3 minutes
```

---

## Current Build Info

- **Bundle size**: 443 KiB (optimized for web)
- **Build time**: ~4 seconds
- **Build output**: `web-build/`
- **Entry point**: `src/App.web.tsx`
- **Mobile app**: `src/App.tsx` (unchanged)

---

## Troubleshooting

### Build fails on Netlify?
Check the build log. Common fixes:
```bash
# Ensure package.json has correct scripts
"build:web": "webpack --mode production"

# Ensure netlify.toml is committed
git add netlify.toml
git commit -m "Add netlify config"
git push
```

### Domain not working?
- Wait 5-10 minutes for DNS propagation
- Check Site settings → Domain management
- Ensure HTTPS is enabled (automatic)

### Want to see build locally?
```bash
npm run web
# Opens http://localhost:3000
```

---

## Your Project Status

- ✅ Code: Complete and committed
- ✅ Build: Successful (443 KiB bundle)
- ✅ Git: Ready to push
- ⏳ GitHub: Need to create repo
- ⏳ Netlify: Need to connect

**Time to deploy**: ~10 minutes total
**Ongoing effort**: Zero (automatic updates)

---

Ready to deploy? Start with **Step 1** above! 🚀
