CREATE TABLE IF NOT EXISTS entregas_actividades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id UUID REFERENCES auth.users(id),
  actividad_id INTEGER REFERENCES pasos(id) ON DELETE CASCADE,
  respuesta_texto TEXT,
  archivo_url TEXT,
  estado TEXT DEFAULT 'pendiente',
  comentario_admin TEXT,
  revisado_por UUID,
  fecha_revision TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE entregas_actividades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_policy" ON entregas_actividades FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "insert_policy" ON entregas_actividades FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "update_policy" ON entregas_actividades FOR UPDATE USING (public.is_admin());
CREATE POLICY "delete_policy" ON entregas_actividades FOR DELETE USING (public.is_admin());
