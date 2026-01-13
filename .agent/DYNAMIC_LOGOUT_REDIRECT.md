# Dynamic Logout Redirect Implementation

## Overview
Implemented a dynamic logout flow that redirects users to the appropriate login page based on their school context. When users log out, they are now taken to their school's specific login page (with proper slug) so they can easily log back in.

## Changes Made

### 1. Enhanced `AuthService.logout()` Method
**File:** `src/lib/auth.ts`

The logout method now:
- Captures the current user's information before clearing the session
- Determines the appropriate redirect URL based on user context
- Redirects school-based users (teachers, students, etc.) to their school's login page with `?schoolId=` parameter
- Redirects super admins and other users to the generic login page

**Logic:**
```typescript
static logout(): void {
  // Get the current user before clearing session to extract school slug
  const user = this.getCurrentUser();
  
  // Clear the session
  localStorage.removeItem(this.STORAGE_KEY);
  window.dispatchEvent(new Event('authChange'));
  
  // Redirect to appropriate login page based on user's school
  if (user?.school?.slug) {
    // School-based users - redirect to their school's login
    window.location.href = `/login?schoolId=${user.school.id}`;
  } else if (user?.role === 'super_admin') {
    // Super admin - redirect to generic login
    window.location.href = '/login';
  } else {
    // Other users (district, provincial, national) - redirect to generic login
    window.location.href = '/login';
  }
}
```

### 2. Updated Logout Handlers
Removed redundant `navigate('/')` calls from logout handlers in:
- `src/components/SuperAdminSidebar.tsx`
- `src/components/RegularSidebar.tsx`
- `src/pages/StudentPortal.tsx`

Since `AuthService.logout()` now handles redirection internally, these navigate calls were no longer needed.

## How It Works

### For School Users (Teachers, Students, Staff)
1. User clicks logout button
2. `AuthService.logout()` captures their school information
3. Session is cleared
4. User is redirected to `/login?schoolId=<their-school-id>`
5. LoginForm component detects the `schoolId` parameter and loads school-specific branding
6. User can log back in to their school portal with familiar branding

### For Super Admin
1. User clicks logout
2. Session is cleared
3. User is redirected to `/login` (generic login page)

### For District/Provincial/National Users
1. User clicks logout
2. Session is cleared
3. User is redirected to `/login` (generic login page)

## Benefits

1. **Better UX**: Users see their school's branding when they return to log in
2. **Reduced Confusion**: Users land on the correct login page for their institution
3. **Consistent Flow**: The login page they see matches their school context
4. **Dynamic**: Works for any school in the system automatically
5. **Secure**: Users can only access their own school's portal (security checks already in place in LoginForm)

## Testing

To test this feature:
1. Log in as a school user (teacher, student, etc.)
2. Click the logout button
3. Verify you're redirected to `/login?schoolId=<school-id>`
4. Verify the login page shows your school's name and branding
5. Log back in to confirm the flow works end-to-end

## Related Files
- `src/lib/auth.ts` - Core logout logic
- `src/components/LoginForm.tsx` - Handles schoolId parameter and displays school branding
- `src/components/SuperAdminSidebar.tsx` - Super admin logout button
- `src/components/RegularSidebar.tsx` - Regular user logout button
- `src/pages/StudentPortal.tsx` - Student logout button
