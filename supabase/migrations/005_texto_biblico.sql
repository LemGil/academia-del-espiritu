-- =============================================================================
-- Academia del Espíritu — Migración 005
-- Columna texto_biblico para certificados y avales de nivel
-- Requisito: migración 001 aplicada
-- =============================================================================

DO $$
BEGIN
  -- niveles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'niveles' AND column_name = 'texto_biblico'
  ) THEN
    ALTER TABLE niveles ADD COLUMN texto_biblico text;
  END IF;

  -- cursos
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cursos' AND column_name = 'texto_biblico'
  ) THEN
    ALTER TABLE cursos ADD COLUMN texto_biblico text;
  END IF;
END $$;

COMMENT ON COLUMN niveles.texto_biblico IS 'Versículo bíblico que aparece en el Aval de Nivel';
COMMENT ON COLUMN cursos.texto_biblico IS 'Versículo bíblico que aparece en el Certificado de Curso';
