import React, { useState } from 'react';
import { Container, Nav, Navbar, Tab, Tabs, Card, Row, Col, Badge } from 'react-bootstrap';
import FormularioOrden from './components/FormularioOrden';
import TablaOrdenes from './components/TablaOrdenes';
import { getEstadisticas } from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

/**
 * =====================================================
 * APLICACIÓN PRINCIPAL - INTERSECOM
 * =====================================================
 * Sistema de Gestión de Reparaciones
 */
function App() {
    const [activeTab, setActiveTab] = useState('ordenes');
    const [refreshOrdenes, setRefreshOrdenes] = useState(0);
    const [estadisticas, setEstadisticas] = useState(null);

    // Callback cuando se crea una nueva orden
    const handleOrdenCreada = (nuevaOrden) => {
        // Cambiar a la pestaña de órdenes
        setActiveTab('ordenes');

        // Forzar recarga de la tabla
        setRefreshOrdenes(prev => prev + 1);

        // Recargar estadísticas
        cargarEstadisticas();
    };

    // Cargar estadísticas
    const cargarEstadisticas = async () => {
        try {
            const response = await getEstadisticas();
            if (response.success) {
                setEstadisticas(response.data);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    // Cargar estadísticas al montar el componente
    React.useEffect(() => {
        cargarEstadisticas();
    }, []);

    return (
        <div className="App">
            {/* BARRA DE NAVEGACIÓN */}
            <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
                <Container fluid>
                    <Navbar.Brand href="#home" className="fw-bold">
                        🔧 INTERSECOM - Sistema de Gestión de Reparaciones
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link href="#ordenes" active={activeTab === 'ordenes'}>
                                Órdenes Activas
                            </Nav.Link>
                            <Nav.Link href="#nueva" active={activeTab === 'nueva'}>
                                Nueva Orden
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* CONTENIDO PRINCIPAL */}
            <Container fluid className="py-4">
                {/* PANEL DE ESTADÍSTICAS */}
                {estadisticas && (
                    <Row className="mb-4">
                        <Col md={3}>
                            <Card className="text-center shadow-sm">
                                <Card.Body>
                                    <h6 className="text-muted mb-2">Total Órdenes</h6>
                                    <h2 className="mb-0">{estadisticas.total_ordenes}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center shadow-sm">
                                <Card.Body>
                                    <h6 className="text-muted mb-2">En Proceso</h6>
                                    <h2 className="mb-0 text-warning">{estadisticas.en_proceso}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center shadow-sm">
                                <Card.Body>
                                    <h6 className="text-muted mb-2">Listos</h6>
                                    <h2 className="mb-0 text-success">{estadisticas.listos}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center shadow-sm">
                                <Card.Body>
                                    <h6 className="text-muted mb-2">Saldo Pendiente</h6>
                                    <h2 className="mb-0 text-danger">
                                        Q {parseFloat(estadisticas.saldo_pendiente_total || 0).toFixed(2)}
                                    </h2>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* TABS DE NAVEGACIÓN */}
                <Tabs
                    id="main-tabs"
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-3"
                >
                    {/* TAB: ÓRDENES ACTIVAS */}
                    <Tab eventKey="ordenes" title="Órdenes en el Taller">
                        <TablaOrdenes refresh={refreshOrdenes} />
                    </Tab>

                    {/* TAB: NUEVA ORDEN */}
                    <Tab eventKey="nueva" title="➕ Nueva Orden">
                        <FormularioOrden onOrdenCreada={handleOrdenCreada} />
                    </Tab>

                    {/* TAB: AYUDA */}
                    <Tab eventKey="ayuda" title="ℹ️ Ayuda">
                        <Card className="shadow-sm">
                            <Card.Header className="bg-info text-white">
                                <h5 className="mb-0">Guía de Uso del Sistema</h5>
                            </Card.Header>
                            <Card.Body>
                                <h6 className="text-primary">📋 Recepción de Equipos</h6>
                                <ol>
                                    <li>Ir a la pestaña "Nueva Orden"</li>
                                    <li>Llenar los datos del cliente y del equipo</li>
                                    <li><strong>IMPORTANTE:</strong> Registrar los datos de acceso (contraseña/patrón)</li>
                                    <li>Anotar accesorios que trae el equipo</li>
                                    <li>Describir la falla reportada</li>
                                    <li>Indicar costo estimado y anticipo (si aplica)</li>
                                    <li>Guardar la orden</li>
                                </ol>

                                <hr />

                                <h6 className="text-primary">🔧 Gestión de Reparaciones</h6>
                                <ol>
                                    <li>En "Órdenes en el Taller", ver todos los equipos activos</li>
                                    <li>Cambiar el estado usando el selector desplegable</li>
                                    <li>Hacer clic en ✏️ para editar detalles (diagnóstico, trabajo realizado, repuestos)</li>
                                    <li>Actualizar el costo total si cambió el presupuesto</li>
                                    <li>Cuando esté listo, cambiar estado a "Listo para Entrega"</li>
                                </ol>

                                <hr />

                                <h6 className="text-primary">🖨️ Impresión de Recibos</h6>
                                <ol>
                                    <li>Hacer clic en el botón 🖨️ junto a la orden</li>
                                    <li>Verificar que todos los datos sean correctos</li>
                                    <li>Hacer clic en "Imprimir"</li>
                                    <li>El recibo incluye las cláusulas legales automáticamente</li>
                                </ol>

                                <hr />

                                <h6 className="text-primary">⚠️ Notas Importantes</h6>
                                <ul>
                                    <li><strong>Datos de Acceso:</strong> Son críticos para diagnosticar el equipo. Siempre solicitarlos.</li>
                                    <li><strong>Anticipo:</strong> Se recomienda solicitar al menos un 50% del costo estimado.</li>
                                    <li><strong>30 Días:</strong> Recordar al cliente que tiene 30 días para recoger el equipo.</li>
                                    <li><strong>Accesorios:</strong> Anotar todos los accesorios para evitar reclamos.</li>
                                    <li><strong>Estado Físico:</strong> Documentar golpes o daños previos.</li>
                                </ul>

                                <hr />

                                <h6 className="text-primary">🔐 Cláusulas Legales Incluidas</h6>
                                <p className="small text-muted">
                                    Todos los recibos incluyen automáticamente las siguientes cláusulas:
                                </p>
                                <ul className="small text-muted">
                                    <li>No responsabilidad por daños causados por mal uso o inestabilidad eléctrica</li>
                                    <li>No responsabilidad por equipos no recogidos en 30 días</li>
                                    <li>No responsabilidad por pérdida de datos</li>
                                </ul>
                            </Card.Body>
                        </Card>
                    </Tab>
                </Tabs>
            </Container>

            {/* FOOTER */}
            <footer className="bg-dark text-white text-center py-3 mt-5">
                <Container>
                    <p className="mb-0">
                        © 2024 INTERSECOM - Sistema de Gestión de Reparaciones
                    </p>
                    <p className="small mb-0">
                        15 Avenida 1-340 Zona 5 San Marcos
                    </p>
                </Container>
            </footer>
        </div>
    );
}

export default App;
