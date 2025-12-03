import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Table, Badge, Button, Form, Row, Col, Card, Spinner, Alert, InputGroup
} from 'react-bootstrap'
import { FaEye, FaFilter, FaPlus } from 'react-icons/fa'
import axios from 'axios'

function ListaOrdenes({ sucursalActual }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ordenes, setOrdenes] = useState([])

  // Filtros
  const [filtros, setFiltros] = useState({
    estado: '',
    fecha_desde: '',
    fecha_hasta: ''
  })

  useEffect(() => {
    cargarOrdenes()
  }, [sucursalActual, filtros])

  const cargarOrdenes = async () => {
    try {
      setLoading(true)
      setError(null)

      let url = '/api.php/ordenes?'
      const params = []

      if (sucursalActual) {
        params.push(`sucursal=${sucursalActual.id}`)
      }

      if (filtros.estado) {
        params.push(`estado=${filtros.estado}`)
      }

      if (filtros.fecha_desde) {
        params.push(`fecha_desde=${filtros.fecha_desde}`)
      }

      if (filtros.fecha_hasta) {
        params.push(`fecha_hasta=${filtros.fecha_hasta}`)
      }

      url += params.join('&')

      const response = await axios.get(url)
      if (response.data.success) {
        setOrdenes(response.data.data)
      }
    } catch (err) {
      console.error('Error al cargar órdenes:', err)
      setError('Error al cargar las órdenes')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (e) => {
    const { name, value } = e.target
    setFiltros({
      ...filtros,
      [name]: value
    })
  }

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      fecha_desde: '',
      fecha_hasta: ''
    })
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
    return new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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
        <h2>Órdenes de Reparación</h2>
        <Link to="/nueva-orden">
          <Button variant="primary">
            <FaPlus className="me-2" />
            Nueva Orden
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <FaFilter className="me-2" />
          Filtros
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="estado"
                  value={filtros.estado}
                  onChange={handleFiltroChange}
                >
                  <option value="">Todos los estados</option>
                  <option value="Recibido">Recibido</option>
                  <option value="En Reparación">En Reparación</option>
                  <option value="Listo">Listo</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Desde</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_desde"
                  value={filtros.fecha_desde}
                  onChange={handleFiltroChange}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Hasta</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_hasta"
                  value={filtros.fecha_hasta}
                  onChange={handleFiltroChange}
                />
              </Form.Group>
            </Col>

            <Col md={3} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                onClick={limpiarFiltros}
                className="w-100 mb-3"
              >
                Limpiar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tabla de Órdenes */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {ordenes.length === 0 ? (
            <div className="text-center py-5 text-muted">
              No se encontraron órdenes con los filtros seleccionados
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0 tabla-ordenes">
                  <thead className="table-light">
                    <tr>
                      <th>Orden</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Equipo</th>
                      <th>Falla</th>
                      <th>Estado</th>
                      <th>Días</th>
                      <th>Valor Total</th>
                      <th>Saldo</th>
                      <th>Sucursal</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenes.map(orden => (
                      <tr key={orden.id}>
                        <td>
                          <strong>{orden.numero_orden}</strong>
                        </td>
                        <td>
                          <small>{formatFecha(orden.fecha_recepcion)}</small>
                        </td>
                        <td>
                          <div>
                            <div><strong>{orden.cliente_nombre}</strong></div>
                            <small className="text-muted">{orden.cliente_telefono}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div>{orden.tipo_equipo}</div>
                            <small className="text-muted">
                              {orden.marca} {orden.modelo}
                            </small>
                          </div>
                        </td>
                        <td>
                          <small>
                            {orden.falla_reportada?.substring(0, 40)}
                            {orden.falla_reportada?.length > 40 ? '...' : ''}
                          </small>
                        </td>
                        <td>
                          <Badge
                            bg={getBadgeVariant(orden.estado)}
                            className="badge-estado"
                          >
                            {orden.estado}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={orden.dias_en_taller > 7 ? 'danger' : 'secondary'}>
                            {orden.dias_en_taller}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <strong>{formatMoneda(orden.valor_total)}</strong>
                        </td>
                        <td className="text-end">
                          {orden.saldo_pendiente > 0 ? (
                            <span className="text-danger">
                              {formatMoneda(orden.saldo_pendiente)}
                            </span>
                          ) : (
                            <span className="text-success">Pagado</span>
                          )}
                        </td>
                        <td>
                          <small>{orden.sucursal_nombre}</small>
                        </td>
                        <td className="text-center">
                          <Link to={`/ordenes/${orden.id}`}>
                            <Button variant="outline-primary" size="sm">
                              <FaEye />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="p-3 bg-light border-top">
                <small className="text-muted">
                  Mostrando {ordenes.length} orden(es)
                </small>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </>
  )
}

export default ListaOrdenes
