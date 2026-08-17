-- =============================================================================
-- Academia del Espíritu — Migración 001
-- Progreso, escalada, certificados y perfiles
--
-- Requisito: tablas existentes niveles, cursos, temas, pasos, estudiantes
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- =============================================================================

-- ── Extensiones útiles ─────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Columnas opcionales en tablas existentes (idempotente) ───────────────────
DO $$
BEGIN
  -- niveles
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'niveles' AND column_name = 'orden') THEN
    ALTER TABLE niveles ADD COLUMN orden int NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'niveles' AND column_name = 'activo') THEN
    ALTER TABLE niveles ADD COLUMN activo boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'niveles' AND column_name = 'descripcion') THEN
    ALTER TABLE niveles ADD COLUMN descripcion text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'niveles' AND column_name = 'created_at') THEN
    ALTER TABLE niveles ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'niveles' AND column_name = 'updated_at') THEN
    ALTER TABLE niveles ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;

  -- cursos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cursos' AND column_name = 'activo') THEN
    ALTER TABLE cursos ADD COLUMN activo boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cursos' AND column_name = 'created_at') THEN
    ALTER TABLE cursos ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cursos' AND column_name = 'updated_at') THEN
    ALTER TABLE cursos ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;

  -- temas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'temas' AND column_name = 'activo') THEN
    ALTER TABLE temas ADD COLUMN activo boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'temas' AND column_name = 'created_at') THEN
    ALTER TABLE temas ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'temas' AND column_name = 'updated_at') THEN
    ALTER TABLE temas ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;

  -- pasos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pasos' AND column_name = 'obligatorio') THEN
    ALTER TABLE pasos ADD COLUMN obligatorio boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pasos' AND column_name = 'created_at') THEN
    ALTER TABLE pasos ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pasos' AND column_name = 'updated_at') THEN
    ALTER TABLE pasos ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;

  -- estudiantes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estudiantes' AND column_name = 'activo') THEN
    ALTER TABLE estudiantes ADD COLUMN activo boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estudiantes' AND column_name = 'notas_pastorales') THEN
    ALTER TABLE estudiantes ADD COLUMN notas_pastorales text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estudiantes' AND column_name = 'created_at') THEN
    ALTER TABLE estudiantes ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estudiantes' AND column_name = 'updated_at') THEN
    ALTER TABLE estudiantes ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- Constraint tipo de paso (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pasos_tipo_check'
  ) THEN
    ALTER TABLE pasos ADD CONSTRAINT pasos_tipo_check
      CHECK (tipo IN ('video', 'texto', 'pdf', 'pregunta', 'otro'));
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'No se pudo crear pasos_tipo_check (revisar valores existentes en pasos.tipo)';
END $$;

-- ── Progreso: grano fino ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progreso_pasos (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estudiante_id  bigint NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  paso_id        bigint NOT NULL REFERENCES pasos(id) ON DELETE CASCADE,
  completado_at  timestamptz NOT NULL DEFAULT now(),
  completado_por text NOT NULL DEFAULT 'estudiante'
    CHECK (completado_por IN ('estudiante', 'admin', 'instructor')),
  notas          text,
  UNIQUE (estudiante_id, paso_id)
);

-- ── Progreso: hitos (tema, curso, nivel) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS progreso_temas (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estudiante_id  bigint NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  tema_id        bigint NOT NULL REFERENCES temas(id) ON DELETE CASCADE,
  completado_at  timestamptz NOT NULL DEFAULT now(),
  porcentaje     smallint NOT NULL DEFAULT 100
    CHECK (porcentaje BETWEEN 0 AND 100),
  UNIQUE (estudiante_id, tema_id)
);

CREATE TABLE IF NOT EXISTS progreso_cursos (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estudiante_id  bigint NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  curso_id       bigint NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  completado_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (estudiante_id, curso_id)
);

CREATE TABLE IF NOT EXISTS progreso_niveles (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estudiante_id       bigint NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  nivel_id            bigint NOT NULL REFERENCES niveles(id) ON DELETE CASCADE,
  completado_at       timestamptz NOT NULL DEFAULT now(),
  listo_certificacion boolean NOT NULL DEFAULT true,
  UNIQUE (estudiante_id, nivel_id)
);

-- ── Historial al escalar de nivel ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS historial_niveles (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estudiante_id bigint NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  nivel_id      bigint NOT NULL REFERENCES niveles(id) ON DELETE RESTRICT,
  fecha_inicio  date,
  fecha_fin     date NOT NULL DEFAULT CURRENT_DATE,
  motivo        text NOT NULL DEFAULT 'completado'
    CHECK (motivo IN ('completado', 'promovido', 'cambio_manual'))
);

-- ── Certificados ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificados (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estudiante_id bigint NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  nivel_id      bigint NOT NULL REFERENCES niveles(id) ON DELETE RESTRICT,
  codigo        text NOT NULL UNIQUE,
  emitido_at    timestamptz NOT NULL DEFAULT now(),
  emitido_por   uuid REFERENCES auth.users(id),
  estado        text NOT NULL DEFAULT 'emitido'
    CHECK (estado IN ('borrador', 'emitido', 'revocado')),
  pdf_url       text,
  notas         text,
  UNIQUE (estudiante_id, nivel_id)
);

-- ── Perfiles (portal + Auth) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS perfiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol             text NOT NULL CHECK (rol IN ('admin', 'instructor', 'estudiante')),
  estudiante_id   bigint UNIQUE REFERENCES estudiantes(id) ON DELETE SET NULL,
  nombre_visible  text,
  activo          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_progreso_pasos_estudiante ON progreso_pasos(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_progreso_pasos_paso ON progreso_pasos(paso_id);
CREATE INDEX IF NOT EXISTS idx_progreso_temas_estudiante ON progreso_temas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_progreso_cursos_estudiante ON progreso_cursos(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_progreso_niveles_estudiante ON progreso_niveles(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_nivel ON estudiantes(nivel_id);
CREATE INDEX IF NOT EXISTS idx_cursos_nivel ON cursos(nivel_id);
CREATE INDEX IF NOT EXISTS idx_temas_curso ON temas(curso_id);
CREATE INDEX IF NOT EXISTS idx_pasos_tema ON pasos(tema_id);
CREATE INDEX IF NOT EXISTS idx_historial_estudiante ON historial_niveles(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_certificados_estudiante ON certificados(estudiante_id);

-- ── Vista: resumen para tablero Progreso ─────────────────────────────────────
CREATE OR REPLACE VIEW v_resumen_estudiante AS
SELECT
  e.id AS estudiante_id,
  e.nombre,
  e.apellido,
  e.email,
  e.nivel_id,
  n.nombre AS nivel_nombre,
  COUNT(DISTINCT p.id) FILTER (WHERE COALESCE(p.obligatorio, true)) AS pasos_totales,
  COUNT(DISTINCT pp.paso_id) AS pasos_completados,
  ROUND(
    100.0 * COUNT(DISTINCT pp.paso_id)
    / NULLIF(COUNT(DISTINCT p.id) FILTER (WHERE COALESCE(p.obligatorio, true)), 0),
    1
  ) AS porcentaje_nivel
FROM estudiantes e
LEFT JOIN niveles n ON n.id = e.nivel_id
LEFT JOIN cursos c ON c.nivel_id = n.id AND COALESCE(c.activo, true)
LEFT JOIN temas t ON t.curso_id = c.id AND COALESCE(t.activo, true)
LEFT JOIN pasos p ON p.tema_id = t.id AND COALESCE(p.obligatorio, true)
LEFT JOIN progreso_pasos pp
  ON pp.estudiante_id = e.id AND pp.paso_id = p.id
WHERE COALESCE(e.activo, true)
GROUP BY e.id, e.nombre, e.apellido, e.email, e.nivel_id, n.nombre;

-- ── Función: ¿tema completado? ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_tema_completado(p_estudiante_id bigint, p_tema_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM pasos p
    WHERE p.tema_id = p_tema_id
      AND COALESCE(p.obligatorio, true)
      AND NOT EXISTS (
        SELECT 1 FROM progreso_pasos pp
        WHERE pp.estudiante_id = p_estudiante_id AND pp.paso_id = p.id
      )
  )
  AND EXISTS (
    SELECT 1 FROM pasos p2
    WHERE p2.tema_id = p_tema_id AND COALESCE(p2.obligatorio, true)
  );
$$;

-- ── Función: ¿curso completado? ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_curso_completado(p_estudiante_id bigint, p_curso_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM temas t
    WHERE t.curso_id = p_curso_id
      AND COALESCE(t.activo, true)
      AND NOT fn_tema_completado(p_estudiante_id, t.id)
  )
  AND EXISTS (
    SELECT 1 FROM temas t2
    WHERE t2.curso_id = p_curso_id AND COALESCE(t2.activo, true)
  );
$$;

-- ── Función: ¿nivel completado? ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_nivel_completado(p_estudiante_id bigint, p_nivel_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM cursos c
    WHERE c.nivel_id = p_nivel_id
      AND COALESCE(c.activo, true)
      AND NOT fn_curso_completado(p_estudiante_id, c.id)
  )
  AND EXISTS (
    SELECT 1 FROM cursos c2
    WHERE c2.nivel_id = p_nivel_id AND COALESCE(c2.activo, true)
  );
$$;

-- ── Función: marcar paso y promover hitos ────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_marcar_paso_completado(
  p_estudiante_id bigint,
  p_paso_id bigint,
  p_completado_por text DEFAULT 'estudiante'
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_tema_id   bigint;
  v_curso_id  bigint;
  v_nivel_id  bigint;
  v_siguiente bigint;
  v_result    jsonb := '{}'::jsonb;
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

  -- Curso
  IF fn_curso_completado(p_estudiante_id, v_curso_id) THEN
    INSERT INTO progreso_cursos (estudiante_id, curso_id)
    VALUES (p_estudiante_id, v_curso_id)
    ON CONFLICT (estudiante_id, curso_id) DO NOTHING;
    v_result := v_result || jsonb_build_object('curso_completado', v_curso_id);
  END IF;

  -- Nivel
  IF fn_nivel_completado(p_estudiante_id, v_nivel_id) THEN
    INSERT INTO progreso_niveles (estudiante_id, nivel_id)
    VALUES (p_estudiante_id, v_nivel_id)
    ON CONFLICT (estudiante_id, nivel_id) DO NOTHING;
    v_result := v_result || jsonb_build_object('nivel_completado', v_nivel_id);

    -- Historial del nivel que terminó
    INSERT INTO historial_niveles (estudiante_id, nivel_id, motivo)
    VALUES (p_estudiante_id, v_nivel_id, 'completado');

    -- Promover al siguiente nivel por orden (si existe)
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

-- ── Comentarios ──────────────────────────────────────────────────────────────
COMMENT ON TABLE progreso_pasos IS 'Fuente de verdad: cada paso marcado por el estudiante';
COMMENT ON TABLE progreso_temas IS 'Hito: tema completado (todos los pasos obligatorios)';
COMMENT ON TABLE progreso_cursos IS 'Hito: curso completado (todos los temas activos)';
COMMENT ON TABLE progreso_niveles IS 'Hito: nivel completado → candidato a certificación';
COMMENT ON TABLE certificados IS 'Certificado emitido al completar un nivel';
COMMENT ON FUNCTION fn_marcar_paso_completado IS
  'Marca un paso y, si aplica, registra tema/curso/nivel y promueve al siguiente nivel';

-- Fin migración 001
