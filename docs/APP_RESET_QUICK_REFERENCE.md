# App Reset - Quick Reference

## 🎯 Two Ways to Reset

### 1️⃣ Force Reset (Crash Screen)
**When:** App crashes repeatedly  
**Access:** Error screen → Expand "⚠️ Crash persists? Try Force Reset"  
**Safety:** One confirmation dialog  
**Use Case:** Emergency recovery

### 2️⃣ Reset App (Tools Menu)
**When:** Want clean start without crash  
**Access:** Tools → ⚠️ Reset App...  
**Safety:** Multiple warnings + confirmation dialog  
**Use Case:** Planned reset, switching setups

---

## ✗ What Gets Deleted

- All settings and configurations
- GitHub credentials
- AppData/Roaming data
- Logs and temp files
- localStorage (welcome screen, etc.)
- Window size/position

## ✓ What Stays Safe

- products.json
- Product images
- Entire project folder

---

## 📝 Quick Steps

### Force Reset (Emergency)
```
1. App crashes → Error screen appears
2. Expand "⚠️ Crash persists? Try Force Reset"
3. Read warning
4. Click "⚠️ Force Reset App Data"
5. Confirm in dialog
6. App relaunches automatically
7. Welcome screen appears
```

### Reset App (Planned)
```
1. Tools → ⚠️ Reset App...
2. Read comprehensive warning dialog
3. Click "⚠️ Yes, Reset App Data"
4. Toast notification appears
5. App quits and relaunches
6. Welcome screen appears
7. Reconfigure settings
```

---

## 🎨 Visual Guide

### Force Reset Button Location
```
Error Screen
├── Restart Application (blue)
├── Copy Error Details (gray)
└── ▼ Crash persists? Try Force Reset
    └── ⚠️ Force Reset App Data (red)
```

### Reset App Menu Location
```
Tools Menu
├── Publish to Store
├── Check for Updates
├── Open Data Folder
└── ── Danger Zone ──
    └── ⚠️ Reset App...
```

---

## ⚠️ Important Notes

**Before Reset:**
- Export products (backup)
- Note GitHub credentials
- Screenshot custom settings

**After Reset:**
- Welcome screen appears
- Configure data source
- Re-enter GitHub credentials
- Select project path again

**If Reset Fails:**
- Manually delete: `%APPDATA%\SakrStoreManager`
- Relaunch app
- Products.json will be safe in project folder

---

## 🔑 Key Differences

| Feature | Force Reset | Reset App |
|---------|------------|-----------|
| **Access** | Crash screen | Tools menu |
| **Safety** | 1 confirmation | Multiple warnings |
| **Use Case** | Emergency | Planned |
| **Speed** | Immediate | Deliberate |
| **Visibility** | Hidden (expandable) | Menu option |

---

## 🧪 Test It Works

1. **Trigger crash:** F12 → Console → `throw new Error("test")`
2. **Try Force Reset:** Click through and confirm
3. **Verify:** App relaunches, welcome screen appears
4. **Check:** products.json still exists in project folder

---

## 📞 Troubleshooting

**Reset button doesn't work?**
- Check console for errors (F12)
- Try manual deletion of AppData folder
- Relaunch app manually

**App won't relaunch?**
- Wait a few seconds
- Launch app manually from Start Menu
- Check if process is still running (Task Manager)

**Products are gone?**
- Check project folder - they should be there
- products.json is NEVER deleted by reset
- If missing, restore from backup

---

## 💡 Pro Tips

1. **Test in dev mode first** - Make sure it works for your setup
2. **Keep GitHub token saved separately** - You'll need to re-enter it
3. **Use Export feature before reset** - Extra safety for products
4. **Document your project path** - You'll need to set it again
5. **Screenshot settings** - Easier to reconfigure

---

## 🎓 When to Use Each Method

### Use Force Reset When:
- ✅ App won't start due to bad config
- ✅ Settings page is inaccessible
- ✅ Crash loop on startup
- ✅ Need immediate fix

### Use Reset App When:
- ✅ Switching to different project
- ✅ Want fresh start (planned)
- ✅ GitHub credentials need full reset
- ✅ Testing app as new user
- ✅ Configuration is messy but app works

---

**Remember:** Reset is safe - your products and images are protected! ✅

---

**See full documentation:** `APP_RESET_IMPLEMENTATION.md`
