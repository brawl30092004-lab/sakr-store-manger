# Product-Level Conflict Resolution - Implementation Guide

## 🎯 Overview

The conflict resolution system has been **enhanced with product-level granularity**. Instead of showing generic file conflicts, the system now shows **exactly which products** have conflicts and **which specific fields** differ between versions.

---

## ✨ What's New

### Before (Generic)
```
❌ Conflict Dialog:
   "products.json has conflicts"
   
   User sees:
   - File name only
   - No details about what changed
   - Must guess which products differ
```

### After (Detailed)
```
✅ Enhanced Conflict Dialog:
   "2 products have conflicts"
   
   User sees:
   📦 Product: "Laptop Pro X1"
      
      💰 Price:
      🌐 Current Store: $1,299
      💻 Your Version: $1,499
      
      📝 Description:
      🌐 Current Store: "High-performance laptop with 16GB RAM"
      💻 Your Version: "Premium laptop with 32GB RAM and RTX 4080"
```

---

## 🏗️ Architecture

### 1. Conflict Parsing (`gitService.js`)

#### New Method: `parseProductConflicts(localContent, remoteContent)`

**Purpose:** Analyzes products.json to find specific product and field-level differences

**Process:**
1. Parse both JSON versions
2. Create ID-based maps for efficient lookup
3. Compare each product by ID
4. Identify differing fields
5. Return structured conflict data

**Output Structure:**
```javascript
[
  {
    productId: 123,
    productName: "Laptop Pro X1",
    localProduct: { /* full local product */ },
    remoteProduct: { /* full remote product */ },
    fieldConflicts: [
      {
        field: "price",
        fieldLabel: "Price",
        localValue: 1499,
        remoteValue: 1299,
        isDifferent: true
      },
      {
        field: "description",
        fieldLabel: "Description",
        localValue: "Premium laptop...",
        remoteValue: "High-performance...",
        isDifferent: true
      }
    ]
  }
]
```

#### Fields Compared

The system checks these fields:
- ✅ `name` - Product Name
- ✅ `price` - Price
- ✅ `description` - Description
- ✅ `category` - Category
- ✅ `stock` - Stock Quantity
- ✅ `isNew` - New Badge
- ✅ `discount` - Discount Percentage

#### Helper Method: `getFieldLabel(field)`

Converts technical field names to user-friendly labels:
```javascript
'name' → 'Product Name'
'price' → 'Price'
'description' → 'Description'
// etc.
```

---

### 2. Enhanced `getConflictDetails()`

**Previous Behavior:**
```javascript
// Only returned file-level conflicts
{
  conflictedFiles: ['products.json'],
  conflicts: [{ file: 'products.json', localVersion: '...', remoteVersion: '...' }]
}
```

**New Behavior:**
```javascript
{
  conflictedFiles: ['products.json'],
  conflicts: [{ file: 'products.json', localVersion: '...', remoteVersion: '...' }],
  
  // NEW: Product-level details
  productConflicts: [
    {
      productId: 123,
      productName: "Laptop Pro X1",
      fieldConflicts: [...]
    }
  ],
  hasProductConflicts: true,
  message: "2 product(s) have conflicts"
}
```

**Detection Logic:**
```javascript
// If this is products.json, parse for product-level conflicts
if (file.includes('products.json') && localVersion && remoteVersion) {
  productConflicts = this.parseProductConflicts(localVersion, remoteVersion);
}
```

---

### 3. Enhanced ConflictResolutionDialog

#### New UI Components

**Product Conflict Item:**
```jsx
<div className="product-conflict-item">
  <div className="product-conflict-header">
    <span className="product-icon">📦</span>
    <strong>{product.productName}</strong>
    <span className="conflict-count">
      {product.fieldConflicts.length} field(s) differ
    </span>
  </div>
  
  <div className="field-conflicts">
    {/* Field-by-field comparison */}
  </div>
</div>
```

**Field Comparison:**
```jsx
<div className="field-conflict">
  <div className="field-name">Price:</div>
  <div className="field-comparison">
    <!-- GitHub Version -->
    <div className="field-version github-version">
      <div className="version-label">🌐 Current Store (GitHub)</div>
      <div className="version-value">$1,299</div>
    </div>
    
    <!-- Separator -->
    <div className="field-separator">→</div>
    
    <!-- Local Version -->
    <div className="field-version local-version">
      <div className="version-label">💻 Your Local Version</div>
      <div className="version-value">$1,499</div>
    </div>
  </div>
</div>
```

#### User-Friendly Language

**Labels Changed:**
- ❌ "Keep Local" → ✅ "Use My Version"
- ❌ "Use GitHub" → ✅ "Keep Store Version"
- ❌ "Remote" → ✅ "Current Store (GitHub)"
- ❌ "Local" → ✅ "Your Local Version"

**Benefits:**
- Non-technical users understand immediately
- Clear what "store" means (what's live on GitHub)
- Obvious which version is theirs

---

### 4. CSS Styling

#### Visual Design

**Color Coding:**
- 🟡 **GitHub Version:** Yellow border (`#ffc107`)
- 🟢 **Local Version:** Green border (`#4caf50`)

**Layout:**
- Side-by-side comparison (desktop)
- Stacked comparison (mobile)
- Clear visual separator (→)

**Hierarchy:**
```
Dialog
 └── Product Item (with background)
      └── Product Header (name + count)
      └── Field Conflicts
           └── Field Item
                └── Field Comparison
                     ├── GitHub Version (yellow)
                     ├── Separator
                     └── Local Version (green)
```

---

## 🎨 UI Examples

### Example 1: Single Product, Multiple Fields

```
╔═══════════════════════════════════════════════════════════╗
║               ⚠️ Merge Conflict Detected                  ║
║    Cannot publish: changes conflict with store version    ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  1 product has conflicting changes                        ║
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ 📦 Laptop Pro X1                    2 fields differ  │ ║
║  ├──────────────────────────────────────────────────────┤ ║
║  │                                                      │ ║
║  │  PRICE:                                             │ ║
║  │  ┌─────────────────┐    →    ┌──────────────────┐ │ ║
║  │  │ 🌐 Current Store│          │ 💻 Your Version │ │ ║
║  │  │    $1,299       │          │    $1,499       │ │ ║
║  │  └─────────────────┘          └──────────────────┘ │ ║
║  │                                                      │ ║
║  │  DESCRIPTION:                                       │ ║
║  │  ┌──────────────────┐    →    ┌──────────────────┐ │ ║
║  │  │ 🌐 Current Store │          │ 💻 Your Version │ │ ║
║  │  │ High-performance │          │ Premium laptop  │ │ ║
║  │  │ laptop with 16GB│          │ with 32GB RAM   │ │ ║
║  │  └──────────────────┘          └──────────────────┘ │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  Which version do you want to keep?                       ║
║                                                            ║
║  [💻 Use My Version] [☁️ Keep Store Version] [Cancel]    ║
╚═══════════════════════════════════════════════════════════╝
```

### Example 2: Multiple Products

```
╔═══════════════════════════════════════════════════════════╗
║               ⚠️ Merge Conflict Detected                  ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  3 products have conflicting changes                      ║
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ 📦 Laptop Pro X1                    2 fields differ  │ ║
║  │ (Price, Description)                                 │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ 📦 Wireless Mouse                   1 field differs  │ ║
║  │ (Stock Quantity)                                     │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ 📦 USB-C Cable                      1 field differs  │ ║
║  │ (Price)                                              │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  [💻 Use My Version] [☁️ Keep Store Version] [Cancel]    ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📊 Data Flow

```
User triggers publish
        ↓
  Git detects conflict
        ↓
  getConflictDetails() called
        ↓
  Loads local & remote versions
        ↓
  Is it products.json?
        ↓
      YES
        ↓
  parseProductConflicts()
        ↓
  Compare products by ID
        ↓
  Find field differences
        ↓
  Build structured output
        ↓
  Return to dialog
        ↓
  Dialog renders details
        ↓
  User sees:
  - Product names
  - Field names
  - Both values
        ↓
  User makes informed choice
        ↓
  Resolution applied
        ↓
  Publish continues
```

---

## 🧪 Testing Examples

### Test Case 1: Price Conflict

**Setup:**
1. Local: Edit "Laptop Pro X1" price to $1,499
2. GitHub: Edit same product price to $1,299
3. Commit on GitHub
4. Try to publish locally

**Expected Dialog:**
```
📦 Laptop Pro X1

Price:
🌐 Current Store: $1,299
💻 Your Version: $1,499
```

### Test Case 2: Description Conflict

**Setup:**
1. Local: Change product description
2. GitHub: Change same description differently
3. Try to publish

**Expected Dialog:**
```
📦 Product Name

Description:
🌐 Current Store: "Original description..."
💻 Your Version: "Your new description..."
```

### Test Case 3: Multiple Fields

**Setup:**
1. Local: Change price AND description
2. GitHub: Change same fields differently
3. Try to publish

**Expected Dialog:**
```
📦 Product Name (2 fields differ)

Price:
🌐 Current Store: $99
💻 Your Version: $120

Description:
🌐 Current Store: "Store version"
💻 Your Version: "Your version"
```

---

## 🎯 Benefits

### For Users

1. **Clear Understanding**
   - See exactly what changed
   - Know what they're choosing between
   - Make informed decisions

2. **No Guessing**
   - Don't have to open GitHub
   - Don't need git knowledge
   - Everything visible in dialog

3. **Confidence**
   - See both versions side-by-side
   - Understand impact of choice
   - Less fear of losing data

### For Developers

1. **Structured Data**
   - Easy to extend to other files
   - Can add more field types
   - Reusable parsing logic

2. **Maintainable**
   - Clean separation of concerns
   - Easy to test
   - Well-documented

3. **Extensible**
   - Can add per-product resolution
   - Can add per-field resolution
   - Can add visual diff view

---

## 🚀 Future Enhancements

### Potential Improvements

1. **Per-Product Resolution**
   - Resolve each product individually
   - Mix and match: keep some local, some remote
   - More granular control

2. **Per-Field Resolution**
   - Keep local price but remote description
   - Cherry-pick field values
   - Ultimate flexibility

3. **Visual Diff Highlighting**
   - Show exact character differences
   - Highlight what changed in text
   - Side-by-side text diff

4. **Conflict Preview**
   - Show merged result before applying
   - Preview what will be published
   - Confirmation step

5. **Smart Suggestions**
   - AI-powered conflict recommendations
   - Analyze change patterns
   - Suggest likely correct version

6. **Conflict History**
   - Track past conflicts
   - Learn user preferences
   - Suggest based on history

---

## 📚 API Reference

### gitService.js

```javascript
// Parse product-level conflicts
const conflicts = gitService.parseProductConflicts(localJSON, remoteJSON);

// Returns:
[
  {
    productId: number,
    productName: string,
    localProduct: object,
    remoteProduct: object,
    fieldConflicts: [
      {
        field: string,
        fieldLabel: string,
        localValue: any,
        remoteValue: any,
        isDifferent: boolean
      }
    ]
  }
]

// Get user-friendly field label
const label = gitService.getFieldLabel('price'); // Returns: "Price"

// Enhanced conflict details
const details = await gitService.getConflictDetails();

// Returns:
{
  success: boolean,
  hasConflicts: boolean,
  conflictedFiles: string[],
  conflicts: object[],
  productConflicts: object[], // NEW
  hasProductConflicts: boolean, // NEW
  message: string
}
```

---

## ✅ Completion Checklist

- [x] Created `parseProductConflicts()` method
- [x] Created `getFieldLabel()` helper
- [x] Enhanced `getConflictDetails()` to parse products
- [x] Updated ConflictResolutionDialog UI
- [x] Added product conflict rendering
- [x] Added field-by-field comparison view
- [x] Created CSS for visual design
- [x] Updated labels to user-friendly language
- [x] Added responsive design for mobile
- [x] Documented implementation

---

## 🎉 Summary

The conflict resolution system is now **product-aware and field-specific**. Users can see exactly which products have conflicts, which fields differ, and what the values are on both sides. This transforms conflict resolution from a **scary, technical process** into an **informed, confident decision**.

**Key Achievement:** Users can now make intelligent choices about conflicts without any git knowledge or needing to inspect files manually.
