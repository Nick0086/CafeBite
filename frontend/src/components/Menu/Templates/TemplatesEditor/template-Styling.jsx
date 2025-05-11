import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import SlackLoader from '@/components/ui/CustomLoaders/SlackLoader';
import { useTemplate } from '@/contexts/TemplateContext';
import { templateDefaultValue, DEFAULT_SECTION_THEME } from '../utils';
import { Separator } from '@/components/ui/separator';

const ColorPicker = ({ label, currentColor, onColorChange, colorKey, t }) => {
  const defaultColors = templateDefaultValue.global;

  const handleChange = (value) => onColorChange(colorKey, value);
  const handleInputChange = (e) => handleChange(e.target.value);
  const handleReset = () => handleChange(defaultColors[colorKey]);

  return (
    <div>
      <Label className="text-xs font-medium block mb-1.5">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <div
            className="w-8 h-8 rounded-md border border-gray-300 overflow-hidden"
            style={{ backgroundColor: currentColor }}
          >
            <input
              type="color"
              value={currentColor}
              onChange={handleInputChange}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>
        </div>
        <Input value={currentColor} onChange={handleInputChange} className="font-mono text-sm" />
        <ResetButton onClick={handleReset} tooltipText={t('reset')} />
      </div>
    </div>
  );
};

const ResetButton = ({ onClick, tooltipText }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <Button
          onClick={onClick}
          size="xs"
          type="button"
          variant="ghost"
          className="rounded-full text-green-500 hover:bg-green-100 hover:text-green-600"
        >
          <RotateCcw size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const TemplateStyling = ({ categoryData, templateConfig, isLoading, setTemplateConfig, t }) => {

  const { currentSection, setCurrentSection } = useTemplate();
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    setCurrentCategory(templateConfig?.categories?.find(category => category.unique_id === currentSection));
  }, [currentSection, templateConfig?.categories]);

  const updateStyleConfig = useCallback((key, value) => {
    setCurrentCategory(prev => ({
      ...prev,
      style: { ...prev?.style, [key]: value }
    }));

    setTemplateConfig(prevConfig => ({
      ...prevConfig,
      categories: prevConfig.categories.map(category =>
        category.unique_id === currentSection
          ? { ...category, style: { ...category.style, [key]: value } }
          : category
      )
    }));
  }, [currentSection, setTemplateConfig]);

  const resetAllStyles = () => {
    setCurrentCategory(prev => ({ ...prev, style: DEFAULT_SECTION_THEME }));

    setTemplateConfig(prevConfig => ({
      ...prevConfig,
      categories: prevConfig.categories.map(category =>
        category.unique_id === currentSection ? { ...category, style: DEFAULT_SECTION_THEME } : category
      )
    }));
  };

  const categoryOptions = useMemo(
    () => categoryData?.categories?.filter(category => category?.status).map(category => ({
      value: category.unique_id,
      label: category.name
    })) || [],
    [categoryData]);

  const colorSettings = [
    { label: t('section_background_color'), key: 'section_background_color' },
    { label: t('card_background_color'), key: 'card_background_color' },
    { label: t('title_color'), key: 'title_color' },
    { label: t('card_title_color'), key: 'card_title_color' },
    { label: t('description_color'), key: 'description_color' },
  ];

  const buttonColors = [
    { label: t('label_color'), key: 'button_label_color' },
    { label: t('background_color'), key: 'button_background_color' },
  ];

  if (isLoading) {
    return (
      <div className="p-4 h-96 flex items-center justify-center">
        <SlackLoader />
      </div>
    );
  }

  if (!templateConfig?.categories?.length) {
    return <div className="p-4">{t('no_items_available')}</div>;
  }

  return (
    <div className="space-y-1.5 pt-1">
      <h5 className="text-lg font-medium px-4 pb-2">{t("section_style")}</h5>

      {/* Category Selection */}
      <div className="flex flex-col gap-1 border-b border-gray-200 px-4 my-4 pb-4">
        <Label className="text-xs">{t('select_category')}</Label>
        <Select value={currentSection} onValueChange={setCurrentSection}>
          <SelectTrigger>
            <SelectValue placeholder={t('select_category')} />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Color Settings */}
      <div className="py-4 px-0 pt-2 space-y-2">
        <div className='' >
          <div className="flex items-center justify-between">
            <h5 className="text-lg font-medium px-4 pb-2">{t('background_&_colors')}</h5>
            <ResetButton onClick={resetAllStyles} tooltipText={t('reset_all')} />
          </div>

          <div className="space-y-4 px-4 pb-2">
            {colorSettings.map(({ label, key }) => (
              <ColorPicker
                key={key}
                label={label}
                currentColor={currentCategory?.style?.[key] || DEFAULT_SECTION_THEME?.[key]}
                onColorChange={updateStyleConfig}
                colorKey={key}
                t={t}
              />
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between">
            <h5 className="text-lg font-medium px-4 pb-2">{t('button_colors')}</h5>
          </div>

          <div className="space-y-4 px-4 pb-2">
            {buttonColors.map(({ label, key }) => (
              <ColorPicker
                key={key}
                label={label}
                currentColor={currentCategory?.style?.[key] || DEFAULT_SECTION_THEME?.[key]}
                onColorChange={updateStyleConfig}
                colorKey={key}
                t={t}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateStyling;
