import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/Common/Button'
import PasswordInput from '../components/Common/PasswordInput'
import authService from '../services/authService'
import { getFriendlyMessage } from '../utils/errorMessage'
import { toast } from '../stores/toastStore'

export default function ResetPassword() {
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { password: '', passwordConfirm: '' },
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      await authService.confirmPasswordReset(uid, token, data.password)
      toast.success('Contraseña actualizada correctamente.')
      setDone(true)
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err) {
      toast.error(getFriendlyMessage(err, 'No se pudo restablecer la contraseña. El enlace pudo haber expirado.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-silver-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-silver-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1a1a1a] mb-2">
          Nueva contraseña
        </h1>

        {done ? (
          <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
            Contraseña actualizada. Redirigiendo al inicio de sesión...
          </p>
        ) : (
          <>
            <p className="text-silver-500 text-sm mb-6">
              Ingresa tu nueva contraseña.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Nueva contraseña <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Confirmar contraseña <span className="text-red-500">*</span></label>
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
                {submitting ? 'Guardando...' : 'Restablecer contraseña'}
              </Button>
            </form>
          </>
        )}

        <div className="mt-5 text-center">
          <Link to="/login" className="text-sm text-gold-600 hover:text-gold-700 underline underline-offset-2">
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
