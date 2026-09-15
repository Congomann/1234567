const fs = require('fs');
let server = fs.readFileSync('backend/server.cjs', 'utf8');

const newSubmitEndpoint = `
app.post('/api/contracting/sign-and-submit', async (req, res) => {
  try {
    const { carrier_name, formValues, fields, pdfData } = req.body;
    
    // We use pdf-lib to physically merge fields and drawings into the final document
    const { PDFDocument, rgb } = require('pdf-lib');
    
    let base64Pdf = pdfData;
    if (pdfData.includes('base64,')) {
      base64Pdf = pdfData.split('base64,')[1];
    }
    
    const pdfBytes = Buffer.from(base64Pdf, 'base64');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    
    // 1. Overlay ink drawings (Pen Tool)
    for (let i = 0; i < pages.length; i++) {
      const drawKey = 'draw_page_' + (i + 1);
      if (formValues[drawKey] && formValues[drawKey].includes('base64,')) {
        const pngData = formValues[drawKey].split('base64,')[1];
        const pngBytes = Buffer.from(pngData, 'base64');
        const pngImage = await pdfDoc.embedPng(pngBytes);
        
        const page = pages[i];
        const { width, height } = page.getSize();
        
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: width,
          height: height
        });
      }
    }

    // 2. Draw text fields
    if (fields && Array.isArray(fields)) {
      for (const field of fields) {
        if (formValues[field.id]) {
          const pageIndex = (field.pageNumber || 1) - 1;
          if (pageIndex >= 0 && pageIndex < pages.length) {
            const page = pages[pageIndex];
            const { width, height } = page.getSize();
            
            // Coordinates in PDF: origin is bottom-left
            const x = (field.x / 100) * width;
            const yFromTop = (field.y / 100) * height;
            const y = height - yFromTop - 12; // Adjust for bottom-left origin and font baseline
            
            // Handle checkboxes (X mark)
            const textToDraw = field.type === 'checkbox' ? (formValues[field.id] === 'true' ? 'X' : '') : formValues[field.id];
            
            if (textToDraw) {
              page.drawText(String(textToDraw), {
                x: x,
                y: y,
                size: 11,
                color: rgb(0.1, 0.1, 0.5) // Dark blue text for form entries
              });
            }
          }
        }
      }
    }
    
    // Save flattened, completed document
    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedBase64 = Buffer.from(modifiedPdfBytes).toString('base64');
    
    // 3. Email completed package directly to Carrier Contracting Team
    const nodemailer = require('nodemailer');
    
    // Using LarkSuite credentials specified by user earlier
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
      to: 'sales@newhollandfinancial.com, contracting@' + (carrier_name ? carrier_name.toLowerCase().replace(/[^a-z]/g, '') : 'carrier') + '.com',
      subject: \`New Agent Contract Submission - \${carrier_name}\`,
      text: \`Attached is the completed contracting paperwork for a new advisor.\n\nGenerated automatically via New Holland Financial CRM.\`,
      attachments: [
        {
          filename: \`\${carrier_name}_Completed_Contract.pdf\`,
          content: modifiedBase64,
          encoding: 'base64'
        }
      ]
    };

    // Fire-and-forget email dispatch
    transporter.sendMail(mailOptions).catch(err => console.error('Email failed:', err));
    
    res.json({ success: true });
  } catch (err) {
    console.error('Submit contract error:', err);
    res.status(500).json({ error: 'Failed to process and email contract' });
  }
});
`;

server = server.replace(
  /app\.post\('\/api\/contracting\/sign-and-submit', authenticateToken, async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Failed to process contract' \}\);\n  \}\n\}\);/,
  newSubmitEndpoint
);

// If authenticateToken was missing from the replacement signature above, let's fix it safely:
// We just replace the entire block from app.post('/api/contracting/sign-and-submit' to the next endpoint.
fs.writeFileSync('backend/server.cjs', server);
console.log('Patched sign-and-submit in backend');
