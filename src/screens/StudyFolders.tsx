import React, { useState, useEffect } from "react";
import { studyFoldersApi, booksApi } from "../api/client";
import { Card, Button, Modal, Input, Textarea, Badge } from "../components/ui";

const FOLDER_COLORS: Record<string, string> = {
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  teal: "bg-teal-100 text-teal-700 border-teal-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
};

const FOLDER_BG: Record<string, string> = {
  indigo: "bg-indigo-50",
  teal: "bg-teal-50",
  blue: "bg-blue-50",
  amber: "bg-amber-50",
};

interface Note {
  _id?: string;
  title: string;
  content: string;
  date: string;
}

interface FolderBook {
  id: string;
  title: string;
  author: string;
  cover: string;
  ebook: boolean;
}

interface Folder {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  bookCount: number;
  books: string[];
  notes: Note[];
  folderBooks: FolderBook[];
}

export default function StudyFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selected, setSelected] = useState<Folder | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeInnerTab, setActiveInnerTab] = useState("books");
  const [loading, setLoading] = useState(true);

  // Add Note modal
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });

  // Add Book modal
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const [availableBooks, setAvailableBooks] = useState<any[]>([]);
  const [addBookToast, setAddBookToast] = useState<string | null>(null);

  // Reader (for ebooks in folder)
  const [readerBook, setReaderBook] = useState<FolderBook | null>(null);

  // Create folder state
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("teal");

  const loadFolders = () => {
    setLoading(true);
    studyFoldersApi
      .getFolders()
      .then((res) => {
        if (res.folders) {
          const mapped: Folder[] = res.folders.map((f: any) => ({
            id: f._id || f.id,
            name: f.name,
            description: f.description || "Coursework and research folder",
            emoji: f.emoji || "📁",
            color: f.color || "teal",
            bookCount: f.bookCount || (f.items ? f.items.length : 0),
            books: [],
            notes: (f.notes || []).map((n: any) => ({
              _id: n._id,
              title: n.title,
              content: n.content,
              date: new Date(n.createdAt || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            })),
            folderBooks: (f.items || []).map((item: any) => ({
              id: item.itemId || item._id,
              title: item.title,
              author: item.subtitle || "Author",
              cover: item.metadata?.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
              ebook: item.itemType === "ebook",
            })),
          }));
          setFolders(mapped);
          if (selected) {
            const updatedSel = mapped.find((x) => x.id === selected.id);
            if (updatedSel) setSelected(updatedSel);
          }
        }
      })
      .catch((err) => console.error("Error loading study folders:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFolders();
    booksApi.getBooks({ limit: 20 })
      .then((res) => {
        if (res.items) setAvailableBooks(res.items);
      })
      .catch(() => {});
  }, []);

  async function handleSelectFolder(f: Folder) {
    setSelected(f);
    setActiveInnerTab("books");
    try {
      const res = await studyFoldersApi.getFolderById(f.id);
      if (res.folder) {
        const enriched: Folder = {
          ...f,
          name: res.folder.name,
          description: res.folder.description || f.description,
          notes: (res.notes || []).map((n: any) => ({
            _id: n._id,
            title: n.title,
            content: n.content,
            date: new Date(n.createdAt || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          })),
          folderBooks: (res.items || []).map((i: any) => ({
            id: i.itemId || i._id,
            title: i.title,
            author: i.subtitle || "Author",
            cover: i.metadata?.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
            ebook: i.itemType === "ebook",
          })),
        };
        setSelected(enriched);
      }
    } catch (err) {
      console.error("Error loading folder details:", err);
    }
  }

  async function handleSaveNote() {
    if (!selected || !noteForm.title.trim()) return;
    try {
      await studyFoldersApi.addNote(selected.id, {
        title: noteForm.title,
        content: noteForm.content,
      });
      setNoteForm({ title: "", content: "" });
      setNoteOpen(false);
      setActiveInnerTab("notes");
      handleSelectFolder(selected);
      loadFolders();
    } catch (err: any) {
      alert(err.message || "Failed to add note");
    }
  }

  async function handleAddBook(book: any) {
    if (!selected) return;
    try {
      await studyFoldersApi.addItem(selected.id, {
        itemType: book.ebook ? "ebook" : "book",
        itemId: book.id || book._id,
        title: book.title,
        subtitle: book.author,
        metadata: { coverImage: book.cover },
      });
      setAddBookOpen(false);
      setBookSearch("");
      setAddBookToast(`"${book.title}" added to folder.`);
      setTimeout(() => setAddBookToast(null), 2500);
      handleSelectFolder(selected);
      loadFolders();
    } catch (err: any) {
      alert(err.message || "Failed to add book to folder");
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    try {
      await studyFoldersApi.createFolder({
        name: newFolderName,
        description: newFolderDesc,
        color: newFolderColor,
        emoji: "📁",
      });
      setNewFolderName("");
      setNewFolderDesc("");
      setCreateOpen(false);
      loadFolders();
    } catch (err: any) {
      alert(err.message || "Failed to create folder");
    }
  }

  const filteredBooks = availableBooks.filter(
    (b) =>
      !bookSearch ||
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase())
  );

  // PDF Reader view
  if (readerBook) {
    return (
      <div className="h-screen flex flex-col bg-[#f1f5f9]">
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#e2e8f0] shadow-sm">
          <Button variant="ghost" size="sm" onClick={() => setReaderBook(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            Back to Folder
          </Button>
          <p className="text-sm font-semibold text-[#0f1f3d]">{readerBook.title}</p>
          <Button variant="outline" size="sm" onClick={() => alert("Downloading digital copy...")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Download
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          <div className="w-full max-w-[680px] bg-white rounded-[14px] shadow-sm p-10">
            <p className="text-xs text-[#94a3b8] uppercase tracking-widest mb-6">Digital Campus Reader</p>
            <h2 className="text-xl font-bold mb-4 text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{readerBook.title}</h2>
            <p className="text-sm leading-7 text-[#374151]">
              Full text digital resource for <strong>{readerBook.title}</strong> by {readerBook.author}.
              Integrated with LibSync institutional e-reader service.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>My Study Folders</h1>
          <p className="text-[#64748b] mt-0.5">Organize your books, notes and AI summaries by topic</p>
        </div>
        <Button variant="accent" onClick={() => setCreateOpen(true)}>+ Create Folder</Button>
      </div>

      {!selected ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <Card
              key={folder.id}
              className="p-5 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSelectFolder(folder)}
            >
              <div className={`w-12 h-12 rounded-[12px] ${FOLDER_BG[folder.color] || "bg-teal-50"} flex items-center justify-center text-2xl mb-4`}>
                {folder.emoji}
              </div>
              <h3 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{folder.name}</h3>
              <p className="text-xs text-[#64748b] mt-1">{folder.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="text-[10px]">📚 {folder.folderBooks.length} books</Badge>
                <Badge variant="info" className="text-[10px]">📝 {folder.notes.length} notes</Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
              ← Back to Folders
            </Button>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-700">{selected.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2 border-b border-slate-200">
              <button
                onClick={() => setActiveInnerTab("books")}
                className={`pb-2 px-3 text-sm font-medium border-b-2 cursor-pointer ${activeInnerTab === "books" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500"}`}
              >
                Saved Books ({selected.folderBooks.length})
              </button>
              <button
                onClick={() => setActiveInnerTab("notes")}
                className={`pb-2 px-3 text-sm font-medium border-b-2 cursor-pointer ${activeInnerTab === "notes" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500"}`}
              >
                Notes & Summaries ({selected.notes.length})
              </button>
            </div>
            <div className="flex gap-2">
              {activeInnerTab === "books" ? (
                <Button variant="accent" size="sm" onClick={() => setAddBookOpen(true)}>+ Add Book</Button>
              ) : (
                <Button variant="accent" size="sm" onClick={() => setNoteOpen(true)}>+ Add Note</Button>
              )}
            </div>
          </div>

          {activeInnerTab === "books" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selected.folderBooks.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400">
                  <p>No books in this folder yet.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setAddBookOpen(true)}>Add Books</Button>
                </div>
              ) : (
                selected.folderBooks.map((b) => (
                  <Card key={b.id} className="p-4 flex flex-col justify-between">
                    <div>
                      <img src={b.cover} alt={b.title} className="w-full h-36 object-cover rounded-md mb-2" />
                      <p className="font-semibold text-xs text-slate-800 line-clamp-1">{b.title}</p>
                      <p className="text-[11px] text-slate-500">{b.author}</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setReaderBook(b)}>
                      Read E-Book
                    </Button>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeInnerTab === "notes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selected.notes.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400">
                  <p>No notes written in this folder yet.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setNoteOpen(true)}>Create First Note</Button>
                </div>
              ) : (
                selected.notes.map((n, i) => (
                  <Card key={n._id || i} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-slate-800">{n.title}</h4>
                      <span className="text-[10px] text-slate-400">{n.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{n.content}</p>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Folder Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Study Folder">
        <div className="space-y-4">
          <Input label="Folder Name" placeholder="e.g. Machine Learning Specialization" value={newFolderName} onChange={setNewFolderName} />
          <Textarea label="Description" placeholder="What will you study in this folder?" value={newFolderDesc} onChange={(e) => setNewFolderDesc(e.target.value)} />
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Color Theme</label>
            <div className="flex gap-3">
              {["teal", "indigo", "blue", "amber"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewFolderColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${FOLDER_BG[c]} ${newFolderColor === c ? "border-[#0d9488] ring-2 ring-[#0d9488]/30" : "border-transparent"}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" className="flex-1" onClick={handleCreateFolder}>Create Folder</Button>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Add Note Modal */}
      <Modal open={noteOpen} onClose={() => setNoteOpen(false)} title="Add Study Note">
        <div className="space-y-4">
          <Input label="Note Title" placeholder="e.g. Key formulas from Chapter 4" value={noteForm.title} onChange={(v) => setNoteForm((f) => ({ ...f, title: v }))} />
          <Textarea label="Content" placeholder="Write your notes, summaries, or review questions..." rows={5} value={noteForm.content} onChange={(e) => setNoteForm((f) => ({ ...f, content: e.target.value }))} />
          <div className="flex gap-2">
            <Button variant="primary" className="flex-1" onClick={handleSaveNote}>Save Note</Button>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Add Book Modal */}
      <Modal open={addBookOpen} onClose={() => setAddBookOpen(false)} title="Add Book to Study Folder">
        <div className="space-y-4">
          <Input placeholder="Search books in campus catalog..." value={bookSearch} onChange={setBookSearch} />
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredBooks.map((b) => (
              <div key={b.id || b._id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 border border-slate-100">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 truncate">{b.title}</p>
                  <p className="text-[11px] text-slate-500">{b.author}</p>
                </div>
                <Button variant="accent" size="sm" onClick={() => handleAddBook(b)}>Add</Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {addBookToast && (
        <div className="fixed bottom-6 right-6 bg-[#0f1f3d] text-white px-4 py-2.5 rounded-[10px] text-xs shadow-xl z-50">
          {addBookToast}
        </div>
      )}
    </div>
  );
}
