# Feedback & Confirmation Patterns - Quick Reference

## 🎯 Quick Links

| Component | File | Purpose |
|-----------|------|---------|
| InlineConfirmation | `src/components/InlineConfirmation.jsx` | Non-blocking confirmations |
| NotificationCenter | `src/components/NotificationCenter.jsx` | Message history panel |
| UndoService | `src/services/undoService.jsx` | Undo destructive actions |
| ToastService | `src/services/toastService.js` | Toast notifications |

---

## 📦 Import Statements

```javascript
// Inline Confirmation
import InlineConfirmation from './components/InlineConfirmation';

// Notification Center
import NotificationCenter from './components/NotificationCenter';
import { addNotification } from './components/NotificationCenter';

// Undo Service
import { showUndoNotification, executeUndo, clearUndoHistory } from '../services/undoService';

// Toast Service
import { 
  showSuccess, 
  showError, 
  showWarning, 
  showInfo,
  showLoading,
  dismissToast,
  ToastDurations 
} from '../services/toastService';
```

---

## ⚡ Common Patterns

### Pattern 1: Delete with Inline Confirmation + Undo

```jsx
// State
const [deleteConfirmId, setDeleteConfirmId] = useState(null);

// Delete handler
const handleDelete = (id) => {
  setDeleteConfirmId(id);
};

// Confirm handler with undo
const handleDeleteConfirm = async () => {
  const item = items.find(i => i.id === deleteConfirmId);
  
  await dispatch(deleteItem(deleteConfirmId));
  
  showUndoNotification(
    { description: `Deleted "${item.name}"` },
    async () => {
      await dispatch(addItem(item)).unwrap();
      showSuccess('Item restored');
    }
  );
  
  setDeleteConfirmId(null);
};

// JSX
{deleteConfirmId && (
  <div style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, maxWidth: '500px', width: '90%' }}>
    <InlineConfirmation
      message={`Delete "${items.find(i => i.id === deleteConfirmId)?.name}"?`}
      onConfirm={handleDeleteConfirm}
      onCancel={() => setDeleteConfirmId(null)}
      confirmText="Delete"
      variant="danger"
    />
  </div>
)}
```

---

### Pattern 2: Bulk Operation with Progress

```javascript
const handleBulkOperation = async (selectedIds) => {
  const total = selectedIds.length;
  const toastId = showLoading(`Processing 0/${total}...`);
  
  for (let i = 0; i < selectedIds.length; i++) {
    await processItem(selectedIds[i]);
    
    // Update progress
    dismissToast(toastId);
    const newToastId = showLoading(`Processing ${i + 1}/${total}...`);
  }
  
  dismissToast(toastId);
  showSuccess(`Processed ${total} items`, { 
    duration: ToastDurations.EXTENDED 
  });
};
```

---

### Pattern 3: Important Notification that Persists

```javascript
// This will show as toast AND be added to notification center
showSuccess('Published to GitHub!', {
  duration: ToastDurations.EXTENDED
}, true); // persist = true

// Or manually add to notification center
addNotification({
  type: 'success',
  message: 'Important operation completed'
});
```

---

### Pattern 4: Warning Confirmation

```jsx
<InlineConfirmation
  message="This will overwrite existing data. Continue?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  confirmText="Continue"
  cancelText="Cancel"
  variant="warning" // Orange warning style
/>
```

---

### Pattern 5: Info Confirmation

```jsx
<InlineConfirmation
  message="This action requires network connection. Proceed?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  confirmText="Yes"
  cancelText="No"
  variant="info" // Blue info style
/>
```

---

## 🎨 Variants & Durations

### InlineConfirmation Variants

| Variant | Color | Use Case |
|---------|-------|----------|
| `danger` | Red | Delete, destructive actions |
| `warning` | Orange | Overwrite, risky actions |
| `info` | Blue | Non-destructive confirmations |

### Toast Durations

| Duration | Value | Use Case |
|----------|-------|----------|
| `SHORT` | 3000ms | Quick confirmations |
| `NORMAL` | 4000ms | Standard messages |
| `LONG` | 6000ms | Errors, warnings |
| `EXTENDED` | 8000ms | Critical messages |
| `PERSISTENT` | 12000ms | Very important |

---

## 🔔 Notification Types

| Type | Icon | Auto-Persist | Color |
|------|------|--------------|-------|
| `success` | ✓ | Important only* | Green |
| `error` | ✗ | Always | Red |
| `warning` | ⚠ | Always | Orange |
| `info` | ℹ | Optional | Blue |

*Auto-persisted if message contains: "Published", "Saved", "Connected"

---

## 🎯 Decision Tree

### Should I use InlineConfirmation?

```
Is the action destructive or risky?
├─ YES → Use InlineConfirmation
│         ├─ Can it be undone easily?
│         │  ├─ YES → Add undo notification
│         │  └─ NO → Use variant="danger"
│         └─ Is it a warning?
│            └─ YES → Use variant="warning"
└─ NO → Just execute the action
```

### Should I add to NotificationCenter?

```
Is this message important?
├─ YES → Will user need to see it later?
│         ├─ YES → addNotification()
│         └─ NO → Regular toast
└─ NO → Regular toast only
```

### What toast duration?

```
Message importance:
├─ Quick confirmation → ToastDurations.SHORT (3s)
├─ Standard message → ToastDurations.NORMAL (4s)
├─ Error/Warning → ToastDurations.LONG (6s)
├─ Critical message → ToastDurations.EXTENDED (8s)
└─ Very important → ToastDurations.PERSISTENT (12s)
```

---

## 📝 Cheat Sheet

```javascript
// ✅ DO THIS
showUndoNotification({ description: 'Deleted item' }, undoFn);
showError(error); // Auto-persists to notification center
showSuccess('Saved', { duration: ToastDurations.EXTENDED }, true);

// ❌ DON'T DO THIS
alert('Are you sure?'); // Use InlineConfirmation instead
confirm('Delete?'); // Use InlineConfirmation instead
showSuccess('Critical message'); // Use extended duration for important messages
```

---

## 🚀 Examples from the Codebase

### MainContent.jsx - Delete Product

```javascript
const handleDeleteConfirm = async () => {
  if (deleteConfirmId) {
    const productToDelete = products.find(p => p.id === deleteConfirmId);
    
    await dispatch(deleteProduct(deleteConfirmId));
    
    showUndoNotification(
      {
        description: `Deleted "${productToDelete.name}"`,
        data: productToDelete,
      },
      async () => {
        await dispatch(addProduct(productToDelete)).unwrap();
        showSuccess('Product restored');
      }
    );
    
    setDeleteConfirmId(null);
  }
};
```

### App.jsx - Notification Center

```jsx
<header className="app-header">
  <div className="app-title">
    <h1>Sakr Store Manager</h1>
  </div>
  <div className="app-header-actions">
    <NotificationCenter />
  </div>
</header>
```

---

## 🐛 Troubleshooting

### Undo not working?

- Check that the undo function is async
- Verify the data is being stored correctly
- Ensure timeout hasn't expired (default 8s)

### Notifications not persisting?

- Check localStorage is enabled
- Verify the type is 'error', 'warning', or important 'success'
- Check browser console for errors

### Inline confirmation not appearing?

- Check z-index (should be 1000+)
- Verify positioning styles
- Ensure state is being set correctly

---

## 📚 Full Documentation

See `FEEDBACK_PATTERNS_GUIDE.md` for:
- Complete implementation details
- Migration guide from old patterns
- Testing procedures
- Configuration options
- Best practices

---

**Last Updated:** November 2025
