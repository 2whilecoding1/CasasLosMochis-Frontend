export default function Terms() {
  return (
    <div className="min-h-screen bg-silver-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-3xl">

        <h1 className="font-serif font-bold text-[#1a1a1a] text-2xl sm:text-3xl mb-2">
          Términos y Condiciones de Uso
        </h1>
        <p className="text-silver-400 text-sm mb-8">Última actualización: abril de 2026</p>

        <div className="bg-white rounded-2xl border border-silver-200 shadow-sm p-6 sm:p-8 flex flex-col gap-7 text-sm text-silver-700 leading-relaxed">

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">1. Aceptación de los términos</h2>
            <p>
              Al acceder y utilizar el sitio web de <strong>Casas Los Mochis</strong> (en adelante, "el Sitio"),
              usted acepta quedar vinculado por los presentes Términos y Condiciones de Uso. Si no está de acuerdo
              con alguna de estas condiciones, le pedimos que se abstenga de utilizar el Sitio.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">2. Descripción del servicio</h2>
            <p>
              Casas Los Mochis es una plataforma inmobiliaria que facilita la publicación, búsqueda y contacto
              entre propietarios, asesores y personas interesadas en comprar o rentar propiedades en Los Mochis,
              Sinaloa y zonas aledañas. El Sitio actúa como intermediario informativo y no es parte en ninguna
              transacción inmobiliaria.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">3. Uso permitido</h2>
            <p>El usuario se compromete a utilizar el Sitio exclusivamente para fines lícitos y de conformidad con la ley. Queda prohibido:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Publicar información falsa, engañosa o fraudulenta.</li>
              <li>Usar el Sitio para actividades ilegales o que vulneren derechos de terceros.</li>
              <li>Intentar acceder a sistemas o datos no autorizados.</li>
              <li>Reproducir, distribuir o modificar el contenido del Sitio sin autorización expresa.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">4. Exactitud de la información</h2>
            <p>
              Casas Los Mochis hace su mejor esfuerzo para mantener la información actualizada y precisa; sin
              embargo, no garantiza la exactitud, integridad o vigencia de los listados publicados. Los precios,
              disponibilidad y características de las propiedades están sujetos a cambios sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">5. Propiedad intelectual</h2>
            <p>
              Todos los contenidos del Sitio, incluyendo textos, imágenes, logotipos, diseño gráfico y código
              fuente, son propiedad de Casas Los Mochis o de sus respectivos titulares, y están protegidos por
              las leyes mexicanas e internacionales de propiedad intelectual.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">6. Limitación de responsabilidad</h2>
            <p>
              Casas Los Mochis no será responsable por daños directos, indirectos, incidentales o consecuentes
              derivados del uso o la imposibilidad de uso del Sitio, ni por errores u omisiones en el contenido
              publicado. Las transacciones realizadas entre usuarios son responsabilidad exclusiva de las partes
              involucradas.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">7. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios entrarán en
              vigor en el momento de su publicación en el Sitio. El uso continuado del Sitio tras dichas
              modificaciones implica la aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">8. Legislación aplicable</h2>
            <p>
              Estos Términos se rigen por las leyes vigentes en los Estados Unidos Mexicanos. Cualquier
              controversia será resuelta ante los tribunales competentes de la ciudad de Los Mochis, Sinaloa,
              renunciando expresamente a cualquier otro fuero que pudiera corresponder.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">9. Contacto</h2>
            <p>
              Para dudas sobre estos Términos, escríbenos a{' '}
              <a href="mailto:casaslosmochis@outlook.com" className="text-gold-600 hover:underline font-medium">
                casaslosmochis@outlook.com
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
