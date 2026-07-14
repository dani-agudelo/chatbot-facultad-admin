import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api';
import { IconAlert, IconPlus, IconUsers } from '../components/Icons';
import type { AdminUser } from '../types';

type Props = {
  notify: (message: string, tone?: 'success' | 'error' | 'info') => void;
};

export function UsersPage({ notify }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const activeCount = users.filter((u) => u.is_active).length;

  const load = useCallback(async () => {
    try {
      setUsers(await api<AdminUser[]>('/admin/users'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar usuarios.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          email,
          full_name: fullName,
          password,
          is_active: true,
        }),
      });
      notify('Usuario creado.', 'success');
      setEmail('');
      setFullName('');
      setPassword('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(user: AdminUser) {
    try {
      await api(`/admin/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      notify(user.is_active ? 'Usuario desactivado.' : 'Usuario activado.', 'success');
      await load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'No se pudo actualizar.', 'error');
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Usuarios</h1>
          <p>Administradores del panel: crear y activar o desactivar.</p>
        </div>
      </div>

      {error ? (
        <div className="banner banner-error">
          <IconAlert size={18} />
          {error}
        </div>
      ) : null}

      <div className="panel" style={{ maxWidth: 560 }}>
        <div className="panel-header">
          <h2>Nuevo administrador</h2>
        </div>
        <form className="form-stack" onSubmit={onCreate}>
          <label>
            Nombre completo
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label>
            Correo
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Contraseña (mín. 8)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              <IconPlus size={18} />
              {busy ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Listado</h2>
        </div>
        {users.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              <IconUsers size={24} />
            </div>
            Sin usuarios.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  // No dejar el panel sin ningún admin activo.
                  const canToggle = user.is_active ? activeCount > 1 : true;
                  return (
                    <tr key={user.id}>
                      <td className="file-name">{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>
                        <div className="status-cell">
                          <span className={`badge ${user.is_active ? 'badge-ok' : 'badge-off'}`}>
                            {user.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                          {canToggle ? (
                            <button
                              type="button"
                              className={`status-action ${user.is_active ? 'is-off' : 'is-on'}`}
                              onClick={() => void toggleActive(user)}
                            >
                              {user.is_active ? 'Desactivar' : 'Activar'}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
