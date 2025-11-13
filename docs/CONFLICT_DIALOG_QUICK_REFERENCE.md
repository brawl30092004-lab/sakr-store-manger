# Conflict Dialog - Quick Reference Guide

## 🚀 Quick Start

### Using the Dialog
```jsx
import ConflictResolutionDialog from './components/ConflictResolutionDialog';

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false);
  
  return (
    <ConflictResolutionDialog
      isOpen={showDialog}
      onClose={() => setShowDialog(false)}
      onResolved={(resolution) => {
        console.log('Resolved with:', resolution);
        // resolution: 'local' | 'remote' | 'merge' | 'custom'
      }}
      isResolving={false}
    />
  );
}
```

---

## 🎨 Icon Components

### Available Icons
```jsx
import {
  WarningIcon,    // Alert/Warning triangle
  LocalIcon,      // Computer/Laptop
  RemoteIcon,     // Cloud
  MergeIcon,      // Git merge branches
  CancelIcon,     // Circle with X
  ProductIcon,    // 3D box
  FileIcon,       // Document
  InfoIcon,       // Info circle
  CheckIcon,      // Checkmark
  AdvancedIcon,   // Target
  SparkleIcon,    // Star burst
  SpinnerIcon     // Loading spinner
} from './components/icons/ConflictIcons';
```

### Usage
```jsx
// Default size
<WarningIcon />

// Custom size
<LocalIcon size={32} />

// With className
<RemoteIcon size={24} className="my-custom-class" />

// All props
<MergeIcon 
  size={40} 
  className="merge-icon" 
/>
```

---

## 🎨 CSS Classes Reference

### Main Structure
```css
.conflict-dialog-overlay     /* Full-screen backdrop */
.conflict-dialog             /* Main dialog container */
.conflict-dialog-header      /* Top section with title */
.conflict-dialog-content     /* Scrollable content area */
.conflict-dialog-actions     /* Bottom action buttons */
.conflict-dialog-footer      /* Help text at bottom */
```

### Header Elements
```css
.conflict-icon-wrapper       /* Icon container */
.conflict-icon               /* The warning icon */
.conflict-subtitle           /* Description text */
```

### Content Elements
```css
.conflict-info               /* Info box with details */
.conflict-description        /* Conflict description text */
.conflict-explanation        /* Explanation section */
```

### Options Layout
```css
.conflict-options            /* Container for all options */
.conflict-option-recommended /* Full-width recommended option */
.conflict-option-grid        /* 2-column grid container */
.conflict-option             /* Individual option card */
.conflict-option-secondary   /* Cancel option */
```

### Option Components
```css
.option-icon-container       /* Icon background circle */
.option-icon-container.merge /* Purple gradient */
.option-icon-container.local /* Blue gradient */
.option-icon-container.remote/* Green gradient */
.option-icon-container.cancel/* Gray gradient */
.option-content              /* Text content area */
.option-note                 /* Note/warning text */
.note-icon                   /* Small icon in notes */
```

### Buttons
```css
.conflict-btn                /* Base button style */
.conflict-btn-merge          /* Purple merge button */
.conflict-btn-local          /* Blue local button */
.conflict-btn-remote         /* Green remote button */
.conflict-btn-cancel         /* Gray cancel button */
.conflict-btn-custom         /* Purple custom button */
```

### Product Conflicts
```css
.product-conflicts           /* Container for products */
.product-conflict-item       /* Individual product card */
.product-conflict-header     /* Product name header */
.product-icon                /* Product box icon */
.conflict-count              /* Badge with count */
```

### Field Comparison
```css
.field-conflicts             /* Container for fields */
.field-conflict              /* Individual field row */
.field-name                  /* Field label */
.field-comparison            /* 2-column comparison */
.field-version               /* Version card */
.remote-version              /* Remote/store version */
.local-version               /* Local/your version */
.version-label               /* Label with icon */
.version-icon                /* Small icon in label */
.version-value               /* The actual value */
.field-separator             /* "vs" text */
```

### Advanced Mode
```css
.advanced-mode-toggle        /* Toggle button container */
.btn-toggle-advanced         /* Advanced mode button */
.advanced-hint               /* Hint text */
.advanced-mode-active        /* Active mode container */
.advanced-mode-header        /* Header with instructions */
.advanced-header-content     /* Icon + text */
.advanced-icon               /* Target icon */
.btn-back-simple             /* Back button */
.product-actions             /* Select all buttons */
.btn-select-all              /* Individual select button */
```

### Interactive Selection
```css
.field-comparison.interactive/* Clickable comparison */
.field-version.selected      /* Selected state */
.field-radio                 /* Radio button input */
```

### States
```css
.conflict-loading            /* Loading state */
.spinner                     /* Loading spinner */
.no-conflicts                /* No conflicts state */
.conflict-help               /* Help text */
.conflict-help.resolving     /* Resolving state */
.inline-icon                 /* Small inline icon */
.inline-spinner              /* Small inline spinner */
```

---

## 🎨 Color Variables

### Main Colors
```css
/* Backgrounds */
--dialog-bg: linear-gradient(145deg, #1e1e2e 0%, #1a1a28 100%)
--overlay-bg: rgba(0, 0, 0, 0.8)

/* Accents */
--warning-color: #ffc107
--merge-color: #9c27b0 → #7b1fa2
--local-color: #2196f3 → #1565c0
--remote-color: #4caf50 → #2e7d32
--cancel-color: #757575 → #5a5a5a

/* Text */
--text-primary: #ffffff
--text-secondary: #b4b4b8
--text-tertiary: #9a9aa0

/* Borders */
--border-subtle: rgba(255, 255, 255, 0.08)
--border-normal: rgba(255, 255, 255, 0.15)
--border-strong: rgba(255, 255, 255, 0.25)
```

---

## 📐 Spacing Scale

```css
/* Base unit: 8px */
--space-xs: 8px
--space-sm: 12px
--space-md: 16px
--space-lg: 20px
--space-xl: 24px
--space-2xl: 32px
--space-3xl: 40px

/* Common usage */
gap: 16px              /* Between cards */
padding: 20px          /* Inside cards */
margin-bottom: 24px    /* Between sections */
padding: 40px          /* Dialog sides */
```

---

## 🎭 Animation Values

```css
/* Timing Functions */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)
--ease-smooth: ease-out
--ease-linear: linear

/* Durations */
--duration-fast: 0.2s
--duration-normal: 0.3s
--duration-slow: 0.4s

/* Common Animations */
animation: fadeIn 0.25s ease-out
animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)
animation: gentlePulse 3s ease-in-out infinite
animation: spin 1s linear infinite
```

---

## 📱 Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 769px) {
  max-width: 900px
  padding: 40px
  2-column grid
}

/* Tablet/Mobile */
@media (max-width: 768px) {
  max-width: 95%
  padding: 24px
  1-column stack
}
```

---

## 🎯 Common Customizations

### Change Dialog Width
```css
.conflict-dialog {
  max-width: 1000px; /* Change from 900px */
}
```

### Adjust Icon Size in Header
```jsx
<WarningIcon size={72} className="conflict-icon" />
```

### Modify Button Colors
```css
.conflict-btn-merge {
  background: linear-gradient(135deg, #YOUR_COLOR_1, #YOUR_COLOR_2);
}
```

### Change Border Radius
```css
.conflict-dialog {
  border-radius: 24px; /* More rounded */
}

.conflict-option {
  border-radius: 20px; /* More rounded cards */
}
```

### Adjust Spacing
```css
.conflict-options {
  gap: 20px; /* Increase from 16px */
}
```

---

## 🐛 Troubleshooting

### Icons Not Showing
```jsx
// Make sure import path is correct
import { WarningIcon } from './components/icons/ConflictIcons';

// Check the file exists
// Should be at: src/components/icons/ConflictIcons.jsx
```

### Layout Breaking on Mobile
```css
/* Ensure you have the responsive CSS */
@media (max-width: 768px) {
  .conflict-option-grid {
    grid-template-columns: 1fr; /* Stack columns */
  }
}
```

### Animations Stuttering
```css
/* Use GPU acceleration */
.conflict-btn {
  transform: translateY(-3px);
  will-change: transform; /* Add this */
}
```

### Colors Not Matching
```css
/* Ensure gradients are defined correctly */
background: linear-gradient(135deg, #START 0%, #END 100%);
```

---

## 📊 Component Props

### ConflictResolutionDialog Props
```typescript
interface Props {
  isOpen: boolean;              // Show/hide dialog
  onClose: () => void;          // Called when dialog closes
  onResolved: (resolution: string) => void; // Called with resolution
  isResolving?: boolean;        // Show loading state (optional)
}
```

### Resolution Values
```typescript
type Resolution = 
  | 'local'    // Keep local changes
  | 'remote'   // Keep remote changes
  | 'merge'    // Smart merge
  | 'custom';  // Custom field selections
```

---

## ✅ Checklist for New Implementations

- [ ] Import ConflictIcons correctly
- [ ] Include updated CSS file
- [ ] Test on desktop (>768px)
- [ ] Test on mobile (<768px)
- [ ] Verify all icons render
- [ ] Check hover states work
- [ ] Test button actions
- [ ] Validate color contrast
- [ ] Check animations smooth
- [ ] Test with real conflict data
- [ ] Verify responsive layout
- [ ] Check accessibility (keyboard nav)

---

## 🔗 Related Files

- **Component**: `src/components/ConflictResolutionDialog.jsx`
- **Styles**: `src/components/ConflictResolutionDialog.css`
- **Icons**: `src/components/icons/ConflictIcons.jsx`
- **Hook**: `src/hooks/useConflictHandler.js`
- **Service**: `src/services/gitService.js`

---

## 📚 Further Reading

- [Full Documentation](./CONFLICT_DIALOG_REDESIGN.md)
- [Visual Comparison](./CONFLICT_DIALOG_VISUAL_COMPARISON.md)
- [Material Design Guidelines](https://material.io)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

**Last Updated**: November 2025  
**Version**: 2.0  
**Maintained By**: Development Team
