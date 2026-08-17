# Supabase — Academia del Espíritu

## Cómo aplicar las migraciones

1. Abre tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2. Ve a **SQL Editor** → **New query**.
3. Copia y ejecuta el contenido de `migrations/001_progreso_certificados.sql`.
4. Si ya tienes tablas de contenido (`niveles`, `cursos`, etc.), esta migración **solo añade** tablas nuevas y columnas opcionales.

## Orden recomendado

| Archivo | Contenido |
|---------|-----------|
| `001_progreso_certificados.sql` | Progreso, historial, certificados, perfiles, vistas |

## Tablas que ya usa el frontend (no las recrea esta migración)

- `niveles`, `cursos`, `temas`, `pasos`, `estudiantes`

## Tablas nuevas

- `progreso_pasos`, `progreso_temas`, `progreso_cursos`, `progreso_niveles`
- `historial_niveles`, `certificados`, `perfiles`
- Vista `v_resumen_estudiante`
- Función `fn_marcar_paso_completado` (marca paso y promueve hitos)

## Storage

Buckets existentes / sugeridos:

- `imagenes-cursos` — portadas (ya en uso)
- `certificados` — PDFs generados (crear en Storage cuando implementes certificados)
- `documentos-temas` — PDFs de temas (opcional)

## RLS

Al activar el portal del estudiante, habilita Row Level Security y políticas por rol. Esta migración deja RLS **desactivado** en tablas nuevas para no romper el panel admin actual (anon key).
