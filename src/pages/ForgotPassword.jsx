import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import Button from '../components/Common/Button'
import authService from '../services/authService'
import { getFriendlyMessage } from '../utils/errorMessage'
import { toast } from '../stores/toastStore'

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '' },
  })

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      await authService.requestPasswordReset(data.email)
      setSent(true)
    } catch (err) {
      toast.error(getFriendlyMessage(err, 'No se pudo procesar la solicitud. Intenta de nuevo.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-silver-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-silver-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1a1a1a] mb-2">
          Recuperar contraseña
        </h1>

        {sent ? (
          <>
            <p className="text-silver-600 text-sm mb-6">
              Si el correo está registrado, te enviamos instrucciones para restablecer tu contraseña.
              {import.meta.env.DEV && ' En desarrollo, revisa la consola del servidor Django para ver el enlace.'}
            </p>
            <Button as={Link} to="/login" variant="primary" className="w-full justify-center">
              Volver a iniciar sesión
            </Button>
          </>
        ) : (
          <>
            <p className="text-silver-500 text-sm mb-6">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Correo <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm text-[#1a1a1a]
                    placeholder:text-silver-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                  placeholder="tucorreo@ejemplo.com"
                  {...register('email', { required: 'El correo es obligatorio' })}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full justify-center" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar enlace'}
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
