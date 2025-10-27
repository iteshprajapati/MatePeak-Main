import { supabase } from "@/integrations/supabase/client";

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'mentor';
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Sign up a new user
 * Supabase automatically hashes passwords and generates JWT tokens
 */
export async function signup(data: SignupData) {
  const { name, email, password, role } = data;
  
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    if (error) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      if (error.message.includes('fetch')) {
        return { success: false, error: 'Network error. Please check your internet connection.' };
      } else if (error.message.includes('User already registered')) {
        return { success: false, error: 'An account with this email already exists.' };
      } else {
        return { success: false, error: error.message };
      }
    }
    
    return { 
      success: true, 
      message: 'Signup successful! Please check your email to verify your account.',
      data: authData 
    };
  } catch (error: any) {
    console.error('Unexpected signup error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { success: false, error: 'Unable to connect to the server. Please check your internet connection.' };
    }
    
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred during signup.' 
    };
  }
}

/**
 * Log in an existing user
 * Returns JWT token automatically stored in localStorage
 */
export async function login(data: LoginData) {
  const { email, password } = data;
  
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
  
  return { 
    success: true, 
    message: 'Login successful!',
    data: authData 
  };
}

/**
 * Log out current user
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, message: 'Logged out successfully' };
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Get user error:', error);
    return { success: false, error: error.message, user: null };
  }
  
  return { success: true, user };
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Get session error:', error);
    return { success: false, error: error.message, session: null };
  }
  
  return { success: true, session };
}
