import { FacetedFilter } from "@/components/ui/FacetedFilter";
import { X } from "lucide-react";
import { getFoodOptions, getStatusOptions, getStockOptions } from "../utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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


    return (
        <div className="pb-2">
            <div className="flex flex-wrap gap-2 justify-start border-b pb-2 px-2">
                <Input
                    placeholder={`Filter By Menu...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 w-full sm:w-[150px] lg:w-[320px]"
                />
                <FacetedFilter title="Status" options={getStatusOptions()} onFilterChange={setSelectedStatuses} value={selectedStatuses} />

                <FacetedFilter title="Food Type" options={getFoodOptions()} onFilterChange={setSelectFoodType} value={selectFoodType} />

                <FacetedFilter title="Category" options={categoryOptions} onFilterChange={setSelectedCategories} value={selectedCategories} />

                <FacetedFilter title="Availability" options={getStockOptions()} onFilterChange={setMenuAvailability} value={menuAvailability} />

                {(searchQuery || selectedCategories.length || menuAvailability.length || selectedStatuses.length || selectFoodType?.length) ? (
                    <Button variant="ghost" onClick={resetFilters} className="text-red-500 h-8 px-1 lg:px-2 hover:bg-red-100 hover:text-red-700">
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
