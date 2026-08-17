import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit3, ChevronRight, BookOpen } from "lucide-react";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

export default function NivelList({ niveles, onDelete, onEdit, onSelect }) {
  if (niveles.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#999" }}>
        <BookOpen size={32} style={{ marginBottom: 12, opacity: 0.3, color: COLORS.teal }} />
        <p style={{ fontStyle: "italic", fontSize: 14 }}>
          No hay niveles registrados aún.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <AnimatePresence mode="popLayout">
        {niveles.map((nivel) => (
          <motion.div
            key={nivel.id}
            layout
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              background: "white",
              border: `1px solid ${COLORS.pergamino}`,
              borderLeft: `3px solid ${COLORS.oro}`,
              borderRadius: "0 4px 4px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              cursor: "pointer",
            }}
            whileHover={{ backgroundColor: "#faf8f4" }}
            onClick={() => onSelect(nivel)}
          >
            {/* Inicial + datos */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "rgba(26,58,74,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Cinzel', serif", fontSize: 15,
                color: COLORS.teal, fontWeight: 600, flexShrink: 0,
              }}>
                {nivel.orden}
              </div>
              <div>
                <p style={{
                  margin: 0, fontFamily: "'Cinzel', serif",
                  fontSize: 14, color: COLORS.teal, letterSpacing: "0.5px",
                }}>
                  {nivel.nombre}
                </p>

              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onEdit(nivel)}
                title="Editar"
                style={{
                  padding: "7px", border: "none", background: "transparent",
                  cursor: "pointer", color: "#aaa", borderRadius: 4,
                  display: "flex", alignItems: "center",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.teal; e.currentTarget.style.background = "rgba(26,58,74,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.background = "transparent"; }}
              >
                <Edit3 size={15} />
              </button>
              <button
                onClick={() => onDelete(nivel.id)}
                title="Eliminar"
                style={{
                  padding: "7px", border: "none", background: "transparent",
                  cursor: "pointer", color: "#aaa", borderRadius: 4,
                  display: "flex", alignItems: "center",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#a32d2d"; e.currentTarget.style.background = "#fee2e2"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.background = "transparent"; }}
              >
                <Trash2 size={15} />
              </button>
              <ChevronRight size={16} style={{ color: COLORS.oro, marginLeft: 4 }} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
