import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Common/Button'
import PasswordInput from '../components/Common/PasswordInput'
import authService from '../services/authService'
import useAuthStore from '../stores/authStore'
import { getFriendlyMessage } from '../utils/errorMessage'
import { toast } from '../stores/toastStore'

export default function SetPassword() {
  const navigate = useNavigate()
  const { refreshUser, logout } = useAuthStore()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { password: '', passwordConfirm: '' },
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      await authService.setPassword(data.password, data.passwordConfirm)
      await refreshUser()
      toast.success('Contraseña definida correctamente.')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(getFriendlyMessage(err, 'No se pudo actualizar la contraseña.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-silver-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-silver-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <h1 className="font-['Playfair_Display'] font-bold text-2xl sm:text-3xl text-[#1a1a1a] mb-2">
          Define tu contraseña
        </h1>
        <p className="text-silver-500 text-sm mb-6">
          Por seguridad, antes de continuar debes definir una contraseña propia para tu cuenta.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Nueva contraseña</label>
            <PasswordInput
              placeholder="Mínimo 8 caracteres"
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Confirmar contraseña</label>
            <PasswordInput
              placeholder="Repite tu contraseña"
              {...register('passwordConfirm', {
                required: 'Confirma tu contraseña',
                validate: (value) => value === password || 'Las contraseñas no coinciden',
              })}
            />
            {errors.passwordConfirm && <p className="text-xs text-red-500 mt-1">{errors.passwordConfirm.message}</p>}
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full justify-center" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar y continuar'}
          </Button>
        </form>

        <button
          type="button"
          onClick={logout}
          className="text-xs text-silver-400 hover:text-silver-600 mt-5 w-full text-center underline underline-offset-2"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
