# Security Testing Guide

## 🧪 How to Test Dashboard Security

Follow these steps to verify that the security is working correctly:

---

## Test 1: Student Access to Student Dashboard ✅

### Steps:
1. **Signup/Login as Student:**
   - Go to http://localhost:8080/student/signup
   - Create a new student account OR
   - Login at http://localhost:8080/student/login

2. **Access Student Dashboard:**
   - Navigate to http://localhost:8080/dashboard
   - OR navigate to http://localhost:8080/student/dashboard

3. **Expected Result:**
   - ✅ Should see the Student Dashboard with 7 tabs
   - ✅ Can navigate through all tabs
   - ✅ No error messages

---

## Test 2: Student Blocked from Mentor Dashboard ❌

### Steps:
1. **While logged in as Student:**
   - Manually navigate to http://localhost:8080/mentor/dashboard
   - OR navigate to http://localhost:8080/expert/dashboard

2. **Expected Result:**
   - ❌ Should be redirected back to /dashboard
   - ✅ Should see toast: "This dashboard is for mentors only"
   - ✅ Should NOT see mentor dashboard content

---

## Test 3: Mentor Access to Mentor Dashboard ✅

### Steps:
1. **Logout from Student Account:**
   - Click logout in navbar

2. **Login as Mentor:**
   - Go to http://localhost:8080/expert/login
   - Login with mentor credentials

3. **Access Mentor Dashboard:**
   - Navigate to http://localhost:8080/mentor/dashboard
   - OR navigate to http://localhost:8080/expert/dashboard

4. **Expected Result:**
   - ✅ Should see the Mentor Dashboard
   - ✅ Can access mentor features
   - ✅ No error messages

---

## Test 4: Mentor Blocked from Student Dashboard ❌

### Steps:
1. **While logged in as Mentor:**
   - Manually navigate to http://localhost:8080/dashboard
   - OR navigate to http://localhost:8080/student/dashboard

2. **Expected Result:**
   - ❌ Should be redirected to /mentor-dashboard
   - ✅ Should see toast: "This dashboard is for students only" or "Mentors cannot access the student dashboard"
   - ✅ Should NOT see student dashboard content

---

## Test 5: Unauthenticated Access Blocked ❌

### Steps:
1. **Logout completely:**
   - Click logout in navbar
   - Verify you're logged out

2. **Try to access Student Dashboard:**
   - Navigate to http://localhost:8080/dashboard

3. **Expected Result:**
   - ❌ Should be redirected to /student/login
   - ✅ Should see toast: "Please login to access the dashboard"

4. **Try to access Mentor Dashboard:**
   - Navigate to http://localhost:8080/mentor/dashboard

5. **Expected Result:**
   - ❌ Should be redirected to /expert/login
   - ✅ Should see appropriate authentication message

---

## Test 6: Direct URL Access (Security Check)

### Steps:
1. **Open Browser DevTools:**
   - Press F12
   - Go to Console tab

2. **As Student, try to manipulate session:**
   ```javascript
   // This should still be blocked by database checks
   // Try accessing mentor dashboard
   window.location.href = '/mentor/dashboard';
   ```

3. **Expected Result:**
   - ✅ Should still be redirected back
   - ✅ Security checks should catch it

---

## Test 7: Role Metadata Bypass Attempt (Advanced)

### Steps:
1. **Open Browser DevTools → Application → Local Storage**
2. **Find Supabase session data**
3. **Try to modify user_metadata.role** (if accessible)

4. **Expected Result:**
   - ✅ Even if metadata is changed, database check should block access
   - ✅ System verifies against expert_profiles table

---

## 🎯 Quick Test Matrix

| User Type | `/dashboard` | `/student/dashboard` | `/mentor/dashboard` | `/expert/dashboard` |
|-----------|--------------|---------------------|---------------------|---------------------|
| **Student** | ✅ Allow | ✅ Allow | ❌ Block + Redirect | ❌ Block + Redirect |
| **Mentor** | ❌ Block + Redirect | ❌ Block + Redirect | ✅ Allow | ✅ Allow |
| **Not Logged In** | ❌ Block + Redirect | ❌ Block + Redirect | ❌ Block + Redirect | ❌ Block + Redirect |

---

## 🔍 What to Check in Browser Console

### When Security Blocks Access:

1. **Check for Redirects:**
   - Open DevTools → Network tab
   - Look for 302 redirects or client-side navigation

2. **Check for Error Messages:**
   - Open DevTools → Console tab
   - Should see console.error logs for blocked attempts

3. **Check Toast Notifications:**
   - Should see toast messages on screen
   - Messages should be clear and informative

---

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot access dashboard after signup"
**Solution:** 
- Verify email is confirmed (if email confirmation enabled)
- Check that user_metadata.role is set to 'student'
- Try logout and login again

### Issue 2: "Student can access mentor dashboard"
**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check database: verify user is NOT in expert_profiles table
- Restart dev server

### Issue 3: "Mentor can access student dashboard"
**Solution:**
- Verify user_metadata.role is 'mentor' or 'expert'
- Check database: verify user IS in expert_profiles table
- Clear browser cache and retry

### Issue 4: "Redirects not working"
**Solution:**
- Check browser console for errors
- Verify React Router is working
- Check if Supabase session is valid
- Restart dev server

---

## 📊 Expected Console Logs

### When Student Accesses Student Dashboard:
```
✅ Auth check passed
✅ User role: student
✅ Not in expert_profiles
✅ Access granted to Student Dashboard
```

### When Mentor Tries Student Dashboard:
```
❌ Auth check detected mentor role
❌ User found in expert_profiles table
❌ Redirecting to /mentor-dashboard
🔔 Toast: "Mentors cannot access the student dashboard"
```

### When Student Tries Mentor Dashboard:
```
❌ Auth check detected student role
❌ Redirecting to /dashboard
🔔 Toast: "This dashboard is for mentors only"
```

---

## ✅ Security Test Checklist

- [ ] Student can access `/dashboard`
- [ ] Student can access `/student/dashboard`
- [ ] Student CANNOT access `/mentor/dashboard`
- [ ] Student CANNOT access `/expert/dashboard`
- [ ] Mentor can access `/mentor/dashboard`
- [ ] Mentor can access `/expert/dashboard`
- [ ] Mentor CANNOT access `/dashboard`
- [ ] Mentor CANNOT access `/student/dashboard`
- [ ] Unauthenticated users CANNOT access any dashboard
- [ ] Appropriate toast messages appear for blocked access
- [ ] Redirects work correctly
- [ ] No console errors (except expected auth logs)
- [ ] Database checks are performed
- [ ] Multiple security layers verified

---

## 🎓 Testing Best Practices

1. **Test in Incognito Mode:**
   - Avoids cached sessions
   - Clean slate for testing

2. **Test with Multiple Accounts:**
   - Create at least one student account
   - Create at least one mentor account
   - Test switching between accounts

3. **Test Edge Cases:**
   - User with no role metadata
   - User with invalid role
   - User with both student and mentor profiles (shouldn't happen)

4. **Check All Routes:**
   - Use direct URL navigation
   - Use navbar navigation
   - Use browser back/forward buttons

5. **Monitor Network Tab:**
   - Watch for API calls
   - Check for proper redirects
   - Verify session validity

---

## 🏆 Success Criteria

**✅ All tests passing means:**
- Security is properly implemented
- Role-based access control works
- Users cannot bypass restrictions
- System is production-ready

**If any test fails:**
- Review the security implementation
- Check database setup
- Verify user metadata is set correctly
- Clear cache and retry

---

## 🚀 Start Testing!

1. Open http://localhost:8080
2. Follow the test scenarios above
3. Check off each item in the checklist
4. Report any issues

**Remember:** Security is critical. Test thoroughly before deploying to production!
