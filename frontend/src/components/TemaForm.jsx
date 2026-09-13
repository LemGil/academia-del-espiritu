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

const errorStyle = {
  fontSize: 12,
  color: "#a32d2d",
  marginTop: 4,
  fontFamily: "'EB Garamond', Georgia, serif",
};

const sectionDividerStyle = {
  margin: "20px 0 16px",
  paddingBottom: 8,
  borderBottom: `1px solid ${COLORS.pergamino}`,
  fontSize: 10,
  fontFamily: "'Cinzel', serif",
  color: COLORS.oro,
  letterSpacing: "2px",
  textTransform: "uppercase",
};

export default function TemaForm({ onSave, editingTema, saving, onClose, niveles = [], cursos = [] }) {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    contenido: "",       // PDF de clase (Google Drive u otra URL)
    video_url: "",
    pdf_url: "",         // Material adicional
    titulo_descarga: "", // Título del material adicional
    pdf_premium: false,  // Material adicional exclusivo (membresía futura)
    orden: 0,
    curso_id: "",
  });
  const [nivelTemp, setNivelTemp] = useState("");
  const [formError, setFormError] = useState(null);

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
        pdf_premium: editingTema.pdf_premium || false,
        orden: editingTema.orden ?? 0,
        curso_id: editingTema.curso_id || "",
      });
      setNivelTemp(cursoEncontrado?.nivel_id?.toString() || "");
    } else {
      setFormData({
        titulo: "", descripcion: "", contenido: "", video_url: "",
        pdf_url: "", titulo_descarga: "", pdf_premium: false, orden: 0, curso_id: "",
      });
      setNivelTemp("");
    }
    setFormError(null);
  }, [editingTema]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.titulo.trim()) {
      setFormError("El título del tema es obligatorio.");
      return;
    }
    if (niveles.length > 0 && !nivelTemp) {
      setFormError("Debes seleccionar un nivel.");
      return;
    }
    if (niveles.length > 0 && !formData.curso_id) {
      setFormError("Debes seleccionar un curso.");
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Nivel y Curso */}
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

      {/* Datos principales */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Título del Tema</label>
        <input
          type="text"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Ej: La creación como acto simbólico"
          style={inputStyle}
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

      {/* Sección: Contenido multimedia */}
      <div style={sectionDividerStyle}>Contenido Multimedia</div>

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
        <label style={labelStyle}>PDF de Clase</label>
        <input
          type="url"
          name="contenido"
          value={formData.contenido}
          onChange={handleChange}
          placeholder="https://drive.google.com/file/d/... o cualquier URL de PDF"
          style={inputStyle}
        />
        <p style={{ margin: "5px 0 0", fontSize: 11, color: "#999", fontStyle: "italic" }}>
          Acepta Google Drive, Dropbox u otra URL directa al PDF.
        </p>
      </div>

      {/* Sección: Material adicional */}
      <div style={sectionDividerStyle}>Material Adicional</div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>URL del Material (PDF, libro, aplicación)</label>
        <input
          type="url"
          name="pdf_url"
          value={formData.pdf_url}
          onChange={handleChange}
          placeholder="https://drive.google.com/file/d/... o cualquier URL"
          style={inputStyle}
        />
        <p style={{ margin: "5px 0 0", fontSize: 11, color: "#999", fontStyle: "italic" }}>
          Acepta Google Drive, Dropbox u otra URL directa.
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Título del Material</label>
        <input
          type="text"
          name="titulo_descarga"
          value={formData.titulo_descarga}
          onChange={handleChange}
          placeholder="Ej: LIBRO: Los pasos del cangrejo"
          style={inputStyle}
        />
      </div>

      {/* Checkbox membresía */}
      <div style={{
        marginBottom: 24,
        padding: "12px 14px",
        background: formData.pdf_premium ? "rgba(201,162,74,0.08)" : "transparent",
        border: `1px solid ${formData.pdf_premium ? COLORS.oro : COLORS.pergamino}`,
        borderRadius: 2,
        transition: "all 0.2s",
      }}>
        <label style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          cursor: "pointer",
        }}>
          <input
            type="checkbox"
            name="pdf_premium"
            checked={formData.pdf_premium}
            onChange={handleChange}
            style={{ marginTop: 2, accentColor: COLORS.oro, cursor: "pointer" }}
          />
          <div>
            <span style={{
              fontSize: 12, fontFamily: "'Cinzel', serif",
              color: COLORS.teal, letterSpacing: "0.5px",
            }}>
              Material exclusivo (membresía)
            </span>
            <p style={{
              margin: "3px 0 0", fontSize: 11, color: "#999",
              fontStyle: "italic", fontFamily: "'EB Garamond', Georgia, serif",
            }}>
              Reservado para miembros con acceso especial. La restricción se activará en una versión futura.
            </p>
          </div>
        </label>
      </div>

      {formError && <p style={errorStyle}>{formError}</p>}

      {/* Botones */}
      <div style={{
        display: "flex", gap: 10,
        position: "sticky", bottom: -28,
        background: "#F5F1E8", padding: "15px 0",
        borderTop: "1px solid #D6D0C4",
      }}>
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
