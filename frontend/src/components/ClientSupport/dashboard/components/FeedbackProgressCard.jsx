import { TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const FeedbackProgressCard = ({ title,totalCount, items }) => {
    return (
        <Card className='shadow-sm' >
            <CardHeader className='px-4 py-3'>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4">
                {items.map((item) => {
                    const total = Number.parseInt(totalCount.toString());
                    const percentage = total > 0 ? (Number.parseInt(item.count.toString()) / total) * 100 : 0;
                    return (
                        <div key={item.status} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>{item.label}</span>
                                <span>{item.count}</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};

export default FeedbackProgressCard;