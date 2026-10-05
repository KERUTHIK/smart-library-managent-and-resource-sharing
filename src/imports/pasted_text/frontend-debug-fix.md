You are working on my existing Smart Centralized College Library Management System frontend.

IMPORTANT:
This is an EXISTING generated project.

Do NOT redesign the application.
Do NOT create a new project.
Do NOT change the existing overall UI/UX, theme, layout, colors, typography, sidebar structure, dashboard design, cards, tables, or navigation.

Your task is to DEBUG, FIX, and COMPLETE the existing frontend functionality.

First inspect the entire existing codebase and understand:
- routes
- pages
- components
- buttons
- modals
- forms
- role-based access
- state management
- existing mock data
- API/service functions
- book flows
- e-book flows
- department flows
- librarian flows
- student/staff flows
- study folder flows
- transfer flows

Then fix all issues listed below.

==================================================
1. IMPORTANT ROLE STRUCTURE
==================================================

There are 4 effective user roles:

1. ADMIN
2. LIBRARIAN
3. STUDENT
4. STAFF

Student and Staff should have the same library-user functionality unless the existing design specifically differentiates them.

Role permissions must be enforced throughout the UI.

Do not merely hide buttons visually.

The route/component logic must also prevent unauthorized users from accessing restricted functionality.

==================================================
2. ADMIN — BOOKS PAGE
==================================================

Current problems:

- Add New Book button does not work.
- Import Book button does not work.
- View button inside book details does not work correctly.
- Edit Book inside book details does not work.
- View Inventory inside book details does not work.

Fix:

### Add New Book

Clicking:

"Add New Book"

must open the existing appropriate modal/page/form.

The form should allow:

- Book cover
- Title
- Author
- ISBN
- Edition
- Publisher
- Publication year
- Department
- Subject/category
- Description
- Book type
- Total copies
- Location
- Shelf
- Loan period

Buttons:

- Save Book
- Cancel

Save should update the application's book state/API layer.

After successful creation:

- close modal/page
- show success feedback
- refresh book list
- display the newly created book

Do not use a fake button.

### Import Book

Clicking:

"Import Book"

must open an import interface.

Support importing book records from:

- CSV
- Excel if the existing project supports it

Show:

- selected file
- number of records
- validation errors
- preview of imported records
- Import button
- Cancel button

After import:

- update the book list
- show success message

Do not silently do nothing.

### Book Details → Edit Book

When Admin clicks:

View → Book Details → Edit Book

open an editable form populated with the existing book information.

Allow the Admin to modify book information.

Save changes and update the book everywhere the book is displayed.

### Book Details → View Inventory

Clicking:

"View Inventory"

must open an inventory page/modal showing individual copies.

Show:

- Copy ID
- Barcode
- Status
- Current borrower
- Due date
- Location
- Department

Possible statuses:

AVAILABLE
BORROWED
RESERVED
IN_TRANSFER
LOST
DAMAGED

Provide useful filtering/search where appropriate.

==================================================
3. ADMIN — E-BOOK PAGE
==================================================

Current problems:

- Add E-book button does not work.
- Read PDF actions do not work.
- Fullscreen does not work.
- Download does not work.
- Student/staff-only actions are incorrectly visible to Admin.

### Add E-book

Clicking:

"Add E-book"

must open the e-book upload form.

Fields:

- PDF file
- Cover
- Title
- Author
- ISBN
- Publisher
- Edition
- Publication year
- Department
- Subject
- Description
- Language

If PDF metadata extraction already exists, use it.

Allow metadata to be automatically detected where possible, but allow the user to edit/confirm it before saving.

After saving:

- close form
- show success message
- refresh e-book list

### PDF Reader

Clicking:

"Read PDF"

must actually open the PDF reader.

The reader should support:

- Previous page
- Next page
- Page number
- Zoom in
- Zoom out
- Fullscreen
- Exit fullscreen
- Close reader

### Fullscreen

The fullscreen button must use the browser Fullscreen API where supported.

It must actually expand the PDF reader.

Do not leave it as a visual-only button.

### Download

The Download button must actually initiate the PDF download.

If the application is currently using mock/local PDF files, implement the frontend download behavior around the existing file source.

If the backend API already exists, call the backend endpoint.

Do not create fake downloads.

### STUDENT/STAFF ONLY ACTIONS

Inside the e-book detail/read page, these actions:

- Add to Study Folder
- Bookmark
- Ask AI About This Book

must ONLY be visible to:

STUDENT
STAFF

They must NOT appear for:

ADMIN
LIBRARIAN

Do not remove the functionality from the project.

Simply enforce the correct role visibility and authorization.

==================================================
4. ADMIN — DEPARTMENT PAGE
==================================================

Current problems:

- Add Department does not work.
- View Department does not work.
- Edit Department does not work.
- Manage Librarians does not work.

### Add Department

Clicking:

"Add Department"

must open a working form.

Fields:

- Department name
- Department code
- Description
- Head/Coordinator if applicable
- Library information if applicable

Save the department and update the department list.

### View Department

Clicking:

"View Department"

must open a department detail page/modal.

Show:

- Department name
- Code
- Description
- Librarian(s)
- Number of books
- Number of e-books
- Available books
- Issued books
- Overdue books
- Students
- Staff
- Pending requests

Use existing data/state/API where available.

### Edit Department

Clicking:

"Edit Department"

must open a populated editable form.

Changes must persist in application state/API.

### Manage Librarians

Clicking:

"Manage Librarians"

must open a working interface showing librarians assigned to that department.

Allow Admin to:

- view librarians
- assign librarian
- remove/reassign librarian if appropriate

==================================================
5. ADMIN — LIBRARIANS PAGE
==================================================

Current problems:

- Add Librarian does not work.
- View Profile does not work.
- Edit Librarian does not work.
- Assign Department does not work.
- Deactivate does not work.

### Add Librarian

Create a working form:

- Name
- Email
- Employee ID
- Phone if already present in design
- Department
- Status

Save and refresh the librarian list.

### View Profile

Open a proper librarian profile.

Show:

- Name
- Employee ID
- Email
- Department
- Status
- Assigned books
- Active requests
- Transfers
- Renewals
- Recent activity

### Edit Librarian

Allow Admin to edit librarian information.

### Assign Department

Open a department-selection modal.

Show current department.

Allow Admin to assign/reassign the librarian.

Update the librarian's department everywhere.

### Deactivate

Clicking:

"Deactivate"

must:

1. Ask for confirmation.
2. Change librarian status to inactive/deactivated.
3. Prevent that account from performing librarian operations.
4. Update the UI immediately.
5. Show appropriate feedback.

Do not permanently delete the librarian unless the existing system specifically requires deletion.

==================================================
6. ADMIN — STUDENTS & STAFF PAGE
==================================================

Current problems:

- Add Members does not work.
- Import Members does not work.
- View Profile does not work.
- Edit Profile does not work.
- Suspend Access does not work.

### Add Members

Create a working form for:

- Name
- ID
- Email
- Role
- Department
- Status

Roles:

STUDENT
STAFF

Save and update the member list.

### Import Members

Create a working import flow.

Support CSV where appropriate.

Show:

- selected file
- preview
- valid records
- invalid records
- validation errors
- import action

After successful import, refresh the member list.

### View Profile

Show:

- Name
- ID
- Email
- Role
- Department
- Account status
- Borrowed books
- Returned books
- Due dates
- Fines
- Payment history
- Requests

### Edit Profile

Allow Admin to edit permitted member information.

### Suspend Access

Clicking:

"Suspend Access"

must:

1. Show confirmation.
2. Change account status to suspended.
3. Prevent the user from performing library actions.
4. Update UI status.
5. Show feedback.

Do not delete the member.

==================================================
7. ADMIN — BOOK TRANSFERS
==================================================

Current problem:

These actions should NOT be available to Admin:

- Contact Librarian
- Mark as Received
- Notify Student

Change the UI so that these actions are shown ONLY to LIBRARIANS.

For Admin:

Admin can still VIEW transfer information and organization-level transfer status.

Admin should see:

- Source department
- Destination department
- Book
- Student/requester
- Transfer status
- Created date
- Expected date
- Current stage

But do not show operational buttons:

Contact Librarian
Mark as Received
Notify Student

to Admin.

==================================================
8. LIBRARIAN — MY LIBRARY BOOKS
==================================================

Current problems:

- Add New button should be removed.
- View Details → Edit Book does not work.
- View Details → Manage Copies does not work.

### Remove Add New

Remove the:

"Add New"

button from the Librarian's My Library Books page.

Librarians should not directly add new books from this page according to the current role design.

Do NOT remove Admin's Add New Book functionality.

### Edit Book

Inside:

View Details → Edit Book

make the edit form functional.

Librarian should only be able to edit information permitted by the role.

### Manage Copies

Clicking:

"Manage Copies"

must open the book's inventory/copies interface.

Show:

- Copy ID
- Barcode
- Status
- Borrower
- Due date
- Location

Allow appropriate copy-management operations according to librarian permissions.

==================================================
9. LIBRARIAN — E-BOOK PAGE
==================================================

Fix:

- Read PDF
- Fullscreen
- Download

using the same functional PDF reader behavior described above.

Student/Staff-only actions:

- Add to Study Folder
- Bookmark
- Ask AI About This Book

must NOT appear for Librarian.

Librarian should still be able to read the e-book if the role permissions allow it.

==================================================
10. LIBRARIAN — BOOK TRANSFERS
==================================================

Change:

"Contact Librarian"

to:

"Notify Librarian"

The button must represent sending a notification to the appropriate department librarian.

Example:

Student department:
CSE

Book located in:
ECE Library

CSE librarian requests/needs the book.

The system should notify the ECE librarian.

The notification should contain:

- Book
- Requesting department
- Requesting student
- Destination department
- Request ID
- Transfer ID

### Mark as Received

Make:

"Mark as Received"

functional.

When the destination librarian receives the book:

- transfer status changes to RECEIVED
- book/copy status updates appropriately
- transfer timeline updates
- notification is generated
- UI refreshes

### Notify Student

Make:

"Notify Student"

functional.

It should send a notification to the student that the requested book is ready/received/available according to the transfer status.

Do not just show a toast without updating the underlying state.

==================================================
11. STUDENT & STAFF — MY BOOKS
==================================================

Current problems:

- Renew button does not work.
- View Details → Read E-book does not work.
- View Details → Add to Folder does not work.

### Renew

The Renew button must create a renewal request.

When clicked:

1. Check whether renewal is allowed.
2. Open confirmation if appropriate.
3. Create renewal request.
4. Show "Renewal Requested".
5. Update status in My Books.

Possible statuses:

AVAILABLE_FOR_RENEWAL
RENEWAL_REQUESTED
RENEWAL_APPROVED
RENEWAL_REJECTED
NOT_ELIGIBLE

If librarian approval is required:

Student
↓
Renew
↓
Renewal Request
↓
Librarian
↓
Approve / Reject
↓
Student receives result

Do not simply change the due date from the frontend.

### Read E-book

Inside book details:

"Read E-book"

must open the actual PDF reader.

Use the same working:

- page navigation
- zoom
- fullscreen
- download
- close

behavior.

### Add to Folder

Clicking:

"Add to Folder"

must show the student's existing study folders.

Example:

- Database Systems
- Operating Systems
- Machine Learning
- Exam Preparation

Allow:

- select existing folder
- create new folder
- add book

After adding:

show confirmation and update the folder contents.

==================================================
12. STUDENT & STAFF — MY STUDY FOLDERS
==================================================

Current problems:

Inside a study folder:

- Read does not work.
- Add Book does not work.
- Add Note does not work.

Fix all three.

### Read

Clicking:

"Read"

on an e-book/book saved in the folder must open the correct resource.

For an e-book:
→ open PDF reader.

For a physical book:
→ show book details and availability/request options.

### Add Book

Clicking:

"Add Book"

must open the library book search.

Allow the student/staff member to:

1. Search books.
2. Select a book/e-book.
3. Add it to the current folder.

Do not create duplicate entries.

### Add Note

Clicking:

"Add Note"

must open a working note editor/modal.

Allow:

- title
- note content

Save the note inside the selected study folder.

Allow the user to edit/delete notes if the existing design supports those actions.

==================================================
13. ROLE-BASED VISIBILITY MATRIX
==================================================

Implement the following:

FEATURE                         ADMIN   LIBRARIAN   STUDENT   STAFF

Add New Book                    YES       NO*        NO        NO
Import Book                     YES       NO         NO        NO
Edit Book                       YES      YES**       NO        NO
Manage Copies                   YES      YES         NO        NO

Add E-book                      YES      YES/NO***   NO        NO
Read E-book                     YES       YES        YES       YES
Download E-book                 YES       YES        YES       YES
Fullscreen PDF                  YES       YES        YES       YES

Add to Study Folder             NO        NO         YES       YES
Bookmark                        NO        NO         YES       YES
Ask AI About Book               NO        NO         YES       YES

Add Department                  YES       NO         NO        NO
Edit Department                 YES       NO         NO        NO
Manage Librarians               YES       NO         NO        NO

Add Librarian                   YES       NO         NO        NO
Edit Librarian                  YES       NO         NO        NO
Assign Department               YES       NO         NO        NO
Deactivate Librarian            YES       NO         NO        NO

Add Student/Staff               YES       NO         NO        NO
Import Members                  YES       NO         NO        NO
Edit Member                     YES       NO         NO        NO
Suspend Access                  YES       NO         NO        NO

Transfer View                   YES       YES        LIMITED   LIMITED
Notify Librarian                NO        YES        NO        NO
Mark as Received                NO        YES        NO        NO
Notify Student                  NO        YES        NO        NO

Renew Book                      NO        APPROVE    YES       YES

* Librarian's "My Library Books" Add New button must be removed.
** Librarian edit permissions should follow existing system permissions.
*** Follow the existing library policy for e-book creation.

IMPORTANT:
This matrix describes UI visibility AND permission behavior.

==================================================
14. BUTTON FUNCTIONALITY AUDIT
==================================================

Scan the entire project for:

- buttons with no onClick
- buttons with placeholder handlers
- console.log-only handlers
- TODO handlers
- empty functions
- fake navigation
- dead routes
- missing modals
- broken links
- actions that update UI but not state
- actions that close without saving
- actions that display a toast but do nothing

Fix them where they relate to the existing library functionality.

Do not change unrelated working features.

==================================================
15. STATE MANAGEMENT
==================================================

Use the project's existing state-management approach if one already exists.

If the project uses:

- React Context
- Zustand
- Redux
- React Query
- local state

continue using it consistently.

Do not introduce a completely different state-management architecture unnecessarily.

After create/edit/delete/status actions:

- update the relevant state
- refresh affected data
- keep navigation consistent

==================================================
16. API INTEGRATION
==================================================

If backend APIs already exist:

Connect all buttons/actions to the actual APIs.

If APIs are not yet available:

Create clean service functions/interfaces so the frontend is ready for the backend.

Do NOT hardcode fake successful responses.

Examples:

bookService.createBook()
bookService.updateBook()
bookService.importBooks()
bookService.getInventory()

ebookService.uploadEbook()
ebookService.getPdf()
ebookService.downloadPdf()

departmentService.createDepartment()
departmentService.updateDepartment()
departmentService.getDepartment()

librarianService.createLibrarian()
librarianService.updateLibrarian()
librarianService.assignDepartment()
librarianService.deactivate()

memberService.createMember()
memberService.importMembers()
memberService.updateMember()
memberService.suspend()

transferService.notifyLibrarian()
transferService.markReceived()
transferService.notifyStudent()

renewalService.requestRenewal()

studyFolderService.addBook()
studyFolderService.addNote()
studyFolderService.removeBook()

==================================================
17. ERROR HANDLING
==================================================

Every action must handle:

- loading
- success
- failure
- unauthorized
- forbidden
- validation error
- network error
- empty state

Examples:

Instead of silently failing:

"Unable to update book. Please try again."

Instead of fake success:

"Book updated successfully."

ONLY show success after the operation actually succeeds.

==================================================
18. CONFIRMATION DIALOGS
==================================================

For destructive/sensitive actions:

- Deactivate Librarian
- Suspend Member
- Delete Book
- Delete Department
- Delete Study Folder
- Remove Book from Folder

show confirmation dialogs.

Do not execute immediately.

==================================================
19. PDF READER REQUIREMENT
==================================================

Create one reusable PDF reader component instead of implementing different broken readers on every page.

Example:

<PDFReader
    fileUrl={...}
    title={...}
    allowDownload={true}
    allowFullscreen={true}
/>

Use this component in:

- Admin e-book page
- Librarian e-book page
- Student/Staff e-book page
- My Books → Read E-book
- Study Folder → Read

The component must support:

- open
- close
- page navigation
- zoom
- fullscreen
- download

Keep the existing visual design.

==================================================
20. STUDY FOLDER COMPONENTS
==================================================

Create/reuse reusable components:

StudyFolderList
StudyFolderDetails
AddBookToFolderModal
AddNoteModal

Ensure folder changes are reflected immediately.

Example:

Add Book
↓
Save
↓
Folder count updates
↓
Book appears in folder

Add Note
↓
Save
↓
Note appears in folder

==================================================
21. NOTIFICATION SYSTEM
==================================================

For:

Notify Librarian
Notify Student

use the existing notification UI/system if present.

If not present, implement a simple notification state/API interface.

Notifications should include:

- recipient
- title
- message
- type
- related entity
- timestamp
- read/unread

==================================================
22. DO NOT BREAK EXISTING FEATURES
==================================================

While fixing these problems:

DO NOT break:

- login
- role-based routing
- dashboards
- book search
- book filtering
- fine display
- payment UI
- return workflow
- renewal workflow
- AI UI
- notifications
- analytics
- navigation
- existing responsive layout

Preserve existing working functionality.

==================================================
23. MOCK DATA
==================================================

The application currently contains mock/demo data.

Do not introduce additional mock data to solve these problems.

If backend APIs are already connected:

→ use real API data.

If backend is not yet connected:

→ keep the existing data/service abstraction and implement proper service functions that can be connected to the backend.

Do not create another layer of hardcoded fake data.

==================================================
24. FINAL TESTING
==================================================

After implementation, test every action manually through the UI.

ADMIN:

✓ Add Book
✓ Import Book
✓ View Book
✓ Edit Book
✓ View Inventory
✓ Add E-book
✓ Read PDF
✓ Fullscreen
✓ Download
✓ Add Department
✓ View Department
✓ Edit Department
✓ Manage Librarians
✓ Add Librarian
✓ View Librarian Profile
✓ Edit Librarian
✓ Assign Department
✓ Deactivate Librarian
✓ Add Member
✓ Import Members
✓ View Member
✓ Edit Member
✓ Suspend Member

Verify Admin DOES NOT see:

✓ Add to Study Folder
✓ Bookmark
✓ Ask AI About This Book
✓ Notify Librarian
✓ Mark as Received
✓ Notify Student

LIBRARIAN:

✓ My Library Books
✓ Edit Book
✓ Manage Copies
✓ Read PDF
✓ Fullscreen
✓ Download
✓ Notify Librarian
✓ Mark as Received
✓ Notify Student
✓ Renewal approval workflow

Verify Librarian DOES NOT see:

✓ Add New Book in My Library Books
✓ Add to Study Folder
✓ Bookmark
✓ Ask AI About This Book

STUDENT:

✓ My Books
✓ Renew
✓ Read E-book
✓ Add to Folder
✓ Study Folder
✓ Read
✓ Add Book
✓ Add Note
✓ Bookmark
✓ Ask AI About This Book

STAFF:

✓ My Books
✓ Renew
✓ Read E-book
✓ Add to Folder
✓ Study Folder
✓ Read
✓ Add Book
✓ Add Note
✓ Bookmark
✓ Ask AI About This Book

==================================================
25. FINAL REQUIREMENT
==================================================

Do not just make the buttons visually clickable.

Every listed button must perform its intended action.

For every action verify:

CLICK
→ EVENT
→ VALIDATION
→ STATE/API UPDATE
→ DATABASE/API RESPONSE WHERE AVAILABLE
→ UI UPDATE
→ SUCCESS/ERROR FEEDBACK

After fixing everything, provide a concise summary of:

1. What was fixed.
2. Which components/routes were modified.
3. Which role permissions were changed.
4. Which API/service functions were added or connected.
5. Any remaining backend dependency.

Do not redesign the application.

Fix the existing application while preserving its current visual design.