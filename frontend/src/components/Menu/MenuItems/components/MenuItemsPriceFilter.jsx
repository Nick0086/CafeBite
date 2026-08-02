import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { PRICE_OPERATORS } from '../constants/menuItem.constants';

const DEFAULT_OPERATOR = 'equals';

export default function MenuItemsPriceFilter({ value, onChange }) {
    const [operator, setOperator] = useState(value?.operator || DEFAULT_OPERATOR);
    const [amount, setAmount] = useState(value?.value != null ? String(value.value) : '');

    useEffect(() => {
        setOperator(value?.operator || DEFAULT_OPERATOR);
        setAmount(value?.value != null ? String(value.value) : '');
    }, [value?.operator, value?.value]);

    const apply = (nextAmount, nextOperator) => {
        const parsed = parseFloat(nextAmount);
        if (nextAmount && parsed > 0) {
            onChange({ value: parsed, operator: nextOperator });
        } else {
            onChange(null);
        }
    };

    const handleOperatorChange = (next) => {
        setOperator(next);
        apply(amount, next);
    };

    const handleAmountChange = (e) => {
        const next = e.target.value;
        setAmount(next);
        apply(next, operator);
    };

    const handleReset = () => {
        setAmount('');
        setOperator(DEFAULT_OPERATOR);
        onChange(null);
    };

    return (
        <div className="flex items-center space-x-2 bg-white border rounded-md p-1 px-2 border-input">
            <span className="text-sm font-medium">Price:</span>
            <Select value={operator} onValueChange={handleOperatorChange}>
                <SelectTrigger className="h-6 border-none px-0 focus:ring-0">
                    <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                    {PRICE_OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                            {op.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Separator orientation="vertical" className="h-6" />
            <Input
                type="number"
                placeholder="Price..."
                value={amount}
                onChange={handleAmountChange}
                className="h-6 border-none shadow-none w-[75px] px-0.5 focus:border-none focus-visible:ring-0"
            />
            {amount && (
                <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="text-red-500 h-6 px-1 hover:bg-red-100 hover:text-red-700"
                    size="sm"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
