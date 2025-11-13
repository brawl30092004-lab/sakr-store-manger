# Data Source Setup - Quick Reference

## When You'll See This Dialog

### 🎯 First Time Setup
After clicking "Get Started" on the Welcome Screen, if no data source is configured.

**Dialog Shows:**
- Title: "Set Up Your Data Source"
- Message: "Choose where you want to store and manage your product data"

### ⚠️ File Not Found
When the app can't find your products.json file at the configured location.

**Dialog Shows:**
- Title: "Data Source Not Found"
- Message: "The products.json file could not be found at the configured location"

### 📂 Manual Selection
When you click **File → Browse Data Source** from the menu bar.

**Dialog Shows:**
- Title: "Choose Data Source"
- Message: "Select how you want to manage your product data"

---

## Your Options

### 1️⃣ Create New Local File
**Icon:** 📄 Document with plus sign

**What it does:**
- Creates an empty `products.json` file
- Saves it to your configured project path
- Ready for you to add products

**Best for:**
- First-time users starting fresh
- Creating a new product catalog
- Starting over with clean data

**Result:**
- Empty products.json created
- App shows 0 products
- Ready to add your first product

---

### 2️⃣ Browse for Existing File
**Icon:** 🏠 House with magnifying glass

**What it does:**
- Opens a folder picker dialog
- Select folder containing products.json
- Updates your project path
- Loads products from that folder

**Best for:**
- You have an existing products.json elsewhere
- Moved your files to a new location
- Switching between multiple catalogs
- Opening a backed-up catalog

**Result:**
- Project path updated
- Products loaded from selected folder
- All existing products appear

---

### 3️⃣ Connect to GitHub Repository
**Icon:** 🔗 GitHub logo

**What it does:**
- Closes this dialog
- Opens Settings panel
- Directs you to GitHub configuration section

**Best for:**
- Setting up version control
- Backing up products to cloud
- Collaborating with team members
- Syncing across multiple computers

**Next Steps:**
1. Dialog closes
2. Settings panel opens
3. Configure your GitHub repository details
4. Save settings and enable sync

**Result:**
- Settings opened to GitHub section
- Configure repository URL, branch, token
- Once configured, products sync with GitHub

---

## Tips & Shortcuts

### 💡 Change Anytime
You can change your data source at any time:
- Go to **Settings** (gear icon)
- Scroll to "Data Source" section
- Switch between Local and GitHub

### 💡 Keyboard Shortcuts
- `ESC` - Close dialog (same as clicking Close button)
- Click anywhere outside dialog to close

### 💡 Loading States
When you click an option, you'll see:
- "Creating..." - File being created
- "Opening..." - Folder picker loading
- "Connecting..." - Opening Settings

All other options disabled while processing.

### 💡 Can't Decide?
Click **Close** button:
- Dialog dismisses
- No changes made
- App continues (may show 0 products)
- Can re-open from File menu anytime

---

## Common Scenarios

### Scenario: New User
```
Welcome Screen → Get Started 
  → See "Set Up Your Data Source"
  → Click "Create New Local File"
  → Start adding products
```

### Scenario: Existing User, Wrong Path
```
App Launch → "Data Source Not Found"
  → Click "Browse for Existing File"
  → Select correct folder
  → Products loaded
```

### Scenario: Want GitHub Backup
```
Any time → File → Browse Data Source
  → See "Choose Data Source"
  → Click "Connect to GitHub Repository"
  → Settings opens → Configure GitHub
```

### Scenario: Moved Files
```
App Launch → "Data Source Not Found"
  → Click "Browse for Existing File"
  → Navigate to new location
  → Select folder → Done
```

---

## Troubleshooting

### Dialog Keeps Appearing?
**Problem:** Shows every time you launch  
**Cause:** No valid data source configured  
**Solution:** Choose one of the three options to proceed

### Can't Create File?
**Problem:** "Create New Local File" fails  
**Cause:** No write permission or invalid path  
**Solution:**
1. Click "Browse for Existing File" 
2. Select a folder you have write access to
3. Then try creating again

### Browse Doesn't Open?
**Problem:** Nothing happens when clicking Browse  
**Cause:** System dialog permissions  
**Solution:**
1. Restart the app
2. Check console (F12) for errors
3. Try different option

### Where's GitHub Configuration?
**Problem:** Clicked GitHub, but not sure what to do  
**Cause:** Settings opened but section unclear  
**Solution:**
1. Look for "Data Source" section in Settings
2. Switch to "GitHub Repository" option
3. Fill in repository details
4. Save settings

---

## What Happens Next?

### After Creating New File:
✅ Empty products.json created  
✅ Project path saved  
✅ Dialog closes  
✅ App ready for first product

### After Browsing:
✅ New path selected  
✅ Products loaded (if file exists)  
✅ Dialog closes  
✅ Ready to work

### After Selecting GitHub:
✅ Dialog closes  
✅ Settings panel opens  
✅ Configure repository details  
✅ Enable sync when ready

---

## Need More Help?

### Documentation
- Full implementation details: `DATA_SOURCE_SETUP_DIALOG_IMPLEMENTATION.md`
- GitHub setup guide: `GITHUB_SYNC_IMPLEMENTATION_SUMMARY.md`
- Settings guide: `DATA_SOURCE_SELECTION_QUICK_REFERENCE.md`

### Console Logs
Press `F12` → Console tab to see detailed logs and error messages

### File Menu
**File → Browse Data Source** - Reopen dialog anytime

---

**Remember:** You can always change your data source later in Settings!
