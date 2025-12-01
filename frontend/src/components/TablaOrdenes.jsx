import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Modal, Form, Card, Row, Col, Spinner } from 'react-bootstrap';
import { getOrdenes, updateEstado, updateOrden, getOrden } from '../services/api';
import { formatearFecha, formatearMoneda, getBadgeColor } from '../services/api';
import ReciboImprimible from './ReciboImprimible';

/**
 * =====================================================
 * TABLA DE CONTROL DE ÓRDENES
 * =====================================================
 * Componente para visualizar y gestionar órdenes
 */
function TablaOrdenes({ refresh }) {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('');

    // Modal de edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [ordenEditando, setOrdenEditando] = useState(null);

    // Modal de impresión
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [ordenImprimir, setOrdenImprimir] = useState(null);

    // Estados disponibles
    const ESTADOS = [
        'Recibido',
        'En Diagnóstico',
        'En Espera de Repuesto',
        'En Reparación',
        'Reparado',
        'Listo para Entrega',
        'Entregado',
        'Cancelado',
        'No Reparable'
    ];

    // Cargar órdenes al montar el componente
    useEffect(() => {
        cargarOrdenes();
    }, [filtroEstado, refresh]);

    const cargarOrdenes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getOrdenes(filtroEstado || null);
            if (response.success) {
                setOrdenes(response.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Cambiar estado rápido
    const handleCambiarEstado = async (ordenId, nuevoEstado) => {
        try {
            const response = await updateEstado(ordenId, nuevoEstado);
            if (response.success) {
                cargarOrdenes();
            }
        } catch (err) {
            alert('Error al cambiar estado: ' + err.message);
        }
    };

    // Abrir modal de edición
    const handleEditar = async (ordenId) => {
        try {
            const response = await getOrden(ordenId);
            if (response.success) {
                setOrdenEditando(response.data);
                setShowEditModal(true);
            }
        } catch (err) {
            alert('Error al cargar orden: ' + err.message);
        }
    };

    // Guardar cambios de edición
    const handleGuardarEdicion = async () => {
        try {
            const response = await updateOrden(ordenEditando);
            if (response.success) {
                setShowEditModal(false);
                cargarOrdenes();
            }
        } catch (err) {
            alert('Error al actualizar: ' + err.message);
        }
    };

    // Abrir modal de impresión
    const handleImprimir = async (ordenId) => {
        try {
            const response = await getOrden(ordenId);
            if (response.success) {
                setOrdenImprimir(response.data);
                setShowPrintModal(true);
            }
        } catch (err) {
            alert('Error al cargar orden: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Cargando órdenes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                Error al cargar órdenes: {error}
            </div>
        );
    }

    return (
        <>
            <Card className="shadow-sm">
                <Card.Header className="bg-white">
                    <Row className="align-items-center">
                        <Col md={8}>
                            <h5 className="mb-0">Órdenes en el Taller ({ordenes.length})</h5>
                        </Col>
                        <Col md={4}>
                            <Form.Select
                                size="sm"
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                {ESTADOS.map(estado => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table striped hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>Nº Orden</th>
                                    <th>Cliente</th>
                                    <th>Equipo</th>
                                    <th>Falla</th>
                                    <th>Estado</th>
                                    <th>Ingreso</th>
                                    <th>Días</th>
                                    <th>Costo</th>
                                    <th>Saldo</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordenes.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="text-center py-4 text-muted">
                                            No hay órdenes {filtroEstado ? `en estado "${filtroEstado}"` : 'registradas'}
                                        </td>
                                    </tr>
                                ) : (
                                    ordenes.map(orden => (
                                        <tr key={orden.id}>
                                            <td>
                                                <strong>{orden.numero_orden}</strong>
                                            </td>
                                            <td>
                                                <div>{orden.cliente_nombre}</div>
                                                <small className="text-muted">{orden.cliente_telefono}</small>
                                            </td>
                                            <td>
                                                <div>{orden.tipo_equipo}</div>
                                                <small className="text-muted">{orden.marca} {orden.modelo}</small>
                                            </td>
                                            <td>
                                                <small>{orden.falla_reportada?.substring(0, 50)}...</small>
                                            </td>
                                            <td>
                                                <Form.Select
                                                    size="sm"
                                                    value={orden.estado}
                                                    onChange={(e) => handleCambiarEstado(orden.id, e.target.value)}
                                                    style={{ minWidth: '150px' }}
                                                >
                                                    {ESTADOS.map(estado => (
                                                        <option key={estado} value={estado}>{estado}</option>
                                                    ))}
                                                </Form.Select>
                                            </td>
                                            <td>
                                                <small>{formatearFecha(orden.fecha_ingreso).split(',')[0]}</small>
                                            </td>
                                            <td>
                                                <Badge bg={orden.dias_en_taller > 7 ? 'danger' : 'secondary'}>
                                                    {orden.dias_en_taller}d
                                                </Badge>
                                            </td>
                                            <td>{formatearMoneda(orden.costo_total)}</td>
                                            <td>
                                                <Badge bg={parseFloat(orden.saldo_pendiente) > 0 ? 'warning' : 'success'}>
                                                    {formatearMoneda(orden.saldo_pendiente)}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <div className="btn-group btn-group-sm">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleEditar(orden.id)}
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </Button>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => handleImprimir(orden.id)}
                                                        title="Imprimir Recibo"
                                                    >
                                                        🖨️
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* MODAL DE EDICIÓN */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Editar Orden {ordenEditando?.numero_orden}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {ordenEditando && (
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Diagnóstico Técnico</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={ordenEditando.diagnostico_tecnico || ''}
                                            onChange={(e) => setOrdenEditando({
                                                ...ordenEditando,
                                                diagnostico_tecnico: e.target.value
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Trabajo Realizado</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={ordenEditando.trabajo_realizado || ''}
                                            onChange={(e) => setOrdenEditando({
                                                ...ordenEditando,
                                                trabajo_realizado: e.target.value
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Repuestos Utilizados</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={ordenEditando.repuestos_usados || ''}
                                            onChange={(e) => setOrdenEditando({
                                                ...ordenEditando,
                                                repuestos_usados: e.target.value
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Técnico Responsable</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={ordenEditando.tecnico_responsable || ''}
                                            onChange={(e) => setOrdenEditando({
                                                ...ordenEditando,
                                                tecnico_responsable: e.target.value
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Costo Total (Q)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            value={ordenEditando.costo_total || ''}
                                            onChange={(e) => setOrdenEditando({
                                                ...ordenEditando,
                                                costo_total: e.target.value
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Anticipo (Q)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            value={ordenEditando.anticipo || ''}
                                            onChange={(e) => setOrdenEditando({
                                                ...ordenEditando,
                                                anticipo: e.target.value
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Saldo Pendiente</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formatearMoneda(ordenEditando.saldo_pendiente)}
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleGuardarEdicion}>
                        Guardar Cambios
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL DE IMPRESIÓN */}
            <Modal show={showPrintModal} onHide={() => setShowPrintModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Recibo - {ordenImprimir?.numero_orden}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {ordenImprimir && <ReciboImprimible orden={ordenImprimir} />}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPrintModal(false)}>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={() => window.print()}>
                        Imprimir
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default TablaOrdenes;
