export interface PaymentInfo {
  method: string;
  data: {
    [key: string]: string;
  };
  message: string;
  messageColor: string;
}

export const paymentInformation: PaymentInfo[] = [
  {
    method: "Transferencia bancaria",
    data: {
      Banco: "Mercantil",
      "Número de cuenta": "0102-0000-0000000000-00",
      Titular: "XVII ROBLESMUN",
      Cédula: "V-30.217.393",
    },
    message:
      "Realiza la transferencia y adjunta el comprobante en el siguiente paso.",
    messageColor: "blue",
  },
  {
    method: "Pago móvil",
    data: {
      Banco: "Mercantil",
      Teléfono: "0412-996-8751",
      Cédula: "V-30.217.393",
      Titular: "XVII Roblesmun",
    },
    message: "Envía el pago móvil y guarda la confirmación SMS.",
    messageColor: "green",
  },
  {
    method: "Zelle",
    data: {
      "Correo electrónico": "mun@losroblesenlinea.com.ve",
    },
    message: "Envía el pago vía Zelle y guarda la confirmación SMS.",
    messageColor: "purple",
  },
  {
    method: "Efectivo",
    data: {
      Ubicación: "U.E. Liceo Los Robles",
      Dirección: "Av. Principal, Los Robles",
      "Horario de atención": "Lunes a Viernes 8:00 AM - 4:00 PM",
      Contacto: "0212-1234567",
    },
    message: "Acércate a nuestras oficinas para realizar el pago en efectivo.",
    messageColor: "orange",
  },
];

export const additionalMessages = {
  "Transferencia bancaria":
    "Una vez realizada la transferencia, tendrás 24 horas para enviar el comprobante.",
  "Pago móvil":
    "Confirma que el monto y datos sean correctos antes de realizar el pago móvil.",
  Zelle: "Verifica que el correo sea correcto antes de enviar el pago.",
  Efectivo:
    "Reserva tu cupo ahora y paga en nuestras oficinas antes de la fecha límite.",
};
