import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card, Row, Col, Form, Button, Badge, Table, Alert, Spinner, Modal
} from 'react-bootstrap'
import { FaSave, FaPrint, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa'
import axios from 'axios'
import ReciboImprimible from '../components/ReciboImprimible'

function DetalleOrden() {
  const { id } = useParams()
  const navigate = useNavigate()
  const reciboRef = useRef()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [orden, setOrden] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)

  // Modal para agregar repuesto
  const [showModalRepuesto, setShowModalRepuesto] = useState(false)
  const [nuevoRepuesto, setNuevoRepuesto] = useState({
    descripcion: '',
    cantidad: 1,
    precio_unitario: 0
  })

  useEffect(() => {
    cargarOrden()
  }, [id])

  const cargarOrden = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`/api.php/ordenes/${id}`)
      if (response.data.success) {
        setOrden(response.data.data)
      }
    } catch (err) {
      console.error('Error al cargar orden:', err)
      setError('Error al cargar la orden')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setOrden({
      ...orden,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setError(null)
      setSuccess(null)

      const response = await axios.put(`/api.php/ordenes/${id}`, orden)

      if (response.data.success) {
        setSuccess('Orden actualizada exitosamente')
        setModoEdicion(false)
        cargarOrden()
      }
    } catch (err) {
      console.error('Error al actualizar orden:', err)
      setError(err.response?.data?.error || 'Error al actualizar la orden')
    }
  }

  const agregarRepuesto = async () => {
    try {
      const response = await axios.post('/api.php/repuestos', {
        ...nuevoRepuesto,
        id_orden: id
      })

      if (response.data.success) {
        setSuccess('Repuesto agregado exitosamente')
        setShowModalRepuesto(false)
        setNuevoRepuesto({
          descripcion: '',
          cantidad: 1,
          precio_unitario: 0
        })
        cargarOrden()
      }
    } catch (err) {
      console.error('Error al agregar repuesto:', err)
      setError(err.response?.data?.error || 'Error al agregar repuesto')
    }
  }

  const eliminarRepuesto = async (repuestoId) => {
    if (!window.confirm('¿Está seguro de eliminar este repuesto?')) {
      return
    }

    try {
      const response = await axios.delete(`/api.php/repuestos/${repuestoId}`)

      if (response.data.success) {
        setSuccess('Repuesto eliminado exitosamente')
        cargarOrden()
      }
    } catch (err) {
      console.error('Error al eliminar repuesto:', err)
      setError('Error al eliminar repuesto')
    }
  }

  const imprimirRecibo = () => {
    window.print()
  }

  const getBadgeVariant = (estado) => {
    const variants = {
      'Recibido': 'primary',
      'En Reparación': 'warning',
      'Listo': 'info',
      'Entregado': 'success',
      'Cancelado': 'danger'
    }
    return variants[estado] || 'secondary'
  }

  const formatMoneda = (valor) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(valor || 0)
  }

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    )
  }

  if (!orden) {
    return <Alert variant="danger">Orden no encontrada</Alert>
  }

  return (
    <>
      <div className="no-print">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button
              variant="link"
              onClick={() => navigate('/ordenes')}
              className="p-0 mb-2"
            >
              <FaArrowLeft className="me-2" />
              Volver a órdenes
            </Button>
            <h2 className="mb-0">
              Orden {orden.numero_orden}
              <Badge bg={getBadgeVariant(orden.estado)} className="ms-3">
                {orden.estado}
              </Badge>
            </h2>
          </div>

          <div className="d-flex gap-2">
            <Button variant="success" onClick={imprimirRecibo}>
              <FaPrint className="me-2" />
              Imprimir Recibo
            </Button>
            {!modoEdicion ? (
              <Button variant="primary" onClick={() => setModoEdicion(true)}>
                Editar
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => {
                  setModoEdicion(false)
                  cargarOrden()
                }}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                  <FaSave className="me-2" />
                  Guardar Cambios
                </Button>
              </>
            )}
          </div>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

        <Row>
          {/* Columna Izquierda */}
          <Col md={8}>
            {/* Información del Cliente */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Información del Cliente</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Nombre:</strong> {orden.cliente_nombre}</p>
                    <p><strong>Teléfono:</strong> {orden.cliente_telefono}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Correo:</strong> {orden.cliente_correo || 'N/A'}</p>
                    <p><strong>Sucursal:</strong> {orden.sucursal_nombre}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Información del Equipo */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">Información del Equipo</h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tipo de Equipo</Form.Label>
                        <Form.Select
                          name="tipo_equipo"
                          value={orden.tipo_equipo}
                          onChange={handleChange}
                          disabled={!modoEdicion}
                        >
                          <option value="Laptop">Laptop</option>
                          <option value="Desktop">Desktop</option>
                          <option value="Celular">Celular</option>
                          <option value="Tablet">Tablet</option>
                          <option value="Otro">Otro</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Marca</Form.Label>
                        <Form.Control
                          type="text"
                          name="marca"
                          value={orden.marca || ''}
                          onChange={handleChange}
                          disabled={!modoEdicion}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Modelo</Form.Label>
                        <Form.Control
                          type="text"
                          name="modelo"
                          value={orden.modelo || ''}
                          onChange={handleChange}
                          disabled={!modoEdicion}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Color</Form.Label>
                        <Form.Control
                          type="text"
                          name="color"
                          value={orden.color || ''}
                          onChange={handleChange}
                          disabled={!modoEdicion}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Accesorios</Form.Label>
                        <Form.Control
                          type="text"
                          name="accesorios"
                          value={orden.accesorios || ''}
                          onChange={handleChange}
                          disabled={!modoEdicion}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Datos de Acceso</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="datos_acceso"
                          value={orden.datos_acceso || ''}
                          onChange={handleChange}
                          disabled={!modoEdicion}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Falla Reportada</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="falla_reportada"
                          value={orden.falla_reportada || ''}
                          onChange={handleChange}
                          disabled={!modoEdicion}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Detalle del Trabajo Realizado</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="detalle_trabajo"
                          value={orden.detalle_trabajo || ''}
                          onChange={handleChange}
                          disabled={!modoEdicion}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Observaciones</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="observaciones"
                          value={orden.observaciones || ''}
                          onChange={handleChange}
                          disabled={!modoEdicion}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            {/* Repuestos Utilizados */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Repuestos Utilizados</h5>
                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => setShowModalRepuesto(true)}
                >
                  <FaPlus className="me-2" />
                  Agregar Repuesto
                </Button>
              </Card.Header>
              <Card.Body className="p-0">
                {orden.repuestos && orden.repuestos.length > 0 ? (
                  <Table responsive className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Descripción</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-end">Precio Unit.</th>
                        <th className="text-end">Total</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orden.repuestos.map(repuesto => (
                        <tr key={repuesto.id}>
                          <td>{repuesto.descripcion}</td>
                          <td className="text-center">{repuesto.cantidad}</td>
                          <td className="text-end">{formatMoneda(repuesto.precio_unitario)}</td>
                          <td className="text-end">
                            <strong>{formatMoneda(repuesto.precio_total)}</strong>
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => eliminarRepuesto(repuesto.id)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <td colSpan="3" className="text-end"><strong>Total Repuestos:</strong></td>
                        <td className="text-end">
                          <strong>
                            {formatMoneda(
                              orden.repuestos.reduce((sum, r) => sum + parseFloat(r.precio_total), 0)
                            )}
                          </strong>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted">
                    No se han agregado repuestos
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Columna Derecha */}
          <Col md={4}>
            {/* Estado y Fechas */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-secondary text-white">
                <h5 className="mb-0">Estado y Fechas</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="estado"
                    value={orden.estado}
                    onChange={handleChange}
                    disabled={!modoEdicion}
                  >
                    <option value="Recibido">Recibido</option>
                    <option value="En Reparación">En Reparación</option>
                    <option value="Listo">Listo</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Cancelado">Cancelado</option>
                  </Form.Select>
                </Form.Group>

                <hr />

                <p><strong>Fecha Recepción:</strong><br />{formatFecha(orden.fecha_recepcion)}</p>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha Estimada Entrega</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_estimada_entrega"
                    value={orden.fecha_estimada_entrega || ''}
                    onChange={handleChange}
                    disabled={!modoEdicion}
                  />
                </Form.Group>

                {orden.fecha_entrega && (
                  <p><strong>Fecha Entrega:</strong><br />{formatFecha(orden.fecha_entrega)}</p>
                )}
              </Card.Body>
            </Card>

            {/* Información Financiera */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Información Financiera</h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Costo Estimado</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="costo_estimado"
                      value={orden.costo_estimado || 0}
                      onChange={handleChange}
                      disabled={!modoEdicion}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Costo de Repuestos</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="costo_repuestos"
                      value={orden.costo_repuestos || 0}
                      disabled
                      readOnly
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Costo de Trabajo</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="costo_trabajo"
                      value={orden.costo_trabajo || 0}
                      onChange={handleChange}
                      disabled={!modoEdicion}
                    />
                  </Form.Group>

                  <hr />

                  <div className="d-flex justify-content-between mb-2">
                    <strong>Valor Total:</strong>
                    <strong className="text-success">
                      {formatMoneda(orden.valor_total)}
                    </strong>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Anticipo</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="anticipo"
                      value={orden.anticipo || 0}
                      onChange={handleChange}
                      disabled={!modoEdicion}
                    />
                  </Form.Group>

                  <hr />

                  <div className="d-flex justify-content-between">
                    <strong>Saldo Pendiente:</strong>
                    <strong className="text-danger">
                      {formatMoneda(orden.valor_total - orden.anticipo)}
                    </strong>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Personal */}
            <Card className="shadow-sm">
              <Card.Header className="bg-dark text-white">
                <h5 className="mb-0">Personal</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Recibido Por</Form.Label>
                  <Form.Control
                    type="text"
                    name="recibido_por"
                    value={orden.recibido_por || ''}
                    onChange={handleChange}
                    disabled={!modoEdicion}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Entregado Por</Form.Label>
                  <Form.Control
                    type="text"
                    name="entregado_por"
                    value={orden.entregado_por || ''}
                    onChange={handleChange}
                    disabled={!modoEdicion}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Componente de Recibo para Imprimir */}
      <div className="print-container">
        <ReciboImprimible orden={orden} />
      </div>

      {/* Modal para agregar repuesto */}
      <Modal show={showModalRepuesto} onHide={() => setShowModalRepuesto(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Repuesto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Descripción *</Form.Label>
              <Form.Control
                type="text"
                value={nuevoRepuesto.descripcion}
                onChange={(e) => setNuevoRepuesto({ ...nuevoRepuesto, descripcion: e.target.value })}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cantidad *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={nuevoRepuesto.cantidad}
                    onChange={(e) => setNuevoRepuesto({ ...nuevoRepuesto, cantidad: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio Unitario (Q) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={nuevoRepuesto.precio_unitario}
                    onChange={(e) => setNuevoRepuesto({ ...nuevoRepuesto, precio_unitario: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="alert alert-info">
              <strong>Total:</strong> {formatMoneda(nuevoRepuesto.cantidad * nuevoRepuesto.precio_unitario)}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalRepuesto(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={agregarRepuesto}>
            Agregar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default DetalleOrden
