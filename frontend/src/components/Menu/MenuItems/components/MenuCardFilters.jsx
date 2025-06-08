import { FacetedFilter } from "@/components/ui/FacetedFilter";
import { X } from "lucide-react";
import { getFoodOptions, getStatusOptions, getStockOptions } from "../utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function MenuFilters({
    searchQuery,
    setSearchQuery,
    selectedStatuses,
    setSelectedStatuses,
    selectFoodType,
    setSelectFoodType,
    selectedCategories,
    setSelectedCategories,
    menuAvailability,
    setMenuAvailability,
    categoryOptions,
    resetFilters,
}) {

    const {t} = useTranslation();

    return (
        <div className="pb-2">
            <div className="flex flex-wrap gap-2 justify-start border-b pb-2 px-2">
                <Input
                    placeholder={`${t('filter_by')} ${t('menu')}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 w-full sm:w-[150px] lg:w-[320px]"
                />
                <FacetedFilter title={t('status')} options={getStatusOptions(t)} onFilterChange={setSelectedStatuses} value={selectedStatuses} />

                <FacetedFilter title={t('food_type')} options={getFoodOptions(t)} onFilterChange={setSelectFoodType} value={selectFoodType} />

                <FacetedFilter title={t('category')} options={categoryOptions} onFilterChange={setSelectedCategories} value={selectedCategories} />

                <FacetedFilter title={t('availability')} options={getStockOptions(t)} onFilterChange={setMenuAvailability} value={menuAvailability} />

                {(searchQuery || selectedCategories.length || menuAvailability.length || selectedStatuses.length || selectFoodType?.length) ? (
                    <Button variant="ghost" onClick={resetFilters} className="text-red-500 h-8 px-1 lg:px-2 hover:bg-red-100 hover:text-red-700">
                        {t('reset')}
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
