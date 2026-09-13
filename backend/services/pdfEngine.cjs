const { PDFDocument, rgb } = require('pdf-lib');

/**
 * PDF Engine for Carrier Contracting
 * Merges form data and stamps the Advisor's electronic signature.
 */
async function generateCompletedForm(originalPdfBuffer, fieldData, signatureDataUrl, signatureMetadata) {
  // 1. Load the blank carrier PDF
  const pdfDoc = await PDFDocument.load(originalPdfBuffer);
  
  // 2. Fill standard AcroForm fields (if they exist in the PDF)
  const form = pdfDoc.getForm();
  if (fieldData) {
    for (const [fieldName, value] of Object.entries(fieldData)) {
      try {
        const field = form.getField(fieldName);
        if (field) {
          if (field.constructor.name === 'PDFTextField') {
            field.setText(value || '');
          } else if (field.constructor.name === 'PDFCheckBox') {
            if (value) field.check();
            else field.uncheck();
          }
        }
      } catch (err) {
        console.warn(`[PDF Engine] Could not map field: ${fieldName}`);
      }
    }
  }

  // 3. Stamp Electronic Signature (if provided)
  if (signatureDataUrl) {
    try {
      // Decode base64 PNG data URL
      const base64Data = signatureDataUrl.replace(/^data:image\/png;base64,/, "");
      const signatureImageBytes = Buffer.from(base64Data, 'base64');
      
      const pngImage = await pdfDoc.embedPng(signatureImageBytes);
      
      // Get the correct page (default to the last page if not specified)
      const pages = pdfDoc.getPages();
      const targetPageNum = signatureMetadata?.pageIndex !== undefined ? signatureMetadata.pageIndex : (pages.length - 1);
      const page = pages[targetPageNum];
      
      // Extract coordinates (fallback to bottom center if not provided by AI extraction mapping)
      const x = signatureMetadata?.x || 100;
      const y = signatureMetadata?.y || 100;
      const width = signatureMetadata?.width || 200;
      const height = signatureMetadata?.height || 50;
      
      // Draw the signature
      page.drawImage(pngImage, {
        x,
        y,
        width,
        height,
      });

      // Add a small digital timestamp for audit trail
      page.drawText(`Digitally signed: ${new Date().toISOString()}`, {
        x: x,
        y: y - 12,
        size: 8,
        color: rgb(0.2, 0.2, 0.2),
      });
      
    } catch (err) {
      console.error('[PDF Engine] Failed to stamp signature:', err);
    }
  }

  // 4. Flatten the PDF to lock it from future edits (PRD requirement: "Lock document")
  form.flatten();

  // 5. Serialize the PDF Document to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = {
  generateCompletedForm
};
