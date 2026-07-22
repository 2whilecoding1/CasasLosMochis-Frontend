export default function Contact() {
  return (
    <div className="min-h-screen bg-silver-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-3xl">

        <h1 className="font-serif font-bold text-[#1a1a1a] text-2xl sm:text-3xl mb-2">
          Contacto
        </h1>
        <p className="text-silver-500 text-sm mb-8">
          Estamos aquí para ayudarte. Escríbenos y te responderemos a la brevedad.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Correo */}
          <a
            href="mailto:casaslosmochis@outlook.com"
            className="bg-white rounded-2xl border border-silver-200 shadow-sm p-6 flex items-start gap-4
              hover:border-gold-400 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gold-600">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#1a1a1a] text-sm mb-0.5 group-hover:text-gold-600 transition-colors">
                Correo electrónico
              </p>
              <p className="text-silver-500 text-sm">casaslosmochis@outlook.com</p>
              <p className="text-xs text-silver-400 mt-1">Respuesta en menos de 24 horas</p>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/526681234567"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl border border-silver-200 shadow-sm p-6 flex items-start gap-4
              hover:border-[#25d366] hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25d366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#1a1a1a] text-sm mb-0.5 group-hover:text-[#25d366] transition-colors">
                WhatsApp
              </p>
              <p className="text-silver-500 text-sm">668 123 4567</p>
              <p className="text-xs text-silver-400 mt-1">Lun – Sáb, 9:00 am – 7:00 pm</p>
            </div>
          </a>

          {/* Ubicación */}
          <div className="bg-white rounded-2xl border border-silver-200 shadow-sm p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gold-600">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#1a1a1a] text-sm mb-0.5">Ubicación</p>
              <p className="text-silver-500 text-sm">Los Mochis, Sinaloa, México</p>
              <p className="text-xs text-silver-400 mt-1">Atención en toda la zona norte de Sinaloa</p>
            </div>
          </div>

          {/* Horario */}
          <div className="bg-white rounded-2xl border border-silver-200 shadow-sm p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gold-600">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#1a1a1a] text-sm mb-0.5">Horario de atención</p>
              <p className="text-silver-500 text-sm">Lunes a Viernes: 9:00 am – 7:00 pm</p>
              <p className="text-silver-500 text-sm">Sábado: 9:00 am – 2:00 pm</p>
            </div>
          </div>

        </div>

        {/* CTA publicar */}
        <div className="mt-6 bg-[#1a1a1a] rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="font-serif font-bold text-white text-lg sm:text-xl mb-2">
            ¿Quieres publicar tu propiedad?
          </h2>
          <p className="text-silver-400 text-sm mb-4">
            Llena el formulario y un asesor te contactará sin costo.
          </p>
          <a
            href="/publish"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-600
              text-[#1a1a1a] font-semibold text-sm transition-colors"
          >
            Publicar propiedad
          </a>
        </div>

      </div>
    </div>
  )
}
