const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generarFactura = (reserva, cuidador, usuario) => {
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, '../facturas', `${reserva.numeroFactura}.pdf`);

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text('Factura', { align: 'center' });
    doc.fontSize(14).text(`Número de Factura: ${reserva.numeroFactura}`);
    doc.text(`Fecha de Expedición: ${new Date(reserva.fechaExpedicion).toLocaleDateString()}`);
    doc.text(`Nombre Emisor: ${cuidador.nombre}`);
    doc.text(`Domicilio Emisor: ${cuidador.direccionStr}`);
    doc.text(`Nombre Receptor: ${usuario.nombre}`);
    doc.text(`Domicilio Receptor: ${usuario.ubicacion.direccion}`);
    doc.text(`Descripción: Servicio de ${reserva.servicio.tipo}`);
    doc.text(`Base Imponible: ${reserva.precioTotal}`);
    doc.text(`Tipo Impositivo: 21%`);
    doc.text(`Cuota Tributaria: ${(reserva.precioTotal * 0.21).toFixed(2)}`);
    doc.text(`Precio Total: ${(reserva.precioTotal * 1.21).toFixed(2)}`);
    doc.text(`Fecha de Prestación del Servicio: ${new Date(reserva.fechaInicio).toLocaleDateString()}`);

    doc.end();

    return filePath;
};

module.exports = generarFactura;
