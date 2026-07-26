import { useQuery } from '@tanstack/react-query';
import { getAllQrCode } from '@/service/tableQrcode.service';
import { getAllTemplates } from '@/service/templates.service';
import { QRCODE_QUERY_KEYS } from '../constants/qrcode.constants';

export const useQrCodes = () => {
    return useQuery({
        queryKey: [QRCODE_QUERY_KEYS.QRCODES],
        queryFn: getAllQrCode,
    });
};

export const useTemplates = () => {
    return useQuery({
        queryKey: [QRCODE_QUERY_KEYS.TEMPLATE_LIST],
        queryFn: getAllTemplates,
    });
};
