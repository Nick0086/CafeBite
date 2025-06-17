import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateGlobal from './template-global';
import TemplateCategories from './template-categories';
import TemplateStyling from './template-Styling';
import TemplateItems from './template-items';
import { useTranslation } from 'react-i18next';
import { useTemplate } from '@/contexts/TemplateContext';

export default function TemplateSideBarTabs({
    categoryData,
    isCategoryLoading,
    templateConfig,
    setTemplateConfig,
    isMenuItemLoading,
    currenctCategoryItems,
    setCurrenctCategoryItems
}) {

    const { t } = useTranslation();
    const {selectedTab, handleTabChange} = useTemplate()


    return (
        <div className="w-full mx-auto px-0">
            <Tabs value={selectedTab} className='border-none w-full' onValueChange={handleTabChange}>
                <TabsList className="flex overflow-auto w-full border-b border-gray-300">
                    <TabsTrigger value="Global" variant="team" className="text-xs flex-1 text-blue-500 border-blue-500 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-700 py-1.5 px-2">
                        {t('global')}
                    </TabsTrigger>
                    <TabsTrigger value="categories" variant="team" className="text-xs flex-1 text-red-500 border-red-500 data-[state=active]:bg-red-200 data-[state=active]:text-red-700 py-1.5 px-2">
                        {t('category')}
                    </TabsTrigger>
                    <TabsTrigger value="items" variant="team" className="text-xs flex-1 text-green-500 border-green-500 data-[state=active]:bg-green-200 data-[state=active]:text-green-700 py-1.5 px-2">
                        {t('items')}
                    </TabsTrigger>
                    {/* <TabsTrigger value="Styling" variant="team" className="text-xs text-yellow-500 border-yellow-500 data-[state=active]:bg-yellow-200 data-[state=active]:text-yellow-700 py-1.5 px-2">
                        {t('styling')}
                    </TabsTrigger> */}
                </TabsList>

                <TabsContent value='Global' >
                    <TemplateGlobal templateConfig={templateConfig} setTemplateConfig={setTemplateConfig} t={t} />
                </TabsContent>

                <TabsContent value='categories' >
                    <TemplateCategories
                        isCategoryLoading={isCategoryLoading}
                        templateConfig={templateConfig}
                        setTemplateConfig={setTemplateConfig}
                        setCurrenctCategoryItems={setCurrenctCategoryItems}
                        t={t}
                    />
                </TabsContent>

                <TabsContent value='items' >
                    <TemplateItems
                        isLoading={isCategoryLoading || isMenuItemLoading}
                        categoryData={categoryData}
                        templateConfig={templateConfig}
                        setTemplateConfig={setTemplateConfig}
                        currentCategoryItems={currenctCategoryItems}
                        setCurrentCategoryItems={setCurrenctCategoryItems}
                        t={t}
                    />
                </TabsContent>

                {/* <TabsContent value='Styling' >
                    <TemplateStyling
                        isLoading={isCategoryLoading || isMenuItemLoading}
                        categoryData={categoryData}
                        templateConfig={templateConfig}
                        setTemplateConfig={setTemplateConfig}
                        t={t}
                    />
                </TabsContent> */}
            </Tabs>
        </div>
    )
}
