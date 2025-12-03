import React, { useState, useEffect } from 'react'
import {
  Card, Table, Button, Modal, Form, Alert, Spinner, Row, Col, InputGroup
} from 'react-bootstrap'
import { FaPlus, FaEdit, FaSearch, FaUsers } from 'react-icons/fa'
import axios from 'axios'

function Clientes() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [clienteActual, setClienteActual] = useState({
    id: null,
    nombre: '',
    telefono: '',
    correo_electronico: '',
    direccion: '',
    nit: ''
  })

  useEffect(() => {
    cargarClientes()
  }, [])

  useEffect(() => {
    if (busqueda.length >= 3) {
      buscarClientes()
    } else if (busqueda.length === 0) {
      cargarClientes()
    }
  }, [busqueda])

  const cargarClientes = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get('/api.php/clientes')
      if (response.data.success) {
        setClientes(response.data.data)
      }
    } catch (err) {
      console.error('Error al cargar clientes:', err)
      setError('Error al cargar los clientes')
    } finally {
      setLoading(false)
    }
  }

  const buscarClientes = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`/api.php/clientes?search=${busqueda}`)
      if (response.data.success) {
        setClientes(response.data.data)
      }
    } catch (err) {
      console.error('Error al buscar clientes:', err)
      setError('Error al buscar clientes')
    } finally {
      setLoading(false)
    }
  }

  const abrirModalNuevo = () => {
    setClienteActual({
      id: null,
      nombre: '',
      telefono: '',
      correo_electronico: '',
      direccion: '',
      nit: ''
    })
    setModoEdicion(false)
    setShowModal(true)
  }

  const abrirModalEditar = (cliente) => {
    setClienteActual(cliente)
    setModoEdicion(true)
    setShowModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setClienteActual({
      ...clienteActual,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      let response

      if (modoEdicion) {
        // Actualizar cliente existente
        response = await axios.put(`/api.php/clientes/${clienteActual.id}`, clienteActual)
      } else {
        // Crear nuevo cliente
        response = await axios.post('/api.php/clientes', clienteActual)
      }

      if (response.data.success) {
        setSuccess(modoEdicion ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente')
        setShowModal(false)
        cargarClientes()
      }
    } catch (err) {
      console.error('Error al guardar cliente:', err)
      setError(err.response?.data?.error || 'Error al guardar el cliente')
    }
  }

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading && clientes.length === 0) {
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
          <FaUsers className="me-2" />
          Gestión de Clientes
        </h2>
        <Button variant="primary" onClick={abrirModalNuevo}>
          <FaPlus className="me-2" />
          Nuevo Cliente
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Búsqueda */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Tabla de Clientes */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {clientes.length === 0 ? (
            <div className="text-center py-5 text-muted">
              {busqueda ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>NIT</th>
                    <th>Dirección</th>
                    <th>Fecha Registro</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map(cliente => (
                    <tr key={cliente.id}>
                      <td>
                        <strong>{cliente.nombre}</strong>
                      </td>
                      <td>{cliente.telefono}</td>
                      <td>{cliente.correo_electronico || 'N/A'}</td>
                      <td>{cliente.nit || 'N/A'}</td>
                      <td>
                        <small>{cliente.direccion || 'N/A'}</small>
                      </td>
                      <td>
                        <small>{formatFecha(cliente.fecha_registro)}</small>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => abrirModalEditar(cliente)}
                        >
                          <FaEdit />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="p-3 bg-light border-top">
                <small className="text-muted">
                  Mostrando {clientes.length} cliente(s)
                </small>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal para Crear/Editar Cliente */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={clienteActual.nombre}
                    onChange={handleChange}
                    placeholder="Nombre completo"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono *</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefono"
                    value={clienteActual.telefono}
                    onChange={handleChange}
                    placeholder="1234-5678"
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
                    name="correo_electronico"
                    value={clienteActual.correo_electronico}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>NIT</Form.Label>
                  <Form.Control
                    type="text"
                    name="nit"
                    value={clienteActual.nit}
                    onChange={handleChange}
                    placeholder="12345678-9"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="direccion"
                    value={clienteActual.direccion}
                    onChange={handleChange}
                    placeholder="Dirección completa"
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
              {modoEdicion ? 'Actualizar' : 'Crear'} Cliente
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default Clientes
