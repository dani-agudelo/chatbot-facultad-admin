# Chatbot Admin (frontend)

Panel de administración del asistente virtual de la Facultad (React + Vite + TypeScript).

Colores institucionales por defecto: azul `#00407d`, naranja `#f27022` (configurables en el panel).

## Requisitos

- Node 20+
- API `chatbot-facultad` en `http://127.0.0.1:8000` (PostgreSQL + migraciones + seed)

## Arranque

```bash
cp .env.example .env
npm install
npm run dev
```

Abrir http://localhost:5173

Credenciales: `ADMIN_EMAIL` / `ADMIN_PASSWORD` del backend (seed).

Variable:

| Variable | Default |
|----------|---------|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` |

## Token

El JWT se guarda en `localStorage` (`cfb_admin_token`). Aceptable para MVP intranet; en producción valorar cookies httpOnly.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — build producción
- `npm run preview` — vista previa del build

## Páginas

| Ruta | Función |
|------|---------|
| `/login` | Acceso; branding público (`GET /admin/branding`) |
| `/` | Dashboard (estado, provider, modelo, docs, reindex) |
| `/documentos` | Subir / eliminar PDF·TXT·MD; reindexar |
| `/configuracion` | Claves API, modelo de IA, personalización |
| `/chat` | Chat de prueba RAG |
| `/usuarios` | Crear / activar administradores |

## Configuración (detalle)

1. **Claves API** — Gemini y NVIDIA; se envían al backend y se almacenan **cifradas**. La UI no muestra ni permite “quitar” con checkbox: campo vacío = no modifica. Badge: *Guardada en BD* / *Usando .env* / *No configurada*.
2. **Modelo de IA** — proveedor (`nvidia` \| `gemini`), modelo LLM, embeddings, `top_k`.
3. **Personalización** — URL de logo horizontal (transparencia OK), nombre, subtítulo, colores primario/acento. Se aplican al sidebar y al login al guardar.

Documentación del backend: `../chatbot-facultad/ADMIN.md`.

## Flujo típico

1. Login  
2. Configurar claves (si no están en `.env` del API)  
3. Documentos → subir → Reindexar  
4. Chat de prueba  
5. Ajustar branding si hace falta  

## Notas UX

- No se puede desactivar al único admin **activo** desde la UI.
- Eliminar documento y reindexar piden confirmación.
- Tipografía: Manrope; navegación e acciones con iconos.
