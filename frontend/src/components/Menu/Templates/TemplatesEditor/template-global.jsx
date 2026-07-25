import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTemplate } from '@/contexts/TemplateContext';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DEFAULT_THEME, templateDefaultValue } from '../utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ColorPicker = ({ label, currentColor, onColorChange, colorKey, updateTemplateConfig }) => {
  const defaultColors = templateDefaultValue.global;

  const handleChange = (value) => {
    onColorChange(value);
    updateTemplateConfig((prevConfig) => ({
      ...prevConfig,
      global: {
        ...prevConfig.global,
        [colorKey]: value,
      },
    }));
  };

  return (
    <div>
      <Label className="text-xs font-medium block mb-1.5">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-8 h-8 rounded-md border border-gray-300 overflow-hidden" style={{ backgroundColor: currentColor }}>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => handleChange(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>
        </div>
        <Input value={currentColor} onChange={(e) => handleChange(e.target.value)} className="font-mono text-sm" />
        <ResetButton onClick={() => handleChange(defaultColors[colorKey])} tooltipText="Reset"  />
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

const TemplateGlobal = ({ setTemplateConfig }) => {
  const {
    backgroundColor,
    setBackgroundColor,
    sectionBackgroundColor,
    setSectionBackgroundColor,
    titleColor,
    setTitleColor,
    descriptionColor,
    setDescriptionColor,
    cardTitleColor,
    setCardTitleColor,
    cardBackgroundColor,
    setCardBackgroundColor,
    buttonBackgroundColor,
    setButtonBackgroundColor,
    buttonLabelColor,
    setButtonLabelColor,
    resetAllHandler,
    currentView,
    setCurrentView
  } = useTemplate();

  const colorConfigs = [
    { label: 'Background Color', currentColor: backgroundColor, onColorChange: setBackgroundColor, colorKey: 'background_color' },
    { label: 'Section Background Color', currentColor: sectionBackgroundColor, onColorChange: setSectionBackgroundColor, colorKey: 'section_background_color' },
    { label: 'Card Background Color', currentColor: cardBackgroundColor, onColorChange: setCardBackgroundColor, colorKey: 'card_background_color' },
    { label: 'Title Color', currentColor: titleColor, onColorChange: setTitleColor, colorKey: 'title_color' },
    { label: 'Card Title Color', currentColor: cardTitleColor, onColorChange: setCardTitleColor, colorKey: 'card_title_color' },
    { label: 'Description Color', currentColor: descriptionColor, onColorChange: setDescriptionColor, colorKey: 'description_color' },
  ];

  const buttonColorConfigs = [
    { label: 'Label Color', currentColor: buttonLabelColor, onColorChange: setButtonLabelColor, colorKey: 'button_label_color' },
    { label: 'Background Color', currentColor: buttonBackgroundColor, onColorChange: setButtonBackgroundColor, colorKey: 'button_background_color' },
  ];

  const handleResetAll = () => {
    resetAllHandler();
    setTemplateConfig((prevConfig) => ({
      ...prevConfig,
      global: templateDefaultValue['global'],
    }));
  };

  return (
    <div className="space-y-3">
      <div className='flex items-center gap-1 mt-3' >
        <h5 className="text font-medium px-4 pr-1">View</h5>
        <div className=" flex-1 space-y-4">
          <Tabs value={currentView} onValueChange={setCurrentView} defaultValue={templateDefaultValue['view']}>
            <TabsList className="bg-muted rounded-md p-1">
              <TabsTrigger value="list" className="p-1.5">
                <List size={20} />
              </TabsTrigger>
              <Separator orientation="vertical" className="h-6 bg-gray-300" />
              <TabsTrigger value="grid" className="p-1.5">
                <LayoutGrid size={20} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <Separator />
      <div>
        <div className="flex items-center justify-between">
          <h5 className="text-lg font-medium px-4 pb-2">Background & Colors</h5>
          <ResetButton onClick={handleResetAll} tooltipText="Reset All" />
        </div>
        <div className="space-y-4 px-4 pb-2">
          {colorConfigs.map(({ label, currentColor, onColorChange, colorKey }) => (
            <ColorPicker key={colorKey} label={label} currentColor={currentColor} onColorChange={onColorChange} colorKey={colorKey} updateTemplateConfig={setTemplateConfig} />
          ))}
        </div>
      </div>

      {/* <Separator />

      <div>
        <h5 className="text-lg font-medium px-4 pb-2">Button Colors</h5>
        <div className="space-y-4 px-4 pb-2">
          {buttonColorConfigs.map(({ label, currentColor, onColorChange, colorKey }) => (
            <ColorPicker key={colorKey} label={label} currentColor={currentColor} onColorChange={onColorChange} colorKey={colorKey} updateTemplateConfig={setTemplateConfig} />
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default TemplateGlobal;
