import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isDevBypassed, clearDevBypass } from "@/pages/Auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    if (isDevBypassed()) {
      setDevMode(true);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (devMode) {
      clearDevBypass();
      setDevMode(false);
      window.location.href = '/auth';
      return;
    }
    await supabase.auth.signOut();
  };

  const isAuthenticated = devMode || !!session;

  return { user, session, loading, signOut, isAuthenticated, devMode };
};
