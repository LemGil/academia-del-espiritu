-- =============================================================================
-- Academia del Espíritu — Fix RLS definitivo
-- Usa una función SECURITY DEFINER para evitar recursividad en políticas
-- Ejecutar en el SQL Editor de Supabase (una sola vez)
-- =============================================================================

-- ── Función helper: ¿el usuario actual es admin? ───────────────────────────
-- SECURITY DEFINER = se ejecuta como el dueño de la tabla, evitando RLS
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

-- ── Dar permiso a todos los roles para ejecutar la función ─────────────────
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

DROP POLICY IF EXISTS perfiles_delete_admin ON perfiles;
CREATE POLICY perfiles_delete_admin ON perfiles
  FOR DELETE
  USING (public.is_admin());

-- ── Estudiantes ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS estudiantes_select_own ON estudiantes;
CREATE POLICY estudiantes_select_own ON estudiantes
  FOR SELECT
  USING (
    id IN (SELECT estudiante_id FROM perfiles WHERE id = auth.uid())
    OR public.is_admin()
  );

-- ── Progreso ────────────────────────────────────────────────────────────────
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

-- ── Certificados ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS certificados_select_own ON certificados;
CREATE POLICY certificados_select_own ON certificados
  FOR SELECT
  USING (
    estudiante_id IN (SELECT estudiante_id FROM perfiles WHERE id = auth.uid())
    OR public.is_admin()
  );

-- ── Historial ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS historial_niveles_select_own ON historial_niveles;
CREATE POLICY historial_niveles_select_own ON historial_niveles
  FOR SELECT
  USING (
    estudiante_id IN (SELECT estudiante_id FROM perfiles WHERE id = auth.uid())
    OR public.is_admin()
  );
