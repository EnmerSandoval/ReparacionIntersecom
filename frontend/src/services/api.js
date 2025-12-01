/**
 * =====================================================
 * SERVICIO DE API - FRONTEND INTERSECOM
 * =====================================================
 * Funciones para comunicarse con el backend PHP
 */

// URL base de la API (Ajustar según tu servidor)
const API_BASE_URL = 'http://localhost/ReparacionIntersecom/backend/api/api.php';

/**
 * Función auxiliar para hacer peticiones HTTP
 */
async function fetchAPI(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }

        return data;
    } catch (error) {
        console.error('Error en fetchAPI:', error);
        throw error;
    }
}

// =====================================================
// ÓRDENES
// =====================================================

/**
 * Obtener todas las órdenes
 */
export async function getOrdenes(estado = null, limit = 100, offset = 0) {
    let url = `${API_BASE_URL}?action=getOrdenes&limit=${limit}&offset=${offset}`;
    if (estado) {
        url += `&estado=${encodeURIComponent(estado)}`;
    }
    return fetchAPI(url);
}

/**
 * Obtener una orden específica
 */
export async function getOrden(id) {
    return fetchAPI(`${API_BASE_URL}?action=getOrden&id=${id}`);
}

/**
 * Crear nueva orden
 */
export async function createOrden(ordenData) {
    return fetchAPI(`${API_BASE_URL}?action=createOrden`, {
        method: 'POST',
        body: JSON.stringify(ordenData),
    });
}

/**
 * Actualizar orden completa
 */
export async function updateOrden(ordenData) {
    return fetchAPI(`${API_BASE_URL}?action=updateOrden`, {
        method: 'PUT',
        body: JSON.stringify(ordenData),
    });
}

/**
 * Actualizar solo el estado de una orden
 */
export async function updateEstado(id, estado, entregadoA = null) {
    const payload = { id, estado };
    if (entregadoA) {
        payload.entregado_a = entregadoA;
    }

    return fetchAPI(`${API_BASE_URL}?action=updateEstado`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

/**
 * Eliminar orden
 */
export async function deleteOrden(id) {
    return fetchAPI(`${API_BASE_URL}?action=deleteOrden&id=${id}`, {
        method: 'DELETE',
    });
}

// =====================================================
// CLIENTES
// =====================================================

/**
 * Obtener todos los clientes
 */
export async function getClientes() {
    return fetchAPI(`${API_BASE_URL}?action=getClientes`);
}

// =====================================================
// ESTADÍSTICAS
// =====================================================

/**
 * Obtener estadísticas generales
 */
export async function getEstadisticas() {
    return fetchAPI(`${API_BASE_URL}?action=getEstadisticas`);
}

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Formatear fecha para mostrar
 */
export function formatearFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-GT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Formatear moneda (Quetzales)
 */
export function formatearMoneda(monto) {
    return `Q ${parseFloat(monto).toFixed(2)}`;
}

/**
 * Obtener color del badge según estado
 */
export function getBadgeColor(estado) {
    const colores = {
        'Recibido': 'info',
        'En Diagnóstico': 'warning',
        'En Espera de Repuesto': 'secondary',
        'En Reparación': 'primary',
        'Reparado': 'success',
        'Listo para Entrega': 'success',
        'Entregado': 'dark',
        'Cancelado': 'danger',
        'No Reparable': 'danger',
    };
    return colores[estado] || 'secondary';
}
