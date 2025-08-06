import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, USER_ROLES } from '@/lib/constants';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
}

interface AuthUser extends User {
  profile?: UserProfile;
  // Backward compatibility properties
  name?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<{ needsConfirmation: boolean }>;
  logout: () => Promise<void>;
  hasPermission: (permission: { resource: string; action: string }) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              setUser({
                ...session.user,
                profile: profile || undefined,
                // Backward compatibility
                name: profile?.full_name || session.user.email?.split('@')[0] || '',
                role: profile?.role || 'tenant'
              });
            } catch (error) {
              console.error('Error fetching user profile:', error);
              // Set user without profile as fallback
              setUser({
                ...session.user,
                name: session.user.email?.split('@')[0] || '',
                role: 'tenant'
              });
            }
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        // Fetch user profile for existing session
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            setUser({
              ...session.user,
              profile: profile || undefined,
              // Backward compatibility
              name: profile?.full_name || session.user.email?.split('@')[0] || '',
              role: profile?.role || 'tenant'
            });
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // Set user without profile as fallback
            setUser({
              ...session.user,
              name: session.user.email?.split('@')[0] || '',
              role: 'tenant'
            });
          }
          setIsLoading(false);
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    // User and session will be set by the auth state change listener
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: name,
          role: role
        }
      }
    });

    setIsLoading(false);

    if (error) {
      throw error;
    }

    // Return whether the user needs to confirm their email
    const needsConfirmation = !data.session && data.user && !data.user.email_confirmed_at;
    return { needsConfirmation };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    setUser(null);
    setSession(null);
  };

  const hasPermission = (permission: { resource: string; action: string }) => {
    if (!user?.profile) return false;

    const userRole = user.profile.role;

    // Admin has all permissions
    if (userRole === USER_ROLES.ADMIN) return true;

    // Basic role-based permissions
    const rolePermissions: Record<UserRole, Record<string, string[]>> = {
      [USER_ROLES.ADMIN]: {},
      [USER_ROLES.OWNER]: { 
        users: ['view', 'create'], 
        maintenance: ['view', 'update'], 
        payments: ['view'] 
      },
      [USER_ROLES.VENDOR]: { 
        maintenance: ['view', 'update'], 
        users: ['view'] 
      },
      [USER_ROLES.TENANT]: { 
        maintenance: ['create', 'view'], 
        payments: ['create', 'view'] 
      },
    };

    const userPermissions = rolePermissions[userRole];
    const resourcePermissions = userPermissions[permission.resource];
    return resourcePermissions && resourcePermissions.includes(permission.action);
  };

  const value = {
    user,
    session,
    isLoading,
    login,
    signup,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};