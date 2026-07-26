// src/contexts/TemplateContext.jsx
import { DEFAULT_THEME } from '@/components/Menu/Templates/constants/template.constants';
import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const TemplateContext = createContext(null);

export function TemplateProvider({ children }) {
    const [backgroundColor, setBackgroundColor] = useState(DEFAULT_THEME.backgroundColor);
    const [sectionBackgroundColor, setSectionBackgroundColor] = useState(DEFAULT_THEME.sectionBackgroundColor);
    const [titleColor, setTitleColor] = useState(DEFAULT_THEME.titleColor);
    const [cardTitleColor, setCardTitleColor] = useState(DEFAULT_THEME.cardTitleColor);
    const [cardBackgroundColor, setCardBackgroundColor] = useState(DEFAULT_THEME.cardBackgroundColor);
    const [descriptionColor, setDescriptionColor] = useState(DEFAULT_THEME.descriptionColor);
    const [buttonBackgroundColor, setButtonBackgroundColor] = useState(DEFAULT_THEME.buttonBackgroundColor);
    const [buttonLabelColor, setButtonLabelColor] = useState(DEFAULT_THEME.buttonLabelColor);
    const [currentView, setCurrentView] = useState('list');
    const [selectedTab, setSelectedTab] = useState('Global');
    const [currentSubItemTab, setCurrentSubItemTab] = useState('item');
    const [currentSection, setCurrentSection] = useState(null);
    const [nameError, setNameError] = useState(null);

    const handleTabChange = useCallback((tab) => {
        setSelectedTab(tab);
    }, []);

    const resetAllHandler = useCallback(() => {
        setBackgroundColor(DEFAULT_THEME.backgroundColor);
        setSectionBackgroundColor(DEFAULT_THEME.sectionBackgroundColor);
        setTitleColor(DEFAULT_THEME.titleColor);
        setCardTitleColor(DEFAULT_THEME.cardTitleColor);
        setCardBackgroundColor(DEFAULT_THEME.cardBackgroundColor);
        setDescriptionColor(DEFAULT_THEME.descriptionColor);
        setButtonBackgroundColor(DEFAULT_THEME.buttonBackgroundColor);
        setButtonLabelColor(DEFAULT_THEME.buttonLabelColor);
    }, []);

    const value = useMemo(() => ({
        backgroundColor,
        sectionBackgroundColor,
        titleColor,
        cardTitleColor,
        cardBackgroundColor,
        descriptionColor,
        buttonBackgroundColor,
        buttonLabelColor,
        currentView,
        selectedTab,
        currentSubItemTab,
        currentSection,
        nameError,
        setBackgroundColor,
        setSectionBackgroundColor,
        setTitleColor,
        setCardTitleColor,
        setCardBackgroundColor,
        setDescriptionColor,
        setButtonBackgroundColor,
        setButtonLabelColor,
        setCurrentView,
        setSelectedTab,
        setCurrentSubItemTab,
        setCurrentSection,
        setNameError,
        resetAllHandler,
        handleTabChange,
    }), [
        backgroundColor, sectionBackgroundColor, titleColor, cardTitleColor, cardBackgroundColor,
        descriptionColor, buttonBackgroundColor, buttonLabelColor, currentView, selectedTab,
        currentSubItemTab, currentSection, nameError, resetAllHandler, handleTabChange,
    ]);

    return (
        <TemplateContext.Provider value={value}>
            {children}
        </TemplateContext.Provider>
    );
}

export const useTemplate = () => {
    const context = useContext(TemplateContext);
    if (context === null) {
        throw new Error('useTemplate must be used within a TemplateProvider');
    }
    return context;
};
