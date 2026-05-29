import { getDashboardResumen } from '@/services/mock/dashboardMock';
import { getProductos, getCategorias } from '@/services/mock/productosMock';
import { getVentas } from '@/services/mock/ventasMock';
import { getClientes } from '@/services/mock/clientesMock';

export function useMock() {
  return {
    dashboard: getDashboardResumen,
    productos: getProductos,
    categorias: getCategorias,
    ventas: getVentas,
    clientes: getClientes,
  };
}
