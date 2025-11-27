# Super Admin (SaaS Platform Owner) - Feature Implementation Plan

## Overview
The Super Admin is the **company owner** who manages multiple schools as **clients** in a SaaS model. They are NOT part of any school and their role is to onboard, manage, and support client schools.

---

## ✅ IMPLEMENTED SO FAR

### 1. Authentication & Access
- ✅ Super Admin role (`super_admin`) added to auth system
- ✅ Demo credentials: `admin@system.zm` / `123456`
- ✅ Bypasses all permission checks (full system access)
- ✅ 'System' user level for super admins
- ✅ Login page with Super Admin demo button
- ✅ Dashboard with system-wide statistics

---

## 🚀 FEATURES TO IMPLEMENT

### 1. School Onboarding & Management (PRIORITY 1)
**Page: `/admin/schools`**

#### Features:
- [ ] **School List View**
  - Table showing all client schools
  - Columns: Name, Status (Active/Inactive), Subscription Plan, Expiry Date, Students, Teachers
  - Quick actions: Edit, Activate/Deactivate, View Details
  - Search and filter by status, plan, location

- [ ] **Add New School**
  - School details form:
    - School name, address, province, district, ward
    - Center number
    - School type (GRZ, Grant Aided, Private)
    - Contact email, phone
    - Logo upload
    - Theme colors (primary, secondary)
  - Subscription settings:
    - Plan selection (Basic, Standard, Premium)
    - Billing cycle (Monthly/Annual)
    - Start date, expiry date
    - Max students/teachers allowed
  - Auto-generate headteacher login credentials
  - Send welcome email with login details

- [ ] **Edit School**
  - Update all school information
  - Change subscription plan
  - Extend/modify expiry date
  - Upload new branding

- [ ] **School Details View**
  - Complete school profile
  - Subscription history
  - Usage statistics (students, teachers, storage)
  - Activity log
  - Quick actions (reset passwords, send message)

- [ ] **Activate/Deactivate School**
  - Toggle school status
  - Deactivated schools cannot login
  - Reactivate when payment received

---

### 2. Subscription & Billing Management (PRIORITY 2)
**Page: `/admin/subscriptions`**

#### Features:
- [ ] **Subscription Plans Management**
  - Create/Edit pricing plans
  - Set features per plan:
    - Max students
    - Max teachers
    - Storage limit
    - Modules available (Reports, Planning, etc.)
  - Monthly/Annual pricing

- [ ] **Billing Dashboard**
  - Schools with active subscriptions
  - Schools with expiring subscriptions (next 30 days)
  - Overdue payments
  - Revenue analytics (monthly, annual)

- [ ] **Payment Tracking**
  - Mark payment as received
  - Payment history per school
  - Generate invoices
  - Send payment reminders

- [ ] **Renewal Management**
  - Auto-send renewal reminders (30, 15, 7 days before expiry)
  - Bulk renewal actions
  - Grace period settings

---

### 3. User Management (PRIORITY 2)
**Page: `/admin/users`**

#### Features:
- [ ] **Initial School User Setup**
  - Create headteacher account during onboarding
  - Create senior teacher accounts
  - Create admin clerk accounts
  - Assign default permissions

- [ ] **User Management Tools**
  - View all users across all schools
  - Filter by school, role, status
  - Reset passwords for any user
  - Deactivate/reactivate users
  - Audit trail of user actions

- [ ] **Role Templates**
  - Create permission templates
  - Assign to schools during onboarding
  - Update templates (affects all schools using it)

---

### 4. System-Wide Settings (PRIORITY 3)
**Page: `/admin/settings`**

#### Features:
- [ ] **Global Configuration**
  - Company branding (logo, colors)
  - Email settings (SMTP configuration)
  - SMS gateway settings
  - API keys management
  - Backup settings

- [ ] **Module Management**
  - Enable/disable system modules
  - Feature flags
  - Maintenance mode

- [ ] **Security Settings**
  - Password policies
  - Session timeout
  - Two-factor authentication
  - IP whitelist/blacklist

---

### 5. Analytics & Reporting (PRIORITY 1)
**Page: `/admin/analytics`**

#### Features:
- [ ] **Company Dashboard**
  - Total schools (active/inactive)
  - Total students across all schools
  - Total teachers across all schools
  - Revenue metrics
  - Growth charts (monthly/yearly)

- [ ] **School Performance**
  - High-activity schools
  - Low-activity schools
  - Schools by subscription plan
  - Geographic distribution

- [ ] **Usage Statistics**
  - Login frequency
  - Feature usage
  - Storage usage
  - API calls (if applicable)

- [ ] **Financial Reports**
  - Revenue by month
  - Revenue by plan
  - Churn rate
  - Lifetime value

---

### 6. Communication Tools (PRIORITY 2)
**Page: `/admin/communications`**

#### Features:
- [ ] **Announcements**
  - Send to specific school
  - Send to all schools
  - Schedule announcements
  - Announcement history

- [ ] **Email Templates**
  - Welcome email
  - Renewal reminder
  - Payment received
  - Account suspended
  - Custom templates

- [ ] **Support Tickets**
  - View all support requests
  - Assign to team members
  - Status tracking (Open, In Progress, Resolved)
  - Response templates

- [ ] **Notifications**
  - System-wide notifications
  - School-specific notifications
  - Push notifications (if implemented)

---

### 7. Data Management (PRIORITY 3)
**Page: `/admin/data`**

#### Features:
- [ ] **Bulk Import**
  - Import students for a school
  - Import teachers for a school
  - CSV/Excel templates
  - Validation and error handling

- [ ] **Bulk Export**
  - Export school data
  - Export usage reports
  - Export financial data
  - Scheduled exports

- [ ] **Backup & Restore**
  - Manual backup trigger
  - Scheduled backups
  - Restore from backup
  - Backup history

---

## 📋 SIDEBAR MENU STRUCTURE

```
Super Admin Sidebar:
├── 🏠 Dashboard (Overview)
├── 🏫 Schools
│   ├── All Schools
│   ├── Add New School
│   └── Subscription Plans
├── 👥 Users
│   ├── All Users
│   └── Role Templates
├── 💰 Billing
│   ├── Subscriptions
│   ├── Payments
│   └── Invoices
├── 📊 Analytics
│   ├── Overview
│   ├── School Performance
│   └── Financial Reports
├── 📢 Communications
│   ├── Announcements
│   ├── Support Tickets
│   └── Email Templates
├── 💾 Data Management
│   ├── Import/Export
│   └── Backups
├── ⚙️ System Settings
│   ├── General
│   ├── Security
│   └── Modules
└── 🚪 Logout
```

---

## 🎨 UI/UX GUIDELINES

### Design Principles:
1. **Clean & Professional** - Corporate SaaS aesthetic
2. **Data-Dense** - Show key metrics prominently
3. **Quick Actions** - Common tasks easily accessible
4. **Responsive** - Works on desktop, tablet, mobile
5. **Modern** - Use gradients, shadows, animations

### Color Coding:
- **Active Schools**: Green
- **Inactive Schools**: Gray
- **Expiring Soon**: Orange/Warning
- **Overdue**: Red/Destructive
- **New**: Blue/Primary

---

## 🔐 SECURITY CONSIDERATIONS

1. **Audit Logging**: Log all super admin actions
2. **Two-Factor Auth**: Require for super admin login
3. **IP Restrictions**: Optional IP whitelist
4. **Session Management**: Auto-logout after inactivity
5. **Data Encryption**: Encrypt sensitive data
6. **Backup Security**: Encrypted backups

---

## 📝 NEXT STEPS

### Phase 1 (Week 1):
1. Create Schools Management page
2. Add New School form
3. School list with basic CRUD
4. Super Admin sidebar menu

### Phase 2 (Week 2):
1. Subscription management
2. Billing dashboard
3. Analytics dashboard
4. User management

### Phase 3 (Week 3):
1. Communication tools
2. Data import/export
3. System settings
4. Polish & testing

---

## 💡 NOTES

- Super Admin should see ALL data across ALL schools
- Each school's data remains isolated from other schools
- Super Admin cannot directly manage students/teachers (schools do that)
- Focus on onboarding, billing, and support workflows
- Make it easy to add new schools and track their success

---

**Status**: Ready for implementation
**Last Updated**: 2025-11-22
