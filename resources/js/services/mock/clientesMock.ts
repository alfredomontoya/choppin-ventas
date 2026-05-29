import type { Cliente } from '@/types/models';

export function getClientes(): Cliente[] {
  return [
    { id: 1, nombre: 'Juan', apellido: 'Pérez', tipo_documento: 'dni', numero_documento: '12345678', telefono: '999888777', email: 'juan@email.com', direccion: 'Av. Principal 123' },
    { id: 2, nombre: 'María', apellido: 'López', tipo_documento: 'dni', numero_documento: '87654321', telefono: '999111222', email: 'maria@email.com', direccion: 'Jr. Las Flores 456' },
    { id: 3, nombre: 'Carlos', apellido: 'García', tipo_documento: 'ruc', numero_documento: '20123456789', telefono: '999333444', email: 'carlos@empresa.com', direccion: 'Av. Industrial 789' },
    { id: 4, nombre: 'Ana', apellido: 'Torres', tipo_documento: 'dni', numero_documento: '45678912', telefono: '999555666', email: 'ana@email.com', direccion: 'Calle Los Olivos 321' },
    { id: 5, nombre: 'Pedro', apellido: 'Ramírez', tipo_documento: 'dni', numero_documento: '78945612', telefono: '999777888', email: 'pedro@email.com', direccion: 'Av. Central 654' },
  ];
}
