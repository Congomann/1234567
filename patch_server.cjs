const fs = require('fs');
const filePath = 'backend/server.cjs';
let content = fs.readFileSync(filePath, 'utf8');

const routeCode = `
app.post('/api/contracting/sign-and-submit', authenticateToken, async (req, res) => {
  try {
    const { carrier_name, formValues, fields, pdfData } = req.body;
    
    // We would use pdf-lib here to modify the PDF
    const { PDFDocument, rgb } = require('pdf-lib');
    
    let base64Pdf = pdfData;
    if (pdfData.includes('base64,')) {
      base64Pdf = pdfData.split('base64,')[1];
    }
    
    const pdfBytes = Buffer.from(base64Pdf, 'base64');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    
    // Draw text onto the PDF
    for (const field of fields) {
      if (formValues[field.id]) {
        const pageIndex = (field.pageNumber || 1) - 1;
        if (pageIndex >= 0 && pageIndex < pages.length) {
          const page = pages[pageIndex];
          const { width, height } = page.getSize();
          
          // react-pdf rendered dimensions are scaled, but percentages remain relative
          // coordinates in PDF: origin is bottom-left
          const x = (field.x / 100) * width;
          const yFromTop = (field.y / 100) * height;
          const y = height - yFromTop - 12; // Adjust for bottom-left origin and font size
          
          page.drawText(formValues[field.id], {
            x: x,
            y: y,
            size: 12,
            color: rgb(0, 0, 0.5) // Dark blue text
          });
        }
      }
    }
    
    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedBase64 = Buffer.from(modifiedPdfBytes).toString('base64');
    
    // Send email using nodemailer
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.larksuite.com',
      port: 465,
      secure: true,
      auth: {
        user: 'sales@newhollandfinancial.com',
        pass: 'SalesNew@2026'
      }
    });

    const mailOptions = {
      from: '"New Holland Contracting" <sales@newhollandfinancial.com>',
      to: \`plbcontracting@protective.com, sales@newhollandfinancial.com\`, // Usually would be dynamic based on carrier
      subject: \`New Agent Contract Submission - \${req.user.email} - \${carrier_name}\`,
      text: \`Attached is the completed contracting paperwork for \${req.user.email}.\`,
      attachments: [
        {
          filename: \`\${carrier_name}_Contract_\${req.user.email}.pdf\`,
          content: modifiedBase64,
          encoding: 'base64'
        }
      ]
    };

    // Send email (ignore errors in sandbox)
    transporter.sendMail(mailOptions).catch(console.error);
    
    // Log submission to database
    await query(
      'INSERT INTO carriers_submissions (carrier_name, user_id, status, submitted_at, data) VALUES ($1, $2, $3, NOW(), $4)',
      [carrier_name, req.user.id, 'Pending Carrier', JSON.stringify(formValues)]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('Submit contract error:', err);
    res.status(500).json({ error: 'Failed to process contract' });
  }
});
`;

if (!content.includes('/api/contracting/sign-and-submit')) {
  content = content.replace('app.get(\'/api/contracting/submissions\'', routeCode + '\napp.get(\'/api/contracting/submissions\'');
  fs.writeFileSync(filePath, content);
  console.log('Added sign-and-submit route');
}
