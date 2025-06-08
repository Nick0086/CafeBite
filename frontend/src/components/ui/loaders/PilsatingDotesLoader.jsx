import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { cva } from "class-variance-authority";

const dotVariants = cva(
    "rounded-full mr-2.5 last:mr-0",
    {
        variants: {
            size: {
                sm: "h-3 w-3",
                md: "h-5 w-5",
                lg: "h-7 w-7"
            },
            color: {
                blue: "bg-blue-300",
                green: "bg-green-300",
                red: "bg-red-300",
                purple: "bg-purple-300"
            }
        },
        defaultVariants: {
            size: "md",
            color: "blue"
        }
    }
);

const PilsatingDotesLoader = ({
    className,
    dotClassName,
    size = "md",
    color = "blue",
    count = 5
}) => {
    const dots = Array.from({ length: count }, (_, i) => i);

    return (
        <div className={cn("flex items-center justify-center h-full w-full", className)}>
            {dots.map((i) => (
                <motion.div
                    key={i}
                    className={cn(dotVariants({ size, color }), dotClassName)}
                    animate={{
                        scale: [0.8, 1.2, 0.8],
                        backgroundColor: [
                            color === "blue" ? "#b3d4fc" : "",
                            color === "blue" ? "#6793fb" : "",
                            color === "blue" ? "#b3d4fc" : ""
                        ],
                        boxShadow: [
                            `0 0 0 0 rgba(178, 212, 252, 0.7)`,
                            `0 0 0 10px rgba(178, 212, 252, 0)`,
                            `0 0 0 0 rgba(178, 212, 252, 0.7)`
                        ]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1 - 0.3
                    }}
                />
            ))}
        </div>
    );
};

export default PilsatingDotesLoader;