# Feedback & Confirmation Patterns - Visual Guide

## 🎨 UI Components Overview

### 1. InlineConfirmation Component

```
┌────────────────────────────────────────────────────────────┐
│  ⚠️  Are you sure you want to delete "Product Name"?      │
│      You can undo this action.                             │
│                                                             │
│      [Cancel]  [Delete]                                  ✕ │
└────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Non-blocking (appears at top, users can still scroll)
- Warning icon with color-coded border
- Clear message with action context
- Prominent action buttons
- Close button (✕) in top-right
- Auto-focus on "Cancel" for safety

**Variants:**
```
Danger (Red):    ⚠️ Border: rgba(248, 81, 73, 0.4)
Warning (Orange): ⚠️ Border: rgba(210, 153, 34, 0.4)
Info (Blue):      ℹ️ Border: rgba(88, 166, 255, 0.4)
```

---

### 2. Undo Toast Notification

```
┌──────────────────────────────────────────┐
│  Deleted "Wireless Headphones"           │
│                        [Undo]          ✕ │
└──────────────────────────────────────────┘
```

**Key Features:**
- Appears bottom-right
- Blue border (non-error style)
- Prominent "Undo" button
- 8-second timeout
- Click "Undo" to restore
- Auto-dismisses if no action

**Timeline:**
```
0s ──────────────────── 8s
│                        │
└─ Undo Available ──────┘ ← Disappears
```

---

### 3. Notification Center

**Closed State:**
```
┌────────┐
│  🔔 (3)│  ← Bell icon with unread count badge
└────────┘
```

**Open State:**
```
┌─────────────────────────────────────────┐
│ Notifications                    🗑️  ✕  │  ← z-index: 9000
├─────────────────────────────────────────┤
│                                         │
│  ✓ Published to GitHub!                │
│     🕐 2m ago                         ✕ │
│                                         │
│  ⚠️ Image is not square                │
│     🕐 5m ago                         ✕ │
│                                         │
│  ✗ Failed to save product              │
│     🕐 10m ago                        ✕ │
│                                         │
└─────────────────────────────────────────┘
```

**Key Features:**
- Fixed position (top-right)
- Scrollable list
- Color-coded icons by type
- Relative timestamps
- Individual delete buttons
- Clear all button (🗑️)
- Unread indicator (blue left border)
- Persists across sessions

**Icon Key:**
- ✓ Success (Green)
- ✗ Error (Red)
- ⚠️ Warning (Orange)
- ℹ️ Info (Blue)

---

### 4. Progress Toast

**During Operation:**
```
┌──────────────────────────┐
│  ⚡ Processing 3/10...   │
└──────────────────────────┘
```

**On Completion:**
```
┌─────────────────────────────────────┐
│  ✓ Successfully processed 10 items  │
└─────────────────────────────────────┘
```

**Key Features:**
- Real-time count updates
- Loading spinner for bulk ops
- Extended duration on completion
- Green success confirmation

---

## 🔄 User Flow Examples

### Delete Product Flow

#### Step 1: User clicks delete
```
Product Card
┌─────────────────────────┐
│  Wireless Headphones    │
│  $79.99                 │
│                         │
│  [Edit] [Duplicate]     │
│  [Delete] ← Click       │
└─────────────────────────┘
```

#### Step 2: Inline confirmation appears
```
Fixed at top of screen
┌────────────────────────────────────────────────────┐
│  ⚠️  Delete "Wireless Headphones"?                 │
│      You can undo this action.                     │
│                                                     │
│      [Cancel]  [Delete]                          ✕ │
└────────────────────────────────────────────────────┘

Product Card (still visible and accessible)
┌─────────────────────────┐
│  Wireless Headphones    │
│  $79.99                 │
│                         │
│  [Edit] [Duplicate]     │
│  [Delete]               │
└─────────────────────────┘
```

#### Step 3: User confirms delete
```
Product is removed from list
```

#### Step 4: Undo notification appears
```
Bottom-right corner
┌──────────────────────────────────────┐
│  Deleted "Wireless Headphones"       │
│                      [Undo]        ✕ │
└──────────────────────────────────────┘
```

#### Step 5a: User clicks Undo
```
┌────────────────────────────┐
│  ✓ Product restored        │
└────────────────────────────┘

Product reappears in list
```

#### Step 5b: User doesn't undo (timeout)
```
Toast disappears after 8 seconds
Deletion is final
```

---

### Notification Center Flow

#### Step 1: Multiple operations trigger notifications
```
Operation 1: Saved product        → ✓ Success (persisted)
Operation 2: Image warning        → ⚠️ Warning (persisted)
Operation 3: Network error        → ✗ Error (persisted)
```

#### Step 2: Badge shows unread count
```
Header
┌──────────────────────────────────────┐
│  Sakr Store Manager         🔔 (3)   │
└──────────────────────────────────────┘
```

#### Step 3: User clicks bell
```
Panel opens showing history
┌─────────────────────────────────────┐
│ Notifications                 🗑️  ✕ │
├─────────────────────────────────────┤
│  ✗ Network connection failed        │
│     🕐 Just now                   ✕ │
│                                     │
│  ⚠️ Image is not square            │
│     🕐 2m ago                     ✕ │
│                                     │
│  ✓ Product saved successfully      │
│     🕐 5m ago                     ✕ │
└─────────────────────────────────────┘
```

#### Step 4: Auto-marked as read when opened
```
Badge disappears: 🔔
```

---

## 📱 Responsive Behavior

### Desktop (>768px)
```
Inline Confirmation: 500px wide, centered
Notification Center: 380px wide, top-right
Undo Toast: Bottom-right corner
```

### Mobile (<480px)
```
Inline Confirmation:
┌─────────────────────────────┐
│  ⚠️                         │
│  Delete product?            │
│                             │
│  You can undo this.         │
│                             │
│  [────── Cancel ──────]     │
│  [────── Delete ──────]     │
└─────────────────────────────┘

Notification Center: Full width minus 32px
Undo Toast: Full width at bottom
```

---

## 🎨 Color Coding

### InlineConfirmation
```
Danger:
┌─────────────────────────────┐ ← Red border (rgba(248, 81, 73, 0.4))
│  ⚠️  Destructive action     │   Red background tint
│      [Cancel]  [Delete]     │   Red confirm button
└─────────────────────────────┘

Warning:
┌─────────────────────────────┐ ← Orange border (rgba(210, 153, 34, 0.4))
│  ⚠️  Risky action           │   Orange background tint
│      [Cancel]  [Continue]   │   Orange confirm button
└─────────────────────────────┘

Info:
┌─────────────────────────────┐ ← Blue border (rgba(88, 166, 255, 0.4))
│  ℹ️  Information            │   Blue background tint
│      [Cancel]  [OK]         │   Blue confirm button
└─────────────────────────────┘
```

### Notification Types
```
Success: ✓ Green (#3fb950)
Error:   ✗ Red (#f85149)
Warning: ⚠️ Orange (#d29922)
Info:    ℹ️ Blue (#58a6ff)
```

---

## ⌨️ Keyboard Navigation

### InlineConfirmation
```
ESC         → Cancel confirmation
Tab         → Move between Cancel/Confirm
Enter       → Activate focused button
Click Away  → Does NOT dismiss (intentional)
```

### Notification Center
```
Click Bell  → Open/Close panel
ESC         → Close panel
Click Away  → Close panel
Tab         → Navigate through notifications
```

---

## 🎯 Visual Hierarchy

### Priority Levels
```
1. CRITICAL (Red)
   ┌─────────────────────────┐
   │  ⚠️  Danger action      │ ← Most prominent
   │     [Cancel] [Delete]   │
   └─────────────────────────┘

2. WARNING (Orange)
   ┌─────────────────────────┐
   │  ⚠️  Warning action     │ ← Medium prominence
   │     [Cancel] [Continue] │
   └─────────────────────────┘

3. INFO (Blue)
   ┌─────────────────────────┐
   │  ℹ️  Info action        │ ← Lower prominence
   │     [Cancel] [OK]       │
   └─────────────────────────┘
```

---

## 💡 Best Practices Visualization

### DO: Non-blocking Inline
```
✅ GOOD
┌──────────────────────────────────┐
│  ⚠️  Delete "Product"?          │ ← Inline confirmation
│     [Cancel] [Delete]         ✕ │
└──────────────────────────────────┘

┌────────────────┐
│  Product Card  │ ← Still accessible
│  [Edit] [Del]  │
└────────────────┘
```

### DON'T: Blocking Modal
```
❌ BAD
┌──────────────────────────────────┐
│ OVERLAY BLOCKING EVERYTHING      │
│                                  │
│  ┌───────────────────┐          │
│  │ Delete Product?   │          │ ← Blocks entire screen
│  │ [Cancel] [Delete] │          │
│  └───────────────────┘          │
│                                  │
└──────────────────────────────────┘
```

---

## 📊 State Indicators

### Undo Toast States
```
Active (0-8s):
┌──────────────────────────────┐
│  Deleted "Item"              │
│              [Undo]        ✕ │ ← Undo available
└──────────────────────────────┘

Expiring (6-8s):
┌──────────────────────────────┐
│  Deleted "Item"              │ ← Fading out
│              [Undo]        ✕ │
└──────────────────────────────┘

Expired:
(Disappeared)
```

### Notification States
```
Unread:
│  ✓ Message         │ ← Blue left border
     🕐 5m ago      ✕ │

Read:
│  ✓ Message         │ ← No border
     🕐 5m ago      ✕ │
```

---

## 🎬 Animation Timing

```
InlineConfirmation:
Appear: 200ms slideDown ease-out

Undo Toast:
Appear: 200ms slideIn from right
Dismiss: 150ms fadeOut

Notification Center:
Open: 200ms slideIn + scale
Close: 150ms fadeOut

Notification Badge:
Pulse: 2s ease-in-out infinite
```

---

**Visual Design Philosophy:**
- ✅ Clear visual hierarchy
- ✅ Consistent color coding
- ✅ Non-intrusive animations
- ✅ Accessibility-first
- ✅ Mobile-responsive
- ✅ Dark mode optimized

