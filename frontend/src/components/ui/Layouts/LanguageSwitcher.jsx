import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();

    const languageOptions = [
        { value: 'en', label: 'English' },
        { value: 'fr', label: 'French' },
        { value: 'es', label: 'Spanish' },
    ];

    const handleLanguageChange = (value) => {
        i18n.changeLanguage(value);
    };

    return (
        <Select onValueChange={handleLanguageChange} defaultValue={i18n.language}>
            <SelectTrigger className="w-[100px]">
                <SelectValue placeholder={t('select_language')} />
            </SelectTrigger>
            <SelectContent>
                {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default LanguageSwitcher;