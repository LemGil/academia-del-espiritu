-- =============================================================================
-- Academia del Espíritu — Migración 003
-- RLS Policies para el Portal del Estudiante + Admin
-- Requisito: migraciones 001 y 002 aplicadas
-- Habilita Row Level Security y define políticas de acceso
-- Los administradores pueden ver y gestionar todos los registros
-- =============================================================================

-- ── Habilitar RLS en tablas que lo requieren ──────────────────────────────
ALTER TABLE IF EXISTS perfiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS progreso_pasos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS progreso_temas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS progreso_cursos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS progreso_niveles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS certificados       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS historial_niveles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS niveles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cursos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS temas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pasos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS estudiantes        ENABLE ROW LEVEL SECURITY;

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

-- ── Perfiles ────────────────────────────────────────────────────────────────
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

-- ── Progreso: estudiante ve lo suyo, admin ve todo ────────────────────────
DROP POLICY IF EXISTS progreso_pasos_select_own ON progreso_pasos;
CREATE POLICY progreso_pasos_select_own ON progreso_pasos
  FOR SELECT
  USING (
    estudiante_id IN (SELECT estudiante_id FROM perfiles WHERE id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS progreso_temas_select_own ON progreso_temas;
CREATE POLICY progreso_temas_select_own ON progreso_temas
  FOR SELECT
  USING (
    estudiante_id IN (SELECT estudiante_id FROM perfiles WHERE id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS progreso_cursos_select_own ON progreso_cursos;
CREATE POLICY progreso_cursos_select_own ON progreso_cursos
  FOR SELECT
  USING (
    estudiante_id IN (SELECT estudiante_id FROM perfiles WHERE id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS progreso_niveles_select_own ON progreso_niveles;
CREATE POLICY progreso_niveles_select_own ON progreso_niveles
  FOR SELECT
  USING (
    estudiante_id IN (SELECT estudiante_id FROM perfiles WHERE id = auth.uid())
    OR public.is_admin()
  );

-- ── Certificados ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS certificados_select_own ON certificados;
CREATE POLICY certificados_select_own ON certificados
  FOR SELECT
  USING (
    estudiante_id IN (SELECT estudiante_id FROM perfiles WHERE id = auth.uid())
    OR public.is_admin()
  );

-- ── Historial ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS historial_niveles_select_own ON historial_niveles;
CREATE POLICY historial_niveles_select_own ON historial_niveles
  FOR SELECT
  USING (
    estudiante_id IN (SELECT estudiante_id FROM perfiles WHERE id = auth.uid())
    OR public.is_admin()
  );

-- ── Contenido: lectura pública para autenticados ─────────────────────────
CREATE POLICY niveles_select_auth ON niveles
  FOR SELECT
  USING (true);

CREATE POLICY cursos_select_auth ON cursos
  FOR SELECT
  USING (true);

CREATE POLICY temas_select_auth ON temas
  FOR SELECT
  USING (true);

CREATE POLICY pasos_select_auth ON pasos
  FOR SELECT
  USING (true);

-- ── Estudiantes: estudiante ve su registro, admin ve todo ────────────────
DROP POLICY IF EXISTS estudiantes_select_own ON estudiantes;
CREATE POLICY estudiantes_select_own ON estudiantes
  FOR SELECT
  USING (
    id IN (SELECT estudiante_id FROM perfiles WHERE id = auth.uid())
    OR public.is_admin()
  );

-- ── RPC fn_marcar_paso_completado ─────────────────────────────────────────
GRANT EXECUTE ON FUNCTION fn_marcar_paso_completado TO authenticated;

COMMENT ON SCHEMA public IS 'Academia del Espíritu — Portal con RLS (admin total, estudiante restringido)';
