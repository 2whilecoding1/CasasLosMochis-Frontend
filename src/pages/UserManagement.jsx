import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import userService from '../services/userService'
import { getFriendlyMessage } from '../utils/errorMessage'
import { toast } from '../stores/toastStore'

const ROLE_OPTIONS = [
  { value: 'client', label: 'Cliente' },
  { value: 'agent', label: 'Agente' },
  { value: 'owner', label: 'Propietario' },
  { value: 'admin', label: 'Administrador' },
]

function stripAccents(value) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function slugifyUsername(value) {
  return stripAccents(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function randomDigits(length) {
  let result = ''
  for (let i = 0; i < length; i++) result += Math.floor(Math.random() * 10)
  return result
}

const RANDOM_WORDS = ['casa', 'mochis', 'sol', 'costa', 'valle', 'sinaloa', 'agente', 'mar']

function generateUsername(firstName, lastName) {
  const first = slugifyUsername(firstName || '')
  const last = slugifyUsername(lastName || '')
  if (first || last) {
    const base = [first, last.charAt(0)].filter(Boolean).join('.')
    return `${base}${randomDigits(2)}`
  }
  const word = RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)]
  return `${word}${randomDigits(3)}`
}

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      username: '', email: '', first_name: '', last_name: '', role: 'client',
      phone: '', company: '', license_number: '',
      birth_date: '', rfc: '', curp: '', address: '', city: '', state: '', zip_code: '',
    },
  })

  const firstName = watch('first_name')
  const lastName = watch('last_name')

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const payload = await userService.listUsers()
      const items = Array.isArray(payload) ? payload : payload?.results || []
      setUsers(items)
    } catch (err) {
      toast.warning(getFriendlyMessage(err, 'No se pudo cargar la lista de usuarios.'))
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleGenerateUsername = () => {
    setValue('username', generateUsername(firstName, lastName), { shouldValidate: true })
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    setResult(null)
    try {
      const payload = { ...data }
      Object.keys(payload).forEach((key) => {
        if (payload[key] === '') delete payload[key]
      })
      const response = await userService.createUser(payload)
      setResult(response)
      toast.success(`Usuario ${response.user.username} creado. Se le envió un correo con su contraseña temporal.`)
      reset()
      loadUsers()
    } catch (err) {
      toast.error(getFriendlyMessage(err, 'No se pudo crear el usuario.'))
    } finally {
      setSubmitting(false)
    }
  }

  const copyPassword = () => {
    if (!result?.temporary_password) return
    navigator.clipboard.writeText(result.temporary_password)
    setCopied(true)
    toast.success('Contraseña temporal copiada.')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-silver-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
        <h1 className="font-['Playfair_Display'] font-bold text-[#1a1a1a] text-2xl sm:text-3xl mb-1">
          Usuarios
        </h1>
        <p className="text-silver-500 text-sm mb-6">
          Este es un sitio privado: solo un administrador puede dar de alta cuentas nuevas.
        </p>

        {result && (
          <Card className="p-4 sm:p-5 mb-6 border-green-200 bg-green-50">
            <p className="text-sm font-semibold text-green-800 mb-2">
              Cuenta creada: {result.user.username} ({result.user.email})
            </p>
            <p className="text-xs text-green-700 mb-2">
              Comparte esta contraseña temporal por un canal seguro. Se le pedirá cambiarla en su primer inicio de sesión.
            </p>
            <div className="flex items-center gap-2">
              <code className="bg-white border border-green-300 rounded-lg px-3 py-2 text-sm font-mono">
                {result.temporary_password}
              </code>
              <Button type="button" size="sm" variant="outline" onClick={copyPassword}>
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-4 sm:p-6 mb-8">
          <h2 className="font-semibold text-[#1a1a1a] mb-4">Dar de alta un usuario</h2>

          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Nombre(s)</label>
              <input
                className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm"
                {...register('first_name')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Apellidos</label>
              <input
                className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm"
                {...register('last_name')}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Usuario</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2.5 rounded-lg border border-silver-200 text-sm"
                  placeholder="usuario123"
                  {...register('username', { required: 'El usuario es obligatorio' })}
                />
                <Button type="button" size="sm" variant="outline" onClick={handleGenerateUsername}>
                  Generar
                </Button>
              </div>
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Correo</label>
              <input
                type="email"
                className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm"
                {...register('email', { required: 'El correo es obligatorio' })}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Rol</label>
              <select className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('role')}>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Teléfono</label>
              <input className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('phone')} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Fecha de nacimiento</label>
              <input type="date" className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('birth_date')} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">RFC</label>
              <input className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('rfc')} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">CURP</label>
              <input className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('curp')} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Código postal</label>
              <input className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('zip_code')} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Dirección</label>
              <input className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('address')} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Ciudad</label>
              <input className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('city')} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Estado</label>
              <input className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('state')} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Empresa / Inmobiliaria</label>
              <input className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('company')} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">No. de licencia</label>
              <input className="w-full px-3 py-2.5 rounded-lg border border-silver-200 text-sm" {...register('license_number')} />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" variant="primary" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? 'Creando...' : 'Crear usuario'}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-4 sm:p-5">
          <h2 className="font-semibold text-[#1a1a1a] mb-3">Usuarios existentes</h2>
          {loadingUsers ? (
            <p className="text-sm text-silver-400">Cargando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-silver-400 border-b border-silver-100">
                    <th className="py-2 pr-3">Usuario</th>
                    <th className="py-2 pr-3">Correo</th>
                    <th className="py-2 pr-3">Rol</th>
                    <th className="py-2 pr-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-silver-50">
                      <td className="py-2 pr-3">{u.username}</td>
                      <td className="py-2 pr-3">{u.email}</td>
                      <td className="py-2 pr-3">{u.role}</td>
                      <td className="py-2 pr-3">
                        {u.must_change_password ? (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            Pendiente definir contraseña
                          </span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Activo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
