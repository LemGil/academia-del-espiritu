import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit3, Users, UserPlus } from "lucide-react";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

export default function EstudianteList({ estudiantes, onEdit, onDelete, onCrearAcceso }) {
  if (!estudiantes.length) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#999" }}>
        <Users size={32} style={{ marginBottom: 12, opacity: 0.3, color: COLORS.teal }} />
        <p style={{ fontStyle: "italic", fontSize: 14 }}>
          No hay estudiantes registrados aún.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <AnimatePresence mode="popLayout">
        {estudiantes.map((est) => {
          const tienePerfil = est.tienePerfil;
          return (
            <motion.div
              key={est.id}
              layout
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              style={{
                background: "white",
                border: `1px solid ${COLORS.pergamino}`,
                borderLeft: `3px solid ${tienePerfil ? "#276749" : COLORS.oro}`,
                borderRadius: "0 4px 4px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
              }}
            >
              {/* Avatar + datos */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(26,58,74,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Cinzel', serif", fontSize: 15,
                  color: COLORS.teal, fontWeight: 600, flexShrink: 0,
                }}>
                  {est.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{
                    margin: 0, fontFamily: "'Cinzel', serif",
                    fontSize: 14, color: COLORS.teal, letterSpacing: "0.5px",
                  }}>
                    {est.nombre} {est.apellido}
                  </p>
                  <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
                    {est.email && (
                      <p style={{ margin: 0, fontSize: 12, color: "#999", fontStyle: "italic" }}>
                        {est.email}
                      </p>
                    )}
                    {est.telefono && (
                      <p style={{ margin: 0, fontSize: 12, color: "#999" }}>
                        {est.telefono}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    {est.niveles && (
                      <span style={{
                        fontSize: 10, fontFamily: "'Cinzel', serif",
                        letterSpacing: "1px", padding: "2px 8px",
                        borderRadius: 2,
                        background: "rgba(201,162,74,0.15)",
                        color: COLORS.teal,
                      }}>
                        {est.niveles.nombre}
                      </span>
                    )}
                    {tienePerfil ? (
                      <span style={{
                        fontSize: 10, fontFamily: "'Cinzel', serif",
                        letterSpacing: "1px", padding: "2px 8px",
                        borderRadius: 2,
                        background: "rgba(39,103,73,0.1)",
                        color: "#276749",
                      }}>
                        Perfil activo
                      </span>
                    ) : (
                      <span style={{
                        fontSize: 10, fontFamily: "'Cinzel', serif",
                        letterSpacing: "1px", padding: "2px 8px",
                        borderRadius: 2,
                        background: "rgba(201,162,74,0.1)",
                        color: COLORS.oro,
                      }}>
                        Sin acceso
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {!tienePerfil && onCrearAcceso && (
                  <button
                    onClick={() => onCrearAcceso(est)}
                    title="Crear acceso al portal"
                    style={{
                      padding: "7px", border: "none", background: "transparent",
                      cursor: "pointer", color: "#aaa", borderRadius: 4,
                      display: "flex", alignItems: "center",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#276749"; e.currentTarget.style.background = "rgba(39,103,73,0.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.background = "transparent"; }}
                  >
                    <UserPlus size={15} />
                  </button>
                )}
                <button
                  onClick={() => onEdit(est)}
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
                  onClick={() => onDelete(est.id)}
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
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
