import React, { useEffect, useRef, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { FormControl } from './form';
import { Button } from './button';
import { Check, ChevronDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { cn } from '@/lib/utils';
import { ScrollArea } from './scroll-area';

export default function Combobox({ options, field, placeholder, disabled, inputClassName, onValueChange }) {

    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState("");
    const popoverRef = useRef(null);
    const [popoverWidth, setPopoverWidth] = useState('100%');
    const inputRef = useRef(null);

    useEffect(() => {
        if (popoverRef.current) {
            const width = popoverRef.current.offsetWidth;
            setPopoverWidth(`${width}px`);
        }
    }, [isOpen]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <Popover open={isOpen} onOpenChange={(e) => {
            setIsOpen(!isOpen)
            e.stopPropagation()
        }}  >
            <PopoverTrigger asChild>
                <FormControl className={cn("md:flex-none flex-1 w-full mx-0", inputClassName)} ref={popoverRef} >
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isOpen}
                        className={cn(" flex justify-between tw-text-secondary shadow-sm", inputClassName)}
                        disabled={disabled}
                    >
                        {field.value
                            ? options.find((option) => option.value === field.value)?.label
                            : placeholder}
                        <ChevronDown className="ml-auto self-end h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent onFocusOutside={(e) => { e.preventDefault() }} className="w-full p-0 z-[9999]" style={{ width: popoverWidth }}>
                <Command>
                    <CommandInput ref={inputRef} placeholder="Search options..." />
                    <CommandList >
                        <ScrollArea className='max-h-52 overflow-auto' >
                            <CommandEmpty>No option found.</CommandEmpty>
                            <CommandGroup >
                                {options.map((option) => (
                                    <CommandItem
                                        className='py-2 pr-2'
                                        key={option.value}
                                        value={option.label}
                                        onSelect={(currentLabel) => {
                                            const selectedOption = options.find(
                                                (option) => option.label.toLowerCase() === currentLabel.toLowerCase()
                                            );
                                            field.onChange(selectedOption?.value);
                                            if (onValueChange) {
                                                onValueChange()
                                            }
                                            setSelectedValue(
                                                selectedOption?.value === selectedValue ? "" : selectedOption?.value
                                            );
                                            setIsOpen(false);
                                        }}
                                    >
                                        {option.label}
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                field.value === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
