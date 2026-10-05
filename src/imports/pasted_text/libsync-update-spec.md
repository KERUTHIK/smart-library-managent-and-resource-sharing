Update the EXISTING LibSync college/institution centralized library management system.

IMPORTANT:
Do NOT redesign the entire application.
Do NOT change the existing overall visual identity, sidebar, header, colors, typography, spacing, card style, or navigation structure.

The current design has several empty pages:
- Books
- E-Books
- Departments
- Librarians
- Students & Staff

Populate these pages with realistic sample data and create meaningful interactions.

Maintain the same LibSync design system and make the pages feel production-ready.

==================================================
1. BOOKS PAGE — PHYSICAL BOOK CATALOG
==================================================

The current Books page is empty.

Create a complete physical book management/catalog page.

PAGE HEADER:

Title:
"Books"

Subtitle:
"Manage and explore physical books across all department libraries."

Top-right buttons:
[+ Add New Book]
[Import Books]

Add KPI cards:

Total Physical Books
24,582

Available
18,420

Currently Issued
5,820

Overdue
342

In Transfer
86


==================================================
BOOK SEARCH & FILTERS
==================================================

Add a prominent search bar:

"Search by title, author, ISBN, book ID..."

Filters:
- Department
- Subject
- Availability
- Book Type
- Author
- Publication Year

View toggle:
- Grid View
- List View


==================================================
BOOK GRID
==================================================

Display realistic book cover images on every book card.

Create at least 10–12 sample books.

Example books:

1. Database Management Systems
Author: Abraham Silberschatz
Department: Computer Science
ISBN: 9780078022159
Rating: 4.8
Available: 12 copies

2. Computer Networks
Author: Andrew S. Tanenbaum
Department: Computer Science
ISBN: 9780132126953
Rating: 4.7
Available: 8 copies

3. Operating System Concepts
Author: Abraham Silberschatz
Department: Computer Science
Rating: 4.6
Available: 15 copies

4. Engineering Mechanics
Author: R.C. Hibbeler
Department: Mechanical
Rating: 4.6
Available: 4 copies

5. Digital Electronics
Author: R.P. Jain
Department: Electronics
Rating: 4.5
Available: 7 copies

6. Hands-On Machine Learning
Author: Aurélien Géron
Department: Computer Science
Rating: 4.9
Available: 5 copies

7. Data Structures and Algorithms
Author: Thomas H. Cormen
Department: Computer Science

8. Signals and Systems
Author: Alan V. Oppenheim
Department: Electronics

9. Engineering Mathematics
Author: K.A. Stroud
Department: Mathematics

10. Fluid Mechanics
Author: Frank M. White
Department: Mechanical


Each book card must contain:

- Realistic book cover
- Book title
- Author
- Department
- Subject
- Rating
- Availability badge
- Number of available copies
- Book type badge: "Physical"
- [View Details] button

Do not use blank placeholders for book covers.

==================================================
BOOK DETAILS INTERACTION
==================================================

When a user clicks a book card or "View Details", open a detailed book page or right-side drawer.

Show a large book cover on the left.

Right side:

Database Management Systems

Author:
Abraham Silberschatz

Edition:
7th Edition

ISBN:
9780078022159

Publisher:
McGraw Hill

Publication Year:
2020

Department:
Computer Science

Subject:
Database Systems

Language:
English

Book ID:
LIB-CSE-DB-001

Description:

"Database Management Systems provides a comprehensive introduction to database concepts, relational database design, SQL, transaction management, and modern database technologies."

Add:

Availability
✓ Available

Copies:
12 Available / 15 Total

Current Location:
Computer Science Department Library

Shelf:
CSE-A3-24

Buttons depending on user role:

Student/Staff:
[Request Physical Book]

Librarian:
[Edit Book]
[Manage Copies]

Admin:
[Edit Book]
[View Inventory]

Also show:

"Borrowing Information"
- Loan period: 14 days
- Current borrower count
- Waiting list count


==================================================
2. E-BOOKS PAGE
==================================================

The current E-Books page is empty.

Create a complete digital library page.

Header:

"E-Books"

Subtitle:
"Read digital books available through your institution."

KPI cards:

Total E-Books
8,421

Available to Read
8,120

Recently Added
126

Most Read This Month
842


==================================================
E-BOOK SEARCH
==================================================

Search:
"Search e-books by title, author, topic..."

Filters:
- Department
- Subject
- Language
- Year
- Category

Add sorting:
- Recently Added
- Most Read
- Most Popular
- A–Z


==================================================
E-BOOK GRID
==================================================

Create 10–12 realistic e-book cards with proper cover images.

Each card:

Book Cover

Title
Author

Department

Subject

Format:
PDF

Pages:
XXX pages

Rating

Badge:
"E-Book"

Button:
[Read PDF]

Example:

Database Management Systems
Abraham Silberschatz
Computer Science
PDF • 842 pages
★★★★★ 4.8
[Read PDF]

Computer Networks
Andrew S. Tanenbaum
Computer Science
PDF • 960 pages
[Read PDF]

Operating System Concepts
Abraham Silberschatz
Computer Science
PDF • 944 pages

Hands-On Machine Learning
Aurélien Géron
Computer Science
PDF • 850 pages


==================================================
E-BOOK DETAIL / PDF OPENING
==================================================

When the user clicks an e-book:

Open an e-book reader interface.

IMPORTANT:
The PDF should visually appear to open inside the application.

Create a PDF reader layout with:

Top bar:
← Back to E-Books

Book title:
Database Management Systems

Author:
Abraham Silberschatz

Controls:
- Previous page
- Next page
- Page number
- Zoom -
- Zoom +
- Fullscreen
- Download if permitted

Main area:
Large PDF document viewer showing a realistic book page.

Right-side optional panel:

"Book Information"

Title
Author
Department
Subject
Pages
Language

"Reading Progress"
Chapter 4
Page 248 / 842
29%

Buttons:
[Add to Study Folder]
[Bookmark]
[Ask AI About This Book]

IMPORTANT:
Use a realistic PDF reader visual rather than just showing a blank white box.

The reader should look like an actual digital library experience.


==================================================
3. DEPARTMENTS PAGE
==================================================

The current Departments page is empty.

Create a department management/discovery page.

Header:

"Departments"

Subtitle:
"Manage department libraries and their resources."

Top KPI cards:

12
Departments

24,582
Total Books

8,421
E-Books

18,420
Available Books


==================================================
DEPARTMENT CARDS
==================================================

Create cards for departments such as:

Computer Science
Electronics & Communication
Mechanical Engineering
Civil Engineering
Electrical Engineering
Mathematics
Physics
Chemistry
Management
Biotechnology
Information Technology
Humanities

Each department card should show:

Department icon

Computer Science

Department Code:
CSE

Library:
Computer Science Department Library

Books:
4,218

E-Books:
1,284

Students:
842

Librarians:
2

Available Books:
3,891

Current Requests:
8

Buttons:
[View Department]
[View Library]


==================================================
DEPARTMENT DETAILS
==================================================

Clicking a department opens:

"Computer Science Department"

Show:

Department Overview

Department Head:
Dr. XXXXX

Department Code:
CSE

Library:
Computer Science Department Library

Librarians:
2

Students:
842

Staff:
64

Books:
4,218

E-Books:
1,284


Add sections:

Library Statistics
- Available books
- Issued books
- Overdue books
- Pending requests

Popular Books
- Database Management Systems
- Computer Networks
- Operating Systems
- Machine Learning

Recent Activity

Add a small department activity chart.


==================================================
4. LIBRARIANS PAGE
==================================================

Create a complete librarian management page.

Header:

"Librarians"

Subtitle:
"Manage department librarians and library responsibilities."

KPI cards:

Total Librarians
24

Active
22

On Leave
2

Departments Covered
12


==================================================
LIBRARIAN CARDS / TABLE
==================================================

Create realistic sample librarians.

Example:

Arun Kumar
Senior Librarian
Computer Science Department Library

Employee ID:
LIB-CSE-001

Email:
arun.kumar@college.edu

Experience:
8 years

Status:
Active

Responsibilities:
- Book approvals
- Book transfers
- Fine management

Buttons:
[View Profile]


Other sample librarians:

Priya Nair
ECE Department Library

Mohammed Ali
Mechanical Department Library

Sneha Patel
Civil Department Library

Vikram Singh
Mathematics Department Library


Use a clean table or card layout.

Columns:
- Librarian
- Employee ID
- Department
- Library
- Books Managed
- Pending Requests
- Status
- Action


==================================================
LIBRARIAN PROFILE
==================================================

Clicking a librarian opens a profile/detail drawer.

Show:

Profile photo/avatar

Name
Employee ID
Department
Library
Email
Phone
Joined Date
Experience

Performance Summary:

Books Managed
4,218

Requests Processed
1,284

Transfers Completed
86

Pending Requests
8

Fine Actions
42

Recent Activity

Show realistic recent actions.

Buttons for Admin:
[Edit Librarian]
[Assign Department]
[Deactivate]


==================================================
5. STUDENTS & STAFF PAGE
==================================================

The current Students & Staff page is empty.

Create a complete user management page.

Header:

"Students & Staff"

Subtitle:
"Manage library members, borrowing activity, and access."

KPI cards:

Total Members
6,284

Students
5,820

Staff
464

Active Borrowers
2,842

Users With Fines
126


==================================================
USER SEARCH AND FILTERS
==================================================

Search:

"Search name, ID, email, department..."

Filters:
- Student / Staff
- Department
- Account Status
- Borrowing Status
- Fine Status

Buttons:
[+ Add Member]
[Import Members]


==================================================
USER TABLE
==================================================

Create realistic sample users.

Columns:

- User
- ID
- Type
- Department
- Books Borrowed
- Overdue
- Fine
- Status
- Action

Example:

Arun Kumar
CSE2023-0176
Student
Computer Science
2 borrowed
0 overdue
₹0
Active

Priya Nair
ECE2023-0214
Student
Electronics
3 borrowed
1 overdue
₹35
Active

Mohammed Ali
CSE2022-1121
Student
Computer Science
1 borrowed
0 overdue
₹0
Active

Sneha Patel
ECE2023-0876
Student
Electronics
2 borrowed
2 overdue
₹90
Fine Pending

Dr. Rajesh Kumar
STAFF-0012
Faculty
Computer Science
4 borrowed
0 overdue
₹0
Active


==================================================
USER PROFILE
==================================================

When clicking a user, open a profile drawer/page.

Show:

Profile
- Name
- Profile image/avatar
- User ID
- Student/Staff
- Department
- Email
- Phone
- Account status

Library Activity:

Currently Borrowed
2

Books Returned
18

Pending Requests
1

Overdue Books
0

Outstanding Fine
₹0

Reading Activity:
- Most borrowed subjects
- E-book reading count
- Study folder count

Recent Borrowing History:

Book
Borrowed Date
Due Date
Returned Date
Status

For students/staff, keep their privacy:
Admin can see full institutional management information.
Librarians can see only users relevant to their department.
Students/staff can only see their own profile.


==================================================
6. ROLE-BASED ACCESS
==================================================

Maintain strict role-based UI.

ADMIN:

Books:
✓ View all
✓ Add
✓ Edit
✓ Delete
✓ Manage inventory

E-Books:
✓ View
✓ Add
✓ Edit
✓ Manage access

Departments:
✓ View
✓ Add
✓ Edit
✓ Manage

Librarians:
✓ View
✓ Add
✓ Edit
✓ Assign department

Students & Staff:
✓ View
✓ Add
✓ Edit
✓ Manage access


LIBRARIAN:

Books:
✓ View department books
✓ Add books
✓ Edit department books
✓ Manage copies

E-Books:
✓ View
✓ Add e-books

Departments:
✓ View own department

Librarians:
✓ View relevant librarians

Students & Staff:
✓ View users in own department


STUDENT / STAFF:

Books:
✓ Browse
✓ View details
✓ Request physical book

E-Books:
✓ Browse
✓ Open PDF
✓ Read
✓ Bookmark
✓ Add to Study Folder
✓ Ask AI

Departments:
✓ Browse departments
✓ View department/library information

Librarians:
Do NOT expose administrative librarian-management functionality.

Students & Staff:
✓ View own profile
✓ View own borrowing history


==================================================
7. EMPTY STATES
==================================================

Do not leave major pages blank.

However, create proper empty states where appropriate.

Example:

"No books found"

Try adjusting your filters or search terms.

[Clear Filters]

For no e-books:

"No e-books available"

There are currently no e-books matching your filters.


==================================================
8. SAMPLE DATA QUALITY
==================================================

Use realistic educational/library data.

Avoid:
- Lorem ipsum
- Random meaningless names
- Empty cards
- Placeholder book covers
- Generic "Book 1", "Book 2"
- Generic "User 123"

Use realistic:
- Book titles
- Authors
- ISBNs
- Departments
- Student IDs
- Librarian IDs
- Library names
- Dates
- Borrowing statistics
- Fine amounts


==================================================
9. INTERACTION REQUIREMENTS
==================================================

Make the prototype feel functional.

Book card → Book Details

E-book card → PDF Reader

Department card → Department Details

Librarian row → Librarian Profile

Student/Staff row → User Profile

Add Book → Add Book workflow

Filters → Update visible results

Search → Filter displayed data

Request Physical Book → Request confirmation modal

Add to Study Folder → Folder selection modal

Ask AI → Open LibSync AI assistant with book context


==================================================
10. VISUAL QUALITY
==================================================

Keep the existing LibSync visual language.

Use:
- White cards
- Light gray background
- Dark navy sidebar
- Teal primary actions
- Soft borders
- Small rounded corners
- Clean tables
- Compact KPI cards
- Professional status badges
- Consistent iconography

Book covers should be visually prominent.

For Books and E-Books, prioritize the book cover as the main visual element.

Do not make every page look like a dashboard.
Use the appropriate layout for each page:

Books → Catalog/Grid + filters
E-Books → Digital catalog/Grid
Departments → Department cards
Librarians → Management table/cards
Students & Staff → User management table

Make all pages visually balanced and production-ready.

==================================================
FINAL REQUIREMENT
==================================================

Populate the existing empty pages without changing the existing application's overall design.

The final LibSync prototype should feel like a complete centralized college library platform with:

Physical Book Management
+
Digital E-Book Library
+
Department Libraries
+
Librarian Management
+
Student/Staff Management
+
Borrowing
+
Book Transfers
+
Fine & Payment Management
+
Study Folders
+
AI Library Assistant
+
Demand Forecasting
+
Smart Resource Optimization

Every major page should contain realistic sample data and meaningful interactions.