import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api';
import { IconAlert, IconCheck, IconCpu, IconFiles, IconRefresh } from '../components/Icons';
import type { Dashboard } from '../types';

export function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        setData(await api<Dashboard>('/admin/dashboard'));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'No se pudo cargar el panel.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Inicio</h1>
          <p>Estado general del asistente virtual institucional.</p>
        </div>
        <Link to="/documentos" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
          <IconFiles size={18} />
          Ir a documentos
        </Link>
      </div>

      {error ? (
        <div className="banner banner-error">
          <IconAlert size={18} />
          {error}
        </div>
      ) : null}
      {data?.reindex_required ? (
        <div className="banner banner-warning">
          <IconAlert size={18} />
          Hay cambios pendientes de indexar. Ve a Documentos y pulsa Reindexar.
        </div>
      ) : null}

      {loading ? (
        <div className="grid-cards">
          {[1, 2, 3, 4].map((item) => (
            <div className="card" key={item}>
              <div className="skeleton" />
              <div className="skeleton" style={{ marginTop: 12, width: '45%' }} />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="grid-cards">
          <div className="card card-stat">
            <div className="stat-top">
              <span className="label">Servicio</span>
              <span className="stat-icon">
                <IconCheck size={16} />
              </span>
            </div>
            <div className="value">{data.status}</div>
          </div>
          <div className="card card-stat">
            <div className="stat-top">
              <span className="label">Proveedor</span>
              <span className="stat-icon orange">
                <IconCpu size={16} />
              </span>
            </div>
            <div className="value">{data.provider}</div>
          </div>
          <div className="card card-stat">
            <div className="stat-top">
              <span className="label">Modelo</span>
              <span className="stat-icon">
                <IconCpu size={16} />
              </span>
            </div>
            <div className="value" style={{ fontSize: '0.98rem' }}>
              {data.model}
            </div>
          </div>
          <div className="card card-stat">
            <div className="stat-top">
              <span className="label">Documentos</span>
              <span className="stat-icon orange">
                <IconFiles size={16} />
              </span>
            </div>
            <div className="value">{data.documents_count}</div>
          </div>
        </div>
      ) : null}

      <div className="panel">
        <div className="panel-header">
          <h2>Cómo usar el panel</h2>
          <IconRefresh size={18} style={{ color: 'var(--text-muted)' }} />
        </div>
        <ol className="steps">
          <li>Sube o revisa documentos en Documentos.</li>
          <li>Reindexa para actualizar las respuestas del chatbot.</li>
          <li>Prueba una pregunta en Chat de prueba.</li>
        </ol>
        {data?.last_reindex_at ? (
          <p className="meta">
            Última reindexación: {new Date(data.last_reindex_at).toLocaleString()} ·{' '}
            {data.last_reindex_result}
          </p>
        ) : (
          <p className="meta">Aún no hay reindexaciones registradas.</p>
        )}
      </div>
    </section>
  );
}
