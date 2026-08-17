CREATE TABLE IF NOT EXISTS preguntas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paso_id INTEGER REFERENCES pasos(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  orden INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opciones_respuesta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pregunta_id UUID REFERENCES preguntas(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  es_correcta BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE opciones_respuesta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_preguntas" ON preguntas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "insert_preguntas" ON preguntas FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "update_preguntas" ON preguntas FOR UPDATE USING (public.is_admin());
CREATE POLICY "delete_preguntas" ON preguntas FOR DELETE USING (public.is_admin());

CREATE POLICY "select_opciones" ON opciones_respuesta FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "insert_opciones" ON opciones_respuesta FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "update_opciones" ON opciones_respuesta FOR UPDATE USING (public.is_admin());
CREATE POLICY "delete_opciones" ON opciones_respuesta FOR DELETE USING (public.is_admin());
