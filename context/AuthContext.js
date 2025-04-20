import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/utils/supabaseClient";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const setData = async () => {
    //   // Destructure directly
    //   const {
    //     data: { session },
    //     error,
    //   } = await supabase.auth.getSession();
    //   if (error) throw error;
    //   setSession(session);
    //   setUser(session?.user ?? null);
    //   setLoading(false);
    // };

    // const { data: listener } = supabase.auth.onAuthStateChange(
    //   (_event, session) => {
    //     setSession(session);
    //     setUser(session?.user ?? null);
    //     // No need to set loading false here
    //   }
    // );

    // setData();

    setLoading(true); // Ensure loading is true initially

    // Get initial session *just in case* one exists (e.g., user re-opens app)
    // We won't set loading false here anymore.
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("AuthProvider initial getSession:", initialSession);
      // If a session already exists, onAuthStateChange below will also fire
      // with this session shortly, handling the state update and loading flag.
      // If no session exists yet, we wait for onAuthStateChange.
    });

    // Setup the listener. This listener also fires immediately
    // with the initial auth state, AND processes URL fragments.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("AuthProvider onAuthStateChange:", _event, session);
        setSession(session);
        setUser(session?.user ?? null);
        // Set loading to false HERE, after the listener confirms the state
        setLoading(false);
      }
    );

    // Cleanup listener on component unmount
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setLoading(true); // Indicate loading state during logout
    await supabase.auth.signOut();
    setSession(null); // Clear session state immediately
    setUser(null); // Clear user state immediately
    setLoading(false); // Reset loading state
    // Navigation will be handled in the component calling logout
  };

  const value = {
    session,
    user,
    loading,
    logout, // Provide logout function via context
  };
  // Render children only when initial loading is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
