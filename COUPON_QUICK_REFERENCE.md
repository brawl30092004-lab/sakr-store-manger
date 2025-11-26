# Coupon Management - Quick Reference

## 🎯 Quick Start

### Access Coupons
1. Click **"Coupons"** in the sidebar
2. View all your discount coupons in grid layout

### Create a Coupon
1. Click the **blue + button** (bottom right)
2. Fill in the form:
   - **Code**: e.g., `WELCOME10` (4-20 chars, uppercase)
   - **Type**: Percentage or Fixed Amount
   - **Amount**: Discount value (1-100% or EGP amount)
   - **Min Spend**: Minimum cart value (optional)
   - **Category**: Which products apply
   - **Description**: Optional note (max 200 chars)
   - **Enabled**: Toggle on/off
3. Click **"Add Coupon"**

### Edit a Coupon
1. Click **"Edit"** on any coupon card
2. Modify fields
3. Click **"Update Coupon"**

### Delete a Coupon
1. Click **"Delete"** on coupon card
2. Confirm deletion
3. (Optional) Click **"Undo"** to restore

### Duplicate a Coupon
1. Click **"Duplicate"** on coupon card
2. A copy is created with `_COPY` suffix
3. Edit the copy to customize

### Enable/Disable
- Click the **toggle switch** on any coupon card
- Disabled coupons are grayed out

### Search & Filter
- **Search**: Type in search box (searches code, category, description)
- **Status**: Click "Enabled" or "Disabled" filter
- **Type**: Click "% Discount" or "Fixed Amount" filter

### Publish Changes
1. Make your coupon changes
2. Status bar shows **"Unsaved changes"**
3. Click **"Publish to Store"**
4. Changes pushed to GitHub → Website updated

---

## 📋 Coupon Fields Explained

| Field | Description | Rules |
|-------|-------------|-------|
| **Code** | Unique coupon code customers enter | 4-20 characters, uppercase letters & numbers only |
| **Type** | Discount type | "Percentage" (%) or "Fixed" (EGP amount) |
| **Amount** | Discount value | 1-100 for %, any positive for fixed |
| **Min Spend** | Minimum cart value required | 0 = no minimum, any positive number |
| **Category** | Which products qualify | "All" or specific category from products |
| **Description** | Optional note/description | Max 200 characters |
| **Enabled** | Whether coupon is active | Toggle on/off |

---

## 💡 Tips & Best Practices

### Naming Conventions
- **Purpose + Value**: `WELCOME10`, `SUMMER25`
- **Event-based**: `BLACKFRIDAY`, `NEWYEAR2024`
- **Tier-based**: `BRONZE10`, `SILVER20`, `GOLD30`

### Discount Strategy
- **Welcome coupons**: 5-10% off, no minimum
- **Cart incentives**: 15-25% off, 500+ EGP minimum
- **Clearance**: Fixed amounts (50 EGP, 100 EGP)
- **Category-specific**: Higher % for slow-moving categories

### Organization
- **Enable only active**: Disable expired/unused coupons
- **Use descriptions**: Document purpose and validity
- **Regular cleanup**: Delete old/unused coupons
- **Test before launch**: Verify on website before announcing

### Common Use Cases

**1. Welcome Discount**
```
Code: WELCOME10
Type: Percentage
Amount: 10%
Min Spend: 500 EGP
Category: All
Description: First-time customer welcome offer
```

**2. Free Shipping Equivalent**
```
Code: FREESHIP
Type: Fixed
Amount: 50 EGP
Min Spend: 300 EGP
Category: All
Description: Covers shipping cost
```

**3. Category Sale**
```
Code: ELECTRONICS25
Type: Percentage
Amount: 25%
Min Spend: 1000 EGP
Category: Electronics
Description: Electronics category flash sale
```

**4. VIP Customer**
```
Code: VIP30
Type: Percentage
Amount: 30%
Min Spend: 0
Category: All
Description: VIP customer exclusive discount
```

---

## ⚠️ Important Notes

### Validation Rules
- Coupon codes are **case-insensitive** (WELCOME10 = welcome10)
- Codes must be **unique** (no duplicates)
- Categories must **exist in products** first
- Disabled coupons **won't work** on the website

### Website Integration
- Changes require **"Publish to Store"** to take effect
- Website loads coupons from `coupons.json` in repository
- No server-side tracking (website validates client-side)

### Limitations
- No usage tracking (can't see how many times used)
- No expiration dates (must manually disable)
- No per-user limits (any customer can use any active coupon)
- No stacking rules (website determines stacking logic)

---

## 🔍 Filtering Examples

### Find All Active Coupons
1. Click **"Enabled"** filter
2. Shows only enabled coupons

### Find Percentage Discounts
1. Click **"% Discount"** filter
2. Shows only percentage-type coupons

### Find Electronics Coupons
1. Type **"electronics"** in search box
2. Shows coupons with "Electronics" in category

### Find High-Value Discounts
1. Search for specific amounts (e.g., "25")
2. Or manually scan cards for amount values

---

## 🚨 Troubleshooting

### "Coupon code already exists"
- Codes must be unique
- Check existing coupons (case-insensitive)
- Choose a different code

### "Category not found"
- Category must exist in products.json first
- Add products in that category first
- Or use "All" for all products

### "Amount invalid"
- Percentage: Must be 1-100
- Fixed: Must be positive number
- Check your type selection

### Coupon not working on website
- Verify coupon is **enabled** (toggle on)
- Check you clicked **"Publish to Store"**
- Verify category matches products
- Check minimum spend requirement

### Changes not appearing
- Click **"Publish to Store"** in status bar
- Wait for GitHub Pages to rebuild (~1-2 min)
- Clear website cache and refresh

---

## ⌨️ Keyboard Shortcuts

Currently, coupon management uses standard shortcuts:
- **Ctrl+K**: Open command palette → Type "coupons"
- **Esc**: Close form/modal
- **Enter**: Submit form (when valid)
- **Tab**: Navigate form fields

---

## 📊 Status Indicators

### Coupon Card Colors
- **Blue accent**: Active/enabled coupon
- **Gray**: Disabled coupon
- **Green dot**: Enabled indicator
- **Gray dot**: Disabled indicator

### Status Bar Messages
- **"Ready"**: No unsaved changes
- **"X files modified"**: Changes pending
- **"Publishing..."**: Pushing to GitHub
- **"Published"**: Changes live on website

---

## 🔗 Related Features

### Products
- Categories from products populate coupon dropdown
- Coupons can be category-specific
- Both publish together to store

### Git/GitHub
- Coupons saved to `coupons.json` in repo
- Included in git status tracking
- Published alongside product changes
- Version controlled like products

### Dashboard
- (Future) Coupon analytics may appear here
- Currently tracks product metrics only

---

## 📚 Additional Resources

- **Full Documentation**: `COUPON_FEATURE_DOCUMENTATION.md`
- **Testing Checklist**: `COUPON_FEATURE_TESTING_CHECKLIST.md`
- **Original Requirements**: Task specification document
- **Code Comments**: Inline JSDoc in source files

---

## 🆘 Need Help?

### Check Console
1. Press **F12** to open DevTools
2. Check **Console** tab for errors
3. Look for red error messages

### Check Files
1. Navigate to project folder
2. Open `coupons.json` in text editor
3. Verify structure is valid JSON

### Check Git
1. Click **"View Changes"** in status bar
2. Verify `coupons.json` appears in list
3. Check git status in terminal

### Report Issues
Use the bug report template in `COUPON_FEATURE_TESTING_CHECKLIST.md`

---

## ✅ Quick Checklist

Before publishing coupons:
- [ ] Coupon codes are unique
- [ ] Discount values are correct
- [ ] Categories exist in products
- [ ] Enabled status is correct
- [ ] Descriptions are clear
- [ ] Tested locally if possible
- [ ] Status bar shows changes
- [ ] Ready to publish

After publishing:
- [ ] Wait for GitHub Pages rebuild
- [ ] Visit website to verify
- [ ] Test coupon application
- [ ] Verify discount calculates correctly
- [ ] Check minimum spend enforcement
- [ ] Confirm category restrictions work
