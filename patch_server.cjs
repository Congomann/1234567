const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

const oldDraw = `if (field.type === 'signature' || field.type === 'initials') {
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
              });`;

const newDraw = `if ((field.type === 'signature' || field.type === 'initials') && String(textToDraw).startsWith('data:image/png;base64,')) {
                // Handle drawn signature image
                const imageBytes = Buffer.from(String(textToDraw).split(',')[1], 'base64');
                const pngImage = await pdfDoc.embedPng(imageBytes);
                
                // Scale the image to fit inside the field width/height while maintaining aspect ratio
                // The field is roughly fieldWidth/fieldHeight points. We'll constrain it.
                const imgDims = pngImage.scaleToFit(fieldWidth || 150, fieldHeight || 40);
                
                // Draw centered vertically
                page.drawImage(pngImage, {
                  x: x,
                  y: y - 5,
                  width: imgDims.width,
                  height: imgDims.height
                });
              } else {
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
              }`;

content = content.replace(oldDraw, newDraw);
fs.writeFileSync('backend/server.cjs', content);
console.log('Patched backend/server.cjs to support PNG signatures');
