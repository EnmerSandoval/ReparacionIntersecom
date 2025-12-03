import React, { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap'
import axios from 'axios'

// Páginas
import Dashboard from './pages/Dashboard'
import NuevaOrden from './pages/NuevaOrden'
import ListaOrdenes from './pages/ListaOrdenes'
import DetalleOrden from './pages/DetalleOrden'
import Sucursales from './pages/Sucursales'
import Traslados from './pages/Traslados'
import Clientes from './pages/Clientes'

// Configuración de axios
axios.defaults.baseURL = 'http://localhost:8000/backend'

function App() {
  const [sucursales, setSucursales] = useState([])
  const [sucursalActual, setSucursalActual] = useState(null)

  useEffect(() => {
    cargarSucursales()
  }, [])

  const cargarSucursales = async () => {
    try {
      const response = await axios.get('/api.php/sucursales?activo=true')
      if (response.data.success) {
        setSucursales(response.data.data)
        if (response.data.data.length > 0 && !sucursalActual) {
          setSucursalActual(response.data.data[0])
        }
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error)
    }
  }

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <strong>INTERSECOM</strong> - Sistema de Reparaciones
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/nueva-orden">Nueva Orden</Nav.Link>
              <Nav.Link as={Link} to="/ordenes">Órdenes</Nav.Link>
              <Nav.Link as={Link} to="/traslados">Traslados</Nav.Link>
              <NavDropdown title="Configuración" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/sucursales">
                  Sucursales
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/clientes">
                  Clientes
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Nav>
              <NavDropdown
                title={sucursalActual ? sucursalActual.nombre : 'Seleccionar Sucursal'}
                id="sucursal-dropdown"
                align="end"
              >
                {sucursales.map(sucursal => (
                  <NavDropdown.Item
                    key={sucursal.id}
                    active={sucursalActual?.id === sucursal.id}
                    onClick={() => setSucursalActual(sucursal)}
                  >
                    {sucursal.nombre}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <Routes>
          <Route path="/" element={<Dashboard sucursalActual={sucursalActual} />} />
          <Route path="/nueva-orden" element={<NuevaOrden sucursalActual={sucursalActual} />} />
          <Route path="/ordenes" element={<ListaOrdenes sucursalActual={sucursalActual} />} />
          <Route path="/ordenes/:id" element={<DetalleOrden />} />
          <Route path="/sucursales" element={<Sucursales onUpdate={cargarSucursales} />} />
          <Route path="/traslados" element={<Traslados sucursalActual={sucursalActual} />} />
          <Route path="/clientes" element={<Clientes />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
