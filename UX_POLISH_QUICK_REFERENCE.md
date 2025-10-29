# UX Polish Quick Reference
## Keyboard Shortcuts & Auto-Save

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+N` | New Product | Opens new product form |
| `Ctrl+S` | Save | Saves current product in form |
| `Ctrl+P` | Publish to GitHub | Triggers publish workflow |
| `Ctrl+F` | Focus Search | Focuses main search bar |
| `Delete` | Delete Product | Deletes selected product (with confirmation) |
| `Escape` | Close | Closes form, modal, or settings |
| `Enter` | Submit Form | Submits product form if valid |

---

## 💾 Auto-Save Features

### How It Works:
- **Auto-save interval:** Every 30 seconds
- **Storage:** Browser localStorage
- **Scope:** Per product (including new products)

### Draft Lifecycle:
1. **Save:** Form state auto-saved every 30s
2. **Close:** Draft persists if form closed without saving
3. **Restore:** Prompt appears when reopening product with draft
4. **Clear:** Draft removed after successful save

### Draft Restoration:
When reopening a product with unsaved changes:
- **Prompt appears** with timestamp
- **Two options:**
  - `Restore Draft` - Loads unsaved changes
  - `Discard` - Clears draft and loads original data

---

## 🏗️ Architecture

### Files Created:
1. **`src/services/keyboardShortcuts.js`**
   - Keyboard event handler
   - Shortcut registration system
   - Context-aware shortcuts

2. **`src/services/autoSaveService.js`**
   - Draft save/load/clear operations
   - Auto-save timer management
   - LocalStorage integration
   - Timestamp utilities

### Files Modified:
1. **`src/App.jsx`**
   - Added keyboard shortcut setup
   - Added refs for child component communication

2. **`src/components/MainContent.jsx`**
   - Converted to forwardRef
   - Exposed methods via useImperativeHandle
   - Added product selection tracking
   - Added search input ref

3. **`src/components/ProductForm.jsx`**
   - Converted to forwardRef
   - Added auto-save integration
   - Added draft restoration UI
   - Exposed save methods via ref

4. **`src/components/ProductForm.css`**
   - Added draft prompt styling
   - Added modal overlay styles

---

## 🎯 Usage Examples

### For Developers:

#### Adding a New Keyboard Shortcut:

```javascript
// In App.jsx useEffect
const handlers = {
  // ... existing handlers
  onMyNewShortcut: () => {
    console.log('New shortcut triggered!');
    // Your logic here
  }
};

// In keyboardShortcuts.js
if (e.ctrlKey && e.key === 'x') {
  e.preventDefault();
  if (handlers.onMyNewShortcut) {
    handlers.onMyNewShortcut();
  }
  return;
}
```

#### Using Auto-Save in a New Component:

```javascript
import { startAutoSave, stopAutoSave, loadDraft, clearDraft } from '../services/autoSaveService';

function MyComponent() {
  const [formData, setFormData] = useState({});
  const timerRef = useRef(null);
  
  // Start auto-save
  useEffect(() => {
    timerRef.current = startAutoSave('my-form', () => formData);
    return () => stopAutoSave(timerRef.current);
  }, [formData]);
  
  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft('my-form');
    if (draft) {
      setFormData(draft.data);
    }
  }, []);
  
  // Clear draft on save
  const handleSave = () => {
    // ... save logic
    clearDraft('my-form');
  };
}
```

---

## 🧪 Testing Commands

### Check LocalStorage Drafts:
```javascript
// In browser console
Object.keys(localStorage).filter(key => key.startsWith('product_draft_'))
```

### View Specific Draft:
```javascript
// In browser console
JSON.parse(localStorage.getItem('product_draft_123'))
```

### Clear All Drafts:
```javascript
// In browser console
Object.keys(localStorage)
  .filter(key => key.startsWith('product_draft_'))
  .forEach(key => localStorage.removeItem(key));
```

---

## 📐 Configuration

### Auto-Save Interval:
Located in `src/services/autoSaveService.js`:
```javascript
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
```

To change: Modify the constant value (in milliseconds)

### Keyboard Shortcut Customization:
Located in `src/services/keyboardShortcuts.js`:
- Modify key detection in `handleKeyDown` function
- Update `getShortcutText` for UI display

---

## 🔍 Troubleshooting

### Shortcuts Not Working:
1. Check browser console for errors
2. Verify shortcuts aren't being intercepted by browser/OS
3. Ensure component refs are properly connected
4. Check that useEffect cleanup is being called

### Auto-Save Issues:
1. Check localStorage quota (5-10MB limit)
2. Verify localStorage is enabled in browser
3. Check console for "Draft saved" messages
4. Ensure timer isn't being cleared prematurely

### Draft Not Restoring:
1. Check if draft exists in localStorage
2. Verify product ID matches
3. Check for JSON parsing errors in console
4. Ensure draft prompt isn't being blocked by state

---

## 🎨 UI/UX Notes

### Keyboard Shortcut Behavior:
- **Context-aware:** Only works in appropriate views
- **Smart detection:** Prevented when typing in inputs (except Ctrl+S, Ctrl+F)
- **No conflicts:** Browser defaults overridden where needed

### Draft Prompt UX:
- **Non-intrusive:** Appears as modal overlay
- **Clear actions:** Restore vs Discard
- **Timestamp:** Shows when draft was saved
- **Professional styling:** Matches app design

---

## 📊 Performance Considerations

### Memory:
- Each draft ~1-5KB depending on product data
- Auto-save timer: 1 per open form
- LocalStorage limit: ~5-10MB (browser dependent)

### Optimization:
- Auto-save uses debouncing (30s interval)
- Only saves when form is dirty
- Cleanup on unmount prevents leaks
- Drafts auto-expire on successful save

---

## 🚀 Future Enhancements

Potential improvements:
1. **Customizable shortcuts** via settings
2. **Draft expiration** (auto-delete old drafts)
3. **Multiple draft versions** with history
4. **Cloud sync** for drafts across devices
5. **Visual indicator** showing auto-save status
6. **Conflict resolution** for concurrent edits
7. **Shortcut hints** in UI tooltips

---

## 📚 Related Documentation

- **Full Testing Guide:** `UX_POLISH_TESTING_GUIDE.md`
- **Product Form Documentation:** `PRODUCT_FORM_QUICK_REFERENCE.md`
- **Main App Architecture:** `STORE_MANAGER_SPEC.md`

---

**Last Updated:** October 29, 2025  
**Version:** 1.0.0
