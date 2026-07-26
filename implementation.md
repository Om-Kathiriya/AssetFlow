# Asset Management System - Development Roadmap

## Backend Development Plan (Build This First)

---

## Phase 0 — Project Setup & Core Authentication

### Objectives
Build the project foundation and authentication system.

### Tasks

- Database setup
  - Create initial schema:
    - User
    - Department (Skeleton)
    - Category (Skeleton)

- Authentication
  - Signup API
    - Default role: `EMPLOYEE`
    - First registered user becomes `ADMIN` (Bootstrap Logic)
  - Login API
  - JWT Token Generation
  - Password Hashing (bcrypt)
  - Forgot Password Flow

- Authorization
  - `requireAuth` middleware
  - `requireRole(...)` middleware

### Frontend Mapping

**Screen 1**
- Login
- Signup

---

# Phase 1 — Organization Setup (Master Data)

### Objectives

Create all organization master data required by later modules.

### Tasks

### Department Module

- Create Department
- Edit Department
- Deactivate Department
- Parent Department Hierarchy
- Assign Department Head

### Asset Category Module

- Create Category
- Edit Category
- Delete/Deactivate Category
- Support Category-Specific Fields
  - Warranty Period
  - Custom Fields (Future)

### Employee Directory

- List Employees
- Promote Employee Role (Admin Only)
- Log Role Changes

### Frontend Mapping

**Screen 3**
- Organization Setup
  - Departments Tab
  - Categories Tab
  - Employees Tab

### Why This Phase First?

Assets, allocations, bookings, audits, and maintenance all reference:

- Departments
- Categories
- Employees

These entities must exist before other modules.

---

# Phase 2 — Asset Registration & Lifecycle

### Objectives

Implement complete asset management.

### Tasks

### Asset Model

Include lifecycle states:

- Available
- Allocated
- Reserved
- Under Maintenance
- Lost
- Retired
- Disposed

### Asset Registration

- Register Asset
- Auto-generate Asset Tag

Example:

```
AF-0001
AF-0002
AF-0003
```

### Asset Search & Filters

Search by:

- Asset Tag
- Serial Number
- QR Code
- Category
- Status
- Department
- Location

### Lifecycle Rules

Implement legal state transitions.

Example:

```
Available
    ↓
Allocated
    ↓
Returned
    ↓
Available
```

Block invalid transitions.

Example:

```
Lost
   ❌
Allocated
```

### Asset History

Maintain history log for every asset.

Initially empty.

Later populated by:

- Allocations
- Transfers
- Maintenance
- Audits

### Frontend Mapping

**Screen 4**
- Asset Directory

---

# Phase 3 — Allocation & Transfer

### Objectives

Implement core allocation logic.

### Tasks

### Asset Allocation

Before allocation:

Check if asset already has an active holder.

If yes:

- Reject allocation
- Suggest Transfer Request

### Transfer Workflow

Status Flow

```
Requested
    ↓
Approved
    ↓
Re-Allocated
```

### Return Workflow

- Mark Returned
- Save Condition Notes
- Asset Status → Available

### Overdue Detection

If

```
Today > Expected Return Date
```

Mark allocation as:

```
Overdue
```

Used later for:

- Dashboard
- Notifications
- Reports

### Frontend Mapping

**Screen 5**
- Allocation & Transfer

---

# Phase 4 — Resource Booking

### Objectives

Implement booking engine.

### Tasks

### Booking Model

Bookable Assets

Booking contains:

- Resource
- User
- Start Time
- End Time
- Status

### Booking Conflict Validation

Prevent overlapping bookings.

Example:

```
Booking A

9:00
      10:00

Booking B

     9:30
            10:30

❌ Reject
```

Test edge cases:

- Exact boundaries
- Adjacent slots
- Partial overlap
- Complete overlap

### Booking Lifecycle

```
Upcoming
      ↓
Ongoing
      ↓
Completed
```

or

```
Upcoming
      ↓
Cancelled
```

### Frontend Mapping

**Screen 6**
- Resource Booking

---

# Phase 5 — Maintenance Workflow

### Objectives

Implement maintenance process.

### Tasks

### Maintenance Request

Workflow

```
Pending
    ↓
Approved / Rejected
    ↓
Technician Assigned
    ↓
In Progress
    ↓
Resolved
```

### Approval Logic

Only:

Asset Manager

Approval automatically changes asset status:

```
Under Maintenance
```

### Resolve Logic

When resolved:

Automatically update asset status:

```
Available
```

### Frontend Mapping

**Screen 7**
- Maintenance Kanban Board

---

# Phase 6 — Audit Cycles

### Objectives

Implement physical asset audits.

### Tasks

### Audit Cycle

Contains:

- Scope
  - Department
  - Location
- Date Range
- Assigned Auditors

Use:

Join Table

NOT User Roles.

### Asset Verification

Possible results:

- Verified
- Missing
- Damaged

### Discrepancy Report

Automatically generate for:

- Missing Assets
- Damaged Assets

### Close Audit

Closing:

- Locks Audit
- Updates Asset Status

Example:

```
Confirmed Missing

↓

Lost
```

### Frontend Mapping

**Screen 8**
- Audit Cycle

---

# Phase 7 — Dashboard, Notifications & Reports

### Objectives

Connect all modules together.

### Tasks

## Dashboard KPIs

Aggregation Queries

Examples:

- Available Assets
- Allocated Assets
- Under Maintenance
- Overdue Returns
- Active Bookings

### Notifications

Trigger notifications from:

- Allocation
- Transfer
- Booking
- Maintenance
- Audit

Examples:

- Allocation Approved
- Maintenance Completed
- Audit Assigned
- Asset Returned

### Activity Log

Log every write action.

Store:

- Who
- What
- When

### Reports & Analytics

Generate reports for:

- Asset Utilization
- Maintenance Frequency
- Idle Assets
- Booking Heatmap

Support:

- Export CSV
- Export PDF

### Frontend Mapping

Screens:

- Screen 2
- Screen 9
- Screen 10

---

# Frontend Development Plan

Frontend should follow backend development.

Do **not** build UI before APIs exist.

---

## Frontend Phase 0

### Screen 1

Authentication

Build:

- Login Form
- Signup Form
- Auth Context
- JWT Storage
- Protected Routes

---

## Frontend Phase 1

### Screen 3

Organization Setup

Three Tabs:

- Departments
- Categories
- Employees

Components:

- Tables
- Search
- Filters
- Create/Edit Modals

Admin Only:

- Promote Role UI

---

## Frontend Phase 2

### Screen 4

Asset Directory

Build:

- Asset Table
- Search
- Filters
- Register Asset Modal
- Asset Detail Page
- History Tab

---

## Frontend Phase 3

### Screen 5

Allocation Module

Build:

- Allocate Asset Form
- Conflict Banner (Red Warning)
- Transfer Request Form
- Allocation History

---

## Frontend Phase 4

### Screen 6

Booking Module

Build:

- Calendar View
- Time Slot View
- Booking Form
- Booking Conflict UI

Conflict should match wireframe:

```
🟥 Red Dotted Conflict Box
```

---

## Frontend Phase 5

### Screen 7

Maintenance

Build:

Kanban Board

Columns:

- Pending
- Approved
- Assigned
- In Progress
- Resolved

Support:

- Button-based transitions
- Drag & Drop (Optional)

---

## Frontend Phase 6

### Screen 8

Audit Module

Build:

- Audit Creation Form
- Checklist Table

Verification Tags:

- Verified
- Missing
- Damaged

Action:

- Close Audit

---

## Frontend Phase 7

### Screens

- Screen 2
- Screen 9
- Screen 10

Build:

### Dashboard

- KPI Cards
- Charts
- Recent Activity Feed

### Reports

Charts using:

- Recharts
- Chart.js

### Notifications

Features:

- Notification Feed
- Filters
- Read/Unread

---

# Role-Based Access

Role-based rendering should be implemented incrementally throughout development.

Examples:

### Admin

Can Access:

- Organization Setup
- Employee Promotion
- Reports
- Dashboard
- Audit Management

### Asset Manager

Can Access:

- Maintenance Approval
- Asset Allocation
- Booking Management

### Employee

Can Access:

- View Assets
- Request Allocation
- Book Resources
- View Notifications

Navigation items and action buttons should be shown or hidden based on the logged-in user's role during each development phase—not postponed until the end.