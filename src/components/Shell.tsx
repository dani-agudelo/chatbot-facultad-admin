import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';
import { useBranding } from '../branding';
import { BrandLogo } from './BrandLogo';
import {
  IconChat,
  IconFiles,
  IconHome,
  IconLogout,
  IconSettings,
  IconUsers,
} from './Icons';

const links: Array<{
  to: string;
  label: string;
  icon: typeof IconHome;
  end?: boolean;
}> = [
  { to: '/', label: 'Inicio', icon: IconHome, end: true },
  { to: '/documentos', label: 'Documentos', icon: IconFiles },
  { to: '/configuracion', label: 'Configuración', icon: IconSettings },
  { to: '/chat', label: 'Chat de prueba', icon: IconChat },
  { to: '/usuarios', label: 'Usuarios', icon: IconUsers },
];

export function Shell() {
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  const hasLogo = Boolean(branding.logo_url.trim());

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className={`sidebar-brand${hasLogo ? ' has-logo' : ''}`}>
          <BrandLogo src={branding.logo_url} alt={branding.brand_name} />
          <div>
            <strong>{branding.brand_name}</strong>
            <span>{branding.brand_subtitle}</span>
          </div>
        </div>
        <nav aria-label="Principal">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user" title={user?.email}>
            {user?.full_name || user?.email}
          </div>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            <IconLogout size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
