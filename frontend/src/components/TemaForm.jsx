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

export default function TemaForm({ onSave, editingTema, saving, onClose, niveles = [], cursos = [] }) {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    contenido: "",
    video_url: "",
    pdf_url: "",
    titulo_descarga: "",
    orden: 0,
    curso_id: "",
  });
  const [nivelTemp, setNivelTemp] = useState("");

  const filteredCursos = useMemo(() => {
    if (!nivelTemp || !cursos.length) return [];
    return cursos.filter((c) => c.nivel_id === parseInt(nivelTemp));
  }, [nivelTemp, cursos]);

  useEffect(() => {
    if (editingTema) {
      const cursoEncontrado = cursos.find((c) => c.id === editingTema.curso_id);
      setFormData({
        titulo: editingTema.titulo || "",
        descripcion: editingTema.descripcion || "",
        contenido: editingTema.contenido || "",
        video_url: editingTema.video_url || "",
        pdf_url: editingTema.pdf_url || "",
        titulo_descarga: editingTema.titulo_descarga || "",
        orden: editingTema.orden ?? 0,
        curso_id: editingTema.curso_id || "",
      });
      setNivelTemp(cursoEncontrado?.nivel_id?.toString() || "");
    } else {
      setFormData({ titulo: "", descripcion: "", contenido: "", video_url: "", pdf_url: "", titulo_descarga: "", orden: 0, curso_id: "" });
      setNivelTemp("");
    }
  }, [editingTema]);

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

      {niveles.length > 0 && (
        <>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nivel</label>
            <select
              value={nivelTemp}
              onChange={(e) => {
                setNivelTemp(e.target.value);
                setFormData((prev) => ({ ...prev, curso_id: "" }));
              }}
              style={inputStyle}
              required={niveles.length > 0}
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
              name="curso_id"
              value={formData.curso_id}
              onChange={handleChange}
              style={inputStyle}
              required={niveles.length > 0}
              disabled={!nivelTemp}
            >
              <option value="">{nivelTemp ? "Seleccionar curso..." : "Primero selecciona un nivel"}</option>
              {filteredCursos.map((c) => (
                <option key={c.id} value={c.id}>{c.titulo}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Título del Tema</label>
        <input
          type="text"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Ej: La creación como acto simbólico"
          style={inputStyle}
          required
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Descripción</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Breve descripción del tema..."
          rows={3}
          style={{ ...inputStyle, resize: "vertical", fontStyle: "italic" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Enlace PDF de clase (Google Drive)</label>
        <input
          type="url"
          name="contenido"
          value={formData.contenido}
          onChange={handleChange}
          placeholder="https://drive.google.com/file/d/..."
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>URL de Video (YouTube / Vimeo)</label>
        <input
          type="url"
          name="video_url"
          value={formData.video_url}
          onChange={handleChange}
          placeholder="https://youtube.com/watch?v=..."
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>URL de PDF</label>
        <input
          type="url"
          name="pdf_url"
          value={formData.pdf_url}
          onChange={handleChange}
          placeholder="https://..."
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Título del material descargable</label>
        <input
          type="text"
          name="titulo_descarga"
          value={formData.titulo_descarga}
          onChange={handleChange}
          placeholder="Ej: LIBRO: LOS PASOS DEL CANGREJO"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Orden</label>
        <input
          type="number"
          name="orden"
          value={formData.orden}
          onChange={handleChange}
          min={0}
          style={{ ...inputStyle, width: 100 }}
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
          {saving ? "Guardando..." : editingTema ? "Guardar Cambios" : "Crear Tema"}
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
