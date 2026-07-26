import { useState } from 'react';

export const useQrCodeSelection = () => {
    const [selectedQrCodes, setSelectedQrCodes] = useState([]);

    const toggleQrCodeSelection = (qrId) => {
        setSelectedQrCodes((prev) => {
            if (prev.includes(qrId)) {
                return prev.filter((id) => id !== qrId);
            } else {
                return [...prev, qrId];
            }
        });
    };

    const clearSelections = () => {
        setSelectedQrCodes([]);
    };

    const selectAll = (qrCodes) => {
        setSelectedQrCodes(qrCodes.map((qr) => qr.unique_id));
    };

    return {
        selectedQrCodes,
        toggleQrCodeSelection,
        clearSelections,
        selectAll,
    };
};
