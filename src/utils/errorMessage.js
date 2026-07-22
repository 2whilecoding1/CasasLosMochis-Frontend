// Traduce errores de la API (o de red) a un mensaje corto y entendible,
// sin exponer nunca claves internas, códigos HTTP ni estructuras técnicas.

const FIELD_LABELS = {
  username: 'Usuario',
  email: 'Correo',
  password: 'Contraseña',
  new_password: 'Contraseña nueva',
  old_password: 'Contraseña actual',
  first_name: 'Nombre',
  last_name: 'Apellidos',
  phone: 'Teléfono',
  role: 'Rol',
  rfc: 'RFC',
  curp: 'CURP',
  credential: 'Inicio de sesión con Google',
  non_field_errors: '',
  detail: '',
  error: '',
}

const GENERIC_FALLBACK = 'Ocurrió un problema. Intenta de nuevo en unos momentos.'
const NETWORK_FALLBACK = 'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.'

// Mensajes fijos en inglés que devuelven Django/DRF/SimpleJWT de fábrica —
// se traducen tal cual para no mostrarle inglés técnico al usuario.
const KNOWN_MESSAGES = {
  'no active account found with the given credentials': 'Usuario o contraseña incorrectos.',
  'authentication credentials were not provided.': 'Debes iniciar sesión para continuar.',
  'given token not valid for any token type': 'Tu sesión expiró. Inicia sesión de nuevo.',
  'user account is disabled.': 'Esta cuenta está deshabilitada. Contacta a un administrador.',
  'this field may not be blank.': 'Este campo es obligatorio.',
  'this field is required.': 'Este campo es obligatorio.',
}

function translateKnown(text) {
  return KNOWN_MESSAGES[text.trim().toLowerCase()] ?? text
}

function extractFirst(value) {
  if (Array.isArray(value)) return value[0]
  if (typeof value === 'object' && value !== null) return extractFirst(Object.values(value)[0])
  return value
}

/**
 * @param {*} error - lo que lanzan los servicios (error.response?.data, o error.message)
 * @param {string} [fallback] - mensaje a usar si no se puede interpretar el error
 */
export function getFriendlyMessage(error, fallback = GENERIC_FALLBACK) {
  if (!error) return fallback

  // Error de red (sin respuesta del servidor) — axios deja esto como string tipo "Network Error"
  if (typeof error === 'string') {
    if (/network/i.test(error)) return NETWORK_FALLBACK
    // Strings ya pensados para el usuario (mensajes propios del backend) se muestran tal cual
    // solo si son cortos y no parecen una traza técnica.
    if (error.length < 200 && !/traceback|exception|at\s+\w+\.\w+/i.test(error)) return translateKnown(error)
    return fallback
  }

  if (typeof error !== 'object') return fallback

  // Respuestas DRF típicas: {"detail": "..."} o {"error": "..."}
  if (typeof error.detail === 'string') return translateKnown(error.detail)
  if (typeof error.error === 'string') return translateKnown(error.error)

  // Errores de validación por campo: {"email": ["Ya existe..."]}
  const firstKey = Object.keys(error)[0]
  if (firstKey) {
    const rawValue = extractFirst(error[firstKey])
    if (typeof rawValue === 'string') {
      const label = FIELD_LABELS[firstKey] ?? ''
      const translated = translateKnown(rawValue)
      return label ? `${label}: ${translated}` : translated
    }
  }

  return fallback
}

export default getFriendlyMessage
