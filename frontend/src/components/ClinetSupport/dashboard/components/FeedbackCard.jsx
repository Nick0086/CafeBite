import { Card, CardContent } from '@/components/ui/card';

const FeedbackCard = ({ title, value, icon }) => {
    return (
        <Card className='shadow-sm' >
            <CardContent className="px-3 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
};

export default FeedbackCard;