import { Calendar, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Chip } from '@/components/ui/chip';
import {
    FEEDBACK_STATUS_COLOR,
    FEEDBACK_STATUS_LABEL,
    FEEDBACK_TYPE_COLOR,
} from '../../constants/clientSupport.constants';
import { formatFeedbackDate } from '../../utils/date.utils';

export default function FeedbackDetailsTab({ feedback }) {
    const { label: typeLabel, color: typeColor } =
        FEEDBACK_TYPE_COLOR[feedback.type] || FEEDBACK_TYPE_COLOR.default;

    return (
        <div className="space-y-4">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feedback.title}</h3>
                    <div className="flex flex-wrap gap-3">
                        <Chip
                            className="capitalize"
                            variant="light"
                            color={FEEDBACK_STATUS_COLOR[feedback.status] || FEEDBACK_STATUS_COLOR.default}
                            radius="md"
                            size="sm"
                            border="none"
                        >
                            {FEEDBACK_STATUS_LABEL[feedback.status] || FEEDBACK_STATUS_LABEL.default}
                        </Chip>
                        <Chip
                            className="capitalize"
                            variant="light"
                            color={typeColor}
                            radius="md"
                            size="sm"
                            border="none"
                        >
                            {typeLabel}
                        </Chip>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
                <div className="flex items-center gap-2 sm:text-sm text-xs">
                    <User size={16} className="text-gray-500" />
                    <span className="text-gray-600">Submitted by:</span>
                    <span className="font-medium">
                        {feedback.first_name} {feedback.last_name}
                    </span>
                </div>
                <div className="flex items-center gap-2 sm:text-sm text-xs">
                    <User size={16} className="text-gray-500" />
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="font-medium">Admin</span>
                </div>
                <div className="flex items-center gap-2 sm:text-sm text-xs">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatFeedbackDate(feedback.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 sm:text-sm text-xs">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-gray-600">Last updated:</span>
                    <span className="font-medium">{formatFeedbackDate(feedback.updated_at)}</span>
                </div>
            </div>

            <Separator />

            <div>
                <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg sm:text-sm text-xs">
                    {feedback.description}
                </p>
            </div>
        </div>
    );
}
