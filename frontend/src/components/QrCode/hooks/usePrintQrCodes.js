import { useRef } from 'react';
import { toastError } from '@/utils/toast-utils';

const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[ch]));

const buildQrHtml = (tableNumber, dataUrl) => `
    <div class="qr-container">
        <div class="table-number">${escapeHtml(tableNumber)}</div>
        <img src="${dataUrl}" class="qr-image" alt="QR Code" />
    </div>
`;

const writeIframeBody = (iframe, html) => {
    const doc = iframe.contentDocument;
    if (!doc) return;
    const styleEl = doc.createElement('style');
    styleEl.textContent = `
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .qr-container { margin: 10px; padding: 15px; border: 1px solid #ccc; border-radius: 5px; display: inline-block; width: 250px; text-align: center; }
        .qr-image { max-width: 200px; height: auto; }
        .table-number { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
        @media print { .qr-container { page-break-inside: avoid; } }
    `;
    doc.head?.appendChild(styleEl);
    const body = doc.body || doc.createElement('body');
    body.innerHTML = html;
    if (!doc.body) doc.appendChild(body);
};

export const usePrintQrCodes = (printFrameRef, selectedQrCodes, clearSelections) => {
    const timerRef = useRef(null);

    const printQrCodes = (html) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            if (!printFrameRef.current) return;
            const iframe = printFrameRef.current;
            const iframeWindow = iframe.contentWindow || iframe;
            try {
                writeIframeBody(iframe, html);
                iframe.focus();
                iframeWindow.print();
                clearSelections();
            } catch (error) {
                console.error('Printing failed:', error);
                toastError('Printing failed. Please try again.');
            }
        }, 500);
    };

    const printQRCode = (qrId, tableName) => {
        const canvas = document.querySelector(`canvas[data-qrid="${qrId}"]`);
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        printQrCodes(buildQrHtml(tableName, dataUrl));
    };

    const printMultipleQrCodes = (qrCodes) => {
        let html = '';
        qrCodes.forEach((qrCode) => {
            const canvas = document.querySelector(`canvas[data-qrid="${qrCode.unique_id}"]`);
            if (canvas) {
                html += buildQrHtml(qrCode.table_number, canvas.toDataURL('image/png'));
            }
        });
        if (html) printQrCodes(html);
    };

    const printAllQrCodes = (filteredItems) => {
        if (filteredItems?.length > 0) printMultipleQrCodes(filteredItems);
    };

    const printSelectedQrCodes = (filteredItems) => {
        if (selectedQrCodes.length === 0) {
            toastError('No QR codes selected. Please select at least one QR code.');
            return;
        }
        const selectedItems = filteredItems.filter((qr) => selectedQrCodes.includes(qr.unique_id));
        printMultipleQrCodes(selectedItems);
    };

    return {
        printQRCode,
        printAllQrCodes,
        printSelectedQrCodes,
    };
};
