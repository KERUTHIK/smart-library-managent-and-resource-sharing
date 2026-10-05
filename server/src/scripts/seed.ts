import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import {
  User,
  Department,
  Library,
  LibrarianProfile,
  Book,
  BookCopy,
  EBook,
  BorrowRequest,
  BorrowTransaction,
  ReturnTransaction,
  RenewalRequest,
  TransferRequest,
  Fine,
  Payment,
  StudyFolder,
  StudyFolderItem,
  StudyNote,
  Bookmark,
  WaitlistEntry,
  Notification,
  AIConversation,
  AIMessage,
  AuditLog,
} from "../models/index.js";
import {
  UserRole,
  UserStatus,
  LibraryType,
  BookCopyStatus,
  BookCondition,
  BorrowRequestStatus,
  TransferStatus,
  BorrowTransactionStatus,
  RenewalStatus,
  FineStatus,
  PaymentMethod,
  PaymentStatus,
  WaitlistStatus,
  NotificationType,
  AuditAction,
} from "../constants/index.js";

export async function seedDatabase() {
  console.log("🌱 Starting LibSync database seeding...");

  await connectDatabase();

  // Clear existing collections
  console.log("🧹 Clearing old collections...");
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Library.deleteMany({}),
    LibrarianProfile.deleteMany({}),
    Book.deleteMany({}),
    BookCopy.deleteMany({}),
    EBook.deleteMany({}),
    BorrowRequest.deleteMany({}),
    BorrowTransaction.deleteMany({}),
    ReturnTransaction.deleteMany({}),
    RenewalRequest.deleteMany({}),
    TransferRequest.deleteMany({}),
    Fine.deleteMany({}),
    Payment.deleteMany({}),
    StudyFolder.deleteMany({}),
    StudyFolderItem.deleteMany({}),
    StudyNote.deleteMany({}),
    Bookmark.deleteMany({}),
    WaitlistEntry.deleteMany({}),
    Notification.deleteMany({}),
    AIConversation.deleteMany({}),
    AIMessage.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("demo123", 10);

  // ── 1. DEPARTMENTS ────────────────────────────────────────────────────────
  console.log("🏛️  Creating 12 academic departments...");
  const rawDepts = [
    { name: "Computer Science", code: "CSE", icon: "🖥️", head: "Dr. Priya Sharma" },
    { name: "Electronics & Comm", code: "ECE", icon: "⚡", head: "Dr. Rajesh Nair" },
    { name: "Mechanical Eng", code: "ME", icon: "⚙️", head: "Dr. Suresh Kumar" },
    { name: "Civil Engineering", code: "CE", icon: "🏗️", head: "Dr. Anitha Rao" },
    { name: "Electrical Eng", code: "EE", icon: "💡", head: "Dr. Mohan Das" },
    { name: "Mathematics", code: "MATH", icon: "∑", head: "Dr. Kavitha Pillai" },
    { name: "Physics", code: "PHY", icon: "🔬", head: "Dr. Arjun Singh" },
    { name: "Chemistry", code: "CHEM", icon: "⚗️", head: "Dr. Deepa Nair" },
    { name: "Management", code: "MBA", icon: "📊", head: "Dr. Vikram Reddy" },
    { name: "Biotechnology", code: "BIO", icon: "🧬", head: "Dr. Sneha Patel" },
    { name: "Information Technology", code: "IT", icon: "💻", head: "Dr. Kiran Menon" },
    { name: "Humanities", code: "HUM", icon: "📚", head: "Dr. Divya Kumar" },
  ];

  const deptsMap = new Map<string, any>();

  for (const d of rawDepts) {
    const dept = await Department.create({
      name: d.name,
      code: d.code,
      icon: d.icon,
      libraryName: `${d.code} Library`,
      head: d.head,
      description: `Department of ${d.name}`,
      status: "active",
    });
    deptsMap.set(d.code, dept);
  }

  // ── 2. LIBRARIES ──────────────────────────────────────────────────────────
  console.log("📖 Creating Central and Departmental Libraries...");
  const centralLibrary = await Library.create({
    name: "Central Library",
    code: "CENTRAL-LIB",
    type: LibraryType.CENTRAL,
    location: "Dr. APJ Abdul Kalam Knowledge Centre",
    shelfPrefixes: ["A", "B", "C", "D"],
    status: "active",
  });

  const libMap = new Map<string, any>();
  libMap.set("CENTRAL", centralLibrary);

  for (const [code, dept] of deptsMap.entries()) {
    const lib = await Library.create({
      name: `${code} Library`,
      code: `LIB-${code}`,
      type: LibraryType.DEPARTMENT,
      departmentId: dept._id,
      location: `${dept.name} Block, 2nd Floor`,
      shelfPrefixes: ["A", "B"],
      status: "active",
    });
    libMap.set(code, lib);
  }

  // ── 3. USERS (Admin, Librarians, Students, Faculty) ───────────────────────
  console.log("👥 Creating users & accounts...");
  const cseDept = deptsMap.get("CSE");
  const eceDept = deptsMap.get("ECE");
  const meDept = deptsMap.get("ME");
  const itDept = deptsMap.get("IT");

  // Admin
  const adminUser = await User.create({
    name: "Dr. K. S. Ramanathan",
    email: "admin@libsync.edu",
    collegeId: "ADM-001",
    passwordHash,
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    departmentId: cseDept._id,
    departmentName: "Administration",
    phone: "+91 98400 00001",
  });

  // Chief Librarian (CSE)
  const cseLibrarian = await User.create({
    name: "Mr. Rajesh Kumar",
    email: "librarian@libsync.edu",
    collegeId: "LIB-CSE-001",
    passwordHash,
    role: UserRole.LIBRARIAN,
    status: UserStatus.ACTIVE,
    departmentId: cseDept._id,
    departmentName: cseDept.name,
    phone: "+91 98400 11234",
  });

  // Secondary Librarians
  const eceLibrarian = await User.create({
    name: "Ms. Priya Nair",
    email: "priya.nair@libsync.edu",
    collegeId: "LIB-ECE-001",
    passwordHash,
    role: UserRole.LIBRARIAN,
    status: UserStatus.ACTIVE,
    departmentId: eceDept._id,
    departmentName: eceDept.name,
    phone: "+91 98400 22345",
  });

  const meLibrarian = await User.create({
    name: "Mr. Mohammed Ali",
    email: "mohammed.ali@libsync.edu",
    collegeId: "LIB-ME-001",
    passwordHash,
    role: UserRole.LIBRARIAN,
    status: UserStatus.ACTIVE,
    departmentId: meDept._id,
    departmentName: meDept.name,
    phone: "+91 98400 33456",
  });

  // Librarian Profiles
  await LibrarianProfile.create([
    {
      userId: cseLibrarian._id,
      empId: "LIB-CSE-001",
      departmentId: cseDept._id,
      libraryId: libMap.get("CSE")._id,
      joined: "Jan 2016",
      experience: "8 yrs",
      status: "Active",
      booksManaged: 4218,
      requestsProcessed: 1284,
      transfersCompleted: 86,
      fineActions: 42,
      recentActivity: [
        "Approved book request from Arun Kumar",
        "Transferred 2 copies to ECE Library",
        "Waived fine for Sneha Pillai",
      ],
    },
    {
      userId: eceLibrarian._id,
      empId: "LIB-ECE-001",
      departmentId: eceDept._id,
      libraryId: libMap.get("ECE")._id,
      joined: "Jan 2018",
      experience: "6 yrs",
      status: "Active",
      booksManaged: 3102,
      requestsProcessed: 941,
      transfersCompleted: 64,
      fineActions: 28,
      recentActivity: [
        "Processed 5 new book requests",
        "Updated catalog records",
        "Issued reminder for overdue books",
      ],
    },
    {
      userId: meLibrarian._id,
      empId: "LIB-ME-001",
      departmentId: meDept._id,
      libraryId: libMap.get("ME")._id,
      joined: "Mar 2017",
      experience: "7 yrs",
      status: "Active",
      booksManaged: 3562,
      requestsProcessed: 842,
      transfersCompleted: 52,
      fineActions: 18,
      recentActivity: [
        "Approved transfer request",
        "Catalogued new arrivals",
        "Processed fine payment",
      ],
    },
  ]);

  // Primary Student: Arun Kumar
  const studentUser = await User.create({
    name: "Arun Kumar",
    email: "student@libsync.edu",
    collegeId: "CSE2023-0176",
    passwordHash,
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    departmentId: cseDept._id,
    departmentName: cseDept.name,
    phone: "+91 98400 99881",
    yearOfStudy: "3rd Year, B.Tech CSE",
    bio: "Passionate about Distributed Systems, Database Internals, and AI/ML.",
  });

  // Additional Students & Faculty
  const studentPriya = await User.create({
    name: "Priya Nair",
    email: "priya.nair@student.libsync.edu",
    collegeId: "ECE2023-0214",
    passwordHash,
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    departmentId: eceDept._id,
    departmentName: eceDept.name,
    phone: "+91 98400 99882",
  });

  const studentSneha = await User.create({
    name: "Sneha Patel",
    email: "sneha.patel@student.libsync.edu",
    collegeId: "ECE2023-0876",
    passwordHash,
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    departmentId: eceDept._id,
    departmentName: eceDept.name,
    phone: "+91 98400 99883",
  });

  const facultyRajesh = await User.create({
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@libsync.edu",
    collegeId: "STAFF-0012",
    passwordHash,
    role: UserRole.FACULTY,
    status: UserStatus.ACTIVE,
    departmentId: cseDept._id,
    departmentName: cseDept.name,
    phone: "+91 98400 99884",
  });

  const studentKiran = await User.create({
    name: "Kiran Reddy",
    email: "kiran.reddy@student.libsync.edu",
    collegeId: "IT2024-0318",
    passwordHash,
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    departmentId: itDept._id,
    departmentName: itDept.name,
    phone: "+91 98400 99885",
  });

  // ── 4. CATALOG BOOKS & COPIES ─────────────────────────────────────────────
  console.log("📚 Cataloging textbooks and generating physical copies...");
  const rawBooks = [
    {
      title: "Database Management Systems",
      author: "Raghu Ramakrishnan & Johannes Gehrke",
      isbn: "978-0072465631",
      category: "Computer Science",
      subject: "Databases",
      edition: "3rd",
      publisher: "McGraw-Hill",
      publicationYear: 2002,
      deptCode: "CSE",
      shelf: "A-12",
      cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=280&fit=crop",
      rating: 4.8,
      copies: 5,
    },
    {
      title: "Computer Networks",
      author: "Andrew S. Tanenbaum & David J. Wetherall",
      isbn: "978-0132126953",
      category: "Computer Science",
      subject: "Networking",
      edition: "5th",
      publisher: "Pearson",
      publicationYear: 2010,
      deptCode: "CSE",
      shelf: "A-14",
      cover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=280&fit=crop",
      rating: 4.9,
      copies: 4,
    },
    {
      title: "Operating System Concepts",
      author: "Abraham Silberschatz, Peter B. Galvin & Greg Gagne",
      isbn: "978-1118063330",
      category: "Computer Science",
      subject: "Systems",
      edition: "9th",
      publisher: "Wiley",
      publicationYear: 2012,
      deptCode: "CSE",
      shelf: "A-08",
      cover: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=200&h=280&fit=crop",
      rating: 4.7,
      copies: 4,
    },
    {
      title: "Artificial Intelligence: A Modern Approach",
      author: "Stuart Russell & Peter Norvig",
      isbn: "978-0134610993",
      category: "Computer Science",
      subject: "Artificial Intelligence",
      edition: "4th",
      publisher: "Pearson",
      publicationYear: 2020,
      deptCode: "CSE",
      shelf: "B-03",
      cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=280&fit=crop",
      rating: 4.9,
      copies: 3,
    },
    {
      title: "Introduction to Algorithms",
      author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest & Clifford Stein",
      isbn: "978-0262033848",
      category: "Computer Science",
      subject: "Algorithms",
      edition: "3rd",
      publisher: "MIT Press",
      publicationYear: 2009,
      deptCode: "CSE",
      shelf: "B-01",
      cover: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=200&h=280&fit=crop",
      rating: 4.9,
      copies: 6,
    },
    {
      title: "Signals and Systems",
      author: "Alan V. Oppenheim & Alan S. Willsky",
      isbn: "978-0138147570",
      category: "Electronics",
      subject: "Signal Processing",
      edition: "2nd",
      publisher: "Prentice Hall",
      publicationYear: 1996,
      deptCode: "ECE",
      shelf: "C-05",
      cover: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&h=280&fit=crop",
      rating: 4.6,
      copies: 4,
    },
    {
      title: "Basic VLSI Design",
      author: "Douglas A. Pucknell & Kamran Eshraghian",
      isbn: "978-8120309869",
      category: "Electronics",
      subject: "VLSI",
      edition: "3rd",
      publisher: "PHI Learning",
      publicationYear: 2009,
      deptCode: "ECE",
      shelf: "C-11",
      cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=280&fit=crop",
      rating: 4.5,
      copies: 3,
    },
    {
      title: "Thermodynamics: An Engineering Approach",
      author: "Yunus A. Çengel & Michael A. Boles",
      isbn: "978-0073398174",
      category: "Mechanical",
      subject: "Thermodynamics",
      edition: "8th",
      publisher: "McGraw-Hill",
      publicationYear: 2014,
      deptCode: "ME",
      shelf: "D-02",
      cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=280&fit=crop",
      rating: 4.8,
      copies: 4,
    },
    {
      title: "Structural Analysis",
      author: "Russell C. Hibbeler",
      isbn: "978-0134610672",
      category: "Civil",
      subject: "Structures",
      edition: "10th",
      publisher: "Pearson",
      publicationYear: 2017,
      deptCode: "CE",
      shelf: "E-04",
      cover: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&h=280&fit=crop",
      rating: 4.7,
      copies: 3,
    },
  ];

  const createdBooks = [];
  const allCreatedCopies = [];

  for (const b of rawBooks) {
    const dept = deptsMap.get(b.deptCode);
    const lib = libMap.get(b.deptCode);

    const book = await Book.create({
      title: b.title,
      normalizedTitle: b.title.toLowerCase().trim(),
      author: b.author,
      normalizedAuthor: b.author.toLowerCase().trim(),
      isbn: b.isbn,
      edition: b.edition,
      publisher: b.publisher,
      publicationYear: b.publicationYear,
      category: b.category,
      subject: b.subject,
      description: `Comprehensive academic standard textbook for undergraduate and postgraduate engineering courses. Covers core principles, worked examples, and practical applications.`,
      departmentId: dept._id,
      departmentName: dept.name,
      totalCopies: b.copies,
      availableCopies: b.copies - 1, // 1 copy issued out
      shelfLocation: b.shelf,
      coverImage: b.cover,
      rating: b.rating,
      loanPeriodDays: 14,
      hasEbook: true,
      keywords: [b.subject, b.category, "Engineering", "Textbook"],
    });

    createdBooks.push(book);

    // Create physical copies
    for (let i = 1; i <= b.copies; i++) {
      const copyNum = String(i).padStart(2, "0");
      const copyCode = `${b.isbn.slice(-4)}-${copyNum}`;
      const barcode = `BC-${Math.floor(100000 + Math.random() * 900000)}`;

      // Let first copy be allocated to Central Library, rest to Dept
      const assignedLib = i === 1 ? centralLibrary : lib;

      const copy = await BookCopy.create({
        bookId: book._id,
        bookTitle: book.title,
        copyCode,
        barcode,
        accessionNumber: `ACC-${Math.floor(10000 + Math.random() * 90000)}`,
        libraryId: assignedLib._id,
        libraryName: assignedLib.name,
        departmentId: dept._id,
        departmentName: dept.name,
        shelfLocation: b.shelf,
        condition: BookCondition.GOOD,
        status: i === 1 ? BookCopyStatus.BORROWED : BookCopyStatus.AVAILABLE,
      });

      allCreatedCopies.push(copy);
    }
  }

  // ── 5. E-BOOKS ────────────────────────────────────────────────────────────
  console.log("📱 Seeding digital e-books catalog...");
  const rawEbooks = [
    {
      title: "Cloud Computing: Concepts, Technology & Architecture",
      author: "Thomas Erl, Ricardo Puttini & Zaigham Mahmood",
      subject: "Cloud Architecture",
      category: "Computer Science",
      deptCode: "CSE",
      pages: 524,
      size: "14.2 MB",
      cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=160&h=220&fit=crop",
    },
    {
      title: "Deep Learning with Python",
      author: "François Chollet",
      subject: "Deep Learning",
      category: "Computer Science",
      deptCode: "CSE",
      pages: 384,
      size: "18.6 MB",
      cover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=160&h=220&fit=crop",
    },
    {
      title: "Clean Architecture: A Craftsman's Guide",
      author: "Robert C. Martin",
      subject: "Software Engineering",
      category: "Computer Science",
      deptCode: "IT",
      pages: 432,
      size: "12.8 MB",
      cover: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=160&h=220&fit=crop",
    },
    {
      title: "Modern Control Engineering",
      author: "Katsuhiko Ogata",
      subject: "Control Systems",
      category: "Electronics",
      deptCode: "EE",
      pages: 912,
      size: "26.4 MB",
      cover: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=160&h=220&fit=crop",
    },
  ];

  const createdEbooks = [];
  for (const e of rawEbooks) {
    const dept = deptsMap.get(e.deptCode);
    const ebook = await EBook.create({
      title: e.title,
      normalizedTitle: e.title.toLowerCase().trim(),
      author: e.author,
      normalizedAuthor: e.author.toLowerCase().trim(),
      category: e.category,
      subject: e.subject,
      description: `Authoritative digital reference handbook and textbook for student revision and research.`,
      language: "English",
      keywords: [e.subject, "E-Book", "Digital Library"],
      coverImage: e.cover,
      pdfPath: "uploads/sample-digital-book.pdf",
      fileSize: e.size,
      pageCount: e.pages,
      departmentId: dept._id,
      departmentName: dept.name,
      rating: 4.9,
      readCount: 142,
      isAiExtracted: true,
      createdBy: adminUser._id,
    });
    createdEbooks.push(ebook);
  }

  // ── 6. ACTIVE BORROWINGS & OVERDUES ───────────────────────────────────────
  console.log("🤝 Generating active borrow transactions & overdue loans...");
  const dbBook = createdBooks[0]; // Database Management Systems
  const netBook = createdBooks[1]; // Computer Networks
  const osBook = createdBooks[2];  // Operating System Concepts
  const sigBook = createdBooks[5]; // Signals and Systems

  const now = new Date();

  // Active Loan 1 for Arun Kumar (Database Management Systems - Due in 6 days)
  const dbCopy = allCreatedCopies.find((c) => c.bookId.equals(dbBook._id));
  const loan1DueDate = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
  const trans1 = await BorrowTransaction.create({
    transactionId: "BRW-1024",
    bookId: dbBook._id,
    bookTitle: dbBook.title,
    bookAuthor: dbBook.author,
    bookIsbn: dbBook.isbn,
    bookCover: dbBook.coverImage,
    bookCopyId: dbCopy!._id,
    copyCode: dbCopy!.copyCode,
    barcode: dbCopy!.barcode,
    userId: studentUser._id,
    userName: studentUser.name,
    userCollegeId: studentUser.collegeId,
    userDepartmentName: studentUser.departmentName,
    userEmail: studentUser.email,
    departmentId: cseDept._id,
    libraryId: libMap.get("CSE")._id,
    libraryName: "CSE Library",
    shelfLocation: dbBook.shelfLocation,
    issuedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    dueDate: loan1DueDate,
    status: BorrowTransactionStatus.ACTIVE,
    renewalCount: 0,
    maxRenewals: 2,
    issuedBy: cseLibrarian._id,
  });

  // Active Loan 2 for Arun Kumar (Computer Networks - Due in 2 days)
  const netCopy = allCreatedCopies.find((c) => c.bookId.equals(netBook._id));
  const loan2DueDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const trans2 = await BorrowTransaction.create({
    transactionId: "BRW-1025",
    bookId: netBook._id,
    bookTitle: netBook.title,
    bookAuthor: netBook.author,
    bookIsbn: netBook.isbn,
    bookCover: netBook.coverImage,
    bookCopyId: netCopy!._id,
    copyCode: netCopy!.copyCode,
    barcode: netCopy!.barcode,
    userId: studentUser._id,
    userName: studentUser.name,
    userCollegeId: studentUser.collegeId,
    userDepartmentName: studentUser.departmentName,
    userEmail: studentUser.email,
    departmentId: cseDept._id,
    libraryId: libMap.get("CSE")._id,
    libraryName: "CSE Library",
    shelfLocation: netBook.shelfLocation,
    issuedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
    dueDate: loan2DueDate,
    status: BorrowTransactionStatus.ACTIVE,
    renewalCount: 0,
    maxRenewals: 2,
    issuedBy: cseLibrarian._id,
  });

  // Overdue Loan for Sneha Patel (Signals and Systems - 7 days overdue)
  const sigCopy = allCreatedCopies.find((c) => c.bookId.equals(sigBook._id));
  const overdueDueDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const transOverdue = await BorrowTransaction.create({
    transactionId: "BRW-1020",
    bookId: sigBook._id,
    bookTitle: sigBook.title,
    bookAuthor: sigBook.author,
    bookIsbn: sigBook.isbn,
    bookCover: sigBook.coverImage,
    bookCopyId: sigCopy!._id,
    copyCode: sigCopy!.copyCode,
    barcode: sigCopy!.barcode,
    userId: studentSneha._id,
    userName: studentSneha.name,
    userCollegeId: studentSneha.collegeId,
    userDepartmentName: studentSneha.departmentName,
    userEmail: studentSneha.email,
    departmentId: eceDept._id,
    libraryId: libMap.get("ECE")._id,
    libraryName: "ECE Library",
    shelfLocation: sigBook.shelfLocation,
    issuedAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
    dueDate: overdueDueDate,
    status: BorrowTransactionStatus.ACTIVE,
    daysOverdue: 7,
    fineAmount: 35,
    issuedBy: eceLibrarian._id,
  });

  // ── 7. FINES & PAYMENTS ───────────────────────────────────────────────────
  console.log("💰 Creating institutional fines and recorded payments...");
  // Unpaid fine for Sneha Patel
  await Fine.create({
    fineId: "FIN-3041",
    userId: studentSneha._id,
    studentName: studentSneha.name,
    studentCollegeId: studentSneha.collegeId,
    studentEmail: studentSneha.email,
    departmentId: eceDept._id,
    departmentName: eceDept.name,
    bookId: sigBook._id,
    bookTitle: sigBook.title,
    bookCover: sigBook.coverImage,
    borrowTransactionId: transOverdue._id,
    dueDate: overdueDueDate,
    daysOverdue: 7,
    dailyRate: 5,
    amount: 35,
    status: FineStatus.PENDING,
  });

  // Past Paid Fine for Arun Kumar
  const pastPaidFine = await Fine.create({
    fineId: "FIN-2018",
    userId: studentUser._id,
    studentName: studentUser.name,
    studentCollegeId: studentUser.collegeId,
    studentEmail: studentUser.email,
    departmentId: cseDept._id,
    departmentName: cseDept.name,
    bookId: osBook._id,
    bookTitle: osBook.title,
    bookCover: osBook.coverImage,
    dueDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
    daysOverdue: 3,
    dailyRate: 5,
    amount: 15,
    status: FineStatus.PAID,
    paidDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
    paymentMethod: PaymentMethod.UPI,
    paymentTransactionId: "TXN-UPI-98421049",
  });

  await Payment.create({
    transactionId: "TXN-UPI-98421049",
    fineId: pastPaidFine._id,
    userId: studentUser._id,
    userName: studentUser.name,
    userEmail: studentUser.email,
    bookTitle: osBook.title,
    amount: 15,
    method: PaymentMethod.UPI,
    providerTxnId: "upi_mock_88194",
    paidAt: pastPaidFine.paidDate,
  });

  // ── 8. BORROW REQUESTS & INTER-DEPT TRANSFERS ─────────────────────────────
  console.log("🚚 Creating active borrow requests & transfer workflows...");
  // Pending request for Arun Kumar (Introduction to Algorithms)
  const algoBook = createdBooks[4];
  await BorrowRequest.create({
    requestId: "REQ-8412",
    studentId: studentUser._id,
    studentName: studentUser.name,
    studentCollegeId: studentUser.collegeId,
    studentDepartmentId: cseDept._id,
    studentDepartmentName: cseDept.name,
    bookId: algoBook._id,
    bookTitle: algoBook.title,
    pickupLibraryId: libMap.get("CSE")._id,
    pickupLibraryName: "CSE Library",
    status: BorrowRequestStatus.PENDING,
    availabilityNote: "Available in CSE Library",
    aiRecommendation: {
      action: "AUTO_APPROVE",
      reason: "Copy available in own department library (CSE).",
    },
  });

  // Active Transfer Request from Central Library to ECE Library
  await TransferRequest.create({
    transferId: "TRF-1024",
    bookId: dbBook._id,
    bookTitle: dbBook.title,
    studentId: studentPriya._id,
    studentName: studentPriya.name,
    studentDept: studentPriya.departmentName,
    sourceDepartmentId: cseDept._id,
    sourceDepartmentName: "Central Library",
    sourceLibraryId: centralLibrary._id,
    sourceLibraryName: "Central Library",
    targetDepartmentId: eceDept._id,
    targetDepartmentName: eceDept.name,
    targetLibraryId: libMap.get("ECE")._id,
    targetLibraryName: "ECE Library",
    status: TransferStatus.IN_TRANSIT,
    statusLabel: "In Transit",
    requestDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    steps: [
      { label: "Transfer initiated", done: true, active: false },
      { label: "Dispatch from Central Library", done: true, active: false },
      { label: "Received by ECE Library", done: false, active: true },
      { label: "Available for pickup", done: false, active: false },
    ],
  });

  // ── 9. STUDY FOLDERS & NOTES ──────────────────────────────────────────────
  console.log("📁 Creating student study folders and notes...");
  const folder1 = await StudyFolder.create({
    userId: studentUser._id,
    name: "Machine Learning & AI",
    description: "Core algorithms, gradient descent, neural networks and lecture notes.",
    emoji: "🤖",
    color: "teal",
    bookCount: 2,
  });

  await StudyFolderItem.create([
    {
      folderId: folder1._id,
      userId: studentUser._id,
      itemType: "book",
      bookId: createdBooks[3]._id, // AI Modern Approach
      title: createdBooks[3].title,
      author: createdBooks[3].author,
      coverImage: createdBooks[3].coverImage,
      isEbook: false,
    },
    {
      folderId: folder1._id,
      userId: studentUser._id,
      itemType: "ebook",
      ebookId: createdEbooks[1]._id, // Deep Learning with Python
      title: createdEbooks[1].title,
      author: createdEbooks[1].author,
      coverImage: createdEbooks[1].coverImage,
      isEbook: true,
    },
  ]);

  await StudyNote.create([
    {
      folderId: folder1._id,
      userId: studentUser._id,
      title: "Gradient Descent Optimization",
      content: "Update rule: θ = θ - α∇J(θ). Learning rate α controls step size. Too high causes divergence, too low causes slow convergence.",
    },
    {
      folderId: folder1._id,
      userId: studentUser._id,
      title: "Bias-Variance Tradeoff",
      content: "High bias leads to underfitting. High variance leads to overfitting. Regularization (L1/L2) balances the sweet spot.",
    },
  ]);

  const folder2 = await StudyFolder.create({
    userId: studentUser._id,
    name: "Database Systems Prep",
    description: "Relational algebra, B+ trees, ACID properties and normalization.",
    emoji: "🗄️",
    color: "indigo",
    bookCount: 1,
  });

  await StudyFolderItem.create({
    folderId: folder2._id,
    userId: studentUser._id,
    itemType: "book",
    bookId: dbBook._id,
    title: dbBook.title,
    author: dbBook.author,
    coverImage: dbBook.coverImage,
    isEbook: false,
  });

  // ── 10. NOTIFICATIONS ─────────────────────────────────────────────────────
  console.log("🔔 Creating live notifications...");
  await Notification.create([
    {
      userId: studentUser._id,
      type: NotificationType.BOOK_ISSUED,
      uiType: "success",
      title: "Book Issued Successfully",
      message: `"${dbBook.title}" was issued to you. Due on ${loan1DueDate.toLocaleDateString("en-GB")}.`,
      read: false,
    },
    {
      userId: studentUser._id,
      type: NotificationType.DUE_SOON,
      uiType: "warning",
      title: "Book Due Soon",
      message: `"${netBook.title}" is due in 2 days. Remember to return or renew.`,
      read: false,
    },
    {
      userId: studentUser._id,
      type: NotificationType.PAYMENT_SUCCESS,
      uiType: "info",
      title: "Fine Payment Receipt",
      message: "Payment of ₹15 received via UPI for Operating System Concepts.",
      read: true,
    },
  ]);

  // ── 11. AUDIT LOGS ────────────────────────────────────────────────────────
  console.log("📜 Writing initial audit trail...");
  await AuditLog.create([
    {
      actorName: "Dr. K. S. Ramanathan",
      actorRole: "ADMIN",
      action: AuditAction.USER_LOGIN,
      resourceType: "System",
      details: "Admin initialized institutional catalog.",
    },
    {
      actorName: "Mr. Rajesh Kumar",
      actorRole: "LIBRARIAN",
      action: AuditAction.BOOK_COPY_ISSUED,
      resourceType: "BookCopy",
      details: `Issued copy of "${dbBook.title}" to student Arun Kumar.`,
    },
    {
      actorName: "System",
      actorRole: "System",
      action: AuditAction.FINE_GENERATED,
      resourceType: "Fine",
      details: `Overdue penalty ₹35 assessed for student Sneha Patel.`,
    },
  ]);

  console.log("✅ LibSync Database Seeding Completed Successfully!");
  console.log("---------------------------------------------------");
  console.log("Demo Accounts Available:");
  console.log("Admin:     admin@libsync.edu     / demo123");
  console.log("Librarian: librarian@libsync.edu / demo123");
  console.log("Student:   student@libsync.edu   / demo123");
  console.log("---------------------------------------------------");
}

// Auto-run if executed directly via tsx
if (process.argv[1]?.includes("seed.ts")) {
  seedDatabase()
    .then(async () => {
      await disconnectDatabase();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("❌ Seeding failed:", err);
      await disconnectDatabase();
      process.exit(1);
    });
}
