import React, { useEffect, useState } from "react";

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

export default function EstudianteForm({ onSave, editingEstudiante, saving, onClose, niveles = [] }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    fecha_ingreso: "",
    nivel_id: "",
  });

  useEffect(() => {
    if (editingEstudiante) {
      setFormData({
        nombre: editingEstudiante.nombre || "",
        apellido: editingEstudiante.apellido || "",
        email: editingEstudiante.email || "",
        telefono: editingEstudiante.telefono || "",
        fecha_ingreso: editingEstudiante.fecha_ingreso || "",
        nivel_id: editingEstudiante.nivel_id || "",
      });
    } else {
      setFormData({ nombre: "", apellido: "", email: "", telefono: "", fecha_ingreso: "", nivel_id: "" });
    }
  }, [editingEstudiante]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      nivel_id: formData.nivel_id ? parseInt(formData.nivel_id) : null,
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit}>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Juan"
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label style={labelStyle}>Apellido</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Ej: Pérez"
            style={inputStyle}
            required
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Teléfono</label>
        <input
          type="text"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="Ej: +53 5 000 0000"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Fecha de Ingreso</label>
        <input
          type="date"
          name="fecha_ingreso"
          value={formData.fecha_ingreso}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Nivel</label>
        <select
          name="nivel_id"
          value={formData.nivel_id}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">Sin nivel asignado</option>
          {niveles.map((n) => (
            <option key={n.id} value={n.id}>{n.nombre}</option>
          ))}
        </select>
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
          {saving ? "Guardando..." : editingEstudiante ? "Guardar Cambios" : "Registrar Estudiante"}
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
