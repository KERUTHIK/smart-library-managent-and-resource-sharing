import React, { useState } from "react";
import { User } from "../data";
import { Card, Button, Input, Badge, Avatar, Tabs } from "../components/ui";

export default function Settings({ user }: { user: User }) {
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const sections = [
    { id: "profile", label: "Profile" },
    { id: "account", label: "Account" },
    { id: "notifications", label: "Notifications" },
    { id: "preferences", label: "Library Preferences" },
    { id: "privacy", label: "Privacy" },
    { id: "security", label: "Security" },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Settings</h1>
        <p className="text-[#64748b] mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <aside className="w-44 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-[8px] text-sm font-medium cursor-pointer transition-all ${activeSection === s.id ? "bg-[#1e3a5f] text-white" : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f1f3d]"}`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === "profile" && (
            <Card className="p-6 space-y-5">
              <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Profile Information</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar initials={user.avatar} size="lg" />
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0d9488] text-white flex items-center justify-center cursor-pointer text-xs">+</button>
                </div>
                <div>
                  <p className="font-semibold text-[#0f1f3d]">{user.name}</p>
                  <p className="text-xs text-[#64748b]">{user.email}</p>
                  <Badge variant="primary" className="mt-1 capitalize">{user.role}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" value={user.name} />
                <Input label="College ID" value={user.collegeId} />
                <Input label="Email Address" type="email" value={user.email} />
                <Input label="Department" value={user.department} />
                <Input label="Phone Number" placeholder="+91 XXXXXX XXXX" />
                <Input label="Year of Study" placeholder="e.g. 3rd Year" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0f1f3d] mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  placeholder="A short bio about yourself…"
                  className="w-full border border-[#e2e8f0] rounded-[10px] bg-white text-sm py-2.5 px-3.5 focus:outline-none focus:border-[#0d9488] resize-none"
                />
              </div>
              <Button variant="primary" onClick={save}>{saved ? "✓ Saved!" : "Save Changes"}</Button>
            </Card>
          )}

          {activeSection === "account" && (
            <Card className="p-6 space-y-5">
              <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Account Settings</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-[#f8fafc]">
                  <div>
                    <p className="text-sm font-medium text-[#0f1f3d]">Email Address</p>
                    <p className="text-xs text-[#64748b]">{user.email}</p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#f8fafc]">
                  <div>
                    <p className="text-sm font-medium text-[#0f1f3d]">Language</p>
                    <p className="text-xs text-[#64748b]">English (India)</p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-red-600">Delete Account</p>
                    <p className="text-xs text-[#64748b]">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="danger" size="sm">Delete</Button>
                </div>
              </div>
            </Card>
          )}

          {activeSection === "notifications" && (
            <Card className="p-6 space-y-4">
              <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Notification Preferences</h2>
              {[
                { label: "Due Date Reminders", sub: "Get notified 3 days before a book is due", checked: true },
                { label: "Request Status Updates", sub: "When your borrow request is approved or rejected", checked: true },
                { label: "Transfer Notifications", sub: "When your book transfer is complete", checked: true },
                { label: "Fine Alerts", sub: "When a fine is generated for an overdue book", checked: true },
                { label: "New Books Matching Interests", sub: "When new books matching your interests are added", checked: false },
                { label: "Weekly Reading Summary", sub: "A weekly digest of your reading progress", checked: false },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-[#f8fafc] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#0f1f3d]">{n.label}</p>
                    <p className="text-xs text-[#64748b]">{n.sub}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={n.checked} className="sr-only peer" />
                    <div className="w-10 h-5 bg-[#e2e8f0] peer-checked:bg-[#0d9488] rounded-full peer-focus:ring-2 peer-focus:ring-[#0d9488]/20 after:absolute after:left-0.5 after:top-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-sm peer-checked:after:translate-x-5 after:transition-transform" />
                  </label>
                </div>
              ))}
              <Button variant="primary" size="sm" onClick={save}>{saved ? "✓ Saved" : "Save Preferences"}</Button>
            </Card>
          )}

          {activeSection === "preferences" && (
            <Card className="p-6 space-y-5">
              <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Library Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0f1f3d] mb-2">Preferred Pickup Library</label>
                  <select className="w-full border border-[#e2e8f0] rounded-[10px] bg-white text-sm py-2.5 px-3 focus:outline-none focus:border-[#0d9488]">
                    <option>CSE Library</option>
                    <option>ECE Library</option>
                    <option>Main Library</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0f1f3d] mb-2">Reading Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {["Machine Learning", "Databases", "Networking", "Operating Systems", "Data Science", "Algorithms", "Web Development"].map((t) => (
                      <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" defaultChecked={["Machine Learning", "Databases", "Networking"].includes(t)} className="accent-[#0d9488]" />
                        <span className="text-sm text-[#64748b]">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={save}>{saved ? "✓ Saved" : "Save Preferences"}</Button>
            </Card>
          )}

          {activeSection === "security" && (
            <Card className="p-6 space-y-5">
              <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Security</h2>
              <div className="space-y-4">
                <Input label="Current Password" type="password" placeholder="••••••••" />
                <Input label="New Password" type="password" placeholder="••••••••" />
                <Input label="Confirm New Password" type="password" placeholder="••••••••" />
              </div>
              <div className="flex items-center justify-between py-3 border border-[#e2e8f0] rounded-[10px] px-4">
                <div>
                  <p className="text-sm font-medium text-[#0f1f3d]">Two-Factor Authentication</p>
                  <p className="text-xs text-[#64748b]">Add an extra layer of security to your account</p>
                </div>
                <Badge variant="secondary">Disabled</Badge>
              </div>
              <Button variant="primary" size="sm">Update Password</Button>
            </Card>
          )}

          {(activeSection === "privacy") && (
            <Card className="p-6 space-y-4">
              <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Privacy Settings</h2>
              {[
                { label: "Show Reading History to Librarians", checked: true },
                { label: "Allow AI to analyze my reading patterns", checked: true },
                { label: "Share anonymized data for library improvement", checked: false },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-[#f8fafc] last:border-0">
                  <p className="text-sm font-medium text-[#0f1f3d]">{p.label}</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={p.checked} className="sr-only peer" />
                    <div className="w-10 h-5 bg-[#e2e8f0] peer-checked:bg-[#0d9488] rounded-full after:absolute after:left-0.5 after:top-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white peer-checked:after:translate-x-5 after:transition-transform" />
                  </label>
                </div>
              ))}
              <Button variant="primary" size="sm" onClick={save}>{saved ? "✓ Saved" : "Save"}</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
