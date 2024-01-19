const fs = require("fs");
const PDFDocument = require("pdfkit");

const makePdf = function createInvoice(path,invoice) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });

  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc)
  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

// header part of the PDF
// data,x-axis,y-axix,options
function generateHeader(doc) {
  doc
    .image("public/image/logo.png", 35, 20, { width: 80 }, { align: "left" })
    .fillColor("#444444")
    .fontSize(20)
    .text("ZESUGAR.shop", 0, 57, { align: "center" })
    .fontSize(10)
    .text("ZESUGAR.shop", 200, 50, { align: "right" })
    .text("Dotspace Business Park", 200, 65, { align: "right" })
    .text("Trivandrum, 695582", 200, 80, { align: "right" })
    .moveDown();
}


// FOoter of the PDF
function generateFooter(doc) {
  doc.fontSize(
    10,
  ).text(
    'Thank You shop with us again',
    50,
    750,
    { align: 'center', width: 500 },
  );
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Invoice", 50, 160);

  generateHr(doc, 185); //horizontal line

  const customerInformationTop = 200; //position of the data

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .text(invoice.invoice_nr, 150, customerInformationTop)
    .text("Payment Id:", 50, customerInformationTop + 15)
    .text(invoice.payment_id, 150, customerInformationTop + 15)
    .text("Invoice Date:", 50, customerInformationTop + 30)
    .text(formatDate(new Date()), 150, customerInformationTop + 30)
    .text("Grand Total:", 50, customerInformationTop + 45)
    .text(
      formatCurrency(invoice.totalPrice),
      150,
      customerInformationTop + 45
    )

    .text(invoice.shippingAddress.name, 350, customerInformationTop) //nAME OF THE CUSTOMER
    .text(invoice.shippingAddress.address, 350, customerInformationTop + 15) //ADDRESS OF THE CUSTOMER
    .text(
      invoice.shippingAddress.city,
      350,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 272);
}

// generate the table for the items
function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 350;

  generateTableRow( //heading of the table
    doc,
    invoiceTableTop,
    "SL.No",
    "Name",
    "Unit Cost",
    "Quantity",
    "Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow( //data of the  table
      doc,
      position,
      i + 1,
      item.product.name,
      formatCurrency(item.orderPrice),
      item.quantity,
      formatCurrency(item.priceOfTotalQTy)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow( //adding new row
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    "",
    formatCurrency(invoice.totalPrice)
  );

  const discountToDatePosition = subtotalPosition + 20;
//   generateTableRow(
//     doc,
//     discountToDatePosition,
//     "",
//     "",
//     "Discount",
//     "",
//     12
//   );

//   const duePosition = discountToDatePosition + 25;
//   generateTableRow(
//     doc,
//     duePosition,
//     "",
//     "",
//     "Grand Total",
//     "",
//     formatCurrency(invoice.subtotal)
//   );

  const duePosition = discountToDatePosition + 25;
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Order Status",
    "",
    invoice.status
  );
}


function generateTableRow(
  doc,
  y,
  slno,
  name,
  unitCost,
  quantity,
  Total
) {
  const cellWidth = 90; // Width of each cell

  doc
    .fontSize(10)
    .text(slno, 50, y)
    .text(name, 150, y, { width: cellWidth, height: 20 }) // Set a maximum width for the name cell
    .text(unitCost, 150 + cellWidth, y, { width: cellWidth, align: "right" })
    .text(quantity, 150 + 2 * cellWidth, y, { width: cellWidth, align: "right" })
    .text(Total, 150 + 3 * cellWidth, y, { width: cellWidth, align: "right" });
}


function generateHr(doc, y) { //function for drawing the line
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(cents) { //currenxct formating
  return "INR" + (cents).toFixed(2);
}

function formatDate(date) { //function for formating the date
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}


module.exports = makePdf //creating the pdf

