import { useState, type FormEvent } from 'react';
import { api, ApiError } from '../api';
import { IconAlert, IconChat, IconSend } from '../components/Icons';
import type { ChatTestResponse } from '../types';

type Msg = { role: 'user' | 'assistant'; text: string; meta?: string };

type Props = {
  notify: (message: string, tone?: 'success' | 'error' | 'info') => void;
};

export function ChatTestPage({ notify }: Props) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;
    setBusy(true);
    setError('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setMessage('');
    try {
      const data = await api<ChatTestResponse>('/admin/chat/test', {
        method: 'POST',
        body: JSON.stringify({ message: text, session_id: 'admin-test' }),
      });
      const meta = `Proveedor: ${data.provider} · Modelo: ${data.model}`;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer,
          meta: data.note ? `${meta} · ${data.note}` : meta,
        },
      ]);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'No se pudo consultar el chat.';
      setError(msg);
      notify(msg, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Chat de prueba</h1>
          <p>Envía una pregunta al motor con la configuración actual.</p>
        </div>
      </div>

      {error ? (
        <div className="banner banner-error">
          <IconAlert size={18} />
          {error}
        </div>
      ) : null}

      <div className="panel chat-box">
        <div className="chat-log" aria-live="polite">
          {messages.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">
                <IconChat size={24} />
              </div>
              Todavía no hay mensajes. Prueba con una pregunta de normativa.
            </div>
          ) : (
            messages.map((item, index) => (
              <div key={`${item.role}-${index}`}>
                <div className={`bubble ${item.role === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                  {item.text}
                </div>
                {item.meta ? <div className="meta">{item.meta}</div> : null}
              </div>
            ))
          )}
        </div>
        <form className="chat-compose" onSubmit={onSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="¿Quién es la segunda instancia para cancelar una asignatura?"
            aria-label="Mensaje de prueba"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button
            className="btn btn-primary btn-icon"
            type="submit"
            disabled={busy || !message.trim()}
            aria-label="Enviar"
            title="Enviar"
          >
            <IconSend size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}
