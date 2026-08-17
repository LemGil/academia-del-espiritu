-- =============================================================================
-- Academia del Espíritu — Migración 007
-- Políticas INSERT / UPDATE / DELETE para admin en tablas de contenido
-- Requisito: migración 003 aplicada
-- =============================================================================

-- ── Niveles ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS niveles_insert_admin ON niveles;
CREATE POLICY niveles_insert_admin ON niveles
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS niveles_update_admin ON niveles;
CREATE POLICY niveles_update_admin ON niveles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS niveles_delete_admin ON niveles;
CREATE POLICY niveles_delete_admin ON niveles
  FOR DELETE
  USING (public.is_admin());

-- ── Cursos ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS cursos_insert_admin ON cursos;
CREATE POLICY cursos_insert_admin ON cursos
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS cursos_update_admin ON cursos;
CREATE POLICY cursos_update_admin ON cursos
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS cursos_delete_admin ON cursos;
CREATE POLICY cursos_delete_admin ON cursos
  FOR DELETE
  USING (public.is_admin());

-- ── Temas ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS temas_insert_admin ON temas;
CREATE POLICY temas_insert_admin ON temas
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS temas_update_admin ON temas;
CREATE POLICY temas_update_admin ON temas
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS temas_delete_admin ON temas;
CREATE POLICY temas_delete_admin ON temas
  FOR DELETE
  USING (public.is_admin());

-- ── Pasos ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS pasos_insert_admin ON pasos;
CREATE POLICY pasos_insert_admin ON pasos
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS pasos_update_admin ON pasos;
CREATE POLICY pasos_update_admin ON pasos
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS pasos_delete_admin ON pasos;
CREATE POLICY pasos_delete_admin ON pasos
  FOR DELETE
  USING (public.is_admin());

-- ── Estudiantes ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS estudiantes_insert_admin ON estudiantes;
CREATE POLICY estudiantes_insert_admin ON estudiantes
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS estudiantes_update_admin ON estudiantes;
CREATE POLICY estudiantes_update_admin ON estudiantes
  FOR UPDATE
  USING (
    public.is_admin()
    OR id IN (SELECT estudiante_id FROM perfiles WHERE id = auth.uid())
  )
  WITH CHECK (
    public.is_admin()
    OR id IN (SELECT estudiante_id FROM perfiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS estudiantes_delete_admin ON estudiantes;
CREATE POLICY estudiantes_delete_admin ON estudiantes
  FOR DELETE
  USING (public.is_admin());
