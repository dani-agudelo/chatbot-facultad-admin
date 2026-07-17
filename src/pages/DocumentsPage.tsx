import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api';
import { ConfirmModal } from '../components/ConfirmModal';
import { IconAlert, IconFiles, IconRefresh, IconTrash, IconUpload } from '../components/Icons';
import { Pagination } from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import type { DocumentItem } from '../types';

type Props = {
  notify: (message: string, tone?: 'success' | 'error' | 'info') => void;
};

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsPage({ notify }: Props) {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [confirmReindex, setConfirmReindex] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const pagination = usePagination(docs);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDocs(await api<DocumentItem[]>('/admin/documents'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar documentos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    pagination.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs.length]);

  async function onUpload(event: FormEvent) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError('Selecciona un archivo PDF, TXT o MD.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      await api('/admin/documents/upload', { method: 'POST', body });
      notify('Documento subido. Recuerda reindexar.', 'success');
      if (inputRef.current) inputRef.current.value = '';
      setSelectedName('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al subir.');
    } finally {
      setUploading(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusyDelete(true);
    try {
      await api(`/admin/documents/${encodeURIComponent(pendingDelete)}`, {
        method: 'DELETE',
      });
      notify('Documento eliminado. Reindexa para actualizar respuestas.', 'success');
      setPendingDelete(null);
      await load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'No se pudo eliminar.', 'error');
    } finally {
      setBusyDelete(false);
    }
  }

  async function runReindex() {
    setReindexing(true);
    try {
      const result = await api<{
        indexed_documents: number;
        indexed_nodes: number;
        message: string;
      }>('/admin/reindex', { method: 'POST' });
      notify(
        `${result.message} (${result.indexed_documents} docs / ${result.indexed_nodes} fragmentos)`,
        'success',
      );
      setConfirmReindex(false);
      await load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Falló la reindexación.', 'error');
    } finally {
      setReindexing(false);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Documentos</h1>
          <p>Sube normativas, elimina archivos y actualiza el índice de búsqueda.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setConfirmReindex(true)}
          disabled={reindexing}
        >
          <IconRefresh size={18} />
          Reindexar
        </button>
      </div>

      <div className="banner banner-info">
        Pasos: 1) Subir documento → 2) Reindexar → 3) Probar en Chat de prueba.
      </div>

      {error ? (
        <div className="banner banner-error">
          <IconAlert size={18} />
          {error}
        </div>
      ) : null}

      <div className="panel">
        <div className="panel-header">
          <h2>Subir archivo</h2>
        </div>
        <form className="form-stack" onSubmit={onUpload}>
          <label className="dropzone" htmlFor="doc-upload">
            <span className="upload-icon">
              <IconUpload size={22} />
            </span>
            <strong>Haz clic para elegir un archivo</strong>
            <span>PDF, TXT o MD · máximo 25 MB</span>
            <input
              ref={inputRef}
              id="doc-upload"
              className="sr-only"
              type="file"
              name="file"
              accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
              onChange={(e) => setSelectedName(e.target.files?.[0]?.name || '')}
            />
          </label>
          {selectedName ? (
            <div className="file-chip">
              <IconFiles size={14} />
              {selectedName}
            </div>
          ) : null}
          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={uploading || !selectedName}>
              <IconUpload size={18} />
              {uploading ? 'Subiendo…' : 'Subir documento'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Biblioteca</h2>
          <span className="meta" style={{ margin: 0 }}>
            {docs.length} archivo{docs.length === 1 ? '' : 's'}
          </span>
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 88 }} />
        ) : docs.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              <IconFiles size={24} />
            </div>
            No hay documentos. Sube el primer archivo institucional.
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Archivo</th>
                    <th>Tamaño</th>
                    <th>Actualizado</th>
                    <th className="sr-only">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.pageItems.map((doc) => (
                    <tr key={doc.file_name}>
                      <td className="file-name">{doc.file_name}</td>
                      <td>{formatBytes(doc.size_bytes)}</td>
                      <td>{new Date(doc.updated_at).toLocaleString()}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-icon danger"
                          aria-label={`Eliminar ${doc.file_name}`}
                          title="Eliminar"
                          onClick={() => setPendingDelete(doc.file_name)}
                        >
                          <IconTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              from={pagination.from}
              to={pagination.to}
              onPageChange={pagination.goTo}
              label="archivos"
            />
          </>
        )}
      </div>

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Eliminar documento"
        message={`¿Eliminar «${pendingDelete}»? Después deberás reindexar.`}
        confirmLabel="Eliminar"
        danger
        busy={busyDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />

      <ConfirmModal
        open={confirmReindex}
        title="Reindexar documentos"
        message="Se volverán a procesar todos los archivos. Puede tardar unos minutos."
        confirmLabel="Reindexar ahora"
        busy={reindexing}
        onCancel={() => setConfirmReindex(false)}
        onConfirm={() => void runReindex()}
      />
    </section>
  );
}
