import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Badge, Spinner, Alert } from 'react-bootstrap'
import { FaTools, FaClock, FaCheckCircle, FaBoxOpen, FaDollarSign } from 'react-icons/fa'
import axios from 'axios'

function Dashboard({ sucursalActual }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [estadisticas, setEstadisticas] = useState(null)
  const [ordenesPendientes, setOrdenesPendientes] = useState([])

  useEffect(() => {
    cargarDashboard()
  }, [sucursalActual])

  const cargarDashboard = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = sucursalActual ? `?sucursal=${sucursalActual.id}` : ''

      // Cargar estadísticas
      const response = await axios.get(`/api.php/dashboard${params}`)
      if (response.data.success) {
        setEstadisticas(response.data.data.estadisticas)
      }

      // Cargar órdenes pendientes
      const ordenesParams = sucursalActual
        ? `?sucursal=${sucursalActual.id}&estado=En Reparación`
        : '?estado=En Reparación'

      const ordenesResponse = await axios.get(`/api.php/ordenes${ordenesParams}`)
      if (ordenesResponse.data.success) {
        setOrdenesPendientes(ordenesResponse.data.data.slice(0, 10))
      }

    } catch (err) {
      console.error('Error al cargar dashboard:', err)
      setError('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const formatMoneda = (valor) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(valor || 0)
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

  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        {sucursalActual && (
          <Badge bg="primary" className="fs-6">
            {sucursalActual.nombre}
          </Badge>
        )}
      </div>

      {/* Tarjetas de Estadísticas */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="card-stats shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Recibidos</p>
                  <h3 className="mb-0">{estadisticas?.recibidos || 0}</h3>
                </div>
                <FaBoxOpen size={40} className="text-primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="card-stats shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">En Reparación</p>
                  <h3 className="mb-0">{estadisticas?.en_reparacion || 0}</h3>
                </div>
                <FaTools size={40} className="text-warning" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="card-stats shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Listos</p>
                  <h3 className="mb-0">{estadisticas?.listos || 0}</h3>
                </div>
                <FaClock size={40} className="text-info" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="card-stats shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Entregados</p>
                  <h3 className="mb-0">{estadisticas?.entregados || 0}</h3>
                </div>
                <FaCheckCircle size={40} className="text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tarjetas Financieras */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Ventas del Mes</p>
                  <h4 className="mb-0 text-success">
                    {formatMoneda(estadisticas?.ventas_totales)}
                  </h4>
                </div>
                <FaDollarSign size={35} className="text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Anticipos Recibidos</p>
                  <h4 className="mb-0 text-primary">
                    {formatMoneda(estadisticas?.anticipos_totales)}
                  </h4>
                </div>
                <FaDollarSign size={35} className="text-primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Saldo Pendiente</p>
                  <h4 className="mb-0 text-danger">
                    {formatMoneda(estadisticas?.saldo_pendiente)}
                  </h4>
                </div>
                <FaDollarSign size={35} className="text-danger" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Órdenes en Reparación */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Órdenes en Reparación</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {ordenesPendientes.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No hay órdenes en reparación
            </div>
          ) : (
            <Table responsive hover className="mb-0 tabla-ordenes">
              <thead className="table-light">
                <tr>
                  <th>Orden</th>
                  <th>Cliente</th>
                  <th>Equipo</th>
                  <th>Falla</th>
                  <th>Días</th>
                  <th>Estado</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {ordenesPendientes.map(orden => (
                  <tr key={orden.id}>
                    <td>
                      <strong>{orden.numero_orden}</strong>
                    </td>
                    <td>
                      {orden.cliente_nombre}
                      <br />
                      <small className="text-muted">{orden.cliente_telefono}</small>
                    </td>
                    <td>
                      {orden.tipo_equipo} {orden.marca}
                      <br />
                      <small className="text-muted">{orden.modelo}</small>
                    </td>
                    <td>
                      <small>{orden.falla_reportada?.substring(0, 50)}...</small>
                    </td>
                    <td>
                      <Badge bg={orden.dias_en_taller > 7 ? 'danger' : 'secondary'}>
                        {orden.dias_en_taller} días
                      </Badge>
                    </td>
                    <td>
                      <Badge bg="warning" className="badge-estado">
                        {orden.estado}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <strong>{formatMoneda(orden.valor_total)}</strong>
                      <br />
                      <small className="text-muted">
                        Pendiente: {formatMoneda(orden.saldo_pendiente)}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </>
  )
}

export default Dashboard
