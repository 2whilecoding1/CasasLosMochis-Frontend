export default function Privacy() {
  return (
    <div className="min-h-screen bg-silver-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-3xl">

        <h1 className="font-serif font-bold text-[#1a1a1a] text-2xl sm:text-3xl mb-2">
          Política de Privacidad
        </h1>
        <p className="text-silver-400 text-sm mb-8">Última actualización: abril de 2026</p>

        <div className="bg-white rounded-2xl border border-silver-200 shadow-sm p-6 sm:p-8 flex flex-col gap-7 text-sm text-silver-700 leading-relaxed">

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">1. Responsable del tratamiento</h2>
            <p>
              <strong>Casas Los Mochis</strong>, con domicilio en Los Mochis, Sinaloa, México, es el responsable
              del tratamiento de los datos personales que usted nos proporcione a través de este sitio web,
              de conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los
              Particulares (LFPDPPP).
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">2. Datos que recopilamos</h2>
            <p>Podemos recopilar los siguientes datos personales:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Nombre completo.</li>
              <li>Número de teléfono y/o WhatsApp.</li>
              <li>Correo electrónico.</li>
              <li>Información sobre la propiedad que desea publicar o buscar.</li>
              <li>Datos de navegación (cookies, dirección IP, páginas visitadas).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">3. Finalidad del tratamiento</h2>
            <p>Sus datos serán utilizados para:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Contactarle para dar seguimiento a su solicitud de publicación o de búsqueda de propiedad.</li>
              <li>Enviarle información sobre propiedades que puedan ser de su interés.</li>
              <li>Mejorar la experiencia de uso del Sitio.</li>
              <li>Cumplir con obligaciones legales y contractuales.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">4. Transferencia de datos</h2>
            <p>
              Casas Los Mochis no vende, alquila ni comparte sus datos personales con terceros para fines
              comerciales propios. Únicamente podrán ser compartidos con asesores inmobiliarios afiliados
              exclusivamente para dar seguimiento a su solicitud, o cuando sea requerido por autoridad competente.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">5. Cookies y tecnologías de rastreo</h2>
            <p>
              El Sitio puede utilizar cookies y tecnologías similares para mejorar la experiencia de navegación,
              recordar preferencias y analizar el tráfico. Puede configurar su navegador para rechazar cookies;
              sin embargo, esto podría afectar algunas funcionalidades del Sitio.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">6. Derechos ARCO</h2>
            <p>
              Usted tiene derecho a <strong>Acceder, Rectificar, Cancelar u Oponerse</strong> (derechos ARCO)
              al tratamiento de sus datos personales. Para ejercer estos derechos, envíe su solicitud a{' '}
              <a href="mailto:casaslosmochis@outlook.com" className="text-gold-600 hover:underline font-medium">
                casaslosmochis@outlook.com
              </a>{' '}
              indicando su nombre completo, los datos que desea ejercer y una copia de su identificación oficial.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">7. Seguridad de los datos</h2>
            <p>
              Implementamos medidas técnicas y administrativas razonables para proteger sus datos personales
              contra acceso no autorizado, pérdida, alteración o destrucción. Sin embargo, ningún sistema de
              transmisión por internet es completamente seguro.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">8. Cambios a esta política</h2>
            <p>
              Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento.
              Le notificaremos los cambios relevantes mediante publicación en este Sitio.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[#1a1a1a] text-base mb-2">9. Contacto</h2>
            <p>
              Para cualquier consulta relacionada con el tratamiento de sus datos, contáctenos en{' '}
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
