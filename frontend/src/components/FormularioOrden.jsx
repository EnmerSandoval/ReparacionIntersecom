import React, { useState } from 'react';
import { Form, Row, Col, Button, Card, Alert } from 'react-bootstrap';
import { createOrden } from '../services/api';

/**
 * =====================================================
 * FORMULARIO DE INGRESO DE ÓRDENES
 * =====================================================
 * Componente para registrar la recepción de equipos
 */
function FormularioOrden({ onOrdenCreada }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        // Datos del Cliente
        cliente_nombre: '',
        cliente_telefono: '',
        cliente_email: '',

        // Datos del Equipo
        tipo_equipo: 'Laptop',
        marca: '',
        modelo: '',
        color: '',
        numero_serie: '',

        // Datos de Acceso y Estado Físico
        datos_acceso: '',
        accesorios: '',
        falla_reportada: '',
        observaciones_recepcion: '',

        // Fechas
        fecha_estimada_salida: '',

        // Financiero
        costo_estimado: '',
        anticipo: '',
        tipo_pago: 'Efectivo',
    });

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await createOrden(formData);

            if (response.success) {
                setSuccess(`Orden creada exitosamente: ${response.data.numero_orden}`);

                // Resetear formulario
                setFormData({
                    cliente_nombre: '',
                    cliente_telefono: '',
                    cliente_email: '',
                    tipo_equipo: 'Laptop',
                    marca: '',
                    modelo: '',
                    color: '',
                    numero_serie: '',
                    datos_acceso: '',
                    accesorios: '',
                    falla_reportada: '',
                    observaciones_recepcion: '',
                    fecha_estimada_salida: '',
                    costo_estimado: '',
                    anticipo: '',
                    tipo_pago: 'Efectivo',
                });

                // Notificar al padre
                if (onOrdenCreada) {
                    onOrdenCreada(response.data);
                }

                // Scroll al inicio
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            setError(err.message || 'Error al crear la orden');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Nueva Orden de Reparación</h5>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
                {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    {/* SECCIÓN: DATOS DEL CLIENTE */}
                    <h6 className="text-primary border-bottom pb-2 mb-3">Datos del Cliente</h6>
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Nombre Completo <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cliente_nombre"
                                    value={formData.cliente_nombre}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ej: Juan Pérez"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Teléfono <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="cliente_telefono"
                                    value={formData.cliente_telefono}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ej: 77889900"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Email (Opcional)</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="cliente_email"
                                    value={formData.cliente_email}
                                    onChange={handleChange}
                                    placeholder="cliente@ejemplo.com"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* SECCIÓN: DATOS DEL EQUIPO */}
                    <h6 className="text-primary border-bottom pb-2 mb-3 mt-4">Datos del Equipo</h6>
                    <Row className="mb-3">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Tipo de Equipo <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    name="tipo_equipo"
                                    value={formData.tipo_equipo}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Laptop">Laptop</option>
                                    <option value="CPU">CPU / Computadora de Escritorio</option>
                                    <option value="Celular">Celular</option>
                                    <option value="Tablet">Tablet</option>
                                    <option value="Monitor">Monitor</option>
                                    <option value="Impresora">Impresora</option>
                                    <option value="Otro">Otro</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Marca</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="marca"
                                    value={formData.marca}
                                    onChange={handleChange}
                                    placeholder="Ej: HP, Dell, Samsung"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Modelo</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="modelo"
                                    value={formData.modelo}
                                    onChange={handleChange}
                                    placeholder="Ej: Pavilion 15"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Color</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    placeholder="Ej: Negro, Plateado"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Número de Serie / IMEI</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="numero_serie"
                                    value={formData.numero_serie}
                                    onChange={handleChange}
                                    placeholder="Número de serie o IMEI del equipo"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* SECCIÓN: DATOS DE ACCESO Y ESTADO */}
                    <h6 className="text-primary border-bottom pb-2 mb-3 mt-4">Datos de Acceso y Estado Físico</h6>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Datos de Acceso (Contraseña/Patrón) <span className="text-warning">⚠️ CRÍTICO</span></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="datos_acceso"
                                    value={formData.datos_acceso}
                                    onChange={handleChange}
                                    placeholder="Ej: PIN: 1234 / Patrón: L invertida / Sin contraseña"
                                />
                                <Form.Text className="text-muted">
                                    Necesario para diagnosticar el equipo
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Accesorios que Trae</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="accesorios"
                                    value={formData.accesorios}
                                    onChange={handleChange}
                                    placeholder="Ej: Cargador, funda, memoria USB, mouse"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Falla Reportada <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="falla_reportada"
                                    value={formData.falla_reportada}
                                    onChange={handleChange}
                                    required
                                    placeholder="Descripción detallada del problema según el cliente"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Observaciones del Estado Físico</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="observaciones_recepcion"
                                    value={formData.observaciones_recepcion}
                                    onChange={handleChange}
                                    placeholder="Golpes, rayones, roturas previas, etc."
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* SECCIÓN: FINANCIERO */}
                    <h6 className="text-primary border-bottom pb-2 mb-3 mt-4">Información Financiera</h6>
                    <Row className="mb-3">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Costo Estimado (Q)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    name="costo_estimado"
                                    value={formData.costo_estimado}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Anticipo (Q)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    name="anticipo"
                                    value={formData.anticipo}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Tipo de Pago</Form.Label>
                                <Form.Select
                                    name="tipo_pago"
                                    value={formData.tipo_pago}
                                    onChange={handleChange}
                                >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Mixto">Mixto</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Fecha Estimada de Salida</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fecha_estimada_salida"
                                    value={formData.fecha_estimada_salida}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* BOTONES */}
                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button
                            variant="secondary"
                            type="reset"
                            onClick={() => {
                                setFormData({
                                    cliente_nombre: '',
                                    cliente_telefono: '',
                                    cliente_email: '',
                                    tipo_equipo: 'Laptop',
                                    marca: '',
                                    modelo: '',
                                    color: '',
                                    numero_serie: '',
                                    datos_acceso: '',
                                    accesorios: '',
                                    falla_reportada: '',
                                    observaciones_recepcion: '',
                                    fecha_estimada_salida: '',
                                    costo_estimado: '',
                                    anticipo: '',
                                    tipo_pago: 'Efectivo',
                                });
                            }}
                        >
                            Limpiar Formulario
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Registrar Orden'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default FormularioOrden;
