# 🎨 Beautiful Toast Notification System

## Overview

The application now features a beautifully redesigned toast notification system with:

- **Top-center positioning** for better visibility
- **Smooth collapse animations** to the top
- **Gradient backgrounds** matching success/error/warning/info states
- **Consistent design** with the Matepeak dashboard
- **Enhanced icons** and visual feedback

## 🎯 Features

### Visual Design

- **Clean, modern cards** with rounded corners and subtle shadows
- **Gradient backgrounds** for each toast type:
  - ✅ Success: Green gradient with checkmark
  - ❌ Error: Red gradient with X icon
  - ⚠️ Warning: Yellow gradient with warning triangle
  - ℹ️ Info: Blue gradient with info icon
  - ⏳ Loading: Gray gradient with spinner

### Animations

- **Slide in from top** with scale effect
- **Collapse to top** when dismissed
- **Hover lift effect** for interactive feel
- **Smooth transitions** (350ms in, 300ms out)
- **Rotating close button** on hover

### User Experience

- **4-second duration** (default) - just right for reading
- **Dismissible** with close button
- **Stackable** - up to 4 visible at once
- **Auto-collapse** - older toasts collapse smoothly
- **Keyboard accessible** with proper focus states

## 📝 Usage

### Simple Toast Messages

```typescript
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
} from "@/utils/toast-helpers";

// Success - Green gradient
showSuccessToast("Profile updated successfully!");

// Error - Red gradient
showErrorToast("Failed to save changes");

// Warning - Yellow gradient
showWarningToast("Your session will expire soon");

// Info - Blue gradient
showInfoToast("New features available!");
```

### Toast with Description

```typescript
showSuccessToast("Upload complete", {
  description: "Your certificate has been uploaded and is under review",
});

showErrorToast("Connection failed", {
  description: "Please check your internet connection and try again",
});
```

### Toast with Action Button

```typescript
showInfoToast("New message received", {
  description: "John Smith sent you a message",
  action: {
    label: "View",
    onClick: () => navigate("/messages"),
  },
});

showWarningToast("Unsaved changes", {
  description: "You have unsaved changes in your profile",
  action: {
    label: "Save",
    onClick: () => saveProfile(),
  },
});
```

### Loading Toast

```typescript
import { showLoadingToast, dismissToast } from "@/utils/toast-helpers";

// Show loading
const toastId = showLoadingToast("Uploading file...");

// Later dismiss it
dismissToast(toastId);
```

### Promise Toast (Auto-updates)

```typescript
import { showPromiseToast } from "@/utils/toast-helpers";

// Automatically shows loading, then success or error
showPromiseToast(saveProfileData(), {
  loading: "Saving profile...",
  success: "Profile saved successfully!",
  error: "Failed to save profile",
});

// With dynamic messages
showPromiseToast(uploadFile(file), {
  loading: "Uploading...",
  success: (data) => `Uploaded ${data.filename}`,
  error: (error) => `Upload failed: ${error.message}`,
});
```

### Custom Duration

```typescript
// Show for longer (useful for important messages)
showSuccessToast("Welcome to Matepeak!", {
  duration: 8000, // 8 seconds
});

// Show briefly (for quick confirmations)
showSuccessToast("Copied!", {
  duration: 2000, // 2 seconds
});
```

### Dismiss Toasts

```typescript
import { dismissAllToasts } from "@/utils/toast-helpers";

// Dismiss all toasts (useful on navigation)
dismissAllToasts();
```

## 🎨 Design Specifications

### Colors

- **Success**: Green gradient (#10b981 → #059669)
- **Error**: Red gradient (#ef4444 → #dc2626)
- **Warning**: Yellow gradient (#f59e0b → #d97706)
- **Info**: Blue gradient (#3b82f6 → #2563eb)
- **Loading**: Gray gradient (#6b7280 → #4b5563)

### Typography

- **Font**: Poppins (consistent with dashboard)
- **Title**: 16px, Semibold
- **Description**: 14px, Regular
- **Button**: 14px, Medium

### Spacing

- **Padding**: 24px horizontal, 16px vertical
- **Gap**: 12px between toasts
- **Min Height**: 72px for consistency

### Animations

- **Slide In**: 350ms cubic-bezier(0.21, 1.02, 0.73, 1)
- **Slide Out**: 300ms cubic-bezier(0.06, 0.71, 0.55, 1)
- **Hover**: 200ms ease-out transform

## 🔧 Technical Details

### Files Modified

1. **`src/components/ui/sonner.tsx`** - Main toast component configuration
2. **`src/index.css`** - Custom animations and styling
3. **`src/utils/toast-helpers.ts`** - Helper functions (NEW)
4. **Components using toasts** - Updated to use new helpers

### Key Configuration

```typescript
position="top-center"      // Centered at top
expand={false}             // Don't expand on hover
gap={12}                   // 12px between toasts
visibleToasts={4}          // Show up to 4 at once
closeButton                // Show close button
richColors                 // Enable color variants
duration={4000}            // 4 second default
```

### CSS Classes Applied

```css
/* Base toast styling */
.toast {
  background: white;
  border: 1px solid gray-200;
  border-radius: 12px;
  box-shadow: 2xl;
  min-height: 72px;
  padding: 16px 24px;
}

/* Success variant */
.toast[data-type="success"] {
  background: linear-gradient(to-right, green-50, emerald-50);
  border-color: green-200;
  color: green-900;
}
```

## 🎯 Best Practices

### Do's ✅

- Use success toasts for confirmations
- Use error toasts with descriptions for failures
- Use warning toasts for non-blocking alerts
- Use info toasts for helpful information
- Keep messages concise (under 50 characters)
- Add descriptions for context (under 100 characters)
- Use action buttons for next steps
- Test on mobile devices

### Don'ts ❌

- Don't show too many toasts at once
- Don't use long messages in titles
- Don't use toasts for critical errors (use modals)
- Don't set very short durations (< 2 seconds)
- Don't use toasts for permanent information
- Don't block user interaction with toasts

## 📱 Responsive Design

The toast system is fully responsive:

- **Desktop**: 400px max width, centered top
- **Mobile**: Full width with 20px margin
- **Touch**: Swipe to dismiss (Sonner built-in)

## ♿ Accessibility

- **ARIA labels** for screen readers
- **Keyboard navigation** (Tab, Escape to close)
- **Focus management** (auto-focus action buttons)
- **High contrast** colors for readability
- **Sufficient duration** for reading

## 🚀 Migration Guide

### Old Code

```typescript
import { toast } from "@/components/ui/sonner";
toast.success("Saved!");
```

### New Code (Recommended)

```typescript
import { showSuccessToast } from "@/utils/toast-helpers";
showSuccessToast("Profile saved successfully!", {
  description: "Your changes are now live",
});
```

## 🎨 Examples in the App

1. **Profile Updates** - Success toast with description
2. **Upload Certificates** - Loading → Success/Error
3. **Share Profile** - Success with copy confirmation
4. **Form Validation** - Error with helpful description
5. **Session Expiry** - Warning with action to extend

## 📚 Additional Resources

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Version**: 1.0  
**Last Updated**: November 1, 2025  
**Maintained by**: Matepeak Development Team
