import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateGlobal from './TemplateGlobal';
import TemplateCategories from './TemplateCategories';
import TemplateItems from './TemplateItems';
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

    const {selectedTab, handleTabChange} = useTemplate()

    return (
        <div className="w-full mx-auto px-0">
            <Tabs value={selectedTab} className='border-none w-full' onValueChange={handleTabChange}>
                <TabsList className="flex overflow-auto w-full border-b border-gray-300">
                    <TabsTrigger value="Global" variant="team" className="text-xs flex-1 text-blue-500 border-blue-500 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-700 py-1.5 px-2">
                        Global
                    </TabsTrigger>
                    <TabsTrigger value="categories" variant="team" className="text-xs flex-1 text-red-500 border-red-500 data-[state=active]:bg-red-200 data-[state=active]:text-red-700 py-1.5 px-2">
                        Category
                    </TabsTrigger>
                    <TabsTrigger value="items" variant="team" className="text-xs flex-1 text-green-500 border-green-500 data-[state=active]:bg-green-200 data-[state=active]:text-green-700 py-1.5 px-2">
                        Items
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='Global' >
                    <TemplateGlobal templateConfig={templateConfig} setTemplateConfig={setTemplateConfig} />
                </TabsContent>

                <TabsContent value='categories' >
                    <TemplateCategories
                        isCategoryLoading={isCategoryLoading}
                        templateConfig={templateConfig}
                        setTemplateConfig={setTemplateConfig}
                        setCurrenctCategoryItems={setCurrenctCategoryItems}
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
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
