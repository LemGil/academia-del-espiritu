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

export default function NivelForm({ onSave, editingNivel, saving, onClose }) {
  const [formData, setFormData] = useState({
    nombre: "",
    color: "#1A3A4A",
    orden: 0,
    texto_biblico: "",
  });

  useEffect(() => {
    if (editingNivel) {
      setFormData({
        nombre: editingNivel.nombre || "",
        color: editingNivel.color || "#1A3A4A",
        orden: editingNivel.orden ?? 0,
        texto_biblico: editingNivel.texto_biblico || "",
      });
    } else {
      setFormData({ nombre: "", color: "#1A3A4A", orden: 0, texto_biblico: "" });
    }
  }, [editingNivel]);

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
        <label style={labelStyle}>Nombre del Nivel</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Nivel I — Fundamentos"
          style={inputStyle}
          required
        />
      </div>

      <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Orden</label>
          <input
            type="number"
            name="orden"
            value={formData.orden}
            onChange={handleChange}
            min={1}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Color</label>
          <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              style={{ width: 40, height: 36, border: `1px solid ${COLORS.pergamino}`, borderRadius: 2, padding: 0, cursor: "pointer", background: "none" }}
            />
            <span style={{ fontSize: 12, color: COLORS.teal, fontFamily: "'Cinzel', serif" }}>
              {formData.color}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Texto Bíblico del Aval de Nivel</label>
        <textarea
          name="texto_biblico"
          value={formData.texto_biblico}
          onChange={handleChange}
          rows={2}
          placeholder="Ej: Todo lo puedo en Cristo que me fortalece. Fil. 4:13"
          style={{ ...inputStyle, resize: "vertical" }}
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
          {saving ? "Guardando..." : editingNivel ? "Guardar Cambios" : "Crear Nivel"}
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
