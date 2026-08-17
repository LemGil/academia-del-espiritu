import React, { useEffect, useState, useRef } from "react";

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

export default function CursoForm({ onSave, editingCurso, saving, onClose, niveles = [] }) {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    orden: 0,
    texto_biblico: "",
    nivel_id: "",
  });
  const imagenFileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (editingCurso) {
      setFormData({
        titulo: editingCurso.titulo || "",
        descripcion: editingCurso.descripcion || "",
        orden: editingCurso.orden ?? 0,
        texto_biblico: editingCurso.texto_biblico || "",
        nivel_id: editingCurso.nivel_id || "",
      });
      setPreview(editingCurso.imagen_url || null);
    } else {
      setFormData({ titulo: "", descripcion: "", orden: 0, texto_biblico: "", nivel_id: "" });
      setPreview(null);
    }
    imagenFileRef.current = null;
  }, [editingCurso]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    imagenFileRef.current = file;
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("imagenFile ref:", imagenFileRef.current);
    onSave(formData, imagenFileRef.current);
  };

  return (
    <form onSubmit={handleSubmit}>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Título del Curso</label>
        <input
          type="text"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Ej: Fundamentos de meditación"
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
          rows={3}
          placeholder="Describe de qué trata el curso..."
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
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

      {niveles.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nivel</label>
          <select
            name="nivel_id"
            value={formData.nivel_id}
            onChange={handleChange}
            style={inputStyle}
            required={niveles.length > 0}
          >
            <option value="">Seleccionar nivel...</option>
            {niveles.map((n) => (
              <option key={n.id} value={n.id}>{n.nombre}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Imagen / Portada</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: "block", marginTop: 6, fontSize: 13, color: COLORS.teal }}
        />
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{
              marginTop: 10, width: "100%", height: 140,
              objectFit: "cover", borderRadius: 4,
              border: `1px solid ${COLORS.pergamino}`,
            }}
          />
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Texto Bíblico del Certificado</label>
        <textarea
          name="texto_biblico"
          value={formData.texto_biblico}
          onChange={handleChange}
          rows={2}
          placeholder="Ej: Todo lo puedo en Cristo que me fortalece. Fil. 4:13"
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
          {saving ? "Guardando..." : editingCurso ? "Guardar Cambios" : "Crear Curso"}
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
