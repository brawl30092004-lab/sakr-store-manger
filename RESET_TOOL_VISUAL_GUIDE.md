# Reset Tool - Visual Guide

## Main Menu

When you run `reset-tool.bat`, you'll see:

```
============================================================================
              Sakr Store Manager - Reset Tool
============================================================================

Please choose a reset option:

  [1] Quick Safe Reset
      - Fast and simple
      - Deletes app settings only
      - KEEPS your products and images safe
      - Recommended for fixing app issues

  [2] Smart Reset (Safe Mode)
      - Shows detailed information
      - Detects all locations automatically
      - Deletes app settings only
      - KEEPS your products and images safe
      - Includes confirmation

  [3] Complete Reset (DANGER!)
      - Deletes EVERYTHING
      - App settings + Project folder + Products + Images
      - Use only if starting fresh
      - Multiple confirmations required

  [4] Nuclear Reset (DEVELOPERS ONLY)
      - Most thorough cleanup
      - Searches entire system for traces
      - Deletes cache, prefetch, recent items
      - For testing/debugging only

  [0] Exit

============================================================================

Enter your choice [0-4]: _
```

---

## Option 1: Quick Safe Reset

```
============================================================================
                     QUICK SAFE RESET
============================================================================

This will reset the app to default settings.
Your products and images will be SAFE.

What will be deleted:
  - App settings
  - GitHub credentials
  - Cache files

What will be safe:
  - Your products (products.json)
  - Product images
  - Project folder

============================================================================

Press any key to continue . . . _

[*] Resetting app...

[*] Checking for running app...
[*] Deleting: C:\Users\Ahmed\AppData\Roaming\sakr-store-manager

[+] Reset complete!
[+] Your products and images are safe

Press any key to return to menu...
```

---

## Option 2: Smart Reset (Safe Mode)

```
============================================================================
                    SMART RESET - SAFE MODE
============================================================================

[*] Detecting app data locations...

[+] Found: C:\Users\Ahmed\AppData\Roaming\sakr-store-manager

[i] Found config.json, extracting project path...
[+] Project path: E:\Sakr Store Manger data
[i] Git repository detected

============================================================================

What will be DELETED:
  [X] All app settings and configurations
  [X] GitHub credentials and cache
  [X] C:\Users\Ahmed\AppData\Roaming\sakr-store-manager

What will be SAFE:
  [OK] Project folder: E:\Sakr Store Manger data
  [OK] products.json
  [OK] All images
  [OK] .git repository

============================================================================

Type 'RESET' to continue: _
```

After confirmation:

```
[*] Starting reset...

[*] Closing app...
[*] Deleting: C:\Users\Ahmed\AppData\Roaming\sakr-store-manager
[+] Deleted

[+] Reset complete!
[+] Your project data is safe

Press any key to return to menu...
```

---

## Option 3: Complete Reset

```
============================================================================
              !!! COMPLETE RESET - DANGER !!!
============================================================================

                 *** WARNING: This will DELETE EVERYTHING! ***

[*] Detecting all locations...

[+] Found: C:\Users\Ahmed\AppData\Roaming\sakr-store-manager
[+] Project: E:\Sakr Store Manger data

============================================================================

The following will be PERMANENTLY DELETED:
  [X] All app settings
  [X] All configurations
  [X] C:\Users\Ahmed\AppData\Roaming\sakr-store-manager
  [X] PROJECT FOLDER: E:\Sakr Store Manger data
  [X] products.json
  [X] ALL images
  [X] .git repository
  [X] EVERYTHING in project folder!

                 *** THIS CANNOT BE UNDONE! ***

============================================================================

Type 'DELETE EVERYTHING' to continue: _
```

After first confirmation:

```
Are you absolutely sure? Type 'YES' to confirm: _
```

After both confirmations:

```
[*] Starting complete reset...

[*] Terminating all processes...
[*] Deleting: C:\Users\Ahmed\AppData\Roaming\sakr-store-manager
[+] Deleted

[*] Deleting project folder: E:\Sakr Store Manger data
    This includes products.json, images, .git, everything...
[+] Project folder completely deleted

============================================================================
[+] Complete reset finished!
[+] Everything has been deleted

The app will start from scratch when you run it next.
============================================================================

Press any key to return to menu...
```

---

## Option 4: Nuclear Reset

```
============================================================================
                    NUCLEAR RESET
         This will delete EVERYTHING EVERYWHERE!
============================================================================

This advanced tool will search and destroy:
  - All app data in AppData (all variations)
  - All app data in LocalAppData
  - All temp files
  - All project folders found in configs
  - All localStorage data
  - All cached data (Cache, GPUCache, etc.)
  - All log files
  - System prefetch data
  - Recent items
  - Everything!

============================================================================
                   !!! WARNING !!!
============================================================================

This is a DESTRUCTIVE operation!
There is NO UNDO!
Use only for testing or complete removal!

============================================================================

Type 'I UNDERSTAND' to continue: _
```

After first confirmation:

```
Type 'DELETE EVERYTHING' to confirm: _
```

After both confirmations:

```
[*] Starting nuclear reset...

[*] Terminating all app processes...
[+] Processes terminated

[*] Scanning and deleting all locations...

[*] Deleting: C:\Users\Ahmed\AppData\Roaming\sakr-store-manager
[+] Deleted

[*] Searching for project folders in configs...
[*] Found config: C:\Users\Ahmed\AppData\Roaming\sakr-store-manager\config.json
[*] Found project folder: E:\Sakr Store Manger data
[*] Deleting project folder...
[+] Project folder deleted

[*] Clearing system temp files...
[+] Temp files cleared

[*] Clearing prefetch data...
[+] Prefetch cleared

[*] Clearing recent items...
[+] Recent items cleared

============================================================================
[+] Nuclear reset complete!
[+] All traces of the app have been removed
============================================================================

Press any key to return to menu...
```

---

## Visual Flow Diagram

```
┌─────────────────────────────────────┐
│      Run reset-tool.bat             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Main Menu                    │
│  [1] Quick  [2] Smart               │
│  [3] Complete  [4] Nuclear          │
│  [0] Exit                           │
└──────────────┬──────────────────────┘
               │
       ┌───────┼───────┬───────┬──────┐
       │       │       │       │      │
       ▼       ▼       ▼       ▼      ▼
    ┌────┐ ┌────┐ ┌────┐ ┌────┐  ┌────┐
    │ 1  │ │ 2  │ │ 3  │ │ 4  │  │ 0  │
    └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘  └─┬──┘
      │      │      │      │       │
      ▼      ▼      ▼      ▼       ▼
   ┌────┐ ┌────┐ ┌────┐ ┌────┐  Exit
   │Fast│ │Show│ │2x  │ │2x  │
   │    │ │Info│ │Conf│ │Conf│
   └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘
     │      │      │      │
     │      ▼      │      │
     │   ┌────┐   │      │
     │   │Type│   │      │
     │   │RESET   │      │
     │   └─┬──┘   │      │
     │     │      ▼      ▼
     │     │   ┌──────────────┐
     │     │   │   DELETE     │
     │     │   │ EVERYTHING   │
     │     │   └──────┬───────┘
     │     │          │
     │     │          ▼
     │     │   ┌──────────────┐
     │     │   │     YES      │
     │     │   └──────┬───────┘
     │     │          │
     └─────┴──────────┴───────┐
                               │
                               ▼
                    ┌──────────────────┐
                    │  Close App       │
                    │  Delete Files    │
                    │  Show Results    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Return to Menu   │
                    └──────────────────┘
```

---

## Safety Levels

```
┌─────────────────────────────────────────────────────┐
│                  SAFETY SCALE                        │
└─────────────────────────────────────────────────────┘

🟢 SAFE - Your data is protected
├─ Option 1: Quick Safe Reset
└─ Option 2: Smart Reset (Safe Mode)

🟡 CAUTION - Some data at risk
└─ (None in this tool)

🟠 DANGEROUS - Most data will be deleted
└─ Option 3: Complete Reset

🔴 DESTRUCTIVE - Everything will be deleted
└─ Option 4: Nuclear Reset
```

---

## What Each Option Deletes

```
                    ┌───────────────────────────┐
                    │   What Gets Deleted?      │
                    └───────────────────────────┘

File/Folder         │ Option 1 │ Option 2 │ Option 3 │ Option 4
────────────────────┼──────────┼──────────┼──────────┼─────────
AppData\Roaming\... │    ✅    │    ✅    │    ✅    │    ✅
AppData\Local\...   │    ✅    │    ✅    │    ✅    │    ✅
Temp\...            │    ✅    │    ✅    │    ✅    │    ✅
products.json       │    ❌    │    ❌    │    ✅    │    ✅
images/             │    ❌    │    ❌    │    ✅    │    ✅
.git/               │    ❌    │    ❌    │    ✅    │    ✅
Project Folder      │    ❌    │    ❌    │    ✅    │    ✅
Prefetch            │    ❌    │    ❌    │    ❌    │    ✅
Recent Items        │    ❌    │    ❌    │    ❌    │    ✅
System Traces       │    ❌    │    ❌    │    ❌    │    ✅

Legend: ✅ Deleted  ❌ Safe
```

---

## Typical User Scenarios

### Scenario 1: "App is acting weird"
```
User Action:       Run reset-tool.bat
Choose:           Option 1 (Quick Safe Reset)
Time:             3 seconds
Result:           App fixed, data intact ✅
```

### Scenario 2: "I want to see what's wrong"
```
User Action:       Run reset-tool.bat
Choose:           Option 2 (Smart Reset)
Time:             10 seconds
Result:           Detailed info shown, app fixed, data intact ✅
```

### Scenario 3: "Starting a new project"
```
User Action:       BACKUP data first!
                  Run reset-tool.bat
Choose:           Option 3 (Complete Reset)
Confirmations:    Type "DELETE EVERYTHING" + "YES"
Time:             15 seconds
Result:           Fresh start, everything gone ✅
```

### Scenario 4: "Testing clean install"
```
User Action:       BACKUP data first!
                  Run reset-tool.bat
Choose:           Option 4 (Nuclear Reset)
Confirmations:    Type "I UNDERSTAND" + "DELETE EVERYTHING"
Time:             30 seconds
Result:           Absolutely clean system ✅
```

---

## Color Guide (in actual console)

Since ANSI colors were removed for compatibility, the tool uses:
- `[*]` - Information/In Progress
- `[+]` - Success/Completed
- `[!]` - Warning/Error
- `[i]` - Info/Note
- `[X]` - Will be deleted
- `[OK]` - Will be safe

---

## Quick Tips

💡 **Most users should use Option 1 or 2**

💡 **Option 2 shows you exactly what will happen before doing it**

💡 **Options 3 & 4 require exact confirmation text - this is intentional!**

💡 **All options automatically close the app before resetting**

💡 **You can always return to the menu without doing anything**

💡 **The tool detects ALL folder name variations automatically**
