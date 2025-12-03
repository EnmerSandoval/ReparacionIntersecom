import React, { useState, useEffect } from 'react'
import {
  Card, Table, Button, Modal, Form, Badge, Alert, Spinner, Row, Col
} from 'react-bootstrap'
import { FaExchangeAlt, FaPlus, FaCheck, FaTruck } from 'react-icons/fa'
import axios from 'axios'

function Traslados({ sucursalActual }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [traslados, setTraslados] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [ordenes, setOrdenes] = useState([])

  const [showModal, setShowModal] = useState(false)
  const [showModalRecibir, setShowModalRecibir] = useState(false)
  const [trasladoSeleccionado, setTrasladoSeleccionado] = useState(null)

  const [nuevoTraslado, setNuevoTraslado] = useState({
    id_orden: '',
    id_sucursal_origen: '',
    id_sucursal_destino: '',
    motivo: '',
    enviado_por: '',
    observaciones: ''
  })

  const [datosRecepcion, setDatosRecepcion] = useState({
    recibido_por: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar traslados
      const trasladosResponse = await axios.get('/api.php/traslados')
      if (trasladosResponse.data.success) {
        setTraslados(trasladosResponse.data.data)
      }

      // Cargar sucursales
      const sucursalesResponse = await axios.get('/api.php/sucursales?activo=true')
      if (sucursalesResponse.data.success) {
        setSucursales(sucursalesResponse.data.data)
      }

      // Cargar órdenes (solo las que no están entregadas)
      const ordenesResponse = await axios.get('/api.php/ordenes')
      if (ordenesResponse.data.success) {
        const ordenesActivas = ordenesResponse.data.data.filter(
          orden => orden.estado !== 'Entregado' && orden.estado !== 'Cancelado'
        )
        setOrdenes(ordenesActivas)
      }
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const abrirModalNuevo = () => {
    setNuevoTraslado({
      id_orden: '',
      id_sucursal_origen: sucursalActual?.id || '',
      id_sucursal_destino: '',
      motivo: '',
      enviado_por: '',
      observaciones: ''
    })
    setShowModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setNuevoTraslado({
      ...nuevoTraslado,
      [name]: value
    })

    // Si se selecciona una orden, actualizar la sucursal origen automáticamente
    if (name === 'id_orden' && value) {
      const ordenSeleccionada = ordenes.find(o => o.id === parseInt(value))
      if (ordenSeleccionada) {
        // Buscar el id de la sucursal por nombre
        const sucursalOrden = sucursales.find(s => s.nombre === ordenSeleccionada.sucursal_nombre)
        if (sucursalOrden) {
          setNuevoTraslado(prev => ({
            ...prev,
            id_sucursal_origen: sucursalOrden.id
          }))
        }
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const response = await axios.post('/api.php/traslados', nuevoTraslado)

      if (response.data.success) {
        setSuccess('Traslado creado exitosamente')
        setShowModal(false)
        cargarDatos()
      }
    } catch (err) {
      console.error('Error al crear traslado:', err)
      setError(err.response?.data?.error || 'Error al crear el traslado')
    }
  }

  const abrirModalRecibir = (traslado) => {
    setTrasladoSeleccionado(traslado)
    setDatosRecepcion({ recibido_por: '' })
    setShowModalRecibir(true)
  }

  const confirmarRecepcion = async () => {
    if (!datosRecepcion.recibido_por) {
      setError('Debe ingresar el nombre de quien recibe')
      return
    }

    try {
      const response = await axios.put(`/api.php/traslados/${trasladoSeleccionado.id}`, {
        estado_traslado: 'Recibido',
        recibido_por: datosRecepcion.recibido_por
      })

      if (response.data.success) {
        setSuccess('Traslado recibido exitosamente')
        setShowModalRecibir(false)
        cargarDatos()
      }
    } catch (err) {
      console.error('Error al recibir traslado:', err)
      setError(err.response?.data?.error || 'Error al recibir el traslado')
    }
  }

  const cambiarEstadoTraslado = async (trasladoId, nuevoEstado) => {
    try {
      const response = await axios.put(`/api.php/traslados/${trasladoId}`, {
        estado_traslado: nuevoEstado
      })

      if (response.data.success) {
        setSuccess(`Traslado marcado como ${nuevoEstado}`)
        cargarDatos()
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err)
      setError('Error al cambiar el estado del traslado')
    }
  }

  const getBadgeVariant = (estado) => {
    const variants = {
      'Pendiente': 'warning',
      'En Tránsito': 'info',
      'Recibido': 'success',
      'Cancelado': 'danger'
    }
    return variants[estado] || 'secondary'
  }

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
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

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaExchangeAlt className="me-2" />
          Traslados entre Sucursales
        </h2>
        <Button variant="primary" onClick={abrirModalNuevo}>
          <FaPlus className="me-2" />
          Nuevo Traslado
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {traslados.length === 0 ? (
            <div className="text-center py-5 text-muted">
              No hay traslados registrados
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Orden</th>
                  <th>Equipo</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Estado</th>
                  <th>Fecha Envío</th>
                  <th>Enviado Por</th>
                  <th>Recibido Por</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {traslados.map(traslado => (
                  <tr key={traslado.id}>
                    <td>
                      <strong>{traslado.numero_orden}</strong>
                    </td>
                    <td>
                      {traslado.tipo_equipo} {traslado.marca}
                      <br />
                      <small className="text-muted">{traslado.modelo}</small>
                    </td>
                    <td>{traslado.sucursal_origen}</td>
                    <td>{traslado.sucursal_destino}</td>
                    <td>
                      <Badge bg={getBadgeVariant(traslado.estado_traslado)}>
                        {traslado.estado_traslado}
                      </Badge>
                    </td>
                    <td>
                      <small>{formatFecha(traslado.fecha_envio)}</small>
                    </td>
                    <td>{traslado.enviado_por || 'N/A'}</td>
                    <td>{traslado.recibido_por || 'N/A'}</td>
                    <td className="text-center">
                      {traslado.estado_traslado === 'Pendiente' && (
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-1"
                          onClick={() => cambiarEstadoTraslado(traslado.id, 'En Tránsito')}
                          title="Marcar en tránsito"
                        >
                          <FaTruck />
                        </Button>
                      )}
                      {traslado.estado_traslado === 'En Tránsito' && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => abrirModalRecibir(traslado)}
                          title="Confirmar recepción"
                        >
                          <FaCheck /> Recibir
                        </Button>
                      )}
                      {traslado.estado_traslado === 'Recibido' && (
                        <Badge bg="success">Completado</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal para Crear Traslado */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Traslado</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Orden a Trasladar *</Form.Label>
                  <Form.Select
                    name="id_orden"
                    value={nuevoTraslado.id_orden}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione una orden...</option>
                    {ordenes.map(orden => (
                      <option key={orden.id} value={orden.id}>
                        {orden.numero_orden} - {orden.cliente_nombre} - {orden.tipo_equipo} {orden.marca}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sucursal Origen *</Form.Label>
                  <Form.Select
                    name="id_sucursal_origen"
                    value={nuevoTraslado.id_sucursal_origen}
                    onChange={handleChange}
                    required
                    disabled
                  >
                    <option value="">Seleccione...</option>
                    {sucursales.map(sucursal => (
                      <option key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sucursal Destino *</Form.Label>
                  <Form.Select
                    name="id_sucursal_destino"
                    value={nuevoTraslado.id_sucursal_destino}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {sucursales
                      .filter(s => s.id !== parseInt(nuevoTraslado.id_sucursal_origen))
                      .map(sucursal => (
                        <option key={sucursal.id} value={sucursal.id}>
                          {sucursal.nombre}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Motivo del Traslado</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="motivo"
                    value={nuevoTraslado.motivo}
                    onChange={handleChange}
                    placeholder="Razón del traslado..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Enviado Por</Form.Label>
                  <Form.Control
                    type="text"
                    name="enviado_por"
                    value={nuevoTraslado.enviado_por}
                    onChange={handleChange}
                    placeholder="Nombre de quien envía"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Observaciones</Form.Label>
                  <Form.Control
                    type="text"
                    name="observaciones"
                    value={nuevoTraslado.observaciones}
                    onChange={handleChange}
                    placeholder="Notas adicionales..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Crear Traslado
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal para Recibir Traslado */}
      <Modal show={showModalRecibir} onHide={() => setShowModalRecibir(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Recepción de Traslado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {trasladoSeleccionado && (
            <>
              <p>
                <strong>Orden:</strong> {trasladoSeleccionado.numero_orden}
              </p>
              <p>
                <strong>Equipo:</strong> {trasladoSeleccionado.tipo_equipo} {trasladoSeleccionado.marca} {trasladoSeleccionado.modelo}
              </p>
              <p>
                <strong>Desde:</strong> {trasladoSeleccionado.sucursal_origen}
              </p>
              <p>
                <strong>Hacia:</strong> {trasladoSeleccionado.sucursal_destino}
              </p>

              <hr />

              <Form.Group className="mb-3">
                <Form.Label>Recibido Por *</Form.Label>
                <Form.Control
                  type="text"
                  value={datosRecepcion.recibido_por}
                  onChange={(e) => setDatosRecepcion({ recibido_por: e.target.value })}
                  placeholder="Nombre de quien recibe"
                  required
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalRecibir(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={confirmarRecepcion}>
            <FaCheck className="me-2" />
            Confirmar Recepción
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Traslados
