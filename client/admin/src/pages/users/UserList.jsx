import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { usersApi } from '../../api/modules';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../components/ConfirmDialog';
import { Field, TextInput, Select } from '../../components/FormField';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { Plus, Trash2, X } from 'lucide-react';

const EMPTY_USER = { email: '', password: '', fullName: '', phone: '', roleId: '' };

export default function UserList() {
  const { user: currentUser } = useAuth();
  const { confirm, dialog } = useConfirm();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_USER);
  const [isSaving, setIsSaving] = useState(false);

  const load = () => Promise.all([usersApi.list(), usersApi.listRoles()]).then(([u, r]) => {
    setUsers(u.data.data);
    setRoles(r.data.data);
    setIsLoading(false);
  });

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setIsSaving(true);
    try {
      await usersApi.create(draft);
      toast.success('User created');
      setIsCreating(false);
      setDraft(EMPTY_USER);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (user, roleId) => {
    try {
      await usersApi.updateRole(user.id, roleId);
      toast.success('Role updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await usersApi.setActive(user.id, !user.is_active);
      toast.success(user.is_active ? 'User deactivated' : 'User activated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (user) => {
    const ok = await confirm(`Delete user "${user.full_name}"?`);
    if (!ok) return;
    try {
      await usersApi.remove(user.id);
      toast.success('User deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role_name', label: 'Role',
      render: (row) => (
        <Select
          value={roles.find((r) => r.name === row.role_name)?.id || ''}
          onChange={(e) => handleRoleChange(row, e.target.value)}
          disabled={row.id === currentUser.id}
          style={{ minWidth: 170 }}
        >
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name.replace(/_/g, ' ')}</option>)}
        </Select>
      ),
    },
    {
      key: 'is_active', label: 'Status',
      render: (row) => <Badge tone={row.is_active ? 'success' : 'danger'}>{row.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'last_login_at', label: 'Last login',
      render: (row) => row.last_login_at ? new Date(row.last_login_at).toLocaleString() : <span className="cell-muted">Never</span>,
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" disabled={row.id === currentUser.id} onClick={() => handleToggleActive(row)}>
            {row.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="ghost" size="sm" disabled={row.id === currentUser.id} onClick={() => handleDelete(row)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <div className="subtitle">CMS user accounts and roles</div>
        </div>
        {!isCreating && <Button onClick={() => setIsCreating(true)}><Plus size={16} /> New user</Button>}
      </div>

      {isCreating && (
        <div className="surface-card" style={{ padding: 20, marginBottom: 16 }}>
          <div className="form-grid">
            <Field label="Full name" required>
              <TextInput value={draft.fullName} onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))} />
            </Field>
            <Field label="Email" required>
              <TextInput type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
            </Field>
            <Field label="Temporary password" required hint="At least 8 characters">
              <TextInput type="password" value={draft.password} onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))} />
            </Field>
            <Field label="Role" required>
              <Select value={draft.roleId} onChange={(e) => setDraft((d) => ({ ...d, roleId: e.target.value }))}>
                <option value="">— Select a role —</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name.replace(/_/g, ' ')}</option>)}
              </Select>
            </Field>
            <Field label="Phone" hint="Optional">
              <TextInput value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
            </Field>
          </div>
          <div className="row-actions" style={{ justifyContent: 'flex-start' }}>
            <Button onClick={handleCreate} isLoading={isSaving}>Create user</Button>
            <Button variant="secondary" onClick={() => { setIsCreating(false); setDraft(EMPTY_USER); }}>
              <X size={14} /> Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="surface-card">
        <DataTable columns={columns} rows={users} isLoading={isLoading} />
      </div>
      {dialog}
    </div>
  );
}
