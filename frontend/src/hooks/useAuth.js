import { useState, useEffect } from "react";
import { getCurrentUser, getProfile } from "../services/authService";
import { supabase } from "../lib/supabaseClient";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function ensureProfile(currentUser) {
    const { data: perfil, error } = await getProfile(currentUser.id);
    if (perfil) return perfil;

    if (error && error.code !== "PGRST116") {
      console.error("Error consultando perfil:", error.message);
    }

    const { data: nuevoPerfil, error: insertError } = await supabase
      .from("perfiles")
      .insert({
        id: currentUser.id,
        rol: "estudiante",
        nombre_visible: currentUser.email?.split("@")[0] || "Estudiante",
        activo: true,
      })
      .select("*, estudiantes(*)")
      .single();

    // Si el perfil ya existe (conflicto de PK), lo recuperamos en lugar de fallar
    if (insertError) {
      if (insertError.code === "23505") {
        // Duplicate key — el perfil fue creado entre el SELECT y el INSERT
        const { data: perfilExistente } = await getProfile(currentUser.id);
        return perfilExistente || null;
      }
      console.error("Error creando perfil automático:", insertError.message);
      return null;
    }

    return nuevoPerfil;
  }

  async function fetchSession() {
    setLoading(true);
    const { user: currentUser } = await getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const perfil = await ensureProfile(currentUser);
      setProfile(perfil);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchSession();
  }, []);

  function refresh() {
    fetchSession();
  }

  return { user, profile, loading, refresh };
}
