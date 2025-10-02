/**
 * Página de login
 */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TruckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import type { LoginCredentials } from '../types';

// Schema de validación
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Componente de página de login
 */
const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la ruta de redirección después del login
  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  /**
   * Maneja el envío del formulario de login
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
      };

      await login(credentials);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Error en login:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Error al iniciar sesión. Por favor, verifica tus credenciales.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary py-6 px-4">
      <div className="w-full" style={{ maxWidth: '28rem' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <TruckIcon className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-secondary-900 mb-2">
            Iniciar Sesión
          </h2>
          <p className="text-sm text-secondary-600">
            Sistema de Gestión de Alquiler de Vehículos
          </p>
        </div>

        {/* Formulario */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className={`form-input ${
                  errors.email ? 'error' : ''
                }`}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`form-input ${
                    errors.password ? 'error' : ''
                  }`}
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-secondary-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-secondary-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
              <div className="text-sm text-error">{error}</div>
            </div>
          )}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" style={{ animation: 'spin 1s linear infinite' }}></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>

          {/* Links */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/register"
                className="font-medium text-primary hover:text-primary-700 transition"
              >
                ¿No tienes cuenta? Regístrate
              </Link>
            </div>
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary hover:text-primary-700 transition"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <h3 className="text-sm font-medium text-info mb-2">Credenciales de Demo:</h3>
          <div className="text-xs text-info space-y-1">
            <p><strong>Admin:</strong> admin@rentautopro.com / admin123</p>
            <p><strong>Gestor:</strong> gestor@rentautopro.com / gestor123</p>
            <p><strong>Cliente:</strong> cliente@rentautopro.com / cliente123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;