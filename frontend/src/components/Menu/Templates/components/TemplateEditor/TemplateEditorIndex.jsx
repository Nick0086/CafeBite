import { useEffect, useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Sidebar as SidebarComponent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { DEFAULT_SECTION_THEME, templateDefaultValue, templateQueryKeys } from '../../constants/template.constants';
import SideBarHeader from './SidebarHeader';
import TemplateSideBarTabs from './TemplateSideBarTabs';
import TemplateMenuViewerLayout from './TemplateMenuViewerLayout';
import { useTemplate } from '@/contexts/TemplateContext';
import { useNavigate, useParams } from 'react-router';
import { Card } from '@/components/ui/card';
import { getAllCategory } from '@/service/categories.service';
import { getAllMenuItems } from '@/service/menuItems.service';
import { createTemplate, getTemplateById, updateTemplate } from '@/service/templates.service';
import PilsatingDotesLoader from '@/components/ui/loaders/PilsatingDotesLoader';
import { PenIcon } from 'lucide-react';
import { visibleHandler } from '@/components/CustomerMenu/components/menuStyles';

export default function TemplateEditorIndex() {

  const queryClient = useQueryClient();
  const { templateId } = useParams();
  const navigation = useNavigate();
  const {
    handleTabChange,
    currentSection,
    setCurrentSection,
    setNameError,
    setBackgroundColor,
    setSectionBackgroundColor,
    setTitleColor,
    setCardTitleColor,
    setCardBackgroundColor,
    setDescriptionColor,
    setButtonBackgroundColor,
    setButtonLabelColor,
    currentView,
    setCurrentView,
  } = useTemplate();
  const [templateConfig, setTemplateConfig] = useState(templateDefaultValue);
  const [templateName, setTemplateName] = useState('Default Template');
  const [currentCategoryItems, setCurrentCategoryItems] = useState(null);

  const { data: templateData, isLoading, error, isError } = useQuery({
    queryKey: [templateQueryKeys.LIST, templateId],
    queryFn: () => getTemplateById(templateId),
    enabled: !!templateId
  });

  useEffect(() => {
    if (templateData?.template) {
      const { name, config } = templateData.template;
      setTemplateName(name);
      setTemplateConfig(config);
      setBackgroundColor(config?.global?.background_color);
      setSectionBackgroundColor(config?.global?.section_background_color);
      setTitleColor(config?.global?.title_color);
      setCardTitleColor(config?.global?.card_title_color);
      setCardBackgroundColor(config?.global?.card_background_color);
      setDescriptionColor(config?.global?.description_color);
      setButtonBackgroundColor(config?.global?.button_background_color);
      setButtonLabelColor(config?.global?.button_label_color);
      setCurrentView(config?.view);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateData]);

  const shouldFetchDependentData = !templateId || !!templateData;

  const { data: categoryData, isLoading: isCategoryLoading, error: categoryError } = useQuery({
    queryKey: [templateQueryKeys.CATEGORY_LIST],
    queryFn: getAllCategory,
    enabled: shouldFetchDependentData,
  });

  const { data: menuItemData, isLoading: isMenuItemLoading, error: menuItemError } = useQuery({
    queryKey: [templateQueryKeys.ITEM_LIST],
    queryFn: getAllMenuItems,
    enabled: (shouldFetchDependentData && !!categoryData),
  });

  useEffect(() => {
    if (error) {
      toastError(`Error fetching Template Data: ${error?.err?.message || 'Unknown error'}`);
    }

    if (categoryError) {
      toastError(`Error fetching Category: ${categoryError?.err?.message || 'Unknown error'}`);
    }

    if (menuItemError) {
      toastError(`Error fetching Menu Item: ${menuItemError?.err?.message || 'Unknown error'}`);
    }
  }, [error, categoryError, menuItemError]);


  const menuItemsByCategory = useMemo(() => {
    if (!menuItemData?.menuItems) return {};

    const existingItemsByCategoryId = {};
    templateData?.template?.config?.categories?.forEach(category => {
      existingItemsByCategoryId[category.unique_id] = category.items || [];
    });

    const allMenuItemsByCategoryId = menuItemData?.menuItems.reduce((acc, item) => {
      const categoryId = item?.category_id || "Uncategorized";
      if (!acc[categoryId]) acc[categoryId] = [];
      if (item.status) {
        acc[categoryId].push({ ...item, visible: true });
      }
      return acc;
    }, {});

    return Object.entries(allMenuItemsByCategoryId).reduce((result, [categoryId, menuItems]) => {
      const allMenuItems = menuItems?.reduce((acc, element) => {
        acc[element.unique_id] = element;
        return acc;
      }, {});
      const existingItems = existingItemsByCategoryId?.[categoryId]?.filter(item => !!allMenuItems?.[item.unique_id])?.map(item => ({ ...allMenuItems[item.unique_id], visible: item?.visible })) || [];
      const existingItemIds = new Set(existingItems.map(item => item.unique_id));
      const newItems = menuItems.filter(item => !existingItemIds.has(item.unique_id));

      result[categoryId] = [...existingItems, ...newItems];
      return result;
    }, {});
  }, [menuItemData, templateData]);

  const processedCategories = useMemo(() => {
    if (!categoryData?.categories) return [];

    const allCategories = categoryData?.categories.filter(category => category.status);
    const existingCategoriesVisible = allCategories?.reduce((acc, element) => {
      acc[element.unique_id] = element;
      return acc;
    }, {});

    const existingCategories = templateData?.template?.config?.categories?.filter(category => !!existingCategoriesVisible?.[category.unique_id]).map(category => ({ ...existingCategoriesVisible[category.unique_id], visible: category?.visible, style: category?.style || {} })) || [];
    const existingCategoryIds = new Set(existingCategories.map(category => category.unique_id));

    const newCategories = allCategories.filter(category => !existingCategoryIds.has(category.unique_id));

    const combinedCategories = [...existingCategories, ...newCategories];

    return combinedCategories.map(category => ({
      unique_id: category.unique_id,
      name: category.name,
      status: category.status,
      visible: visibleHandler(category?.visible),
      style: category.style || DEFAULT_SECTION_THEME,
      items: menuItemsByCategory[category.unique_id] || []
    }));
  }, [categoryData, menuItemsByCategory, templateData]);

  useEffect(() => {
    if (processedCategories.length > 0) {
      setCurrentCategoryItems(currentCategoryItems || processedCategories[0]?.unique_id || null)
      setCurrentSection(currentSection || processedCategories[0]?.unique_id || null)
      setTemplateConfig((prev) => ({
        ...prev,
        categories: processedCategories
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedCategories]);

  const createTemplateMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: (res) => {
      queryClient.invalidateQueries([templateQueryKeys.LIST]);
      toastSuccess(res?.message || `Template ${templateName} added successfully`);
      navigation(-1)
    },
    onError: (error) => {
      toastError(`Error adding Template: ${error?.err?.error}`);
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: updateTemplate,
    onSuccess: (res) => {
      queryClient.invalidateQueries([templateQueryKeys.LIST]);
      toastSuccess(res?.message || `Template ${templateName} updated successfully`);
    },
    onError: (error) => {
      toastError(`Error updating Template: ${error?.err?.error}`);
    }
  });

  const handleFormSubmit = () => {

    if (!templateName) {
      setNameError('Please select a template name')
      return;
    }

    const optimzeTemplateConfig = []
    templateConfig.categories.forEach(category => {
      const items = [];
      category?.items?.forEach(item => {
        items.push({ position: item?.position, visible: item?.visible, status: item?.status, unique_id: item?.unique_id, category_id: item?.category_id })
      });
      optimzeTemplateConfig.push({ ...category, items: items })
    });


    const obj = { name: templateName, config: { ...templateConfig, view : currentView, categories: optimzeTemplateConfig } }
    if (templateId) {
      updateTemplateMutation.mutate({ templateId: templateId, templateData: obj });
    } else {
      createTemplateMutation.mutate(obj);
    }
  };

  if (isCategoryLoading || isMenuItemLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PilsatingDotesLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="flex justify-center items-center h-screen">
        <p>Something Went Wrong</p>
      </Card>
    );
  }

  return (
    <SidebarProvider CUSTOM_SIDEBAR_WIDTH='20rem' className='w-full bg-gray-50/50' >

      <SidebarInset className={cn('h-full w-full min-w-0')} >
        <header className="flex justify-between flex-wrap min-h-11  sticky top-0 items-center gap-4 border-b bg-background px-6 z-10">
          <h1 className="text-xl font-semibold">{templateName}</h1>
          <SidebarTrigger onClick={() => handleTabChange('Global')} MyIcon={<PenIcon size={18} />} className="-ml-1 border border-foreground md:hidden " />
        </header>
        <TemplateMenuViewerLayout templateConfig={templateConfig} setCurrenctCategoryItems={setCurrentCategoryItems} />
      </SidebarInset>

      <SidebarComponent className='overflow-auto' side='right' >

        <SideBarHeader templateName={templateName} setTemplateName={setTemplateName} handleFormSubmit={handleFormSubmit} isSubmitting={createTemplateMutation?.isPending || updateTemplateMutation?.isPending} />

        <TemplateSideBarTabs
          categoryData={categoryData}
          isCategoryLoading={isCategoryLoading}
          isMenuItemLoading={isMenuItemLoading}
          templateConfig={templateConfig}
          setTemplateConfig={setTemplateConfig}
          currenctCategoryItems={currentCategoryItems}
          setCurrenctCategoryItems={setCurrentCategoryItems}
        />

      </SidebarComponent>
    </SidebarProvider>
  )
}
