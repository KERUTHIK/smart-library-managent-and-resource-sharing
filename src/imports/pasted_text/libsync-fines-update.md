Update the EXISTING LibSync smart centralized college library design.

IMPORTANT:
Do NOT redesign the entire application.
Do NOT change the existing visual identity, sidebar structure, typography, colors, spacing, cards, buttons, or overall design language.

Only redesign and improve the "Fines & Payments" functionality and the related role-based screens.

The system has 3 roles:
1. ADMIN
2. DEPARTMENT LIBRARIAN
3. STUDENT / STAFF

Create a strict hierarchical fine-management system where each role has different permissions.

==================================================
1. ADMIN — GLOBAL FINE & PAYMENT MANAGEMENT
==================================================

Admin has institution-wide access.

Update the Admin sidebar:
- Keep "Fines & Payments"
- Make it clearly represent global/institution-wide finance management.

Admin Fines & Payments page should contain:

TOP KPI CARDS:
- Total Fines Generated
- Total Fine Collected
- Pending Fines
- Overdue Fines
- Waived / Cancelled Fines
- Number of Users With Pending Fines

Each KPI should show:
- Main amount/count
- Small comparison text such as "This month", "vs last month"
- Small relevant icon
- Clean visual hierarchy consistent with the existing dashboard.

Example:
Total Fine Generated
₹1,24,850
+12% this month

Fine Collected
₹98,420
79% collection rate

Pending Fine
₹18,430
126 users

Overdue Fine
₹8,000
42 users

==================================================
ADMIN FINE ANALYTICS
==================================================

Below the KPIs add:

1. Fine Collection Trend
A line/area chart showing:
- Fine generated
- Fine collected
- Pending fine

Filters:
- 7 Days
- 30 Days
- 3 Months
- 1 Year

2. Fine by Department
A horizontal bar chart showing fine amount by department.

Example:
Computer Science
Mechanical
ECE
Civil
Mathematics
Physics

3. Payment Method Distribution
Show:
- UPI
- Card
- Cash
- Other

4. Fine Status Distribution
Show:
- Pending
- Paid
- Overdue
- Waived/Cancelled

==================================================
ADMIN FINE TABLE
==================================================

Create a professional table titled:

"All Fine Transactions"

Columns:
- Fine ID
- Student / Staff
- User ID
- Department
- Book
- Due Date
- Days Overdue
- Fine Amount
- Status
- Payment Date
- Action

Status badges:
- Pending
- Overdue
- Paid
- Waived
- Cancelled

Admin actions:
- View Details
- View User
- View Payment
- Waive Fine
- Cancel Fine

IMPORTANT:
Admin should NOT have a "Pay Fine" button because admin manages the fine system rather than paying a user's fine.

Add filters:
- Department
- Fine Status
- Date Range
- Amount Range
- User Type
- Payment Method

Add search:
"Search student, staff, fine ID, book..."

==================================================
ADMIN FINE DETAIL DRAWER / MODAL
==================================================

When Admin clicks "View Details", open a right-side detail drawer.

Show:

Fine Information
- Fine ID
- Fine status
- Fine amount
- Created date

User Information
- Student/Staff name
- User ID
- Department
- Email

Book Information
- Book title
- Book ID
- Borrow date
- Due date
- Return date

Fine Calculation
- Number of overdue days
- Fine per day
- Total calculated fine
- Waiver/adjustment if applicable
- Final amount

Payment Information
- Payment status
- Payment method
- Transaction ID
- Payment date

Admin actions:
- Waive Fine
- Cancel Fine
- View Transaction

Use confirmation dialogs for Waive and Cancel actions.

==================================================
2. LIBRARIAN — DEPARTMENT LEVEL FINE MANAGEMENT
==================================================

The librarian should ONLY see fines belonging to their own department/library.

Keep the existing librarian visual style.

Update the librarian sidebar:
"Fines & Payments"

Create a department-specific Fine Management page.

TOP KPI CARDS:
- Pending Fines
- Overdue Fines
- Collected This Month
- Total Outstanding
- Fines Awaiting Action

Example:

Pending Fines
₹4,250
18 users

Overdue Fines
₹1,850
7 users

Collected This Month
₹8,420
+15%

Outstanding
₹5,100

==================================================
LIBRARIAN FINE TABLE
==================================================

Title:
"Department Fine Management"

Only display users/books belonging to the librarian's department.

Columns:
- Fine ID
- Student / Staff
- Book
- Due Date
- Days Overdue
- Fine Amount
- Status
- Action

Statuses:
- Pending
- Overdue
- Paid
- Cancelled
- Waived

Librarian actions should include:

For Pending/Overdue:
- View
- Mark as Paid
- Cancel
- Waive

For Paid:
- View
- View Payment

IMPORTANT:
Do not allow librarians to manage fines from other departments.

If a book belongs to another department, clearly show:
"Source Library: Mechanical Department Library"

But the librarian should only manage the fine according to the system's assigned responsibility.

==================================================
LIBRARIAN FINE DETAIL
==================================================

Clicking a fine opens a detail drawer.

Show:

Student details
Book details
Borrow/return information
Due date
Overdue days
Fine calculation
Current fine
Payment status
Payment history

Actions:

[Mark as Paid]
[Waive Fine]
[Cancel Fine]

When clicking "Cancel Fine" or "Waive Fine":
Open confirmation modal requiring:
- Reason
- Optional note
- Confirm / Cancel

After action:
Show success notification.

==================================================
3. STUDENT / STAFF — PERSONAL PAYMENT ONLY
==================================================

IMPORTANT:
Students and staff must NOT have administrative fine-management functionality.

They should only see their own fines.

Keep the existing student dashboard design.

Update the student/staff sidebar:
"Fines & Payments"

Create a simple personal payment page.

TOP CARDS:

Outstanding Fine
₹90
2 unpaid fines

Paid This Year
₹480

Overdue Books
2

==================================================
MY FINES
==================================================

Create a clean list/table:

Columns:
- Book
- Due Date
- Days Overdue
- Fine Amount
- Status
- Action

Example:

Operating Systems
Due: 01 Sep 2026
7 days overdue
₹35
Unpaid
[Pay ₹35]

Discrete status colors:
Unpaid / Pending
Overdue
Paid

==================================================
STUDENT PAYMENT FLOW
==================================================

Student clicks:

[Pay ₹35]

Open a payment modal/page.

Show:

"Pay Library Fine"

Book:
Operating Systems

Fine:
₹35

Overdue:
7 days

Total Payable:
₹35

Payment method:
- UPI
- Card
- Other supported method

Primary button:
[Pay ₹35]

After successful payment:

Show a professional payment success state:

✓ Payment Successful

₹35 Paid

Fine ID: FIN-1024
Transaction ID: TXN-XXXXXX
Payment Date: 11 Sep 2026

Buttons:
[Download Receipt]
[View My Fines]

==================================================
PAYMENT HISTORY
==================================================

Student/staff can view their own payment history.

Columns/cards:
- Book
- Amount
- Payment Date
- Payment Method
- Transaction ID
- Status
- Receipt

Add:
[View Receipt]

Students/staff must NOT see:
- Other users' fines
- Department-wide fine data
- Total institution fines
- Fine analytics
- Waive Fine
- Cancel Fine
- Mark as Paid
- Admin controls
- Librarian controls

==================================================
4. ROLE-BASED PERMISSION SYSTEM
==================================================

Make the UI clearly communicate permissions.

ADMIN:
✓ View all fines
✓ View all departments
✓ View all users
✓ View analytics
✓ View payment history
✓ Waive fines
✓ Cancel fines
✓ Monitor collection
✓ Export reports

LIBRARIAN:
✓ View department fines
✓ View department payment history
✓ Mark payment received
✓ Waive/cancel according to department permissions
✓ Manage overdue fines
✓ View student fine details

STUDENT / STAFF:
✓ View own fines
✓ View own payment history
✓ Pay own fines
✓ Download receipt

STUDENT / STAFF:
✗ Cannot cancel
✗ Cannot waive
✗ Cannot mark paid manually
✗ Cannot view other users
✗ Cannot view department analytics

==================================================
5. FINE STATUS WORKFLOW
==================================================

Create a consistent status lifecycle:

Book Due
↓
Overdue
↓
Fine Generated
↓
Pending Payment
↓
Student Pays
↓
Payment Verified
↓
Paid

Alternative librarian/admin action:

Fine Generated
↓
Waived / Cancelled
↓
Closed

Make this workflow visually clear wherever appropriate.

==================================================
6. IMPORTANT UX IMPROVEMENTS
==================================================

Use confirmation modals for sensitive actions:

"Are you sure you want to waive this fine?"

"Are you sure you want to cancel this fine?"

"Mark payment as received?"

Show success/error toast notifications.

Examples:

✓ Fine marked as paid
✓ Fine waived successfully
✓ Fine cancelled successfully
✓ Payment successful

Error:
"Payment failed. Please try again."

==================================================
7. CONSISTENCY WITH EXISTING DESIGN
==================================================

Use the same design system already present in the LibSync project:

- Existing dark navy sidebar
- Existing light gray page background
- Existing white cards
- Existing teal/green primary accent
- Existing rounded cards
- Existing compact KPI cards
- Existing typography
- Existing icon style
- Existing status badges
- Existing table style

Do not introduce a completely new visual style.

Improve spacing and hierarchy where necessary.

Make the interface look like a real production-ready college library management system rather than a generic dashboard.

==================================================
8. RESPONSIVE DESIGN
==================================================

Ensure the new Fines & Payments screens work on:
- Desktop
- Laptop
- Tablet

Tables should become horizontally scrollable or transform into cards on smaller screens.

==================================================
9. IMPORTANT DATA SEPARATION
==================================================

The UI should visually communicate that the same fine system operates at three levels:

INSTITUTION
ADMIN
↓
DEPARTMENT
LIBRARIAN
↓
INDIVIDUAL
STUDENT / STAFF

Admin sees everything.

Librarian sees only their department.

Student/staff sees only their own fines.

Do not duplicate unrelated information across roles.

==================================================
10. FINAL OUTPUT
==================================================

Update the existing LibSync design and generate all necessary screens/states for this hierarchical Fine & Payment system.

Do not remove the existing library features such as:
- Book management
- E-books
- Book transfers
- Borrow requests
- Study folders
- AI Assistant
- Dashboard
- Resource optimization
- Demand forecasting

Only improve and integrate the Fine & Payment module into the existing system.

Make all screens interconnected through realistic navigation and interactions.