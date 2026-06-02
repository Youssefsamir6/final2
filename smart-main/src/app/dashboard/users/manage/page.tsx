"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { UserPlus, Trash2, Pencil, Save, X, History, Users, GraduationCap, Shield } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";


type Member = { _id?: string; id: string; email: string; role: string };
type Person = { _id?: string; id: string; name: string; type: string; studentId?: string; photo?: string; places?: string[] };
type HistoryEntry = { _id: string; action: string; entityType: string; entityName: string; userEmail: string; userRole: string; details: any; timestamp: string };

export default function UserManagementPage() {
  const { userRole } = useAuth();
  const canManage = userRole === 'admin' || userRole === 'operator';
  const { toast } = useToast();

  const [members, setMembers] = React.useState<Member[]>([]);
  const [people, setPeople] = React.useState<Person[]>([]);
  const [historyEntries, setHistoryEntries] = React.useState<HistoryEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [memberEmail, setMemberEmail] = React.useState("");
  const [memberRole, setMemberRole] = React.useState("operator");

  const [personName, setPersonName] = React.useState("");
  const [personType, setPersonType] = React.useState("student");
  const [studentId, setStudentId] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState("");
  const [placesCsv, setPlacesCsv] = React.useState("");
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [editingMemberId, setEditingMemberId] = React.useState<string | null>(null);
  const [editMemberEmail, setEditMemberEmail] = React.useState("");
  const [editMemberRole, setEditMemberRole] = React.useState("");

  const [editingPersonId, setEditingPersonId] = React.useState<string | null>(null);
  const [editPersonName, setEditPersonName] = React.useState("");
  const [editPersonType, setEditPersonType] = React.useState("student");
  const [editStudentId, setEditStudentId] = React.useState("");
  const [editPhotoUrl, setEditPhotoUrl] = React.useState("");
  const [editPlacesCsv, setEditPlacesCsv] = React.useState("");
  const [editPhotoPreview, setEditPhotoPreview] = React.useState<string | null>(null);
  const editFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [dialogConfig, setDialogConfig] = React.useState<{
    open: boolean;
    title: string;
    description: string;
    variant: "default" | "destructive";
    confirmLabel: string;
  }>({ open: false, title: '', description: '', variant: 'default', confirmLabel: 'Confirm' });
  const resolveDialogRef = React.useRef<(value: boolean) => void>();

  React.useEffect(() => { loadData(); }, []);


  async function loadData() {
    setLoading(true);
    const token = localStorage.getItem('ssc_token');
    if (!token) { setLoading(false); return; }
    const headers: Record<string, string> = { 'Authorization': `Bearer ${token}` };

    try {
      const [mRes, pRes, hRes] = await Promise.all([
        fetch('/api/members', { headers }),
        fetch('/api/people', { headers }),
        fetch('/api/history', { headers })
      ]);

      if (mRes.ok) {
        const data = await mRes.json();
        setMembers(data.map((m: any) => ({ ...m, id: m._id || m.id })));
      }
      if (pRes.ok) {
        const data = await pRes.json();
        setPeople(data.map((p: any) => ({ ...p, id: p._id || p.id })));
      }
      if (hRes.ok) {
        const data = await hRes.json();
        setHistoryEntries(data);
      }
    } catch (e) {
      console.error('Failed to load data', e);
      toast('Failed to load data', { description: 'Please check your connection' });
    } finally {
      setLoading(false);
    }
  }

  function getHeaders(): Record<string, string> {
    const token = localStorage.getItem('ssc_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  function openConfirm(options: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
    confirmLabel?: string;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      resolveDialogRef.current = resolve;
      setDialogConfig({
        open: true,
        title: options.title,
        description: options.description,
        variant: options.variant || 'default',
        confirmLabel: options.confirmLabel || 'Confirm',
      });
    });
  }

  function handleDialogConfirm() {
    setDialogConfig(prev => ({ ...prev, open: false }));
    resolveDialogRef.current?.(true);
  }

  function handleDialogCancel() {
    setDialogConfig(prev => ({ ...prev, open: false }));
    resolveDialogRef.current?.(false);
  }

  async function addMember() {

    const email = memberEmail.trim();
    if (!email || !email.includes('@')) {
      toast('Invalid email', { description: 'Please enter a valid email address' });
      return;
    }

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, role: memberRole })
      });
      if (!res.ok) throw new Error('API error');
      const created = await res.json();
      setMembers(prev => [{ ...created, id: created._id || created.id }, ...prev]);
      setMemberEmail('');
      setMemberRole('operator');
      toast('Member added', { description: created.email });
      await refreshHistory();
    } catch (e) {
      toast('Failed to add member', { description: 'Backend unavailable' });
    }
  }

  async function updateMember(id: string) {
    const confirmed = await openConfirm({
      title: 'Update Member',
      description: 'Save changes to this member? This will overwrite existing data.',
    });
    if (!confirmed) return;
    try {

      const res = await fetch(`/api/members/${id}`, {

        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ email: editMemberEmail, role: editMemberRole })
      });
      if (!res.ok) throw new Error('API error');
      const updated = await res.json();
      setMembers(prev => prev.map(m => (m.id === id || m._id === id) ? { ...updated, id: updated._id || updated.id } : m));
      setEditingMemberId(null);
      toast('Member updated', { description: updated.email });
      await refreshHistory();
    } catch (e) {
      toast('Failed to update member', { description: 'Backend unavailable' });
    }
  }

  async function deleteMember(id: string) {
    const confirmed = await openConfirm({
      title: 'Delete Member',
      description: 'This will permanently delete this member and cannot be undone.',
      variant: 'destructive',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;


    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (!res.ok) throw new Error('API error');
      setMembers(prev => prev.filter(m => m.id !== id && m._id !== id));
      toast('Member deleted');
      await refreshHistory();
    } catch (e) {
      toast('Failed to delete member', { description: 'Backend unavailable' });
    }
  }

  async function addPerson() {
    if (!personName.trim()) { toast('Name required'); return; }
    if (personType === 'student' && !studentId.trim()) { toast('Student ID required'); return; }

    const payload = {
      name: personName.trim(),
      type: personType,
      studentId: personType === 'student' ? studentId.trim() : undefined,
      photo: photoUrl.trim() || undefined,
      places: placesCsv.split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('API error');
      const created = await res.json();
      setPeople(prev => [{ ...created, id: created._id || created.id }, ...prev]);
      setPersonName(''); setStudentId(''); setPhotoUrl(''); setPlacesCsv(''); setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast('Person added', { description: created.name });
      await refreshHistory();
    } catch (e) {
      toast('Failed to add person', { description: 'Backend unavailable' });
    }
  }

  async function updatePerson(id: string) {
    const confirmed = await openConfirm({
      title: 'Update Person',
      description: 'Save changes to this person? This will overwrite existing data.',
    });
    if (!confirmed) return;
    const payload = {


      name: editPersonName.trim(),
      type: editPersonType,
      studentId: editPersonType === 'student' ? editStudentId.trim() : undefined,
      photo: editPhotoUrl.trim() || undefined,
      places: editPlacesCsv.split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      const res = await fetch(`/api/people/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('API error');
      const updated = await res.json();
      setPeople(prev => prev.map(p => (p.id === id || p._id === id) ? { ...updated, id: updated._id || updated.id } : p));
      setEditingPersonId(null);
      toast('Person updated', { description: updated.name });
      await refreshHistory();
    } catch (e) {
      toast('Failed to update person', { description: 'Backend unavailable' });
    }
  }

  async function deletePerson(id: string) {
    const confirmed = await openConfirm({
      title: 'Delete Person',
      description: 'This will permanently delete this person and cannot be undone.',
      variant: 'destructive',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;


    try {
      const res = await fetch(`/api/people/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (!res.ok) throw new Error('API error');
      setPeople(prev => prev.filter(p => p.id !== id && p._id !== id));
      toast('Person deleted');
      await refreshHistory();
    } catch (e) {
      toast('Failed to delete person', { description: 'Backend unavailable' });
    }
  }

  async function refreshHistory() {
    try {
      const token = localStorage.getItem('ssc_token');
      if (!token) return;
      const res = await fetch('/api/history', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setHistoryEntries(data);
      }
    } catch (e) {
      // ignore
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>, isEdit = false) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (isEdit) {
        setEditPhotoPreview(result);
        setEditPhotoUrl(result);
      } else {
        setPhotoPreview(result);
        setPhotoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  }

  function clearPhoto(isEdit = false) {
    if (isEdit) {
      setEditPhotoPreview(null);
      setEditPhotoUrl('');
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    } else {
      setPhotoPreview(null);
      setPhotoUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function startEditMember(member: Member) {
    setEditingMemberId(member.id);
    setEditMemberEmail(member.email);
    setEditMemberRole(member.role);
  }

  function startEditPerson(person: Person) {
    setEditingPersonId(person.id);
    setEditPersonName(person.name);
    setEditPersonType(person.type);
    setEditStudentId(person.studentId || '');
    setEditPhotoUrl(person.photo || '');
    setEditPhotoPreview(person.photo || null);
    setEditPlacesCsv(person.places?.join(', ') || '');
  }

  function cancelEditMember() {
    setEditingMemberId(null);
    setEditMemberEmail('');
    setEditMemberRole('');
  }

  function cancelEditPerson() {
    setEditingPersonId(null);
    setEditPersonName('');
    setEditPersonType('student');
    setEditStudentId('');
    setEditPhotoUrl('');
    setEditPhotoPreview(null);
    setEditPlacesCsv('');
  }

  function getPersonTypeLabel(type: string) {
    switch (type) {
      case 'student': return 'Student';
      case 'professor': return 'Professor';
      case 'assistant': return 'Assistant';
      case 'worker': return 'Worker';
      case 'vip': return 'VIP';
      default: return type;
    }
  }

  function getActionBadge(action: string) {
    switch (action) {
      case 'create': return <Badge className="bg-green-600 hover:bg-green-700">Created</Badge>;
      case 'update': return <Badge className="bg-blue-600 hover:bg-blue-700">Updated</Badge>;
      case 'delete': return <Badge variant="destructive">Deleted</Badge>;
      default: return <Badge>{action}</Badge>;
    }
  }

  if (!canManage) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 p-4 border border-yellow-200 rounded-lg bg-yellow-50 text-sm dark:bg-yellow-900/20 dark:border-yellow-800/30 dark:text-yellow-200">
          <Shield className="h-5 w-5" />
          <div>
            <p className="font-medium">Access Denied</p>
            <p>You need admin or operator privileges to manage users.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage members, students, professors, and view audit history</p>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Members
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" /> People
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Add Member
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="Email address"
                value={memberEmail}
                onChange={e => setMemberEmail(e.target.value)}
                type="email"
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={memberRole}
                onChange={e => setMemberRole(e.target.value)}
              >
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
              <Button onClick={addMember} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" /> Add Member
              </Button>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No members found. Add one above.
                    </TableCell>
                  </TableRow>
                )}
                {members.map(member => (
                  <TableRow key={member.id}>
                    {editingMemberId === member.id ? (
                      <>
                        <TableCell>
                          <Input
                            value={editMemberEmail}
                            onChange={e => setEditMemberEmail(e.target.value)}
                            type="email"
                          />
                        </TableCell>
                        <TableCell>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={editMemberRole}
                            onChange={e => setEditMemberRole(e.target.value)}
                          >
                            <option value="operator">Operator</option>
                            <option value="admin">Admin</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => updateMember(member.id)}>
                              <Save className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEditMember}>
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{member.email}</TableCell>
                        <TableCell>
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => startEditMember(member)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteMember(member.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="people" className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Add Person
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input
                placeholder="Full name"
                value={personName}
                onChange={e => setPersonName(e.target.value)}
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={personType}
                onChange={e => setPersonType(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
                <option value="assistant">Assistant</option>
                <option value="worker">Worker</option>
                <option value="vip">VIP</option>
              </select>
              {personType === 'student' && (
                <Input
                  placeholder="Student ID"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                />
              )}
              <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                  onChange={e => handlePhotoChange(e, false)}
                />
                {photoPreview && (
                  <Button size="sm" variant="ghost" onClick={() => clearPhoto(false)}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              {photoPreview && (
                <div className="col-span-full flex items-center gap-3">
                  <img src={photoPreview} alt="Preview" className="h-16 w-16 rounded object-cover border" />
                  <span className="text-xs text-muted-foreground">Photo preview</span>
                </div>
              )}
              <Input
                placeholder="Places (comma separated)"
                value={placesCsv}
                onChange={e => setPlacesCsv(e.target.value)}
                className="sm:col-span-2 lg:col-span-3"
              />
              <Button onClick={addPerson} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" /> Add Person
              </Button>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Places</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No people found. Add one above.
                    </TableCell>
                  </TableRow>
                )}
                {people.map(person => (
                  <TableRow key={person.id}>
                    {editingPersonId === person.id ? (
                      <>
                        <TableCell>
                          <div className="space-y-2">
                            <input
                              ref={editFileInputRef}
                              type="file"
                              accept="image/*"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                              onChange={e => handlePhotoChange(e, true)}
                            />
                            {editPhotoPreview && (
                              <div className="flex items-center gap-2">
                                <img src={editPhotoPreview} alt="Preview" className="h-10 w-10 rounded object-cover border" />
                                <Button size="sm" variant="ghost" onClick={() => clearPhoto(true)}>
                                  <X className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input value={editPersonName} onChange={e => setEditPersonName(e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={editPersonType}
                            onChange={e => setEditPersonType(e.target.value)}
                          >
                            <option value="student">Student</option>
                            <option value="professor">Professor</option>
                            <option value="assistant">Assistant</option>
                            <option value="worker">Worker</option>
                            <option value="vip">VIP</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          {editPersonType === 'student' ? (
                            <Input value={editStudentId} onChange={e => setEditStudentId(e.target.value)} placeholder="Student ID" />
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input value={editPlacesCsv} onChange={e => setEditPlacesCsv(e.target.value)} placeholder="Places" />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => updatePerson(person.id)}>
                              <Save className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEditPerson}>
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          {person.photo ? (
                            <img src={person.photo} alt={person.name} className="h-10 w-10 rounded object-cover border" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{person.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {getPersonTypeLabel(person.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>{person.studentId || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {person.places?.join(', ') || '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => startEditPerson(person)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deletePerson(person.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No history yet. Changes will appear here.
                    </TableCell>
                  </TableRow>
                )}
                {historyEntries.map(entry => (
                  <TableRow key={entry._id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(entry.timestamp), "MMM dd, HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{entry.userEmail}</div>
                      <div className="text-xs text-muted-foreground capitalize">{entry.userRole}</div>
                    </TableCell>
                    <TableCell>{getActionBadge(entry.action)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {entry.entityType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{entry.entityName || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[300px]">
                      {entry.details ? (
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      ) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={dialogConfig.open}
        title={dialogConfig.title}
        description={dialogConfig.description}
        variant={dialogConfig.variant}
        confirmLabel={dialogConfig.confirmLabel}
        cancelLabel="Cancel"
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
    </div>
  );
}
