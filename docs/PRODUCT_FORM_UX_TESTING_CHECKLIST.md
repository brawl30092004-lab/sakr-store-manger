# Product Form UX - Testing Checklist

## 🧪 Manual Testing Guide

Use this checklist to verify all UX improvements are working correctly.

---

## ✅ Multi-Step Form Navigation

### Step Progression
- [ ] Form opens on Step 1 (Basic Info)
- [ ] Progress indicator shows "1 of 4" or similar
- [ ] Step 1 indicator is highlighted in blue
- [ ] Steps 2-4 are grayed out
- [ ] "Next" button is visible
- [ ] "Previous" button is hidden on Step 1

### Navigation Controls
- [ ] Clicking "Next" advances to Step 2
- [ ] "Previous" button appears on Step 2+
- [ ] Clicking "Previous" goes back to Step 1
- [ ] Clicking directly on step indicators navigates to that step
- [ ] Completed steps show green checkmark
- [ ] Active step always highlighted in blue

### Step Content
- [ ] Step 1 shows: Name, Category, Description
- [ ] Step 2 shows: Price, Stock, Discount toggle
- [ ] Step 3 shows: Primary Image, Gallery
- [ ] Step 4 shows: "Mark as New" checkbox
- [ ] Each step hides when not active
- [ ] Data persists when switching steps

---

## 📤 Upload Progress Feedback

### Primary Image Upload

#### Initial State
- [ ] Shows dashed border upload area
- [ ] "Drag & drop" text visible
- [ ] Image icon displayed
- [ ] Recommendations section visible

#### During Upload
- [ ] Click triggers file picker
- [ ] Drag & drop accepts image files
- [ ] Progress bar appears immediately
- [ ] Percentage shows (0-100%)
- [ ] "Processing image..." text displays
- [ ] Icon pulses during processing
- [ ] Upload area becomes non-clickable

#### After Upload
- [ ] Progress bar reaches 100%
- [ ] Preview appears smoothly
- [ ] File info shows (name, size, dimensions)
- [ ] Replace, Remove, Crop buttons visible
- [ ] Recommendation badges appear if applicable

#### Error Handling
- [ ] Invalid file types show error
- [ ] Oversized files (>10MB) rejected
- [ ] Error message displayed clearly
- [ ] Can retry after error

### Gallery Image Upload
- [ ] "Add Image" button always visible
- [ ] Multiple images can be added
- [ ] Progress shown for each upload
- [ ] Thumbnails appear immediately
- [ ] Max 10 images enforced
- [ ] Error on exceeding limit

---

## 🖼️ Gallery Drag-and-Drop

### Hover States
- [ ] Gallery items scale 105% on hover
- [ ] Blue border appears on hover
- [ ] Subtle glow effect visible
- [ ] Gradient overlay appears
- [ ] Drag handle (⋮⋮) becomes visible
- [ ] Remove button (X) becomes visible

### Dragging
- [ ] Can click and hold drag handle
- [ ] Item opacity reduces to 40%
- [ ] Item scales down to 90%
- [ ] Item rotates 2 degrees
- [ ] Blue border remains during drag
- [ ] Shadow effect enhances depth
- [ ] Cursor changes to "move"

### Dropping
- [ ] Can drop on any other gallery item
- [ ] Items reorder smoothly
- [ ] Dragged item transitions to new position
- [ ] Other items shift accordingly
- [ ] No glitches or jumps
- [ ] Order persists after drop
- [ ] Auto-save triggers after reorder

### Visual Feedback
- [ ] Smooth 300ms transitions
- [ ] Cubic-bezier easing feels natural
- [ ] No lag or stuttering
- [ ] Colors match design system
- [ ] Animations are smooth at 60fps

---

## 💾 Auto-Save Indicator

### Status Display

#### Idle State
- [ ] No indicator shown initially
- [ ] Indicator hidden in header

#### Saving State
- [ ] Appears in header (top right)
- [ ] Blue background color
- [ ] Spinner icon animates
- [ ] "Saving draft..." text visible
- [ ] Appears within 3 seconds of typing

#### Saved State
- [ ] Changes to green background
- [ ] Checkmark icon appears
- [ ] "Draft saved" text displays
- [ ] Remains visible for 2 seconds
- [ ] Fades out smoothly

### Trigger Conditions
- [ ] Triggers after typing in any field
- [ ] Debounced to 3 second delay
- [ ] Triggers after image upload
- [ ] Triggers after checkbox toggle
- [ ] Triggers after gallery reorder

---

## 📋 Draft Notification Banner

### Appearance
- [ ] Shows below form header
- [ ] Blue background (info color)
- [ ] Info icon visible
- [ ] "Draft found" title shown
- [ ] Timestamp displays correctly
- [ ] "Restore" button visible
- [ ] "Discard" button visible
- [ ] Smooth slide-down animation

### Behavior
- [ ] Appears only when draft exists
- [ ] Appears on form open (not after)
- [ ] Does NOT block form interaction
- [ ] Can interact with form while banner visible
- [ ] "Restore" loads draft data
- [ ] "Discard" removes draft
- [ ] Banner disappears after action
- [ ] Auto-save disabled while banner shown

### Draft Data
- [ ] Timestamp format is readable
- [ ] Draft contains all form data
- [ ] Draft persists after browser close
- [ ] Draft clears after successful save
- [ ] Multiple products have separate drafts

---

## 👁️ Product Preview

### Activation
- [ ] "Preview Product" button on Step 4
- [ ] Button toggles to "Hide Preview"
- [ ] Preview panel slides down smoothly
- [ ] Preview card displays below form

### Preview Content

#### Image Section
- [ ] Primary image displays if uploaded
- [ ] Image aspect ratio preserved
- [ ] Placeholder shown if no image
- [ ] Image fills 120x120px area

#### Product Details
- [ ] Product name displays correctly
- [ ] Category shown in uppercase
- [ ] Description text visible
- [ ] Line breaks preserved

#### Pricing
- [ ] Regular price shows "EGP X.XX"
- [ ] If discount: old price crossed out
- [ ] If discount: discounted price in green
- [ ] If no discount: single price shown
- [ ] Prices format to 2 decimals

#### Stock Status
- [ ] If stock > 0: "X in stock"
- [ ] If stock = 0: "Out of stock"
- [ ] Stock count matches form value

### Real-Time Updates
- [ ] Name updates as typed
- [ ] Category updates as typed
- [ ] Description updates as typed
- [ ] Price updates immediately
- [ ] Discount toggle updates pricing display
- [ ] Stock updates immediately
- [ ] Image changes reflect instantly

---

## 🎨 Visual Design

### Color Scheme
- [ ] Step indicator: Blue (#3b82f6) when active
- [ ] Completed steps: Green (#22c55e)
- [ ] Inactive steps: Gray (#6b7280)
- [ ] Auto-save saving: Blue background
- [ ] Auto-save saved: Green background
- [ ] Draft banner: Blue background
- [ ] Drag handle: Blue background

### Typography
- [ ] Headers: 18px, bold, white
- [ ] Section titles: 12px, uppercase, gray
- [ ] Labels: 13px, medium weight
- [ ] Input text: 14px, readable
- [ ] Preview text: Matches store font

### Spacing
- [ ] Consistent 16px padding
- [ ] 12px gaps between elements
- [ ] 20px section margins
- [ ] Comfortable tap targets (≥44px)

### Animations
- [ ] Smooth 300ms transitions
- [ ] No jarring movements
- [ ] Natural easing curves
- [ ] 60fps performance

---

## 📱 Responsive Behavior

### Desktop (>768px)
- [ ] Two-column grid layout
- [ ] All features visible
- [ ] Comfortable spacing
- [ ] Readable text sizes

### Tablet (≤768px)
- [ ] Single column layout
- [ ] Fields stack vertically
- [ ] Touch-friendly controls
- [ ] Adequate spacing

### Mobile (≤480px)
- [ ] Full-width inputs
- [ ] Large touch targets
- [ ] Readable fonts
- [ ] No horizontal scroll

---

## 🔄 State Management

### Form State
- [ ] Data persists between steps
- [ ] Validation runs on blur
- [ ] Required fields marked with *
- [ ] Error messages clear
- [ ] Form can be submitted from any step

### Draft State
- [ ] Draft saves every 3 seconds
- [ ] Draft loads on form open
- [ ] Draft clears after save
- [ ] Draft survives browser refresh

### Upload State
- [ ] Images stored temporarily
- [ ] Images processed on save
- [ ] Failed uploads don't block form
- [ ] Can retry failed uploads

---

## ⚠️ Error Handling

### Validation Errors
- [ ] Required field errors show on blur
- [ ] Red border on invalid fields
- [ ] Error message below field
- [ ] Cannot submit with errors
- [ ] Clear error messages

### Upload Errors
- [ ] File type errors clear
- [ ] Size limit errors helpful
- [ ] Can dismiss errors
- [ ] Can retry after error
- [ ] Errors don't crash form

### Network Errors
- [ ] Save failures show toast
- [ ] Can retry save
- [ ] Draft preserved on error
- [ ] Clear error message

---

## 🎯 User Workflows

### Scenario 1: New Product
1. [ ] Open form
2. [ ] See Step 1 (Basic Info)
3. [ ] Fill name, category, description
4. [ ] Click Next → Step 2
5. [ ] Enter price and stock
6. [ ] Click Next → Step 3
7. [ ] Upload primary image (see progress)
8. [ ] Add gallery images
9. [ ] Reorder gallery by dragging
10. [ ] Click Next → Step 4
11. [ ] Toggle "Mark as New"
12. [ ] Click "Preview Product"
13. [ ] Review preview card
14. [ ] Click "Save & Close"
15. [ ] See success message

### Scenario 2: Draft Restoration
1. [ ] Start filling form
2. [ ] Type product name
3. [ ] See "Saving draft..." indicator
4. [ ] Wait for "Draft saved"
5. [ ] Close form without saving
6. [ ] Reopen form
7. [ ] See draft notification banner
8. [ ] Click "Restore"
9. [ ] See previous data loaded
10. [ ] Continue editing

### Scenario 3: Image Upload
1. [ ] Navigate to Step 3
2. [ ] Click primary image area
3. [ ] Select image file
4. [ ] See progress bar (0-100%)
5. [ ] See "Processing image..."
6. [ ] See preview appear
7. [ ] Click "Crop" button
8. [ ] Adjust crop area
9. [ ] Click "Apply Crop"
10. [ ] See cropped preview

### Scenario 4: Gallery Reordering
1. [ ] Upload 3+ gallery images
2. [ ] Hover over first image
3. [ ] See drag handle appear
4. [ ] Click and hold drag handle
5. [ ] Drag to third position
6. [ ] See item opacity change
7. [ ] Drop on target
8. [ ] See smooth reorder
9. [ ] See auto-save trigger

---

## 🐛 Known Issues to Check

### Potential Problems
- [ ] Draft banner doesn't block form (VERIFIED)
- [ ] Upload progress shows correctly (VERIFIED)
- [ ] Drag-and-drop doesn't freeze (VERIFIED)
- [ ] Preview updates in real-time (VERIFIED)
- [ ] Auto-save doesn't spam (VERIFIED)
- [ ] Step data doesn't reset (VERIFIED)

### Edge Cases
- [ ] Empty form shows validation errors
- [ ] Upload very large file (>10MB)
- [ ] Upload invalid file type
- [ ] Drag gallery item quickly
- [ ] Switch steps rapidly
- [ ] Close form during upload
- [ ] Close form during auto-save

---

## ✅ Acceptance Criteria

### All Features Working
- [ ] Multi-step navigation functional
- [ ] Upload progress displays
- [ ] Drag-and-drop reordering works
- [ ] Draft banner is non-blocking
- [ ] Auto-save indicator visible
- [ ] Product preview accurate

### Performance Acceptable
- [ ] No lag or stuttering
- [ ] Animations smooth at 60fps
- [ ] Form responsive (<100ms)
- [ ] Auto-save fast (<50ms)
- [ ] Image preview quick (<500ms)

### UX Goals Met
- [ ] Reduced cognitive load
- [ ] Clear visual feedback
- [ ] Non-intrusive notifications
- [ ] Delightful interactions
- [ ] Professional polish

---

## 📝 Test Results

### Tester Information
- **Name:** _________________
- **Date:** _________________
- **Browser:** _________________
- **OS:** _________________

### Overall Status
- [ ] All tests passed
- [ ] Minor issues found
- [ ] Major issues found

### Issues Found
```
Issue #1:
Description: ___________________________________________
Severity: [ ] Low  [ ] Medium  [ ] High
Steps to reproduce: ____________________________________
___________________________________________________

Issue #2:
Description: ___________________________________________
Severity: [ ] Low  [ ] Medium  [ ] High
Steps to reproduce: ____________________________________
___________________________________________________
```

### Sign-Off
- [ ] Tested by: _________________
- [ ] Approved by: _________________
- [ ] Ready for production: [ ] Yes  [ ] No

---

**Testing Completed:** ___/___/______  
**Version:** 2.0 (UX Improvements)  
**Status:** [ ] PASS  [ ] FAIL  [ ] NEEDS REVIEW
