# Reset Tool - Quick Reference

## 🚀 How to Use

```cmd
reset-tool.bat
```

Then pick an option from the menu.

---

## Options at a Glance

### 🟢 Option 1: Quick Safe Reset
- **When:** App issues, need quick fix
- **Speed:** 2-3 seconds
- **Safety:** ✅ Keeps all your data
- **Confirmation:** None (just press Enter)

### 🔵 Option 2: Smart Reset (Safe)  
- **When:** Want to see what's happening
- **Speed:** 5-10 seconds
- **Safety:** ✅ Keeps all your data
- **Confirmation:** Type "RESET"
- **Shows:** All detected paths, project location, .git status

### 🟠 Option 3: Complete Reset
- **When:** Starting fresh, have backups
- **Speed:** 10-15 seconds
- **Safety:** ⚠️ DELETES EVERYTHING
- **Confirmation:** Type "DELETE EVERYTHING" + "YES"
- **Deletes:** Products, images, .git, project folder, all app data

### 🔴 Option 4: Nuclear Reset
- **When:** Testing, debugging, developers only
- **Speed:** 20-30 seconds
- **Safety:** ☢️ MOST DESTRUCTIVE
- **Confirmation:** Type "I UNDERSTAND" + "DELETE EVERYTHING"
- **Deletes:** Everything + prefetch + recent + system traces

---

## What Gets Detected

✅ All folder name variations:
- `sakr-store-manager`
- `SakrStoreManager`
- `Sakr Store Manager`

✅ All locations:
- AppData\Roaming
- AppData\Local
- AppData\Local\Temp

✅ Project folder from config.json

✅ Git repository (.git folder)

---

## Safe vs Dangerous

### Safe Options (Keep Your Data):
- ✅ **Option 1** - Quick Safe Reset
- ✅ **Option 2** - Smart Reset

### Dangerous Options (Delete Everything):
- ⚠️ **Option 3** - Complete Reset
- ☢️ **Option 4** - Nuclear Reset

---

## Quick Decision Tree

```
Need to fix app issues?
├─ Yes, quickly → Option 1
├─ Yes, want details → Option 2
└─ No, starting fresh
   ├─ Normal cleanup → Option 3
   └─ Developer/testing → Option 4
```

---

## Before Complete/Nuclear Reset

1. ✅ **BACKUP products.json**
2. ✅ **BACKUP images folder**  
3. ✅ **Note Git repo URL** (if you need to re-clone)
4. ✅ **Understand it's permanent**

---

## After Reset

| Option | What Happens Next |
|--------|------------------|
| 1 & 2 | App starts with default settings, your products are there |
| 3 | App shows welcome screen, need to create new project |
| 4 | Like first install ever, nothing remains |

---

## Troubleshooting

**"Could not delete"**
→ Close app and try again, or run as Administrator

**"No app data found"**  
→ Already clean, nothing to delete

**"Access denied"**
→ Right-click → Run as administrator

---

## 💡 Pro Tips

- **Most users:** Stick to Options 1 or 2
- **Safe resets never touch your products/images**
- **All options close the app automatically**
- **Use Option 2 to verify what will be deleted**
- **Complete/Nuclear require exact confirmation text**

---

## Related Files

- `reset-tool.bat` - The unified reset tool
- `RESET_TOOL_README.md` - Full documentation
- `docs/APP_RESET_COMPLETE_V2.md` - Implementation details
