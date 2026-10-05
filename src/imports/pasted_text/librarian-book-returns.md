UPDATE THE EXISTING LIBSYNC FRONTEND — DO NOT REBUILD THE PROJECT FROM SCRATCH.

I already have a working LibSync college/institution library management frontend generated in Figma Make AI. Keep the existing UI design, layout, colors, typography, sidebar, header, cards, tables, buttons, icons, spacing, and overall visual style.

Your task is to ADD and IMPROVE the existing frontend based on the requirements below.

IMPORTANT:
- Do not redesign the existing application.
- Do not remove existing pages or features.
- Do not change the existing role structure.
- Reuse existing components and design patterns.
- Keep the current LibSync navy + teal visual style.
- Make the new pages look like they belong to the existing application.
- Make all buttons, tabs, filters, modals and navigation interactions functional in the frontend.
- Use realistic mock data for now, but structure the UI so it can later connect directly to a REST backend/API.
- Do not hardcode UI in a way that prevents API integration later.

====================================================
1. ADD A NEW "BOOK RETURNS" PAGE FOR LIBRARIANS
====================================================

The current Librarian sidebar contains:

Dashboard
My Library Books
E-Books
Borrow Requests
Book Transfers
Add New Book
Fines & Payments
Settings

Add a new menu item:

Book Returns

Place it between:

Book Transfers
and
Add New Book

Use an appropriate return/rotate/assignment icon.

The page title should be:

Book Returns

Subtitle:

Manage returned books, overdue books, and active borrowings in your department library.

This page must be visible ONLY for LIBRARIANS and ADMIN.

Students and Staff must NOT see this page in their sidebar.

====================================================
2. BOOK RETURNS PAGE — TOP KPI CARDS
====================================================

At the top create 5 KPI cards using the same card style already used throughout LibSync.

Cards:

1. Due Today
Example:
12

Subtitle:
Books due today

2. Overdue
Example:
14

Subtitle:
Need return attention

3. Returned Today
Example:
8

Subtitle:
Successfully returned

4. Pending Returns
Example:
5

Subtitle:
Awaiting confirmation

5. Currently Borrowed
Example:
327

Subtitle:
Active borrowings

Each card should have a small icon matching the existing dashboard style.

Use subtle status-based visual indicators without introducing a new color system.

====================================================
3. RETURN STATUS FILTERS
====================================================

Below the KPI cards create a clean filter/tab section.

Tabs:

All
Due Today
Overdue
Return Requested
Returned

The selected tab should use the same active-tab style already used in the application.

Also add:

Search
Filter by Department/Library
Filter by Date
Filter by Status

For a librarian, the default library should automatically be their assigned department library.

Example:

Computer Science Department Library

A librarian must not see unrelated department return records.

Admin can switch between departments/libraries.

====================================================
4. MAIN RETURN MANAGEMENT TABLE
====================================================

Create a large responsive table.

Title:

Return Management

Columns:

Borrow ID
Student
Book
Book Copy
Borrowed Date
Due Date
Days Overdue
Fine
Status
Action

Example rows:

BRW-1024
Arun Kumar
Operating System Concepts
CSE-OS-0182
20 Aug 2026
01 Sep 2026
10 days
₹50
Overdue
View

BRW-1028
Priya Nair
Database Management Systems
CSE-DB-0091
25 Aug 2026
15 Sep 2026
0 days
₹0
Borrowed
View

BRW-1031
Sneha Patel
Computer Networks
CSE-CN-0214
22 Aug 2026
05 Sep 2026
5 days
₹25
Return Requested
View

BRW-1035
Vikram Singh
Hands-On Machine Learning
CSE-ML-0108
10 Aug 2026
24 Aug 2026
0 days
₹70
Returned
View

Use the same table styling as the existing Librarians, Students & Staff, and Fines & Payments pages.

Do not overcrowd the table.

====================================================
5. STATUS LOGIC
====================================================

Use these statuses:

BORROWED
DUE SOON
OVERDUE
RETURN REQUESTED
RETURNED
LOST
DAMAGED

Display them using the same pill/badge style already used in LibSync.

Rules:

BORROWED:
Book is currently with the student.

DUE SOON:
Due date is approaching.

OVERDUE:
Current date is after due date.

RETURN REQUESTED:
Student has requested to return the physical book and librarian must confirm it.

RETURNED:
Librarian has confirmed the physical return.

LOST:
Student reports the book as lost or librarian marks it lost.

DAMAGED:
Book has been returned but is damaged.

====================================================
6. "VIEW" ACTION
====================================================

When librarian clicks View, open a right-side detail drawer similar to the existing Librarian profile drawer and Student profile drawer in the current design.

Do NOT navigate to a completely different design.

Drawer title:

Borrow Details

Show:

Student
Student ID
Department
Email

Book
Book cover
Book title
Author
ISBN
Book copy/accession number

Library
Shelf

Borrowed Date
Due Date
Days Overdue

Current Fine
Fine Status

Return Status

====================================================
7. RETURN CONFIRMATION
====================================================

If the status is:

RETURN REQUESTED
or
OVERDUE
or
BORROWED

provide a primary action:

Mark as Returned

When clicked, show a confirmation modal.

Modal title:

Confirm Book Return

Content:

Book:
Operating System Concepts

Student:
Arun Kumar

Borrowed:
20 Aug 2026

Due:
01 Sep 2026

Return Date:
15 Sep 2026

Days Overdue:
14 days

Current Fine:
₹70

Then add:

Book Condition

○ Good
○ Damaged
○ Lost

Default:

Good

Buttons:

Cancel
Confirm Return

====================================================
8. RETURN CONFIRMATION BEHAVIOUR
====================================================

After clicking Confirm Return:

Update the frontend state so:

Return Status → Returned

Book status → Available

Borrow record → Returned

Returned date → Current date

The returned book should disappear from the active borrowing list and appear in Return History.

If the book was overdue:

Show the calculated fine.

Example:

Fine:
₹70

Message:

"Book returned successfully. ₹70 fine has been added to the student's account."

If the book was returned on time:

Fine:
₹0

Message:

"Book returned successfully. No fine was charged."

====================================================
9. FINE CALCULATION DISPLAY
====================================================

The frontend should NOT allow librarians to manually type the fine amount during normal return confirmation.

Calculate/display it based on:

Due Date
Return Date
Fine Per Day

Example:

Due Date:
01 Sep 2026

Return Date:
15 Sep 2026

Days Overdue:
14

Fine per day:
₹5

Total Fine:
₹70

Use:

Fine = Days Overdue × Fine Per Day

However, structure the frontend so the actual calculation can later come from the backend API.

The backend will eventually be the source of truth.

====================================================
10. RETURN HISTORY
====================================================

Add a Return History section/tab on the Book Returns page.

Tabs:

Active Returns
Return History

Return History table:

Return ID
Student
Book
Copy
Borrowed Date
Due Date
Returned Date
Days Overdue
Fine
Condition
Returned By

Example:

RET-1001
Arun Kumar
Database Management Systems
CSE-DB-0091
20 Aug
01 Sep
05 Sep
4
₹20
Good
Mr. Rajesh Kumar

Provide:

Search
Date filter
Student filter
Book filter

====================================================
11. "DUE TODAY" VIEW
====================================================

When librarian clicks the Due Today KPI card:

Automatically filter the return table to:

Due Today

Show only books whose due date is today.

====================================================
12. "OVERDUE" VIEW
====================================================

When librarian clicks Overdue:

Show only overdue books.

Display:

Days overdue
Current fine

Make overdue information visually obvious but consistent with the existing design.

====================================================
13. "RETURNED TODAY" VIEW
====================================================

When librarian clicks Returned Today:

Show all books returned today.

====================================================
14. PENDING RETURNS
====================================================

When librarian clicks Pending Returns:

Show:

RETURN REQUESTED

records.

Each row should have:

View
Confirm Return

====================================================
15. AUTOMATIC AVAILABILITY / WAITLIST UI
====================================================

Important LibSync feature.

When a book is returned, there may be students waiting for the same book.

After successful return, show an informational message:

"Book is now available."

If there is a waiting student:

"1 student is waiting for this book."

Add:

View Waiting List

Do not automatically create a new unrelated page.

A small drawer/modal can display:

Waiting List

1. Priya Nair
Request date: 14 Sep 2026
Priority: Normal

2. Mohammed Ali
Request date: 14 Sep 2026
Priority: Normal

The backend will later handle the actual queue/assignment logic.

====================================================
16. STUDENT MY BOOKS UPDATE
====================================================

Also improve the existing Student "My Books" page.

Each currently borrowed physical book should show:

Book cover
Book title
Author
Library
Borrowed date
Due date
Days remaining

If overdue:

Days overdue
Current fine

Add button:

Return Book

When student clicks Return Book:

Show confirmation:

"Request return for this book?"

Buttons:

Cancel
Request Return

After confirmation:

Status becomes:

Return Requested

Show:

"Return request sent to your department librarian."

Students must NOT be able to mark a book as returned themselves.

Only the librarian can confirm the physical return.

====================================================
17. STUDENT FINE & PAYMENT INTEGRATION
====================================================

Keep the existing Student:

Fines & Payments

page.

When a book is returned late:

The fine should appear automatically in:

Outstanding Fine

and

My Fines

Example:

Operating Systems
Due Date: 01 Sep 2026
Returned: 15 Sep 2026
Days Overdue: 14
Fine: ₹70
Status: Pending
Action: Pay ₹70

Student/Staff can only:

Pay Fine

They must NOT see:

Cancel
Waive
Edit Fine

Those actions are for authorized staff/admin only.

====================================================
18. LIBRARIAN FINE PAGE INTEGRATION
====================================================

Keep the existing Librarian:

Fines & Payments

page.

After a book is returned with an overdue fine:

Automatically update:

Pending Fines
Overdue Fines
Total Outstanding
Awaiting Action

The fine table should contain:

Fine ID
Student
Book
Due Date
Days Overdue
Amount
Status
Action

The librarian should be able to click View to inspect the related borrowing/return information.

====================================================
19. INTER-DEPARTMENT RETURN RULE
====================================================

Support books transferred between department libraries.

Example:

Student belongs to CSE.

Book belongs to ECE Library.

ECE → CSE transfer.

Student borrows the book.

When the student returns the book:

The system should know the book originally belongs to ECE.

Return details should display:

Original Library:
ECE Library

Current Library:
CSE Library

Return Destination:
ECE Library

Status:

Awaiting Library Transfer

After the book is transferred back:

Status:

Returned to ECE Library

Do not confuse a transferred book with a permanently owned book of the receiving library.

====================================================
20. BORROW REQUEST PAGE UPDATE
====================================================

Keep the existing Borrow Requests page.

Update the UI logic so that:

If a requested book is available in the student's own department library:

Status:
Auto Approved

No librarian approval button should appear.

If unavailable locally but available in another department:

Status:
Transfer Required

Show:

Transfer Required
From:
ECE Library
To:
CSE Library

If unavailable everywhere:

Status:
Waiting

Show:

Estimated Availability:
18 Sep 2026

The estimated date must be represented as dynamic backend data later.

Do not hardcode business logic into the UI.

====================================================
21. LIBRARIAN REQUEST VISIBILITY
====================================================

IMPORTANT:

A librarian should NOT see every student request in the system.

For example:

CSE Librarian:

Should see:
- requests requiring CSE librarian action
- inter-department requests involving CSE
- transfer requests relevant to CSE
- returns belonging to CSE

Should NOT see:
- unrelated ECE requests
- unrelated Mechanical requests
- unrelated student requests

Admin can see everything.

Build the UI assuming the backend will enforce this scope.

====================================================
22. LIBRARIAN DASHBOARD UPDATE
====================================================

Update the existing Librarian Dashboard KPI section.

Current KPIs should remain.

Add:

Returned Today

and optionally:

Pending Returns

Example:

Total Books
4,218

Available
3,891

Issued
327

Pending Requests
8

Overdue
14

In Transfer
3

Returned Today
8

Pending Returns
5

Keep the dashboard clean.

Do not make the dashboard overcrowded.

====================================================
23. BOOK DETAIL PAGE
====================================================

Keep the existing Book detail drawer/page.

Make sure physical books display:

Book Cover
Title
Author
ISBN
Edition
Publisher
Year
Department
Subject

Availability:

Copies Available
Total Copies
Current Library
Shelf
Loan Period

Description

Actions according to role.

For librarians:

Edit Book
View Inventory

For students:

Request Book

If unavailable:

Show:

Currently unavailable

Estimated availability:
18 Sep 2026

If available:

Request Book

====================================================
24. E-BOOK PAGE
====================================================

Keep the existing E-Books page.

Each e-book should show:

Cover
Title
Author
Department
Subject
Pages
Format
Language
Rating

Button:

Read PDF

When clicked, open the existing PDF reader design.

Do not redesign the reader.

Keep:

Fullscreen
Zoom
Download
Reading progress
Bookmark
Study Folder
AI Assistant

====================================================
25. ADD NEW BOOK
====================================================

Keep the existing Add New Book page.

For E-Book upload:

Upload PDF

Then show a metadata extraction state:

"Extracting book information..."

Then display:

Title
Author
ISBN
Publisher
Edition
Year
Subject

Allow librarian to edit the extracted information before saving.

For physical book:

Allow:

Book
ISBN
Accession Number
Library
Shelf
Condition
Quantity

====================================================
26. ROLE-BASED SIDEBAR
====================================================

Maintain separate navigation for:

ADMIN
LIBRARIAN
STUDENT
STAFF

ADMIN:
Dashboard
Analytics
Books
E-Books
Departments
Librarians
Students & Staff
Requests
Book Transfers
Fines & Payments
Reports
Settings

LIBRARIAN:
Dashboard
My Library Books
E-Books
Borrow Requests
Book Transfers
Book Returns
Add New Book
Fines & Payments
Settings

STUDENT/STAFF:
Dashboard
Explore Books
My Books
Study Folders
My Requests
AI Assistant
Fines & Payments
Settings

Do not expose administrative pages to students/staff.

====================================================
27. API-READY FRONTEND ARCHITECTURE
====================================================

Although this is a Figma Make frontend project, organize the frontend logic so it can later connect to the backend.

Create clear service/data abstraction for:

auth
books
ebooks
borrowRequests
borrowRecords
returns
transfers
fines
payments
notifications
users
departments
analytics

Do not tightly couple UI components to mock data.

Use a structure where mock services can later be replaced by real API calls.

For example:

bookService
returnService
borrowService
fineService
transferService

====================================================
28. IMPORTANT DATA RELATIONSHIPS
====================================================

The frontend should understand these relationships:

User
→ belongs to Department

Department
→ has Library

Library
→ contains Book Copies

Book
→ has multiple Book Copies

Book Copy
→ belongs to one Library

Borrow Request
→ belongs to User + Book

Borrow Record
→ belongs to User + Book Copy

Return Record
→ belongs to Borrow Record

Fine
→ belongs to Borrow Record/User

Transfer
→ moves a Book Copy between libraries

Do not represent a book as simply "available/unavailable".

Availability must be based on physical copies.

====================================================
29. DESIGN CONSISTENCY
====================================================

Use the exact visual language already present in LibSync.

Maintain:

- Existing navy sidebar
- Existing teal primary buttons
- Existing white cards
- Existing light gray page background
- Existing border radius
- Existing typography
- Existing badges
- Existing icons
- Existing table style
- Existing right-side drawers
- Existing modal style
- Existing spacing

Do not introduce:
- gradients everywhere
- unnecessary animations
- completely new colors
- oversized cards
- excessive rounded elements
- unrelated visual styles

The new Book Returns page should look like it was part of LibSync from the beginning.

====================================================
30. RESPONSIVE DESIGN
====================================================

Make the new pages responsive.

Desktop:
Use the existing dashboard layout.

Tablet:
Adjust table and cards appropriately.

Mobile:
Convert tables into stacked cards or horizontally scrollable tables.

The existing sidebar/header behavior should remain consistent.

====================================================
31. FINAL REQUIREMENT
====================================================

After implementing these changes, verify the complete user journey:

STUDENT:

Browse Book
→ Request Book
→ System checks availability
→ Auto Approve if local copy exists
→ Transfer workflow if another library has copy
→ Waitlist if unavailable
→ Borrow Book
→ See Due Date
→ Request Return
→ Librarian confirms Return
→ Fine calculated if overdue
→ Fine appears in Fines & Payments
→ Student pays fine

LIBRARIAN:

Dashboard
→ See Borrow Requests
→ See only relevant/inter-department requests
→ Manage transfers
→ See Book Returns
→ See Due Today / Overdue
→ View Borrow Details
→ Confirm Return
→ Select Book Condition
→ System updates book availability
→ Fine is generated if overdue
→ Waiting student can be notified

ADMIN:

Dashboard
→ View global analytics
→ View all departments
→ View all books
→ View all users
→ View all librarians
→ View all requests
→ View all transfers
→ View all returns
→ View all fines/payments

IMPORTANT:
Do not remove any existing LibSync functionality.

Do not replace the current frontend with a new design.

Modify the existing project and add the missing functionality cleanly.

The most important new feature is:

LIBRARIAN → BOOK RETURNS

It must be a complete page with:
- KPIs
- filters
- return table
- return details drawer
- return confirmation modal
- condition selection
- return history
- overdue/fine information
- waitlist information
- role-based access
- integration with existing Borrow Requests, Book Transfers, My Books and Fines & Payments pages.