
"use client";

import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import htmlDocx from 'html-docx-js';
import { saveAs } from 'file-saver';

export const exportReport = async (
    element: HTMLElement, 
    format: 'pdf' | 'docx' | 'print',
    filename: string
) => {
    if (!element) return;
    
    // Create a clone to avoid modifying the original element
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '1200px'; 
    clone.style.padding = '20px';
    clone.style.background = '#ffffff';

    // Temporarily append to body to ensure styles are computed
    document.body.appendChild(clone);

    try {
        const dataUrl = await toPng(clone, { 
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            // Ensure fonts are loaded
            fetchRequestInit: {
                headers: { 'cache-control': 'no-cache' }
            }
        });
        
        if (format === 'pdf') {
            const pdf = new jsPDF('p', 'px', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps= pdf.getImageProperties(dataUrl);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
              heightLeft -= pdfHeight;
            }
            pdf.save(`${filename}.pdf`);
        } else if (format === 'docx') {
            const content = `
                <!DOCTYPE html>
                <html>
                <head>
                <title>${filename}</title>
                </head>
                <body>
                    <img src="${dataUrl}" style="width:100%;" />
                </body>
                </html>
            `;
            const file = htmlDocx.asBlob(content);
            saveAs(file, `${filename}.docx`);
        } else if (format === 'print') {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                    <head><title>Print Report</title></head>
                    <body><img src="${dataUrl}" style="width:100%;"></body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            }
        }
    } catch (error) {
        console.error('oops, something went wrong!', error);
    } finally {
        // Clean up the cloned element
        document.body.removeChild(clone);
    }
};
