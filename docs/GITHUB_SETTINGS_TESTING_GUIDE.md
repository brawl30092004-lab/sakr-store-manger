# GitHub Settings Testing Guide

## Prerequisites

Before testing, ensure:
- ✅ App is not running (close if open)
- ✅ You have a GitHub account
- ✅ You have access to a Git repository (or can create one)
- ✅ You have a local Git repository folder on your machine

---

## Test Suite

### Test 1: Initial Settings UI

**Objective:** Verify Settings UI loads correctly

**Steps:**
1. Start the app: `npm run electron:dev`
2. Wait for app to fully load
3. Click "Settings" in the menu bar

**Expected Results:**
- ✅ Settings view displays
- ✅ Form has 4 input fields (all empty)
- ✅ Browse button is visible
- ✅ Three action buttons: "Test Connection", "Save Settings", "Clear"
- ✅ No error messages
- ✅ Menu shows "← Back" instead of "Settings"

**Status:** ⬜ Pass | ⬜ Fail

---

### Test 2: Form Validation

**Objective:** Test required field validation

**Steps:**
1. In Settings, leave all fields empty
2. Click "Save Settings"

**Expected Results:**
- ✅ Error message appears: "Please fill in all required fields"
- ✅ Settings are NOT saved
- ✅ No config.json created

**Steps (continue):**
3. Fill only Repository URL
4. Click "Save Settings"

**Expected Results:**
- ✅ Error message appears: "Please fill in all required fields"

**Steps (continue):**
5. Fill all fields EXCEPT Personal Access Token
6. Click "Save Settings"

**Expected Results:**
- ✅ Error message appears: "Please provide a Personal Access Token"

**Status:** ⬜ Pass | ⬜ Fail

---

### Test 3: Directory Browser

**Objective:** Test directory selection functionality

**Steps:**
1. In Settings, click "Browse" button
2. Navigate to a folder on your system
3. Select a folder
4. Click "Select Folder" (or equivalent)

**Expected Results:**
- ✅ Directory picker dialog opens
- ✅ Can navigate folders
- ✅ After selection, path appears in "Local Project Path" field
- ✅ Path is correctly formatted for your OS

**Steps (continue):**
5. Click "Browse" again
6. Click "Cancel" in the dialog

**Expected Results:**
- ✅ Path remains unchanged (previous selection preserved)

**Status:** ⬜ Pass | ⬜ Fail

---

### Test 4: Creating GitHub Token

**Objective:** Create a test Personal Access Token

**Steps:**
1. Open https://github.com/settings/tokens in browser
2. Click "Generate new token (classic)"
3. Name: "Sakr Store Manager Test"
4. Expiration: 7 days (for testing)
5. Scopes: Check only **repo** (all sub-items)
6. Click "Generate token"
7. **IMMEDIATELY COPY** the token (ghp_...)

**Expected Results:**
- ✅ Token is generated successfully
- ✅ Token starts with `ghp_`
- ✅ Token is copied to clipboard

**Important:** Save this token somewhere safe for the next tests!

**Status:** ⬜ Pass | ⬜ Fail

---

### Test 5: Save Settings (Valid Data)

**Objective:** Test saving valid configuration

**Setup:**
- Use token from Test 4
- Use a real GitHub repository URL
- Use a local Git repository folder

**Steps:**
1. Fill in Settings form:
   - Repository URL: `https://github.com/YOUR_USERNAME/YOUR_REPO`
   - GitHub Username: `YOUR_USERNAME`
   - Personal Access Token: (paste token from Test 4)
   - Local Project Path: (browse to a Git repo folder)
2. Click "Save Settings"

**Expected Results:**
- ✅ Status message appears: "Settings saved successfully!"
- ✅ Message is green (success color)
- ✅ Token field changes to `••••••••`
- ✅ Other fields remain populated

**Verification:**
3. Open the config file:
   - **Windows:** `%APPDATA%\SakrStoreManager\config.json`
   - **macOS:** `~/Library/Application Support/SakrStoreManager/config.json`
   - **Linux:** `~/.config/SakrStoreManager/config.json`

**Expected Results:**
- ✅ File exists
- ✅ Contains JSON with your settings
- ✅ Has `encryptedToken` field (NOT `token`)
- ✅ `encryptedToken` value is NOT your plain text token
- ✅ `encryptedToken` is a long base64 string
- ✅ Has `lastUpdated` timestamp
- ✅ Has `version: "1.0"`

**Example config.json:**
```json
{
  "repoUrl": "https://github.com/user/repo",
  "username": "user",
  "encryptedToken": "eyJpdiI6ImFiYzEyMyIsImF1dGhUYWciOiJkZWY0NTYiLCJlbmNyeXB0ZWREYXRhIjoiZ2hpNzg5In0=",
  "projectPath": "C:/path/to/repo",
  "lastUpdated": "2025-10-29T12:34:56.789Z",
  "version": "1.0"
}
```

**Status:** ⬜ Pass | ⬜ Fail

---

### Test 6: Settings Persistence

**Objective:** Verify settings survive app restart

**Steps:**
1. After Test 5, click "← Back" to return to main view
2. Close the entire app (Ctrl+C in terminal)
3. Restart: `npm run electron:dev`
4. Click "Settings" in menu

**Expected Results:**
- ✅ Repository URL field is populated with saved value
- ✅ Username field is populated with saved value
- ✅ Token field shows `••••••••` (NOT plain text!)
- ✅ Project Path field is populated with saved value
- ✅ All values match what you saved in Test 5

**Status:** ⬜ Pass | ⬜ Fail

---

### Test 7: Test Connection (Valid)

**Objective:** Test GitHub connection validation

**Prerequisites:**
- Settings saved from Test 5
- Token is valid
- Repository exists and you have access
- Local folder is a Git repository

**Steps:**
1. In Settings (with fields populated from Test 6)
2. Click "Test Connection"
3. Wait for response

**Expected Results:**
- ✅ Button shows "Testing..." while waiting
- ✅ Status message appears
- ✅ Message is green
- ✅ Message says "Successfully connected to GitHub repository!" or similar
- ✅ Button returns to "Test Connection"

**Status:** ⬜ Pass | ⬜ Fail

---

### Test 8: Test Connection (Invalid Token)

**Objective:** Test error handling for bad credentials

**Steps:**
1. In Settings, clear the Token field
2. Enter a fake token: `ghp_FAKE_TOKEN_123`
3. Click "Test Connection"

**Expected Results:**
- ✅ Error message appears
- ✅ Message is red
- ✅ Message mentions "Authentication failed" or "Personal Access Token"

**Status:** ⬜ Pass | ⬜ Fail

---

### Test 9: Test Connection (Not a Git Repo)

**Objective:** Test validation for non-Git directories

**Steps:**
1. In Settings, click "Browse"
2. Select a folder that is NOT a Git repository (e.g., Desktop)
3. Click "Test Connection"

**Expected Results:**
- ✅ Error message appears
- ✅ Message mentions "Not a valid Git repository" or similar

**Status:** ⬜ Pass | ⬜ Fail

---

### Test 10: Update Settings Without Token Change

**Objective:** Verify token is preserved when updating other fields

**Steps:**
1. In Settings (with valid saved settings)
2. Change only the Username field to something different
3. **DO NOT** change the Token field (leave as `••••••••`)
4. Click "Save Settings"

**Expected Results:**
- ✅ Success message appears
- ✅ Username is updated

**Verification:**
5. Check config.json

**Expected Results:**
- ✅ Username is new value
- ✅ `encryptedToken` still exists
- ✅ `encryptedToken` value is unchanged from before
- ✅ `lastUpdated` is recent timestamp

**Status:** ⬜ Pass | ⬜ Fail

---

### Test 11: Update Token

**Objective:** Test updating the token while keeping other settings

**Steps:**
1. In Settings (with valid saved settings)
2. Clear the Token field (delete `••••••••`)
3. Enter the SAME token from Test 4 (or a new one)
4. Click "Save Settings"

**Expected Results:**
- ✅ Success message appears
- ✅ Token field changes to `••••••••`

**Verification:**
5. Check config.json

**Expected Results:**
- ✅ `encryptedToken` value has changed (new encryption)
- ✅ Other fields unchanged
- ✅ `lastUpdated` is recent timestamp

**Status:** ⬜ Pass | ⬜ Fail

---

### Test 12: Clear Form

**Objective:** Test form reset functionality

**Steps:**
1. In Settings (with fields populated)
2. Click "Clear" button

**Expected Results:**
- ✅ All fields are emptied
- ✅ Status message says "Form cleared"
- ✅ config.json is NOT deleted (still exists on disk)

**Status:** ⬜ Pass | ⬜ Fail

---

### Test 13: Navigation

**Objective:** Test view switching

**Steps:**
1. Start at main view (product list)
2. Click "Settings" in menu
3. Verify Settings view loads
4. Click "← Back" in menu

**Expected Results:**
- ✅ Returns to main view (product list)
- ✅ Sidebar is visible again
- ✅ Menu shows "Settings" (not "← Back")

**Steps (continue):**
5. Click "Settings" again
6. Fill in some fields (don't save)
7. Click "← Back"

**Expected Results:**
- ✅ Returns to main view
- ✅ Unsaved changes are lost (expected behavior)

**Status:** ⬜ Pass | ⬜ Fail

---

### Test 14: Security Verification

**Objective:** Verify token encryption is working

**Steps:**
1. Save settings with a known token (e.g., `test_token_123`)
2. Open config.json in a text editor
3. Search for `test_token_123`

**Expected Results:**
- ✅ Plain text token is NOT found in file
- ✅ Only `encryptedToken` field exists
- ✅ `encryptedToken` value does not resemble plain text

**Steps (continue):**
4. Open browser DevTools (F12)
5. Go to Console tab
6. Navigate to Settings in app
7. Check console logs

**Expected Results:**
- ✅ Plain text token is NOT logged to console
- ✅ No sensitive data visible in console

**Status:** ⬜ Pass | ⬜ Fail

---

### Test 15: Decryption Verification

**Objective:** Verify token can be decrypted correctly

**Steps:**
1. Save settings with valid token
2. Close app completely
3. Manually edit config.json:
   - Change one character in `encryptedToken` value
4. Restart app
5. Click "Settings"

**Expected Results:**
- ✅ App doesn't crash
- ✅ Settings load but token field may be empty or show error
- ✅ App handles decryption failure gracefully

**Cleanup:**
6. Delete config.json
7. Re-enter settings normally

**Status:** ⬜ Pass | ⬜ Fail

---

## Edge Case Tests

### Edge Case 1: Repository URL Formats

**Test various URL formats:**
- `https://github.com/user/repo`
- `https://github.com/user/repo.git`
- `git@github.com:user/repo.git`
- `http://github.com/user/repo` (HTTP instead of HTTPS)
- Invalid: `not-a-url`
- Invalid: `github.com/user/repo` (missing protocol)

**Expected:** App should handle various formats gracefully

---

### Edge Case 2: Special Characters in Paths

**Test paths with:**
- Spaces: `C:\Program Files\My Project`
- Accented characters: `C:\Café\repo`
- Unicode: `C:\项目\repo`

**Expected:** Paths should be handled correctly

---

### Edge Case 3: Long Values

**Test with:**
- Very long repository URL (500+ chars)
- Very long username (100+ chars)
- Very long path (260+ chars on Windows)

**Expected:** Should handle or show appropriate errors

---

## Performance Tests

### Performance 1: Encryption Speed

**Steps:**
1. Save settings 10 times in succession
2. Time how long each save takes

**Expected:**
- ✅ Each save completes in < 1 second
- ✅ No memory leaks (check Task Manager)

---

### Performance 2: Load Speed

**Steps:**
1. Restart app
2. Time how long it takes to load settings

**Expected:**
- ✅ Settings load in < 500ms
- ✅ No blocking of main thread

---

## Test Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Initial Settings UI | ⬜ | |
| 2. Form Validation | ⬜ | |
| 3. Directory Browser | ⬜ | |
| 4. Creating GitHub Token | ⬜ | |
| 5. Save Settings | ⬜ | |
| 6. Settings Persistence | ⬜ | |
| 7. Test Connection (Valid) | ⬜ | |
| 8. Test Connection (Invalid) | ⬜ | |
| 9. Test Connection (Non-Git) | ⬜ | |
| 10. Update Without Token | ⬜ | |
| 11. Update Token | ⬜ | |
| 12. Clear Form | ⬜ | |
| 13. Navigation | ⬜ | |
| 14. Security Verification | ⬜ | |
| 15. Decryption Verification | ⬜ | |

---

## Known Issues / Limitations

Document any issues found during testing:

1. **Issue:** _____________________________________
   **Severity:** Low / Medium / High
   **Workaround:** _________________________________

2. **Issue:** _____________________________________
   **Severity:** Low / Medium / High
   **Workaround:** _________________________________

---

## Testing Environment

- **OS:** Windows / macOS / Linux
- **Node Version:** `node --version`
- **Electron Version:** Check package.json
- **Date Tested:** _______________
- **Tester:** _______________

---

## Final Checklist

Before marking as complete:

- [ ] All tests pass
- [ ] Token is encrypted in config.json
- [ ] Settings persist across restarts
- [ ] No errors in console
- [ ] No errors in main process logs
- [ ] UI is responsive and clean
- [ ] Navigation works smoothly
- [ ] All buttons are functional
- [ ] Form validation works
- [ ] Error messages are helpful
- [ ] Success messages are clear

---

**Status:** 🟡 Ready for Testing
**Next Step:** Run through all tests and document results
