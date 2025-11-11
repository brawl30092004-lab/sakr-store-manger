# Category Rename Feature

## Overview
The category rename feature allows you to rename a category for all products at once, eliminating the need to manually update each product individually.

## Features
- **Bulk Rename**: Rename a category for all products with a single action
- **Validation**: Category names are validated (2-50 characters)
- **Visual Feedback**: Shows the number of products that will be affected
- **Easy Access**: Edit button appears when hovering over categories in the sidebar
- **Success Notifications**: Toast notifications confirm successful renames
- **Error Handling**: Clear error messages for invalid inputs

## How to Use

### Step 1: Hover Over a Category
In the sidebar's category list, hover your mouse over any category (except "All"). An edit icon (pencil) will appear on the right side.

### Step 2: Click the Edit Button
Click the edit icon to open the "Rename Category" dialog.

### Step 3: Enter New Category Name
- The current category name is displayed
- The number of affected products is shown
- Enter the new category name in the input field
- The name must be:
  - At least 2 characters long
  - No more than 50 characters
  - Different from the current name

### Step 4: Confirm or Cancel
- Click **"Rename Category"** to apply the change to all products
- Click **"Cancel"** or press `Escape` to close without changes

### Step 5: View Confirmation
A success toast notification will appear, confirming:
- The old category name
- The new category name
- The number of products updated

## Technical Implementation

### Components Created
1. **RenameCategoryDialog.jsx** - Modal dialog component for renaming
2. **RenameCategoryDialog.css** - Styling for the dialog

### Redux Actions
- **renameCategory** (async thunk) - Handles the category rename operation
- Updates all products with the old category to use the new category name
- Saves changes to products.json

### Service Methods
- **ProductService.renameCategoryForAllProducts()** - Backend logic for bulk category update
  - Loads all products
  - Validates the new category name
  - Updates all matching products
  - Saves to file system

### Sidebar Updates
- Added edit button that appears on hover
- Integrated RenameCategoryDialog component
- Handles category selection after rename

## Validation Rules

Category names must:
- Be a string
- Have at least 2 characters (after trimming whitespace)
- Not exceed 50 characters
- Be different from the current category name

## Error Handling

The feature handles several error scenarios:
- **Invalid category name**: Shows validation error message
- **Same name**: Prevents renaming to the same name
- **No products found**: Prevents renaming empty categories
- **Save failure**: Shows error notification if save fails

## Benefits

1. **Time-Saving**: Rename categories in seconds instead of editing each product
2. **Consistency**: Ensures all products in a category are updated uniformly
3. **User-Friendly**: Simple, intuitive interface with clear feedback
4. **Safe**: Validation prevents invalid category names
5. **Reversible**: Can be renamed again if needed

## Example Use Cases

### Scenario 1: Fixing Typos
- Current: "Electoronics" (typo)
- New: "Electronics"
- Result: All products instantly corrected

### Scenario 2: Rebranding
- Current: "Gadgets"
- New: "Tech Accessories"
- Result: All products recategorized consistently

### Scenario 3: Standardization
- Current: "Home Goods"
- New: "Home & Living"
- Result: Category naming standardized across the store

## Technical Notes

### State Management
- Uses Redux for state management
- Dispatches `renameCategory` async thunk
- Updates local state optimistically after successful save

### File System Operations
- Reads from products.json
- Updates all matching products in memory
- Writes entire products array back to products.json
- Supports both local and GitHub data sources

### Performance
- Efficient bulk operation (single read, single write)
- No individual product updates needed
- Minimal impact on large product catalogs

### Keyboard Shortcuts
- `Escape` - Close dialog without changes

## Future Enhancements (Potential)

- Merge categories (combine two categories into one)
- Batch category operations (rename multiple categories)
- Category history/undo
- Category analytics (most used categories)

---

**Last Updated**: November 11, 2025
