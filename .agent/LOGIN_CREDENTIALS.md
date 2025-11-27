# Login Credentials Reference

## Quick Demo Login Credentials

All demo accounts use the password: **123456**

### School Level Users

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Admin** | admin@system.zm | 123456 | System-wide access |
| **Head Teacher** | head@school.zm | 123456 | Full school management |
| **Deputy Head** | deputy@school.zm | 123456 | School management (limited) |
| **Senior Teacher** | senior@school.zm | 123456 | Student & class management |
| **Teacher** | teacher@school.zm | 123456 | Class teaching |
| **Student** | student@school.zm | 123456 | Student portal |

### District/Provincial Level

| Role | Email | Password |
|------|-------|----------|
| **District Officer** | district@education.zm | 123456 |

## Troubleshooting Login Issues

### If login fails:

1. **Clear Browser Cache & Local Storage**
   - Open Developer Tools (F12)
   - Go to Application/Storage tab
   - Clear Local Storage
   - Refresh the page

2. **Verify Credentials**
   - Email must be exact (case-sensitive)
   - Password is: `123456`

3. **Use Quick Demo Buttons**
   - Click the colored demo buttons on login page
   - These auto-fill the correct credentials

### Deputy Head Login Steps:

1. Click the **"Deputy"** quick demo button (purple)
2. OR manually enter:
   - Email: `deputy@school.zm`
   - Password: `123456`
3. Click "Sign In"

### Common Issues:

- **"Invalid credentials"** - Clear local storage and try again
- **Blank screen** - Check browser console for errors
- **Can't access certain pages** - Role-based permissions are working correctly

## Permissions by Role

### Deputy Head Permissions:
- ✅ Manage Staff
- ✅ Manage Students
- ✅ Manage Classes
- ✅ Manage Assessments
- ✅ View Reports
- ❌ Manage Settings (Head Teacher only)
- ❌ Manage Finance (Head Teacher only)

---

**Note**: This is a demo system with mock authentication. In production, use proper authentication with hashed passwords and secure sessions.
