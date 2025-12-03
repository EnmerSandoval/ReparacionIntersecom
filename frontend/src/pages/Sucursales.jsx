import React, { useState, useEffect } from 'react'
import {
  Card, Table, Button, Modal, Form, Badge, Alert, Spinner, Row, Col
} from 'react-bootstrap'
import { FaPlus, FaEdit, FaTrash, FaStore } from 'react-icons/fa'
import axios from 'axios'

function Sucursales({ onUpdate }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [sucursales, setSucursales] = useState([])

  const [showModal, setShowModal] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [sucursalActual, setSucursalActual] = useState({
    id: null,
    nombre: '',
    direccion: '',
    telefono: '',
    zona: '',
    ciudad: 'San Marcos',
    activo: true
  })

  useEffect(() => {
    cargarSucursales()
  }, [])

  const cargarSucursales = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get('/api.php/sucursales')
      if (response.data.success) {
        setSucursales(response.data.data)
      }
    } catch (err) {
      console.error('Error al cargar sucursales:', err)
      setError('Error al cargar las sucursales')
    } finally {
      setLoading(false)
    }
  }

  const abrirModalNuevo = () => {
    setSucursalActual({
      id: null,
      nombre: '',
      direccion: '',
      telefono: '',
      zona: '',
      ciudad: 'San Marcos',
      activo: true
    })
    setModoEdicion(false)
    setShowModal(true)
  }

  const abrirModalEditar = (sucursal) => {
    setSucursalActual(sucursal)
    setModoEdicion(true)
    setShowModal(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSucursalActual({
      ...sucursalActual,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      let response

      if (modoEdicion) {
        // Actualizar sucursal existente
        response = await axios.put(`/api.php/sucursales/${sucursalActual.id}`, sucursalActual)
      } else {
        // Crear nueva sucursal
        response = await axios.post('/api.php/sucursales', sucursalActual)
      }

      if (response.data.success) {
        setSuccess(modoEdicion ? 'Sucursal actualizada exitosamente' : 'Sucursal creada exitosamente')
        setShowModal(false)
        cargarSucursales()

        // Notificar al componente padre para actualizar el selector
        if (onUpdate) {
          onUpdate()
        }
      }
    } catch (err) {
      console.error('Error al guardar sucursal:', err)
      setError(err.response?.data?.error || 'Error al guardar la sucursal')
    }
  }

  const desactivarSucursal = async (id) => {
    if (!window.confirm('¿Está seguro de desactivar esta sucursal?')) {
      return
    }

    try {
      const response = await axios.delete(`/api.php/sucursales/${id}`)

      if (response.data.success) {
        setSuccess('Sucursal desactivada exitosamente')
        cargarSucursales()

        if (onUpdate) {
          onUpdate()
        }
      }
    } catch (err) {
      console.error('Error al desactivar sucursal:', err)
      setError('Error al desactivar la sucursal')
    }
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
          <FaStore className="me-2" />
          Gestión de Sucursales
        </h2>
        <Button variant="primary" onClick={abrirModalNuevo}>
          <FaPlus className="me-2" />
          Nueva Sucursal
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {sucursales.length === 0 ? (
            <div className="text-center py-5 text-muted">
              No hay sucursales registradas
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Zona</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sucursales.map(sucursal => (
                  <tr key={sucursal.id}>
                    <td>
                      <strong>{sucursal.nombre}</strong>
                    </td>
                    <td>{sucursal.direccion}</td>
                    <td>{sucursal.telefono}</td>
                    <td>{sucursal.zona}</td>
                    <td>{sucursal.ciudad}</td>
                    <td>
                      <Badge bg={sucursal.activo ? 'success' : 'secondary'}>
                        {sucursal.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => abrirModalEditar(sucursal)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => desactivarSucursal(sucursal.id)}
                        disabled={!sucursal.activo}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal para Crear/Editar Sucursal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modoEdicion ? 'Editar Sucursal' : 'Nueva Sucursal'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={sucursalActual.nombre}
                    onChange={handleChange}
                    placeholder="Sucursal Principal"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Dirección *</Form.Label>
                  <Form.Control
                    type="text"
                    name="direccion"
                    value={sucursalActual.direccion}
                    onChange={handleChange}
                    placeholder="15 Avenida 1-340 Zona 5"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefono"
                    value={sucursalActual.telefono}
                    onChange={handleChange}
                    placeholder="7760-3991, 7725-4830"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Zona</Form.Label>
                  <Form.Control
                    type="text"
                    name="zona"
                    value={sucursalActual.zona}
                    onChange={handleChange}
                    placeholder="Zona 5"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control
                    type="text"
                    name="ciudad"
                    value={sucursalActual.ciudad}
                    onChange={handleChange}
                    placeholder="San Marcos"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="activo"
                    label="Sucursal Activa"
                    checked={sucursalActual.activo}
                    onChange={handleChange}
                    className="mt-4"
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
              {modoEdicion ? 'Actualizar' : 'Crear'} Sucursal
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default Sucursales
