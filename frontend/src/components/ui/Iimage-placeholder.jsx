import { cn } from "@/lib/utils"

export const ImagePlaceholder = ({currentView}) => (
    <div className={cn(" bg-gray-200 rounded-lg flex items-center justify-center",currentView ? "w-[124px] h-[100px]" : "w-full h-64")}>
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
        </svg>
    </div>
);