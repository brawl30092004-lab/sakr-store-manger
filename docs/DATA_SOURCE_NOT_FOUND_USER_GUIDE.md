# Quick User Guide - Data Source Not Found Dialog

## What You'll See

### When products.json is Missing

A dialog will appear automatically when the app cannot find your products.json file:

```
┌──────────────────────────────────────────────────────┐
│  ⚠️ Data Source Not Found                            │
├──────────────────────────────────────────────────────┤
│                                                       │
│  The products.json file could not be found at the    │
│  configured location.                                │
│                                                       │
│  Would you like to create a new file or browse for   │
│  an existing one?                                    │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │  📄  Create New File                           │ │
│  │      Create an empty products.json file at     │ │
│  │      the configured location                   │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │  🔍  Browse for Existing File                  │ │
│  │      Select a different folder containing your │ │
│  │      products.json file                        │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  💡 Tip: You can change the data source location    │
│     anytime in Settings.                             │
│                                                       │
│                                    [Close]            │
└──────────────────────────────────────────────────────┘
```

## How to Use

### Option 1: Create New File (Recommended for First Time)

**When to use:**
- First time using the app
- Starting fresh with no existing data
- Lost or deleted your products.json

**Steps:**
1. Click the **"Create New File"** option (📄 icon)
2. Wait for "Creating..." message
3. Dialog closes automatically
4. App shows 0 products - ready to add your first product!

**Result:**
- Empty `products.json` created at your configured project path
- File contains: `[]` (empty array)
- UTF-8 encoded for Arabic support
- Ready for products to be added

### Option 2: Browse for Existing File

**When to use:**
- You have products.json somewhere else
- Changed folders and need to update path
- Working with multiple product databases

**Steps:**
1. Click the **"Browse for Existing File"** option (🔍 icon)
2. Wait for folder picker to open
3. Navigate to folder containing your products.json
4. Click "Select Folder"
5. Dialog closes automatically
6. Products load from new location

**Result:**
- Project path updated to selected folder
- Products.json loaded from new location
- All existing products appear in the app

### Option 3: Close Dialog

**When to use:**
- Want to configure settings first
- Not ready to make a decision
- Need to check file location manually

**Steps:**
1. Click the **"Close"** button at bottom
2. Dialog dismisses
3. App continues with no products loaded
4. Can open Settings to configure path

**Result:**
- Dialog closes
- No changes made
- Can access Settings anytime

## Settings Scrolling

### How to Scroll in Settings

**Before this update:**
- Content could be cut off on small screens
- Some settings hidden

**Now:**
- Settings page scrolls smoothly
- Custom dark-themed scrollbar
- All content accessible

**How to scroll:**
- Mouse wheel - Scroll up/down
- Scrollbar - Click and drag
- Trackpad - Two-finger swipe
- Keyboard - Page Up/Down, Arrow keys

**Visual indicator:**
- Scrollbar appears on right side when content exceeds viewport
- Dark gray scrollbar matches app theme
- Lights up on hover for easy visibility

## Common Scenarios

### Scenario 1: Brand New User
```
Launch app → Dialog appears → Click "Create New File" 
→ Empty products.json created → Start adding products
```

### Scenario 2: Existing User, Wrong Path
```
Launch app → Dialog appears → Click "Browse for Existing File" 
→ Select correct folder → Products load → Continue working
```

### Scenario 3: Moved Files
```
Launch app → Dialog appears → Click "Browse for Existing File" 
→ Navigate to new location → Select folder → Path updated
```

### Scenario 4: Want to Check Settings First
```
Launch app → Dialog appears → Click "Close" 
→ Go to Settings → Browse and configure → Return to main view
```

## Tips & Tricks

### 💡 Tip 1: Default Location
The app looks for products.json at:
```
E:\sakr store manger\mockup products and images\products.json
```

### 💡 Tip 2: Change Anytime
You can change your data source location anytime:
1. Open Settings
2. Use the Browse button under "Local Project Path"
3. Select new folder
4. Products reload automatically

### 💡 Tip 3: Data Source Modes
Remember, you can also switch between:
- **Local Files** (Browse from computer)
- **GitHub** (Coming soon)

### 💡 Tip 4: File Structure
Your folder should contain:
```
your-project-folder/
  ├── products.json
  └── images/
      ├── product-1.jpg
      ├── product-2.jpg
      └── ...
```

### 💡 Tip 5: Manual Creation
You can also create products.json manually:
1. Create a text file named `products.json`
2. Add content: `[]`
3. Save with UTF-8 encoding
4. Restart app or reload

## Troubleshooting

### Dialog Keeps Appearing
**Problem:** Dialog shows every time you launch
**Solution:** 
- You haven't created or selected a file yet
- Choose one of the options to proceed
- Verify the file exists at the configured path

### "Create New File" Doesn't Work
**Problem:** File not created after clicking
**Solution:**
- Check folder permissions (needs write access)
- Verify path in Settings is correct
- Try browsing to a different folder with write access

### Browse Dialog Doesn't Open
**Problem:** Nothing happens when clicking Browse
**Solution:**
- Check system permissions for file dialogs
- Restart the app
- Check console for errors (F12)

### Products Don't Load After Browsing
**Problem:** Selected folder but products don't appear
**Solution:**
- Verify products.json exists in selected folder
- Check file is valid JSON format
- Look at file name (must be exactly "products.json")
- Check file isn't corrupted

### Settings Page Not Scrolling
**Problem:** Can't see all settings
**Solution:**
- Try resizing window
- Use mouse wheel or arrow keys
- Update app to latest version
- Check if scrollbar is visible on right side

## Keyboard Shortcuts

While dialog is open:
- `Escape` - Close dialog (same as clicking Close button)
- `Enter` - Not active (must click option)

In Settings page:
- `Mouse Wheel` - Scroll up/down
- `Page Up/Down` - Jump by page
- `Home/End` - Go to top/bottom
- `Arrow Up/Down` - Scroll slowly

---

## Need More Help?

**Check the documentation:**
- Full implementation details in `DATA_SOURCE_NOT_FOUND_IMPLEMENTATION.md`
- Settings guide in `GITHUB_SETTINGS_QUICK_REFERENCE.md`

**Check the console:**
- Press F12 to open Developer Tools
- Look at Console tab for detailed error messages
- Share console output when asking for help
