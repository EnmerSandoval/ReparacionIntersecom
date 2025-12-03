import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Form, Button, Card, Row, Col, Alert, Spinner, InputGroup, Modal
} from 'react-bootstrap'
import { FaSave, FaSearch, FaUserPlus } from 'react-icons/fa'
import axios from 'axios'

function NuevaOrden({ sucursalActual }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Estados para búsqueda de clientes
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [clientesEncontrados, setClientesEncontrados] = useState([])
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const [showModalCliente, setShowModalCliente] = useState(false)

  // Estados del formulario
  const [formData, setFormData] = useState({
    // Datos del Cliente
    id_cliente: '',
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_correo: '',

    // Datos del Equipo
    tipo_equipo: 'Laptop',
    marca: '',
    modelo: '',
    color: '',

    // Datos de Acceso (CRÍTICO)
    datos_acceso: '',

    // Estado Físico
    accesorios: '',
    falla_reportada: '',

    // Financiero
    costo_estimado: '',
    anticipo: '',

    // Otros
    fecha_estimada_entrega: '',
    observaciones: '',
    recibido_por: ''
  })

  // Nuevo cliente para modal
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    telefono: '',
    correo_electronico: '',
    direccion: '',
    nit: ''
  })

  useEffect(() => {
    if (busquedaCliente.length >= 3) {
      buscarClientes()
    } else {
      setClientesEncontrados([])
      setMostrarResultados(false)
    }
  }, [busquedaCliente])

  const buscarClientes = async () => {
    try {
      const response = await axios.get(`/api.php/clientes?search=${busquedaCliente}`)
      if (response.data.success) {
        setClientesEncontrados(response.data.data)
        setMostrarResultados(true)
      }
    } catch (err) {
      console.error('Error al buscar clientes:', err)
    }
  }

  const seleccionarCliente = (cliente) => {
    setFormData({
      ...formData,
      id_cliente: cliente.id,
      cliente_nombre: cliente.nombre,
      cliente_telefono: cliente.telefono,
      cliente_correo: cliente.correo_electronico || ''
    })
    setBusquedaCliente(cliente.nombre)
    setMostrarResultados(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!sucursalActual) {
      setError('Debe seleccionar una sucursal')
      return
    }

    if (!formData.id_cliente) {
      setError('Debe seleccionar un cliente')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const dataToSend = {
        ...formData,
        id_sucursal: sucursalActual.id
      }

      const response = await axios.post('/api.php/ordenes', dataToSend)

      if (response.data.success) {
        setSuccess(`Orden ${response.data.numero_orden} creada exitosamente`)

        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate(`/ordenes/${response.data.id}`)
        }, 2000)
      }
    } catch (err) {
      console.error('Error al crear orden:', err)
      setError(err.response?.data?.error || 'Error al crear la orden')
    } finally {
      setLoading(false)
    }
  }

  const crearNuevoCliente = async () => {
    try {
      const response = await axios.post('/api.php/clientes', nuevoCliente)

      if (response.data.success) {
        const clienteId = response.data.id

        // Seleccionar el nuevo cliente
        setFormData({
          ...formData,
          id_cliente: clienteId,
          cliente_nombre: nuevoCliente.nombre,
          cliente_telefono: nuevoCliente.telefono,
          cliente_correo: nuevoCliente.correo_electronico || ''
        })

        setBusquedaCliente(nuevoCliente.nombre)
        setShowModalCliente(false)

        // Limpiar formulario de nuevo cliente
        setNuevoCliente({
          nombre: '',
          telefono: '',
          correo_electronico: '',
          direccion: '',
          nit: ''
        })

        setSuccess('Cliente creado exitosamente')
      }
    } catch (err) {
      console.error('Error al crear cliente:', err)
      setError(err.response?.data?.error || 'Error al crear el cliente')
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Nueva Orden de Reparación</h2>
        {sucursalActual && (
          <span className="badge bg-primary fs-6">
            {sucursalActual.nombre}
          </span>
        )}
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      {!sucursalActual && (
        <Alert variant="warning">
          Por favor, seleccione una sucursal en el menú superior antes de crear una orden.
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Datos del Cliente */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Datos del Cliente</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Buscar Cliente *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Nombre o teléfono del cliente..."
                      value={busquedaCliente}
                      onChange={(e) => setBusquedaCliente(e.target.value)}
                      required
                    />
                    <Button
                      variant="success"
                      onClick={() => setShowModalCliente(true)}
                    >
                      <FaUserPlus /> Nuevo
                    </Button>
                  </InputGroup>

                  {/* Resultados de búsqueda */}
                  {mostrarResultados && clientesEncontrados.length > 0 && (
                    <div className="border mt-2 rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {clientesEncontrados.map(cliente => (
                        <div
                          key={cliente.id}
                          className="p-2 border-bottom cursor-pointer"
                          style={{ cursor: 'pointer' }}
                          onClick={() => seleccionarCliente(cliente)}
                        >
                          <strong>{cliente.nombre}</strong>
                          <br />
                          <small className="text-muted">{cliente.telefono}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.cliente_telefono}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.cliente_correo}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Datos del Equipo */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">Datos del Equipo</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Equipo *</Form.Label>
                  <Form.Select
                    name="tipo_equipo"
                    value={formData.tipo_equipo}
                    onChange={handleChange}
                    required
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
                    value={formData.marca}
                    onChange={handleChange}
                    placeholder="HP, Dell, Samsung..."
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Modelo</Form.Label>
                  <Form.Control
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    placeholder="Latitude 5400..."
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Color</Form.Label>
                  <Form.Control
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="Negro, Gris..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Datos de Acceso (Contraseña/Patrón) *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="datos_acceso"
                    value={formData.datos_acceso}
                    onChange={handleChange}
                    placeholder="Contraseña de desbloqueo, patrón, PIN..."
                    required
                  />
                  <Form.Text className="text-muted">
                    Campo obligatorio para poder realizar el diagnóstico
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Accesorios</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="accesorios"
                    value={formData.accesorios}
                    onChange={handleChange}
                    placeholder="Cargador, funda, batería, memoria SD..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Falla Reportada *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="falla_reportada"
                    value={formData.falla_reportada}
                    onChange={handleChange}
                    placeholder="Descripción detallada de la falla..."
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Información Financiera */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">Información Financiera</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
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

              <Col md={4}>
                <Form.Group className="mb-3">
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

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Estimada de Entrega</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_estimada_entrega"
                    value={formData.fecha_estimada_entrega}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Información Adicional */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-secondary text-white">
            <h5 className="mb-0">Información Adicional</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Recibido Por</Form.Label>
                  <Form.Control
                    type="text"
                    name="recibido_por"
                    value={formData.recibido_por}
                    onChange={handleChange}
                    placeholder="Nombre del técnico que recibe"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Observaciones</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    placeholder="Notas adicionales..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Botones */}
        <div className="d-flex justify-content-end gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate('/ordenes')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || !sucursalActual}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                Crear Orden
              </>
            )}
          </Button>
        </div>
      </Form>

      {/* Modal para crear nuevo cliente */}
      <Modal show={showModalCliente} onHide={() => setShowModalCliente(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoCliente.nombre}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono *</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoCliente.telefono}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    value={nuevoCliente.correo_electronico}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, correo_electronico: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>NIT</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoCliente.nit}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, nit: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={nuevoCliente.direccion}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalCliente(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={crearNuevoCliente}>
            Crear Cliente
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default NuevaOrden
