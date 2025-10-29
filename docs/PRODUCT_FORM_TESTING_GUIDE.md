# Product Form Testing Guide

## Manual Testing Checklist for Product Editor Form (Part 1)

### Test 1: Open Form with Default Values
**Steps:**
1. Click the "+ New Product" button
2. Verify the form opens in a modal overlay
3. Check that default values are populated:
   - Name: empty
   - Category: "Apparel" (default)
   - Description: empty
   - Price: 0.00
   - Stock: 0
   - Discount: unchecked (false)
   - Discounted Price: hidden (not visible)
   - Mark as New: checked (true)

**Expected Result:** Form opens with correct default values from defaultProduct

---

### Test 2: Open Form with Existing Product Data
**Steps:**
1. Click "Edit" button on any existing product
2. Verify the form opens
3. Check that all fields are populated with the product's current data

**Expected Result:** Form displays with all fields pre-filled with product data

---

### Test 3: Real-time Validation - Product Name
**Steps:**
1. Open the form (New Product)
2. Click in the Name field and type "A"
3. Tab out or click elsewhere

**Expected Result:** 
- Error message appears: "Name must be at least 3 characters long"
- Error message is displayed in red below the input
- Input field has red border
- Save button is disabled

**Additional Tests:**
- Type "AB" → Still shows error
- Type "ABC" → Error disappears
- Delete all text → Error: "Name is required"
- Type only spaces "   " → Error: "Name cannot be empty or only whitespace"

---

### Test 4: Real-time Validation - Description
**Steps:**
1. Open the form
2. Type less than 10 characters in Description field
3. Tab out

**Expected Result:**
- Error message: "Description must be at least 10 characters long"
- Save button is disabled

**Additional Tests:**
- Type exactly 10 characters → Error disappears
- Type more than 1000 characters → Error: "Description must not exceed 1000 characters"

---

### Test 5: Real-time Validation - Price
**Steps:**
1. Open the form
2. Leave Price at 0.00 or empty
3. Try entering invalid values:
   - 0 → Error: "Price must be greater than 0"
   - -5 → Error: "Price must be greater than 0"
   - 0.001 → Error: "Price must have exactly 2 decimal places"
   - 1000000 → Error: "Price must not exceed 999,999.99 EGP"

**Expected Result:** Appropriate error messages display for each case

---

### Test 6: Real-time Validation - Stock
**Steps:**
1. Open the form
2. Enter invalid stock values:
   - -1 → Error: "Stock cannot be negative"
   - 10000 → Error: "Stock cannot exceed 9999"
   - 5.5 → Error: "Stock must be an integer"

**Expected Result:** Appropriate error messages display for each case

---

### Test 7: Conditional Field - Discount Toggle
**Steps:**
1. Open the form
2. Verify "Discounted Price" field is NOT visible
3. Check the "Product is on discount" checkbox
4. Observe the form

**Expected Result:**
- Discounted Price field slides into view with animation
- Field is marked as required (red asterisk)
- Field has proper validation

**Additional Steps:**
5. Uncheck the discount checkbox

**Expected Result:**
- Discounted Price field disappears

---

### Test 8: Conditional Validation - Discounted Price vs Price
**Steps:**
1. Open the form
2. Set Price to 100.00
3. Check "Product is on discount"
4. Set Discounted Price to 120.00
5. Tab out or click elsewhere

**Expected Result:**
- Error message appears: "Discounted price must be less than regular price"
- Save button is disabled

**Additional Tests:**
6. Change Discounted Price to 80.00

**Expected Result:**
- Error disappears
- Form becomes valid (if all other fields are valid)

---

### Test 9: Category Selection
**Steps:**
1. Open the form
2. Click the Category dropdown
3. Verify all categories are available:
   - Apparel
   - Electronics
   - Home & Garden
   - Sports
   - Books
   - Toys
   - Other
4. Select different categories

**Expected Result:** Dropdown works correctly, selected category is displayed

---

### Test 10: Form Buttons - Cancel
**Steps:**
1. Open the form
2. Fill in some fields
3. Click "Cancel" button

**Expected Result:**
- Form closes immediately
- No data is saved
- Product list remains unchanged

---

### Test 11: Form Buttons - Save (Disabled State)
**Steps:**
1. Open the form
2. Leave required fields empty or invalid
3. Try to click "Save" button

**Expected Result:**
- Save button is visually disabled (grayed out)
- Button is not clickable
- Cursor shows "not-allowed" when hovering

---

### Test 12: Form Buttons - Save (Enabled State)
**Steps:**
1. Open the form
2. Fill in all required fields correctly:
   - Name: "Test Product ABC"
   - Category: "Electronics"
   - Description: "This is a test product description with more than 10 characters"
   - Price: 99.99
   - Stock: 50
3. Click "Save" button

**Expected Result:**
- Product is saved to the store
- Form remains open (allowing more edits)
- Product appears in the product list

---

### Test 13: Form Buttons - Save & Close
**Steps:**
1. Open the form
2. Fill in all required fields correctly (as above)
3. Click "Save & Close" button

**Expected Result:**
- Product is saved to the store
- Form closes automatically
- Product appears in the product list

---

### Test 14: Edit Existing Product and Save
**Steps:**
1. Click "Edit" on an existing product
2. Modify the Name field (add " - Modified")
3. Change the Price
4. Click "Save & Close"

**Expected Result:**
- Product is updated in the store
- Form closes
- Product card shows updated information

---

### Test 15: Form Close Button (X)
**Steps:**
1. Open the form
2. Fill in some fields
3. Click the "X" button in the top-right corner

**Expected Result:**
- Form closes immediately
- No data is saved
- Same behavior as Cancel button

---

### Test 16: Product Flags - isNew
**Steps:**
1. Open the form for a new product
2. Verify "Mark as New" is checked by default
3. Uncheck it
4. Save the product
5. Verify the product card does NOT show "New" badge

**Expected Result:** isNew flag is properly saved and reflected in UI

---

### Test 17: Full Form Validation Flow
**Steps:**
1. Click "+ New Product"
2. Verify Save button is disabled
3. Fill in Name: "Test"
4. Verify Save still disabled (other required fields)
5. Fill in Description: "Test description for validation"
6. Fill in Price: 50.00
7. Fill in Stock: 10
8. Verify Save button is now enabled
9. Toggle discount ON
10. Set Discounted Price: 40.00
11. Click "Save & Close"

**Expected Result:**
- Form validates correctly at each step
- Save button enables only when form is valid
- Product is created successfully with all data

---

### Test 18: Keyboard Accessibility
**Steps:**
1. Open the form
2. Use Tab key to navigate through all fields
3. Use Shift+Tab to navigate backwards
4. Press Escape key (future enhancement)

**Expected Result:**
- All form fields are keyboard accessible
- Tab order is logical (top to bottom)
- Focus indicators are visible

---

### Test 19: Error Message Display
**Steps:**
1. Open the form
2. Trigger multiple errors (invalid name, price, stock)
3. Observe error messages

**Expected Result:**
- Each field shows its own error message
- Error messages are clearly visible in red
- Error messages appear directly below the field
- Multiple errors can be displayed simultaneously

---

### Test 20: Form Overlay Click
**Steps:**
1. Open the form
2. Click on the dark overlay area (outside the form)

**Expected Result:**
- **Current:** Nothing happens (form stays open)
- **Future Enhancement:** Could close form (with confirmation if data entered)

---

## Automated Testing Recommendations

For future implementation, consider these automated tests:

```javascript
// Example test cases using Vitest + React Testing Library

test('form renders with default values for new product', () => {
  // Test default values are displayed
});

test('validation errors appear for invalid inputs', () => {
  // Test each validation rule
});

test('discounted price field appears when discount is toggled', () => {
  // Test conditional rendering
});

test('save button is disabled when form is invalid', () => {
  // Test button state
});

test('form submits valid data correctly', () => {
  // Test form submission
});
```

---

## Browser Testing

Test in the following environments:
- ✅ Electron (primary target)
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox (optional)

## Performance Checks

- Form opens smoothly without lag
- Validation feedback is immediate (< 100ms)
- Conditional fields animate smoothly
- No console errors or warnings

---

## Accessibility Checks

- ✅ All form fields have labels
- ✅ Required fields are marked with asterisk
- ✅ Error messages are associated with fields
- ✅ Keyboard navigation works
- ✅ Focus indicators are visible
- ✅ Color contrast is sufficient (WCAG AA)

---

## Known Limitations (Part 1)

- Images section not yet implemented (Part 2)
- No duplicate product functionality yet
- No delete product confirmation
- Form doesn't close on overlay click
- No unsaved changes warning
- Featured flag not implemented (will be in later parts)
