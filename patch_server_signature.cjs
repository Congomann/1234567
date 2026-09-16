const fs = require('fs');

let server = fs.readFileSync('backend/server.cjs', 'utf8');

// We need to inject font loading for signatures
const oldDrawLoop = `
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
`;

const newDrawLoop = `
            // Handle checkboxes (X mark)
            const textToDraw = (field.type === 'checkbox' || field.type === 'radio') ? (formValues[field.id] === 'true' ? 'X' : '') : formValues[field.id];
            
            if (textToDraw) {
              let font = await pdfDoc.embedFont(require('pdf-lib').StandardFonts.Helvetica);
              let fontSize = 11;
              let yOffset = 0;
              
              if (field.type === 'signature' || field.type === 'initials') {
                font = await pdfDoc.embedFont(require('pdf-lib').StandardFonts.TimesRomanItalic);
                fontSize = 18; // Make signatures larger
                yOffset = -5;  // Adjust baseline for larger font
              }

              page.drawText(String(textToDraw), {
                x: x,
                y: y + yOffset,
                size: fontSize,
                font: font,
                color: rgb(0.1, 0.1, 0.5) // Dark blue text for form entries
              });
            }
`;

server = server.replace(oldDrawLoop, newDrawLoop);

fs.writeFileSync('backend/server.cjs', server);
console.log('Patched server for signatures');
