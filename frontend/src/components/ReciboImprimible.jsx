import React from 'react';
import { formatearFecha, formatearMoneda } from '../services/api';
import './ReciboImprimible.css';

/**
 * =====================================================
 * RECIBO IMPRIMIBLE - INTERSECOM
 * =====================================================
 * Componente para generar recibos de órdenes de reparación
 * Formato idéntico al recibo físico del taller
 */
function ReciboImprimible({ orden }) {
    if (!orden) return null;

    return (
        <div className="recibo-container">
            {/* ENCABEZADO */}
            <div className="recibo-header">
                <h4 className="empresa-nombre">INTERSECOM</h4>
                <p className="empresa-descripcion">DE TODO EN COMPUTACIÓN</p>
                <p className="empresa-direccion">15 Avenida 1-340 Zona 5 San Marcos</p>
                <p className="empresa-contacto">Tel: [Tu Teléfono] | Email: [Tu Email]</p>
            </div>

            <hr className="recibo-divider" />

            {/* NÚMERO DE ORDEN */}
            <div className="numero-orden">
                <h3>ORDEN DE SERVICIO Nº {orden.numero_orden}</h3>
                <p className="fecha-ingreso">Fecha de Ingreso: {formatearFecha(orden.fecha_ingreso)}</p>
            </div>

            <hr className="recibo-divider" />

            {/* DATOS DEL CLIENTE */}
            <div className="recibo-seccion">
                <h5 className="seccion-titulo">DATOS DEL CLIENTE</h5>
                <table className="tabla-info">
                    <tbody>
                        <tr>
                            <td className="label">Nombre:</td>
                            <td className="value">{orden.cliente_nombre}</td>
                        </tr>
                        <tr>
                            <td className="label">Teléfono:</td>
                            <td className="value">{orden.cliente_telefono}</td>
                        </tr>
                        {orden.cliente_email && (
                            <tr>
                                <td className="label">Email:</td>
                                <td className="value">{orden.cliente_email}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* DATOS DEL EQUIPO */}
            <div className="recibo-seccion">
                <h5 className="seccion-titulo">DATOS DEL EQUIPO</h5>
                <table className="tabla-info">
                    <tbody>
                        <tr>
                            <td className="label">Tipo de Equipo:</td>
                            <td className="value">{orden.tipo_equipo}</td>
                        </tr>
                        <tr>
                            <td className="label">Marca / Modelo:</td>
                            <td className="value">{orden.marca} {orden.modelo}</td>
                        </tr>
                        {orden.color && (
                            <tr>
                                <td className="label">Color:</td>
                                <td className="value">{orden.color}</td>
                            </tr>
                        )}
                        {orden.numero_serie && (
                            <tr>
                                <td className="label">Número de Serie:</td>
                                <td className="value">{orden.numero_serie}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* DATOS DE ACCESO (Crítico) */}
            {orden.datos_acceso && (
                <div className="recibo-seccion datos-acceso-section">
                    <h5 className="seccion-titulo">⚠️ DATOS DE ACCESO</h5>
                    <p className="datos-acceso">{orden.datos_acceso}</p>
                </div>
            )}

            {/* ACCESORIOS */}
            {orden.accesorios && (
                <div className="recibo-seccion">
                    <h5 className="seccion-titulo">ACCESORIOS QUE TRAE</h5>
                    <p className="descripcion">{orden.accesorios}</p>
                </div>
            )}

            {/* FALLA REPORTADA */}
            <div className="recibo-seccion">
                <h5 className="seccion-titulo">FALLA REPORTADA POR EL CLIENTE</h5>
                <p className="descripcion">{orden.falla_reportada}</p>
            </div>

            {/* OBSERVACIONES DEL ESTADO FÍSICO */}
            {orden.observaciones_recepcion && (
                <div className="recibo-seccion">
                    <h5 className="seccion-titulo">ESTADO FÍSICO DEL EQUIPO</h5>
                    <p className="descripcion">{orden.observaciones_recepcion}</p>
                </div>
            )}

            {/* DIAGNÓSTICO Y TRABAJO (Si ya está disponible) */}
            {orden.diagnostico_tecnico && (
                <div className="recibo-seccion">
                    <h5 className="seccion-titulo">DIAGNÓSTICO TÉCNICO</h5>
                    <p className="descripcion">{orden.diagnostico_tecnico}</p>
                </div>
            )}

            {orden.trabajo_realizado && (
                <div className="recibo-seccion">
                    <h5 className="seccion-titulo">TRABAJO REALIZADO</h5>
                    <p className="descripcion">{orden.trabajo_realizado}</p>
                </div>
            )}

            {orden.repuestos_usados && (
                <div className="recibo-seccion">
                    <h5 className="seccion-titulo">REPUESTOS UTILIZADOS</h5>
                    <p className="descripcion">{orden.repuestos_usados}</p>
                </div>
            )}

            {/* INFORMACIÓN FINANCIERA */}
            <div className="recibo-seccion recibo-financiero">
                <h5 className="seccion-titulo">INFORMACIÓN FINANCIERA</h5>
                <table className="tabla-financiera">
                    <tbody>
                        <tr>
                            <td className="label">Costo Estimado:</td>
                            <td className="value-money">{formatearMoneda(orden.costo_estimado || 0)}</td>
                        </tr>
                        <tr>
                            <td className="label">Costo Total:</td>
                            <td className="value-money">{formatearMoneda(orden.costo_total || 0)}</td>
                        </tr>
                        <tr>
                            <td className="label">Anticipo Pagado:</td>
                            <td className="value-money">{formatearMoneda(orden.anticipo || 0)}</td>
                        </tr>
                        <tr className="saldo-pendiente-row">
                            <td className="label"><strong>Saldo Pendiente:</strong></td>
                            <td className="value-money"><strong>{formatearMoneda(orden.saldo_pendiente || 0)}</strong></td>
                        </tr>
                        <tr>
                            <td className="label">Tipo de Pago:</td>
                            <td className="value-money">{orden.tipo_pago}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ESTADO Y FECHAS */}
            <div className="recibo-seccion">
                <h5 className="seccion-titulo">ESTADO DEL SERVICIO</h5>
                <table className="tabla-info">
                    <tbody>
                        <tr>
                            <td className="label">Estado Actual:</td>
                            <td className="value"><strong>{orden.estado}</strong></td>
                        </tr>
                        {orden.fecha_estimada_salida && (
                            <tr>
                                <td className="label">Fecha Estimada de Entrega:</td>
                                <td className="value">{formatearFecha(orden.fecha_estimada_salida)}</td>
                            </tr>
                        )}
                        {orden.fecha_entrega && (
                            <tr>
                                <td className="label">Fecha de Entrega:</td>
                                <td className="value">{formatearFecha(orden.fecha_entrega)}</td>
                            </tr>
                        )}
                        {orden.entregado_a && (
                            <tr>
                                <td className="label">Entregado a:</td>
                                <td className="value">{orden.entregado_a}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <hr className="recibo-divider" />

            {/* CLÁUSULAS LEGALES (Texto exacto del PDF) */}
            <div className="recibo-footer">
                <h6 className="footer-titulo">IMPORTANTE - TÉRMINOS Y CONDICIONES</h6>

                <div className="clausula">
                    <p className="clausula-texto">
                        <strong>1. GARANTÍA:</strong> La empresa no se hace responsable a cubrir la garantía
                        de daños causados por el mal uso del equipo, inestabilidad de corriente eléctrica.
                    </p>
                </div>

                <div className="clausula">
                    <p className="clausula-texto">
                        <strong>2. ABANDONO DE EQUIPO:</strong> La empresa no se hace responsable del equipo
                        si en término de 30 días no es recogido el mismo.
                    </p>
                </div>

                <div className="clausula">
                    <p className="clausula-texto">
                        <strong>3. PÉRDIDA DE INFORMACIÓN:</strong> La empresa no se hace responsable por
                        la pérdida de datos o información almacenada en el equipo. Se recomienda realizar
                        respaldo antes de entregar el equipo.
                    </p>
                </div>

                <div className="firma-section">
                    <div className="firma-box">
                        <div className="firma-linea"></div>
                        <p className="firma-label">Firma del Cliente</p>
                        <p className="firma-fecha">Fecha: _______________</p>
                    </div>

                    <div className="firma-box">
                        <div className="firma-linea"></div>
                        <p className="firma-label">Firma del Técnico</p>
                        <p className="firma-fecha">Técnico: {orden.tecnico_responsable || 'Intersecom'}</p>
                    </div>
                </div>

                <p className="footer-agradecimiento">
                    ¡Gracias por confiar en INTERSECOM!
                </p>

                <p className="footer-contacto">
                    Para consultas: [Tu Teléfono] | [Tu Email]
                </p>
            </div>
        </div>
    );
}

export default ReciboImprimible;
