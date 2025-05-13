import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

const GoogleStyleLoader = ({ className }) => {
    // Google's brand colors for each dot
    const dotColors = [
        'bg-[#4285f4]', // Blue
        'bg-[#34a853]', // Green
        'bg-[#fbbc05]', // Yellow
        'bg-[#ea4335]', // Red
        'bg-[#4285f4]'  // Blue again
    ];

    // Animation delays for each dot
    const delays = [0, 0.1, 0.2, 0.3, 0.4];

    return (
        <div className={cn("flex justify-center items-center h-full", className)}>
            <div className="flex">
                {dotColors.map((color, index) => (
                    <motion.div
                        key={index}
                        className={cn(
                            "w-4 h-4 mr-1.5 last:mr-0 rounded-full",
                            color
                        )}
                        animate={{
                            scale: [0.5, 1, 0.5],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: delays[index]
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default GoogleStyleLoader;