-- =============================================================================
-- Academia del Espíritu — Portal del Estudiante: Configuración mínima
-- Crea la tabla perfiles + función is_admin() + RLS policies
-- Ejecutar en el SQL Editor de Supabase (una sola vez).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Crear perfiles (si no existe) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS perfiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol             text NOT NULL CHECK (rol IN ('admin', 'instructor', 'estudiante')),
  estudiante_id   bigint UNIQUE REFERENCES estudiantes(id) ON DELETE SET NULL,
  nombre_visible  text,
  activo          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Función helper: ¿el usuario actual es admin? ───────────────────────────
-- SECURITY DEFINER = se ejecuta como el dueño de la tabla, evita recursividad RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon;

-- ── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS perfiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS perfiles_select_own ON perfiles;
CREATE POLICY perfiles_select_own ON perfiles
  FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS perfiles_insert_own ON perfiles;
CREATE POLICY perfiles_insert_own ON perfiles
  FOR INSERT
  WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS perfiles_update_own ON perfiles;
CREATE POLICY perfiles_update_own ON perfiles
  FOR UPDATE
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());
