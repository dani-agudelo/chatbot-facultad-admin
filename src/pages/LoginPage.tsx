import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useBranding } from '../branding';
import { ApiError } from '../api';

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const { branding } = useBranding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const hasLogo = Boolean(branding.logo_url.trim());

  if (!loading && user) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-visual" aria-hidden={false}>
        {hasLogo ? (
          <div className="brand-logo-wrap login-logo">
            <img className="brand-logo" src={branding.logo_url} alt={branding.brand_name} />
          </div>
        ) : (
          <div className="brand-row" style={{ marginBottom: 0 }}>
            <div className="brand-mark">FI</div>
            <div>
              <strong style={{ color: '#fff' }}>{branding.brand_name}</strong>
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>{branding.brand_subtitle}</span>
            </div>
          </div>
        )}
        <div>
          <h1>Panel del asistente virtual</h1>
          <p>
            Gestiona documentos normativos, el modelo de IA y prueba respuestas antes de
            publicarlas en el sitio.
          </p>
        </div>
        <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: 0 }}>
          Acceso restringido a administradores
        </p>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <h2>Iniciar sesión</h2>
          <p className="lead">Usa el correo y contraseña asignados por la Facultad.</p>
          {error ? <div className="banner banner-error">{error}</div> : null}
          <form className="form-stack" onSubmit={onSubmit}>
            <label>
              Correo electrónico
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@facultad.edu"
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
