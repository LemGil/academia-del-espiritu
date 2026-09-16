import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit3, ChevronDown, ChevronRight, Plus, BookOpen, Eye } from "lucide-react";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

const TIPO_LABELS = {
  video: "Video",
  texto: "Texto",
  pdf: "PDF",
  pregunta: "Pregunta",
  otro: "Actividad",
};

const TIPO_COLORS = {
  video: "#e53e3e",
  texto: "#2b6cb0",
  pdf: "#c05621",
  pregunta: "#6b46c1",
  otro: "#276749",
};

function PasoItem({ paso, onEdit, onDelete }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 14px",
      background: COLORS.marfil,
      border: `1px solid ${COLORS.pergamino}`,
      borderRadius: 2,
      marginBottom: 6,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          fontSize: 10, fontFamily: "'Cinzel', serif",
          letterSpacing: "1px", padding: "2px 8px",
          borderRadius: 2, background: TIPO_COLORS[paso.tipo] || "#888",
          color: "white",
        }}>
          {TIPO_LABELS[paso.tipo] || "Actividad"}
        </span>
        <div>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.teal, fontFamily: "'Cinzel', serif" }}>
            {paso.titulo || "Sin título"}
          </p>
          {paso.descripcion && (
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888", fontStyle: "italic" }}>
              {paso.descripcion}
            </p>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={() => onEdit(paso)} style={btnStyle("#888", "transparent")}
          onMouseEnter={(e) => applyHover(e, COLORS.teal, "rgba(26,58,74,0.08)")}
          onMouseLeave={(e) => applyHover(e, "#888", "transparent")}>
          <Edit3 size={13} />
        </button>
        <button onClick={() => onDelete(paso.id)} style={btnStyle("#888", "transparent")}
          onMouseEnter={(e) => applyHover(e, "#a32d2d", "#fee2e2")}
          onMouseLeave={(e) => applyHover(e, "#888", "transparent")}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function btnStyle(color, bg) {
  return {
    padding: "6px", border: "none", background: bg,
    cursor: "pointer", color, borderRadius: 4,
    display: "flex", alignItems: "center", transition: "all 0.15s",
  };
}

function applyHover(e, color, bg) {
  e.currentTarget.style.color = color;
  e.currentTarget.style.background = bg;
}

export default function TemaList({ temas, onEdit, onDelete, onVer, pasosPorTema, onEditPaso, onDeletePaso, onAddPaso }) {
  const [expandido, setExpandido] = useState(null);

  if (!temas.length) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#999" }}>
        <BookOpen size={32} style={{ marginBottom: 12, opacity: 0.3, color: COLORS.teal }} />
        <p style={{ fontStyle: "italic", fontSize: 14 }}>Esta serie aún no tiene academias.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <AnimatePresence mode="popLayout">
        {temas.map((tema, idx) => {
          const abierto = expandido === tema.id;
          const pasos = pasosPorTema[tema.id] || [];

          return (
            <motion.div
              key={tema.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              style={{
                background: "white",
                border: `1px solid ${COLORS.pergamino}`,
                borderLeft: `3px solid ${COLORS.oro}`,
                borderRadius: "0 4px 4px 0",
              }}
            >
              {/* Cabecera del tema */}
              <div
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", padding: "14px 16px",
                  cursor: "pointer",
                }}
                onClick={() => setExpandido(abierto ? null : tema.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "rgba(26,58,74,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Cinzel', serif", fontSize: 12,
                    color: COLORS.teal, fontWeight: 600, flexShrink: 0,
                  }}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p style={{
                      margin: 0, fontFamily: "'Cinzel', serif",
                      fontSize: 14, color: COLORS.teal, letterSpacing: "0.5px",
                    }}>
                      {tema.titulo}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#999" }}>
                      {pasos.length} {pasos.length === 1 ? "paso" : "pasos"}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 4 }}
                  onClick={(e) => e.stopPropagation()}>
                  {/* Botón Ver detalle */}
                  <button
                    onClick={() => onVer?.(tema)}
                    title="Ver contenido"
                    style={btnStyle(COLORS.oro, "transparent")}
                    onMouseEnter={(e) => applyHover(e, COLORS.teal, "rgba(201,162,74,0.12)")}
                    onMouseLeave={(e) => applyHover(e, COLORS.oro, "transparent")}
                  >
                    <Eye size={15} />
                  </button>
                  <button onClick={() => onEdit(tema)} style={btnStyle("#aaa", "transparent")}
                    onMouseEnter={(e) => applyHover(e, COLORS.teal, "rgba(26,58,74,0.08)")}
                    onMouseLeave={(e) => applyHover(e, "#aaa", "transparent")}>
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => onDelete(tema.id)} style={btnStyle("#aaa", "transparent")}
                    onMouseEnter={(e) => applyHover(e, "#a32d2d", "#fee2e2")}
                    onMouseLeave={(e) => applyHover(e, "#aaa", "transparent")}>
                    <Trash2 size={14} />
                  </button>
                  {abierto
                    ? <ChevronDown size={16} style={{ color: COLORS.oro, marginLeft: 4 }} />
                    : <ChevronRight size={16} style={{ color: COLORS.oro, marginLeft: 4 }} />
                  }
                </div>
              </div>

              {/* Pasos expandibles */}
              <AnimatePresence>
                {abierto && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{
                      padding: "0 16px 16px",
                      borderTop: `1px solid ${COLORS.pergamino}`,
                      paddingTop: 14,
                    }}>
                      {pasos.length === 0 && (
                        <p style={{ fontSize: 13, color: "#bbb", fontStyle: "italic", marginBottom: 10 }}>
                          No hay pasos aún.
                        </p>
                      )}
                      {pasos.map((paso) => (
                        <PasoItem
                          key={paso.id}
                          paso={paso}
                          onEdit={onEditPaso}
                          onDelete={onDeletePaso}
                        />
                      ))}
                      <button
                        onClick={() => onAddPaso(tema.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          marginTop: 6, padding: "7px 14px",
                          background: "transparent",
                          border: `1px dashed ${COLORS.oro}`,
                          borderRadius: 2, cursor: "pointer",
                          fontSize: 11, color: COLORS.oro,
                          fontFamily: "'Cinzel', serif", letterSpacing: "1px",
                        }}
                      >
                        <Plus size={12} /> Agregar Paso
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
