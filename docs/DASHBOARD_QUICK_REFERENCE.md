# Dashboard Quick Reference

## Access Dashboard

### Methods
| Method | Action |
|--------|--------|
| Keyboard | `Ctrl+D` |
| Menu | View → Dashboard |
| Command Palette | `Ctrl+K` → Type "dashboard" |

## Dashboard Sections

### 1. Metrics Overview (Top Cards)
```
┌─────────────┬─────────────┬─────────────┐
│  📦 Total   │  ⚠️ Out of  │  🏷️ Discount │
│  Products   │    Stock    │   Items     │
├─────────────┼─────────────┼─────────────┤
│  ✨ New     │  🛒 Low     │  💰 Total   │
│  Products   │   Stock     │   Value     │
└─────────────┴─────────────┴─────────────┘
```

**Metrics Explained:**
- **Total Products**: All products in inventory
- **Out of Stock**: Stock = 0 or negative
- **Discounted Items**: Products with active discounts
- **New Products**: Products marked as "New"
- **Low Stock**: Stock between 1-5 units
- **Inventory Value**: Total $ value of all stock

### 2. Charts Section

#### Category Distribution
- Shows top 6 categories by product count
- Horizontal bar chart
- Helps identify popular categories

#### Price Ranges
- Distribution across 5 price tiers:
  - $0-50
  - $50-100
  - $100-200
  - $200-500
  - $500+
- Shows average price

#### Stock Levels
- Visual breakdown:
  - 🔴 Out of Stock
  - 🟡 Low Stock (1-5)
  - 🟢 In Stock (6+)

### 3. Recent Activity
- Last 5 products added
- Shows: Image, Name, Category, Price, Badges
- Quick overview of latest inventory changes

## Navigation

### Switch Views
```bash
Dashboard View  ←→  Products View
   (Ctrl+D)         (Click Products)
```

### From Dashboard
- Cannot create/edit products directly
- Switch to Products view for management
- Use floating action buttons in Products view

## Visual Indicators

### Color Coding
| Color | Meaning |
|-------|---------|
| 🟣 Purple | General/Primary |
| 🔴 Red | Alert/Out of Stock |
| 🔵 Blue | Discounts |
| 🟢 Green | New Items |
| 🟡 Yellow | Low Stock Warning |
| 🟦 Teal | Financial/Value |

### Badges in Recent Activity
- **✨ New**: Product marked as new
- **⚠️ Out**: Out of stock
- **Low Stock**: 1-5 units remaining

## Use Cases

### Daily Check-in
1. Press `Ctrl+D` to open dashboard
2. Check Out of Stock count
3. Review Low Stock warnings
4. Check inventory value

### Before Ordering
1. Check Low Stock items
2. Review Out of Stock count
3. Analyze category distribution
4. Check recent additions

### Monthly Review
1. Check total product count
2. Review price distribution
3. Analyze category balance
4. Review inventory value

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+D` | Show Dashboard |
| `Ctrl+K` | Command Palette |
| `Esc` | Close dialogs |

## Tips & Tricks

### Quick Insights
- **High Out of Stock?** Time to restock popular items
- **Low Stock warnings?** Plan next order
- **Inventory Value?** Track business growth
- **Category imbalance?** Diversify inventory

### Performance
- Dashboard updates automatically when products change
- All metrics calculated in real-time
- No manual refresh needed

### Empty States
- No products? Dashboard shows helpful empty states
- Charts display placeholder messages
- Recent activity shows "Add your first product"

## Responsive Design

### Desktop (>1024px)
- 3-column metric cards
- Side-by-side charts
- Full recent activity list

### Tablet (768px-1024px)
- 2-column metric cards
- Stacked charts
- Compact recent activity

### Mobile (<768px)
- 1-column layout
- Single column cards
- Simplified charts
- Compact activity cards

## Integration with Products

### Data Source
- All data from Redux store
- Same data as Products view
- Updates when you save changes

### Workflow
```
Dashboard → Identify Issues → Switch to Products → Fix → Save → Return to Dashboard
```

## Troubleshooting

### Dashboard shows 0 products
- Check if project path is set
- Ensure products.json is loaded
- Try reloading data

### Charts not displaying
- Verify products are loaded
- Check browser console for errors
- Refresh the page

### Metrics seem wrong
- Save any pending changes
- Reload products (Ctrl+R)
- Check product data integrity

## Related Documentation
- `DASHBOARD_IMPLEMENTATION.md` - Full technical details
- `APP_MENU_IMPLEMENTATION.md` - Menu system
- `FEEDBACK_PATTERNS_GUIDE.md` - UI patterns

---

**Last Updated**: November 2025  
**Version**: 1.0.0
