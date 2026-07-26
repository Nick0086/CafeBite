import { z } from 'zod';

export const qrCodeSchema = z.object({
    tableNumbers: z.string().min(1, 'Qr Code Name is required'),
    templateId: z.string().min(1, 'Template is required'),
});
