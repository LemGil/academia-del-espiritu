DROP POLICY IF EXISTS "update_policy" ON entregas_actividades;

CREATE POLICY "update_policy" ON entregas_actividades
  FOR UPDATE USING (
    (alumno_id = auth.uid()) OR public.is_admin()
  );
