# Integración Frontend - Backend

## Configuración del Frontend para Conectar con Django

### 1. Crear archivo .env en la carpeta frontend/

Copiar `.env.example` a `.env`:
```bash
cp .env.example .env
```

Contenido de `.env`:
```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Casas Los Mochis
```

### 2. Servicios Disponibles

Ya están creados en `src/services/`:

- **api.js** - Configuración de axios con interceptores JWT
- **authService.js** - Autenticación y login
- **propertyService.js** - Gestión de propiedades
- **leadService.js** - Gestión de clientes (CRM)
- **interactionService.js** - Interacciones con clientes
- **contractService.js** - Contratos de venta/renta

### 3. Usar los Servicios en Componentes

Ejemplo de login:
```javascript
import authService from '@/services/authService';

const handleLogin = async (username, password) => {
  try {
    const data = await authService.login(username, password);
    console.log('Login exitoso:', data);
    // Usar el token guardado automáticamente
  } catch (error) {
    console.error('Error:', error);
  }
};
```

Ejemplo de obtener propiedades:
```javascript
import propertyService from '@/services/propertyService';
import { useEffect, useState } from 'react';

function Catalog() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    propertyService.getProperties({ city: 'Los Mochis' })
      .then(data => setProperties(data.results))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {properties.map(prop => (
        <div key={prop.id}>{prop.title}</div>
      ))}
    </div>
  );
}
```

Ejemplo de crear un lead desde formulario de contacto:
```javascript
import leadService from '@/services/leadService';

const handleContactSubmit = async (formData) => {
  try {
    const lead = await leadService.createLeadFromContact({
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      interested_in: formData.message,
    });
    alert('¡Gracias! Pronto nos pondremos en contacto.');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 4. Filtros Disponibles

**Propiedades:**
```
GET /properties/?city=Los%20Mochis&property_type=1&bedrooms=3&status=available
```

**Leads/Clientes:**
```
GET /leads/?status=new&agent=1&is_qualified=true
```

### 5. Token JWT

Los tokens se guardan automáticamente en `localStorage`:
- `access_token` - Token de acceso (24 horas)
- `refresh_token` - Token de refresco (7 días)

El interceptor de axios renueva automáticamente al expirar.

### 6. Probar la Integración

1. Iniciar backend:
```bash
cd backend
python manage.py runserver
```

2. Iniciar frontend:
```bash
cd frontend
npm run dev
```

3. Ir a http://localhost:5173

4. Intenta hacer login con usuario/contraseña creado en el admin del backend

### 7. Troubleshooting

**Error: "CORS policy blocked"**
- Verificar que CORS_ALLOWED_ORIGINS en backend/settings.py incluya http://localhost:5173

**Error: "Network request failed"**
- Verificar que el backend está corriendo (http://localhost:8000)
- Verificar el porto correcto en .env

**La API no devuelve datos**
- Ir a http://localhost:8000/api/doc/ (Swagger)
- Probar endpoints manualmente
- Verificar los permisos en el backend

### 8. Flujos Principales

**Flujo de Comprador:**
1. Usuario ve catálogo de propiedades (/api/properties/)
2. Usuario hace clic en "Contactar"
3. Formulario crea un lead (/api/leads/create_from_contact/)
4. Lead aparece en el CRM del agente

**Flujo de Vendedor:**
1. Vendedor se registra (/api/auth/users/register/)
2. Admin lo marca como "vendedor" en panel de admin
3. Vendedor publica propiedad (/api/properties/)
4. Sube imágenes (/api/properties/{id}/upload_image/)
5. Propiedad aparece en catálogo público

**Flujo de Agente (CRM):**
1. Agente inicia sesión (/api/auth/login/)
2. Ve sus leads asignados (/api/leads/)
3. Crea interacciones (/api/interactions/)
4. Crea contratos (/api/contracts/)
5. Genera reportes

---

¡La integración está lista! Cualquier duda, revisa los endpoints en:
- http://localhost:8000/api/doc/ (Swagger)
- http://localhost:8000/api/redoc/ (ReDoc)
