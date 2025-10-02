/**
 * AuthContext - Maneja la autenticación usando únicamente el backend local
 */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { User, AuthContextType, LoginCredentials, RegisterData } from '../types';
import { apiService } from '../services/api';

// Estado de autenticación
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

// Acciones del reducer
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

/**
 * Reducer para manejar el estado de autenticación
 */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Proveedor del contexto de autenticación
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Inicializa la autenticación verificando el token almacenado
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        // Validar que los valores no sean null, undefined o strings inválidas
        if (token && token !== 'undefined' && token !== 'null' && 
            userStr && userStr !== 'undefined' && userStr !== 'null') {
          
          try {
            const user = JSON.parse(userStr);
            
            // Verificar que el token sigue siendo válido
            const profile = await apiService.getProfile();
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user: profile.data, token },
            });
          } catch (parseError) {
            console.error('Error parsing user data or validating token:', parseError);
            // Limpiar datos corruptos
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: 'LOGIN_FAILURE' });
          }
        } else {
          // No hay datos válidos, limpiar cualquier dato corrupto
          if (token === 'undefined' || token === 'null' || userStr === 'undefined' || userStr === 'null') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Limpiar almacenamiento en caso de error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGIN_FAILURE' });
      }
    };

    initializeAuth();
  }, []);

  /**
   * Función de login usando el backend local
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Hacer login con el backend local
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el login');
      }

      const responseData = await response.json();
      
      // El backend devuelve { data: { user, token } }
      const { user, token } = responseData.data || responseData;

      // Validar que los datos sean válidos antes de guardar
      if (!token || !user || token === 'undefined' || user === 'undefined') {
        throw new Error('Datos de autenticación inválidos recibidos del servidor');
      }

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  /**
   * Función de registro usando el backend local
   */
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Hacer registro con el backend local
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`, // Requiere autenticación de admin
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }

      const responseData = await response.json();
      
      // El backend devuelve { data: { user, token } }
      const { user, token } = responseData.data || responseData;

      // Validar que los datos sean válidos antes de guardar
      if (!token || !user || token === 'undefined' || user === 'undefined') {
        throw new Error('Datos de registro inválidos recibidos del servidor');
      }

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
    } catch (error) {
      console.error('Register error:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  /**
   * Función de logout
   */
  const logout = async (): Promise<void> => {
    try {
      // Limpiar almacenamiento local
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Aún así limpiar el estado local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  /**
   * Función para actualizar el perfil del usuario
   */
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await apiService.updateProfile(userData);
      
      // Validar que los datos del usuario sean válidos
      if (!updatedUser.data) {
        throw new Error('Datos de usuario inválidos recibidos del servidor');
      }
      
      // Actualizar en localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser.data));
      
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser.data,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;