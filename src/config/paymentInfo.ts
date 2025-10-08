export interface PaymentInfo {
  method: string;
  data: {
    [key: string]: string;
  };
  message: string;
  messageColor: string;
  placeholder?: string;
}

export const paymentInformation: PaymentInfo[] = [
  {
    method: "Transferencia bancaria",
    data: {
      Banco: "Mercantil",
      "Número de cuenta": "01050265901265101663",
      Cédula: "V-30.217.393",
      Titular: "XVII ROBLESMUN",
    },
    message:
      "Realiza la transferencia y adjunta el comprobante en el siguiente paso.",
    messageColor: "blue",
    placeholder: "Ej: 3317664",
  },
  {
    method: "Pago móvil",
    data: {
      Banco: "Mercantil",
      Teléfono: "0412-996-8751",
      Cédula: "V-30.217.393",
      Titular: "XVII Roblesmun",
      QR: "/qr-pagomovil.jpg",
    },
    message:
      "Envía los cuatro últimos dígitos del número de referencia de tu pago móvil.",
    messageColor: "blue",
    placeholder: "Ej: 1220",
  },
  {
    method: "Zelle",
    data: {
      "Correo electrónico": "mun@losroblesenlinea.com.ve",
    },
    message: "Envía el código de confirmación de tu operación.",
    messageColor: "purple",
    placeholder: "Ej: YB61KGYH",
  },
  {
    method: "Efectivo",
    data: {
      Ubicación: "U.E. Liceo Los Robles",
      Dirección: "Calle 34, Av. Fuerzas Armadas",
      "Horario de atención": "Lunes a Viernes 8:00 AM - 2:00 PM",
      Contacto: "0412-996-8751",
    },
    message: "Acércate a nuestras oficinas para realizar el pago en efectivo.",
    messageColor: "green",
  },
];
