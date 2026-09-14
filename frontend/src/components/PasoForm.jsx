import { useEffect, useState } from "react";

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

const TIPOS = [
  { value: "video", label: "Ver video" },
  { value: "texto", label: "Leer texto" },
  { value: "pdf", label: "Descargar / leer PDF" },
  { value: "pregunta", label: "Responder pregunta" },
  { value: "otro", label: "Otra actividad" },
];

export default function PasoForm({ onSave, editingPaso, saving, onClose }) {
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "otro",
    descripcion: "",
    orden: 0,
  });

  useEffect(() => {
    if (editingPaso) {
      setFormData({
        titulo: editingPaso.titulo || "",
        tipo: editingPaso.tipo || "otro",
        descripcion: editingPaso.descripcion || "",
        orden: editingPaso.orden ?? 0,
      });
    } else {
      setFormData({ titulo: "", tipo: "otro", descripcion: "", orden: 0 });
    }
  }, [editingPaso]);

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
        <label style={labelStyle}>Título del Paso</label>
        <input
          type="text"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Ej: Ver la clase introductoria"
          style={inputStyle}
          required
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Tipo de Actividad</label>
        <select
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          style={inputStyle}
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Descripción / Instrucciones</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={3}
          placeholder="Indica al alumno qué debe hacer..."
          style={{ ...inputStyle, resize: "vertical" }}
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

      <div style={{ display: "flex", gap: 10 }}>
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
          {saving ? "Guardando..." : editingPaso ? "Guardar Cambios" : "Crear Paso"}
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
