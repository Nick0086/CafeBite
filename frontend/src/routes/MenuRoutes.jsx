import { Navigate, Route, Routes } from 'react-router';
import { TabsContent } from '@/components/ui/tabs';
import MenuIndex from '@/components/Menu/MenuIndex';
import CategoriesIndex from '@/components/Menu/Categories/CategoriesIndex';
import MenuItemsIndex from '@/components/Menu/MenuItems/MenuItemsIndex';
import TemplateIndex from '@/components/Menu/Templates/TemplateIndex';
import TemplateEditorIndex from '@/components/Menu/Templates/components/TemplateEditor/TemplateEditorIndex';
import { TemplateProvider } from '@/contexts/TemplateContext';

export default function MenuRoutes() {
    return (
        <Routes>
            <Route path="/" element={<MenuIndex />}>
                <Route index element={<Navigate to="template" replace />} />
                <Route
                    path="template"
                    element={
                        <TabsContent value="template">
                            <TemplateIndex />
                        </TabsContent>
                    }
                />
                <Route
                    path="template-editor/new"
                    element={
                        <TemplateProvider>
                            <TemplateEditorIndex />
                        </TemplateProvider>
                    }
                />
                <Route
                    path="template-editor/:templateId"
                    element={
                        <TemplateProvider>
                            <TemplateEditorIndex />
                        </TemplateProvider>
                    }
                />
                <Route
                    path="categories"
                    element={
                        <TabsContent value="categories">
                            <CategoriesIndex />
                        </TabsContent>
                    }
                />
                <Route
                    path="menu-items"
                    element={
                        <TabsContent value="menu-items">
                            <MenuItemsIndex />
                        </TabsContent>
                    }
                />
                <Route path="*" element={<Navigate to="/menu-management/template" replace />} />
            </Route>
        </Routes>
    );
}
