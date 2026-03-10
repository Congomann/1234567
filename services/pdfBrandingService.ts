
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * PDF Branding Service for New Holland Financial Group
 * Ensures all generated downloads have consistent high-premium branding.
 */
export const PDFBrandingService = {
    /**
     * Adds the NHFG Golden Cards logo and Typography to a jsPDF instance.
     */
    addHeader: (doc: jsPDF, title: string, userName?: string) => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const logoX = 14;
        const logoY = 10;

        // NHFG GOLDEN CARDS LOGO
        // Back Card (Darker Amber)
        doc.setFillColor(245, 158, 11); // #F59E0B
        doc.roundedRect(logoX, logoY, 9, 6, 1, 1, 'F');

        // Front Card (Lighter Amber)
        doc.setFillColor(252, 211, 77); // #FCD34D
        doc.roundedRect(logoX + 0.5, logoY + 2, 8, 5.5, 1, 1, 'F');

        // Chip (Dark Amber)
        doc.setFillColor(180, 83, 9); // #B45309
        doc.roundedRect(logoX + 3.7, logoY + 3.7, 1.6, 2.2, 0.4, 0.4, 'F');

        // TYPOGRAPHY
        doc.setFontSize(22);
        doc.setTextColor(11, 34, 64); // NHFG Dark Blue
        doc.setFont("helvetica", "bold");
        doc.text("NEW HOLLAND", logoX + 11, logoY + 5);

        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text("FINANCIAL GROUP", logoX + 11, logoY + 8);

        // REPORT TITLE
        doc.setFontSize(14);
        doc.setTextColor(11, 34, 64);
        doc.text(title, 14, 30);

        // METADATA
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        const dateStr = new Date().toLocaleString();
        doc.text(`Advisor: ${userName || 'Authorized NHFG Personnel'}`, 14, 38);
        doc.text(`Generated: ${dateStr}`, 14, 43);

        // RIGHT ALIGNED SECURITY BADGE
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(pageWidth - 60, 10, 46, 12, 3, 3, 'F');
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(7);
        doc.text("NHFG SECURE TERMINAL", pageWidth - 56, 15);
        doc.setFont("helvetica", "bold");
        doc.text("CONFIDENTIAL DATA", pageWidth - 56, 19);
    },

    /**
     * Adds the copyright footer and watermark.
     */
    addFooter: (doc: jsPDF) => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.setFont("helvetica", "italic");
        doc.text(`Proprietary & Confidential. Copyright © ${new Date().getFullYear()} New Holland Financial Group. All Rights Reserved.`, 14, pageHeight - 10);

        // PAGE NUMBER
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
        }
    },

    /**
     * Standard Table Styles for NHFG Reports
     */
    tableStyles: {
        theme: 'striped' as 'striped',
        styles: { fontSize: 8, cellPadding: 4, font: 'helvetica' },
        headStyles: { fillColor: [11, 34, 64] as [number, number, number], textColor: [255, 255, 255] as [number, number, number], fontStyle: 'bold' as 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] as [number, number, number] },
        margin: { top: 50 }
    }
};
