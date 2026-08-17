import React, { useEffect, useState, useMemo } from "react";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: `1px solid ${COLORS.pergamino}`,
  borderRadius: 2,
  fontSize: 14,
  outline: "none",
  background: "white",
  color: COLORS.teal,
  boxSizing: "border-box",
  marginTop: 4,
  fontFamily: "'EB Garamond', Georgia, serif",
};

const labelStyle = {
  fontSize: 12,
  fontFamily: "'Cinzel', serif",
  color: COLORS.teal,
  letterSpacing: "0.5px",
};

export default function ActividadForm({ onSave, editingActividad, saving, onClose, niveles = [], cursos = [], temas = [] }) {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tema_id: "",
    tipo: "leer_texto", // Default
  });
  const [nivelTemp, setNivelTemp] = useState("");
  const [cursoTemp, setCursoTemp] = useState("");

  const tipos = [
    { value: "leer_texto", label: "Confirmar lectura" },
    { value: "ver_video", label: "Confirmar video visto" },
    { value: "responder_preguntas", label: "Responder preguntas" },
    { value: "unirse_grupo", label: "Confirmar grupo" },
    { value: "bautizarse", label: "Bautizarse (Manual)" },
    { value: "otro", label: "Acción libre" },
  ];


  const filteredCursos = useMemo(() => {
    if (!nivelTemp || !cursos.length) return [];
    return cursos.filter((c) => c.nivel_id === parseInt(nivelTemp));
  }, [nivelTemp, cursos]);

  const filteredTemas = useMemo(() => {
    if (!cursoTemp || !temas.length) return [];
    return temas.filter((t) => t.curso_id === parseInt(cursoTemp));
  }, [cursoTemp, temas]);

  useEffect(() => {
    if (editingActividad) {
      const temaEncontrado = temas.find((t) => t.id === editingActividad.tema_id);
      const cursoEncontrado = temaEncontrado
        ? cursos.find((c) => c.id === temaEncontrado.curso_id)
        : null;
      setFormData({
        titulo: editingActividad.titulo || "",
        descripcion: editingActividad.descripcion || "",
        tema_id: editingActividad.tema_id || "",
        tipo: editingActividad.tipo || "leer_texto",
      });
      setCursoTemp(cursoEncontrado?.id?.toString() || "");
      setNivelTemp(cursoEncontrado?.nivel_id?.toString() || "");
    } else {
      setFormData({ titulo: "", descripcion: "", tema_id: "", tipo: "leer_texto" });
      setNivelTemp("");
      setCursoTemp("");
    }
  }, [editingActividad, temas, cursos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Nivel</label>
        <select
          value={nivelTemp}
          onChange={(e) => {
            setNivelTemp(e.target.value);
            setCursoTemp("");
            setFormData((prev) => ({ ...prev, tema_id: "" }));
          }}
          style={inputStyle}
          required
        >
          <option value="">Seleccionar nivel...</option>
          {niveles.map((n) => (
            <option key={n.id} value={n.id}>{n.nombre}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Curso</label>
        <select
          value={cursoTemp}
          onChange={(e) => {
            setCursoTemp(e.target.value);
            setFormData((prev) => ({ ...prev, tema_id: "" }));
          }}
          style={inputStyle}
          required
          disabled={!nivelTemp}
        >
          <option value="">{nivelTemp ? "Seleccionar curso..." : "Primero selecciona un nivel"}</option>
          {filteredCursos.map((c) => (
            <option key={c.id} value={c.id}>{c.titulo}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Tema</label>
        <select
          name="tema_id"
          value={formData.tema_id}
          onChange={handleChange}
          style={inputStyle}
          required
          disabled={!cursoTemp}
        >
          <option value="">{cursoTemp ? "Seleccionar tema..." : "Primero selecciona un curso"}</option>
          {filteredTemas.map((t) => (
            <option key={t.id} value={t.id}>{t.titulo}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Tipo de actividad</label>
        <select
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          style={inputStyle}
          required
        >
          {tipos.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Título de la Actividad</label>
        <input
          type="text"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Ej: Reflexión personal"
          style={inputStyle}
          required
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Descripción / Instrucciones</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={4}
          placeholder="Instrucciones para el alumno..."
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div style={{ display: "flex", gap: 10, position: "sticky", bottom: -28, background: "#F5F1E8", padding: "15px 0", borderTop: "1px solid #D6D0C4" }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            flex: 1,
            background: COLORS.oro,
            color: COLORS.teal,
            border: "none",
            padding: "10px 0",
            borderRadius: 2,
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            letterSpacing: "1px",
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Guardando..." : editingActividad ? "Guardar Cambios" : "Crear Actividad"}
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            background: "transparent",
            color: COLORS.teal,
            border: `1px solid ${COLORS.pergamino}`,
            padding: "10px 0",
            borderRadius: 2,
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            letterSpacing: "1px",
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
      </div>

    </form>
  );
}
