
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import htmlDocx from 'html-docx-js/dist/html-docx';

// Helper function to show a loading toast
const showLoadingToast = (toast: any, title: string) => {
    return toast({
      title: title,
      description: 'Your download will begin shortly...',
    });
};

// Generic export function to reduce repetition
const performExport = async (
    element: HTMLElement,
    toast: any,
    exportAction: (element: HTMLElement) => Promise<void>,
    loadingMessage: string,
    successMessage: string,
    errorMessage: string
) => {
    const { dismiss } = showLoadingToast(toast, loadingMessage);
    try {
        await exportAction(element);
        toast({
            title: 'Export Successful',
            description: successMessage,
        });
    } catch (error) {
        console.error(errorMessage, error);
        toast({
            variant: 'destructive',
            title: 'Export Failed',
            description: `${errorMessage}. Please try again.`,
        });
    } finally {
        dismiss();
    }
};

export const exportToPdf = async (element: HTMLElement, toast: any) => {
    await performExport(
        element,
        toast,
        async (el) => {
            const dataUrl = await toPng(el, { 
                quality: 0.95, 
                backgroundColor: 'white' 
            });
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgProps = pdf.getImageProperties(dataUrl);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            pdf.save('lexiguide-report.pdf');
        },
        'Generating PDF...',
        'PDF has been downloaded successfully.',
        'Failed to generate PDF'
    );
};

export const exportToDocx = async (element: HTMLElement, toast: any) => {
    await performExport(
        element,
        toast,
        async (el) => {
            const htmlString = `
                <!DOCTYPE html>
                <html>
                <head>
                <meta charset="UTF-8">
                <title>LexiGuide Report</title>
                </head>
                <body>
                    ${el.innerHTML}
                </body>
                </html>
            `;
            const fileBuffer = htmlDocx.asBlob(htmlString);
            saveAs(fileBuffer, 'lexiguide-report.docx');
        },
        'Generating DOCX...',
        'DOCX file has been downloaded successfully.',
        'Failed to generate DOCX file'
    );
};


export const saveToGoogleDocs = async (element: HTMLElement, toast: any) => {
    const { dismiss } = showLoadingToast(toast, 'Preparing for Google Docs...');
    try {
        const reportText = element.innerText || 'Could not copy report content.';
        await navigator.clipboard.writeText(reportText);

        window.open('https://docs.new', '_blank');

        toast({
            title: 'Copied to Clipboard!',
            description: 'Report content has been copied. You can now paste it into your new Google Doc.',
        });
    } catch (error) {
        console.error('Failed to copy to clipboard', error);
        toast({
            variant: 'destructive',
            title: 'Copy Failed',
            description: 'Could not copy the report content to the clipboard. Please try again.',
        });
    } finally {
        dismiss();
    }
};
