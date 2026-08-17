-- =============================================================================
-- Academia del Espíritu — Migración 004
-- Certificados por curso + auto-generación en RPC
-- Requisito: migración 001 aplicada
-- =============================================================================

-- ── Agregar columna curso_id a certificados (opcional) ────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificados' AND column_name = 'curso_id'
  ) THEN
    ALTER TABLE certificados ADD COLUMN curso_id bigint REFERENCES cursos(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── Cambiar UNIQUE para permitir cert por curso y por nivel ───────────────
ALTER TABLE certificados DROP CONSTRAINT IF EXISTS certificados_estudiante_id_nivel_id_key;
ALTER TABLE certificados DROP CONSTRAINT IF EXISTS certificados_estudiante_id_nivel_id_curso_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_certificados_unique
  ON certificados (estudiante_id, COALESCE(nivel_id, 0), COALESCE(curso_id, 0));

-- ── Reemplazar función fn_marcar_paso_completado ───────────────────────────
-- Ahora genera automáticamente certificados al completar curso y nivel
CREATE OR REPLACE FUNCTION fn_marcar_paso_completado(
  p_estudiante_id bigint,
  p_paso_id bigint,
  p_completado_por text DEFAULT 'estudiante'
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_tema_id     bigint;
  v_curso_id    bigint;
  v_nivel_id    bigint;
  v_siguiente   bigint;
  v_codigo      text;
  v_result      jsonb := '{}'::jsonb;
BEGIN
  SELECT p.tema_id, t.curso_id, c.nivel_id
  INTO v_tema_id, v_curso_id, v_nivel_id
  FROM pasos p
  JOIN temas t ON t.id = p.tema_id
  JOIN cursos c ON c.id = t.curso_id
  WHERE p.id = p_paso_id;

  IF v_tema_id IS NULL THEN
    RAISE EXCEPTION 'Paso % no encontrado', p_paso_id;
  END IF;

  INSERT INTO progreso_pasos (estudiante_id, paso_id, completado_por)
  VALUES (p_estudiante_id, p_paso_id, p_completado_por)
  ON CONFLICT (estudiante_id, paso_id) DO NOTHING;

  -- Tema
  IF fn_tema_completado(p_estudiante_id, v_tema_id) THEN
    INSERT INTO progreso_temas (estudiante_id, tema_id)
    VALUES (p_estudiante_id, v_tema_id)
    ON CONFLICT (estudiante_id, tema_id) DO NOTHING;
    v_result := v_result || jsonb_build_object('tema_completado', v_tema_id);
  END IF;

  -- Curso → genera certificado
  IF fn_curso_completado(p_estudiante_id, v_curso_id) THEN
    INSERT INTO progreso_cursos (estudiante_id, curso_id)
    VALUES (p_estudiante_id, v_curso_id)
    ON CONFLICT (estudiante_id, curso_id) DO NOTHING;
    v_result := v_result || jsonb_build_object('curso_completado', v_curso_id);

    -- Certificado de curso
    v_codigo := 'CUR-' || p_estudiante_id || '-' || v_curso_id || '-' || to_char(now(), 'YYYYMMDD');
    INSERT INTO certificados (estudiante_id, nivel_id, curso_id, codigo, emitido_por)
    VALUES (p_estudiante_id, v_nivel_id, v_curso_id, v_codigo,
      (CASE WHEN p_completado_por = 'estudiante' THEN auth.uid() ELSE NULL END))
    ON CONFLICT (estudiante_id, COALESCE(nivel_id, 0), COALESCE(curso_id, 0)) DO NOTHING;
    v_result := v_result || jsonb_build_object('cert_curso', v_curso_id);
  END IF;

  -- Nivel → genera certificado de nivel
  IF fn_nivel_completado(p_estudiante_id, v_nivel_id) THEN
    INSERT INTO progreso_niveles (estudiante_id, nivel_id)
    VALUES (p_estudiante_id, v_nivel_id)
    ON CONFLICT (estudiante_id, nivel_id) DO NOTHING;
    v_result := v_result || jsonb_build_object('nivel_completado', v_nivel_id);

    -- Certificado de nivel
    v_codigo := 'NIV-' || p_estudiante_id || '-' || v_nivel_id || '-' || to_char(now(), 'YYYYMMDD');
    INSERT INTO certificados (estudiante_id, nivel_id, curso_id, codigo, emitido_por)
    VALUES (p_estudiante_id, v_nivel_id, NULL, v_codigo,
      (CASE WHEN p_completado_por = 'estudiante' THEN auth.uid() ELSE NULL END))
    ON CONFLICT (estudiante_id, COALESCE(nivel_id, 0), COALESCE(curso_id, 0)) DO NOTHING;

    -- Historial
    INSERT INTO historial_niveles (estudiante_id, nivel_id, motivo)
    VALUES (p_estudiante_id, v_nivel_id, 'completado');

    -- Promover al siguiente nivel
    SELECT id INTO v_siguiente
    FROM niveles
    WHERE COALESCE(activo, true)
      AND orden > (SELECT orden FROM niveles WHERE id = v_nivel_id)
    ORDER BY orden ASC
    LIMIT 1;

    IF v_siguiente IS NOT NULL THEN
      UPDATE estudiantes SET nivel_id = v_siguiente, updated_at = now()
      WHERE id = p_estudiante_id;
      v_result := v_result || jsonb_build_object('nivel_promovido', v_siguiente);
    ELSE
      v_result := v_result || jsonb_build_object('nivel_promovido', null);
    END IF;
  END IF;

  RETURN v_result || jsonb_build_object('paso_id', p_paso_id);
END;
$$;

COMMENT ON COLUMN certificados.curso_id IS 'Si tiene valor, es certificado de curso; si es NULL, es certificado de nivel';
