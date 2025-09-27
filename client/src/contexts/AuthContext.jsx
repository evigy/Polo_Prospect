// client/src/contexts/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin via RPC
  const fetchIsAdmin = async () => {
    try {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) {
        console.error("is_admin rpc error:", error);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(Boolean(data));
    } catch (err) {
      console.error("is_admin fetch failed:", err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};

    // Initial session load
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session ?? null;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);

      if (s?.user) fetchIsAdmin();
      else setIsAdmin(false);
    });

    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false); // in case initial call raced

      if (newSession?.user) fetchIsAdmin();
      else setIsAdmin(false);
    });

    unsubscribe = () => sub.subscription.unsubscribe();
    return unsubscribe;
  }, []);

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // isAdmin will refresh via onAuthStateChange; optional manual refresh:
    // await fetchIsAdmin();
  }

  async function signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error; // if confirm-email is ON, user must click the email link
  }

  async function signOut() {
    await supabase.auth.signOut();
    setIsAdmin(false);
  }

  const value = {
    session,
    user,
    isAuthenticated: !!user,
    loading,
    isAdmin,           // <-- new
    signIn,
    signUp,
    signOut,
    refreshAdmin: fetchIsAdmin, // optional: expose manual refresh
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};