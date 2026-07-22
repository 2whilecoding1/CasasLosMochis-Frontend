import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Common/Button';
import useAuthStore from '../stores/authStore';

function getMessage(error) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error.detail) return error.detail;
  const firstKey = Object.keys(error)[0];
  if (!firstKey) return 'Error al iniciar sesion';
  const value = error[firstKey];
  if (Array.isArray(value)) return value[0];
  return String(value);
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data) => {
    try {
      await login(data.username, data.password);
    } catch {
      // El error se maneja desde el store.
    }
  };

  return (
    <div className="min-h-screen bg-silver-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-silver-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <h1 className="font-['Playfair_Display'] font-bold text-2xl sm:text-3xl text-[#1a1a1a] mb-2">
          Iniciar sesion
        </h1>
        <p className="text-silver-500 text-sm mb-6">
          Accede para publicar y administrar tus propiedades.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
            {getMessage(error)}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Usuario</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm text-[#1a1a1a]
                placeholder:text-silver-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
              placeholder="Tu usuario"
              {...register('username', { required: 'El usuario es obligatorio' })}
            />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Contrasena</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 pr-11 py-2.5 rounded-lg border border-silver-200 text-sm text-[#1a1a1a]
                  placeholder:text-silver-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                placeholder="********"
                {...register('password', { required: 'La contrasena es obligatoria' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-silver-500 hover:text-[#1a1a1a] hover:bg-silver-100"
                aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                title={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5-.7 1.43-1.72 2.66-2.96 3.6l1.42 1.42c1.55-1.19 2.82-2.78 3.67-4.62C21.27 7.65 16.97 5 12 5c-1.66 0-3.24.3-4.69.85l1.58 1.58C9.88 6.98 10.92 6 12 6zM2.71 3.57 1.29 5l3.06 3.06C2.83 9.24 1.59 10.95 1 12.5 2.73 16.86 7.03 19.5 12 19.5c1.95 0 3.81-.41 5.49-1.15L19 19.86 20.41 18.45 2.71 3.57zM7.53 11.24l1.55 1.55c-.05.2-.08.41-.08.62a3 3 0 0 0 3 3c.21 0 .42-.03.62-.08l1.55 1.55A4.94 4.94 0 0 1 12 18.5a5 5 0 0 1-5-5c0-.53.08-1.04.23-1.52zm4.31-.73 2.4 2.4.01-.15a3 3 0 0 0-3-3l-.15.01.74.74z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M12 5c-4.97 0-9.27 2.65-11 7 1.73 4.35 6.03 7 11 7s9.27-2.65 11-7c-1.73-4.35-6.03-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full justify-center" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="text-xs text-silver-400 mt-4 text-center">
          Si no tienes acceso, solicita un usuario al administrador.
        </p>

        <div className="mt-5 text-center">
          <Link to="/" className="text-sm text-gold-600 hover:text-gold-700 underline underline-offset-2">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
