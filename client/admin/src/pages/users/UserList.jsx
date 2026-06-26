import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      toast.success(t('users.created'));
      setIsCreating(false);
      setDraft(EMPTY_USER);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (user, roleId) => {
    try {
      await usersApi.updateRole(user.id, roleId);
      toast.success(t('users.roleUpdated'));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.saveFailed'));
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await usersApi.setActive(user.id, !user.is_active);
      toast.success(user.is_active ? t('users.deactivated') : t('users.activated'));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.saveFailed'));
    }
  };

  const handleDelete = async (user) => {
    const ok = await confirm(t('users.deleteConfirm', { name: user.full_name }));
    if (!ok) return;
    try {
      await usersApi.remove(user.id);
      toast.success(t('users.deleted'));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.deleteFailed'));
    }
  };

  const columns = [
    { key: 'full_name', label: t('users.fullName') },
    { key: 'email', label: t('users.email') },
    {
      key: 'role_name', label: t('users.role'),
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
      key: 'is_active', label: t('common.status'),
      render: (row) => <Badge tone={row.is_active ? 'success' : 'danger'}>{row.is_active ? t('users.active') : t('users.inactive')}</Badge>,
    },
    {
      key: 'last_login_at', label: t('users.lastLogin'),
      render: (row) => row.last_login_at ? new Date(row.last_login_at).toLocaleString() : <span className="cell-muted">{t('users.never')}</span>,
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" disabled={row.id === currentUser.id} onClick={() => handleToggleActive(row)}>
            {row.is_active ? t('users.deactivate') : t('users.activate')}
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
          <h1>{t('users.title')}</h1>
          <div className="subtitle">{t('users.subtitle')}</div>
        </div>
        {!isCreating && <Button onClick={() => setIsCreating(true)}><Plus size={16} /> {t('users.newUser')}</Button>}
      </div>

      {isCreating && (
        <div className="surface-card" style={{ padding: 20, marginBottom: 16 }}>
          <div className="form-grid">
            <Field label={t('users.fullName')} required>
              <TextInput value={draft.fullName} onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))} />
            </Field>
            <Field label={t('users.email')} required>
              <TextInput type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
            </Field>
            <Field label={t('users.temporaryPassword')} required hint={t('users.passwordHint')}>
              <TextInput type="password" value={draft.password} onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))} />
            </Field>
            <Field label={t('users.role')} required>
              <Select value={draft.roleId} onChange={(e) => setDraft((d) => ({ ...d, roleId: e.target.value }))}>
                <option value="">{t('users.selectRole')}</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name.replace(/_/g, ' ')}</option>)}
              </Select>
            </Field>
            <Field label={t('users.phone')} hint={t('common.optional')}>
              <TextInput value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
            </Field>
          </div>
          <div className="row-actions" style={{ justifyContent: 'flex-start' }}>
            <Button onClick={handleCreate} isLoading={isSaving}>{t('users.createUser')}</Button>
            <Button variant="secondary" onClick={() => { setIsCreating(false); setDraft(EMPTY_USER); }}>
              <X size={14} /> {t('common.cancel')}
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
