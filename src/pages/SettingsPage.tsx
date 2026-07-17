import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api';
import { useBranding } from '../branding';
import { IconAlert } from '../components/Icons';
import type { Settings } from '../types';

type Props = {
  notify: (message: string, tone?: 'success' | 'error' | 'info') => void;
};

function ColorField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
}) {
  return (
    <label>
      {label}
      <div className="color-field">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setSafeHex(e.target.value, onChange)}
          pattern="^#[0-9A-Fa-f]{6}$"
          required
          spellCheck={false}
        />
      </div>
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

function setSafeHex(raw: string, onChange: (next: string) => void) {
  onChange(raw);
}

function keyStatus(setInDb: boolean, inEnv: boolean): { label: string; className: string } {
  if (setInDb) return { label: 'Guardada en BD', className: 'badge badge-ok' };
  if (inEnv) return { label: 'Usando .env', className: 'badge badge-off' };
  return { label: 'No configurada', className: 'badge badge-off' };
}

export function SettingsPage({ notify }: Props) {
  const { applyBranding } = useBranding();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [provider, setProvider] = useState<'gemini' | 'nvidia'>('nvidia');
  const [llmModel, setLlmModel] = useState('');
  const [embedModel, setEmbedModel] = useState('');
  const [topK, setTopK] = useState(5);
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#00407d');
  const [accentColor, setAccentColor] = useState('#f27022');
  const [brandName, setBrandName] = useState('Chatbot Facultad');
  const [brandSubtitle, setBrandSubtitle] = useState('Administración');
  const [geminiKey, setGeminiKey] = useState('');
  const [nvidiaKey, setNvidiaKey] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api<Settings>('/admin/settings');
        setSettings(data);
        setProvider(data.provider);
        setLlmModel(data.llm_model);
        setEmbedModel(data.embed_model);
        setTopK(data.similarity_top_k);
        setLogoUrl(data.logo_url || '');
        setPrimaryColor(data.primary_color || '#00407d');
        setAccentColor(data.accent_color || '#f27022');
        setBrandName(data.brand_name || 'Chatbot Facultad');
        setBrandSubtitle(data.brand_subtitle || 'Administración');
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'No se pudo cargar la configuración.');
      }
    })();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body: Record<string, unknown> = {
        provider,
        llm_model: llmModel,
        embed_model: embedModel,
        similarity_top_k: topK,
        logo_url: logoUrl.trim(),
        primary_color: primaryColor,
        accent_color: accentColor,
        brand_name: brandName.trim(),
        brand_subtitle: brandSubtitle.trim(),
      };
      if (geminiKey.trim()) body.gemini_api_key = geminiKey.trim();
      if (nvidiaKey.trim()) body.nvidia_api_key = nvidiaKey.trim();

      const updated = await api<Settings>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      setSettings(updated);
      setGeminiKey('');
      setNvidiaKey('');
      applyBranding({
        logo_url: updated.logo_url,
        primary_color: updated.primary_color,
        accent_color: updated.accent_color,
        brand_name: updated.brand_name,
        brand_subtitle: updated.brand_subtitle,
      });
      notify(
        updated.reindex_required
          ? 'Guardado. Debes reindexar por cambio de embeddings.'
          : 'Configuración aplicada.',
        updated.reindex_required ? 'info' : 'success',
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  }

  const geminiStatus = keyStatus(
    Boolean(settings?.gemini_api_key_set),
    Boolean(settings?.gemini_api_key_env),
  );
  const nvidiaStatus = keyStatus(
    Boolean(settings?.nvidia_api_key_set),
    Boolean(settings?.nvidia_api_key_env),
  );

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Configuración</h1>
          <p>Proveedor de IA, claves API, personalización y parámetros del chatbot.</p>
        </div>
      </div>

      {settings?.reindex_required ? (
        <div className="banner banner-warning">
          <IconAlert size={18} />
          Reindexación requerida: embeddings o documentos cambiaron.
        </div>
      ) : null}
      {error ? (
        <div className="banner banner-error">
          <IconAlert size={18} />
          {error}
        </div>
      ) : null}

      <form className="settings-form" onSubmit={onSubmit}>
        <div className="panel" style={{ maxWidth: 640 }}>
          <div className="panel-header">
            <h2>Claves API</h2>
          </div>
          <div className="form-stack">
            <p className="field-hint" style={{ margin: 0 }}>
              Se guardan cifradas en la base de datos. Si dejas el campo
              vacío, no se modifica la clave actual.
            </p>
            <label>
              <span className="label-with-badge">
                Gemini API key
                <span className={geminiStatus.className}>{geminiStatus.label}</span>
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={settings?.gemini_api_key_set ? '••••••••••••' : 'AIza…'}
              />
            </label>
            <label>
              <span className="label-with-badge">
                NVIDIA API key
                <span className={nvidiaStatus.className}>{nvidiaStatus.label}</span>
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={nvidiaKey}
                onChange={(e) => setNvidiaKey(e.target.value)}
                placeholder={settings?.nvidia_api_key_set ? '••••••••••••' : 'nvapi-…'}
              />
              <span className="field-hint">Necesaria para embeddings (y para LLM si se usa NVIDIA).</span>
            </label>
          </div>
        </div>

        <div className="panel" style={{ maxWidth: 640 }}>
          <div className="panel-header">
            <h2>Modelo de IA</h2>
          </div>
          <div className="form-stack">
            <div className="form-grid-2">
              <label>
                Proveedor LLM
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as 'gemini' | 'nvidia')}
                >
                  <option value="nvidia">NVIDIA</option>
                  <option value="gemini">Google Gemini</option>
                </select>
                <span className="field-hint">Se aplica al guardar.</span>
              </label>
              <label>
                Fragmentos por consulta
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  required
                />
                <span className="field-hint">Entre 1 y 20.</span>
              </label>
            </div>
            <label>
              Modelo LLM
              <input value={llmModel} onChange={(e) => setLlmModel(e.target.value)} required />
            </label>
            <label>
              Modelo de embeddings
              <input value={embedModel} onChange={(e) => setEmbedModel(e.target.value)} required />
              <span className="field-hint">
                Si se cambia, el índice queda desactualizado hasta reindexar.
              </span>
            </label>
          </div>
        </div>

        <div className="panel" style={{ maxWidth: 640 }}>
          <div className="panel-header">
            <h2>Personalización</h2>
          </div>
          <div className="form-stack">
            <label>
              URL del logo
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://…/logo-facultad.png"
              />
            </label>
            {logoUrl.trim() ? (
              <div className="logo-preview">
                <span className="field-hint">Vista previa</span>
                <div className="brand-logo-wrap">
                  <img className="brand-logo" src={logoUrl.trim()} alt="Vista previa del logo" />
                </div>
              </div>
            ) : null}
            <div className="form-grid-2">
              <label>
                Nombre
                <input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                  maxLength={128}
                />
              </label>
              <label>
                Subtítulo
                <input
                  value={brandSubtitle}
                  onChange={(e) => setBrandSubtitle(e.target.value)}
                  maxLength={128}
                />
              </label>
            </div>
            <div className="form-grid-2">
              <ColorField
                label="Color primario"
                value={primaryColor}
                onChange={setPrimaryColor}
                hint="Sidebar y fondos institucionales."
              />
              <ColorField
                label="Color de acento"
                value={accentColor}
                onChange={setAccentColor}
                hint="Botones y estado activo."
              />
            </div>
          </div>
        </div>

        <div className="actions" style={{ maxWidth: 640 }}>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar configuración'}
          </button>
        </div>
      </form>
    </section>
  );
}
