import React from 'react'
import '../styles/ReciboImprimible.css'

function ReciboImprimible({ orden }) {
  const formatFecha = (fecha) => {
    if (!fecha) return ''
    const d = new Date(fecha)
    return {
      dia: d.getDate().toString().padStart(2, '0'),
      mes: (d.getMonth() + 1).toString().padStart(2, '0'),
      año: d.getFullYear()
    }
  }

  const fechaRecepcion = formatFecha(orden.fecha_recepcion)

  return (
    <div className="recibo-container">
      {/* Encabezado */}
      <div className="recibo-header">
        <div className="logo-section">
          <div className="logo-text">intersecom</div>
          <div className="logo-subtitle">DE TODO EN COMPUTACIÓN</div>
        </div>

        <div className="empresa-info">
          <h1>INTERSECOM DE TODO EN COMPUTACIÓN</h1>
          <p className="departamento">- DEPARTAMENTO TÉCNICO -</p>
          <p className="direccion">15 Avenida 1-340 Zona 5 San Marcos.</p>
          <p className="telefonos">Tels. 7760 3991 -:- 7725 4830 -:- 3339 1099</p>
        </div>

        <div className="orden-section">
          <p className="orden-label">ORDEN PARA REPARACIÓN</p>
          <div className="orden-numero">N° {orden.numero_orden?.replace('-', '')}</div>
        </div>
      </div>

      {/* Fecha */}
      <div className="fecha-section">
        <div className="fecha-box">
          <span className="fecha-label">DIA</span>
          <div className="fecha-valor">{fechaRecepcion.dia}</div>
        </div>
        <div className="fecha-box">
          <span className="fecha-label">MES</span>
          <div className="fecha-valor">{fechaRecepcion.mes}</div>
        </div>
        <div className="fecha-box">
          <span className="fecha-label">AÑO</span>
          <div className="fecha-valor">{fechaRecepcion.año}</div>
        </div>
      </div>

      {/* Cliente */}
      <div className="seccion-recibo">
        <div className="linea-recibo">
          <span className="label-recibo">Recibí de:</span>
          <span className="valor-recibo">{orden.cliente_nombre}</span>
          <span className="label-recibo ml-auto">Tel:</span>
          <span className="valor-recibo tel-valor">{orden.cliente_telefono}</span>
        </div>
      </div>

      {/* Equipos (hasta 3) */}
      {[1, 2, 3].map((num) => (
        <div key={num} className="equipo-section">
          {num === 1 && (
            <>
              <div className="linea-recibo">
                <span className="label-recibo">Equipo:</span>
                <span className="valor-recibo equipo-valor">
                  {orden.tipo_equipo} {orden.marca} {orden.modelo}
                </span>
                <span className="label-recibo">Accesorios:</span>
                <span className="valor-recibo">{orden.accesorios || 'N/A'}</span>
              </div>
              <div className="linea-recibo">
                <span className="label-recibo">Falla:</span>
                <span className="valor-recibo full-width">{orden.falla_reportada}</span>
                <span className="label-recibo">Datos de Acceso:</span>
                <span className="valor-recibo">{orden.datos_acceso}</span>
              </div>
            </>
          )}
          {num > 1 && (
            <>
              <div className="linea-recibo">
                <span className="label-recibo">Equipo:</span>
                <sup>{num}</sup>
                <span className="valor-recibo equipo-valor"></span>
                <span className="label-recibo">Accesorios:</span>
                <span className="valor-recibo"></span>
              </div>
              <div className="linea-recibo">
                <span className="label-recibo">Falla:</span>
                <span className="valor-recibo full-width"></span>
                <span className="label-recibo">Datos de Acceso:</span>
                <span className="valor-recibo"></span>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Observaciones */}
      <div className="observaciones-section">
        <div className="linea-recibo">
          <span className="label-recibo">Observaciones:</span>
          <span className="valor-recibo observaciones-valor">
            {orden.observaciones || ''}
          </span>
        </div>
        <div className="observaciones-lineas">
          <div className="linea-vacia"></div>
        </div>
      </div>

      {/* Footer con firma y cliente */}
      <div className="footer-section">
        <div className="firma-box">
          <div className="firma-label">RECIBIDO POR</div>
          <div className="firma-contenido">{orden.recibido_por || ''}</div>
        </div>

        <div className="firma-box">
          <div className="firma-label">VALOR</div>
          <div className="firma-contenido">
            Q {parseFloat(orden.valor_total || 0).toFixed(2)}
          </div>
        </div>

        <div className="firma-box">
          <div className="firma-label">TIENDA</div>
          <div className="firma-contenido">{orden.sucursal_nombre}</div>
        </div>

        <div className="cliente-box">
          <div className="cliente-label">CLIENTE</div>
          <div className="cliente-firma"></div>
        </div>
      </div>

      {/* Cláusulas Legales */}
      <div className="clausulas-section">
        <p className="clausula-texto">
          <strong>Importante:</strong> La empresa no se hace responsable a cubrir la garantía de daños
          causados por el mal Uso del Equipo, inestabilidad de corriente eléctrica.
        </p>
        <p className="clausula-texto">
          La Empresa no se hace responsable del equipo si en término de 30 días no es recogido el mismo.
        </p>
      </div>
    </div>
  )
}

export default ReciboImprimible
