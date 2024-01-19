const fs = require("fs");
const PDFDocument = require("pdfkit");

const makeReportPdf = function createInvoice(invoice, path) {
    let doc = new PDFDocument({ size: "A4", margin: 20 });
    generateHeader(doc);
    doc.fontSize(15);
    doc.text('Sales Report', 0, 100, { align: 'center' });
    generateInvoiceTable(doc, invoice);
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


// generate the table for the items
function generateInvoiceTable(doc, invoice) {
    let i;
    const invoiceTableTop = 150;


    generateTableRow( //heading of the table
        doc,
        invoiceTableTop,
        "SL.No",
        "Order ID",
        "User ID",
        "Total Amount",
        "Payment ID",
        "Date",
        "Payment Mode"
    );
    generateHr(doc, invoiceTableTop + 20);
    let subtotal = 0
    for (i = 0; i < invoice.length; i++) {
        subtotal += invoice[i].totalPrice
        const position = invoiceTableTop + (i + 1) * 30;
        generateTableRow( //data of the  table
            doc,
            position,
            i + 1,
            invoice[i]._id,
            invoice[i].userId,
            formatCurrency(invoice[i].totalPrice),
            'Null',
            formatDate(invoice[i].orderDate),
            invoice[i].paymentMethod,

        );

        generateHr(doc, position + 30);
    }
    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    generateTableRow( //adding new row
        doc,
        subtotalPosition,
        "",
        "",
        "",
        '',
        '',
        "Subtotal",
        formatCurrency(subtotal)
    );
}


function generateTableRow(
    doc,
    y,
    slno,
    Order_ID,
    User_ID,
    Total_Amount,
    Payment_ID,
    Date,
    Payment_Mode
) {
    const cellWidth = 70; // Width of each cell

    doc
        .fontSize(8)
        .text(slno, 50, y, { width: 30, align: "center" })
        .text(Order_ID, 100, y, { width: cellWidth, height: 30, align: "center" }) // Set a maximum width for the cell
        .text(User_ID, 130 + cellWidth, y, { width: cellWidth, height: 30, align: "center" })
        .text(Total_Amount, 130 + 2 * cellWidth, y, { width: cellWidth, align: "center" })
        .text(Payment_ID, 130 + 3 * cellWidth, y, { width: cellWidth, align: "center" })
        .text(Date, 130 + 4 * cellWidth, y, { width: cellWidth, align: "center" })
        .text(Payment_Mode, 130 + 5 * cellWidth, y, { width: cellWidth, align: "center" });
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


module.exports = makeReportPdf //creating the pdf

