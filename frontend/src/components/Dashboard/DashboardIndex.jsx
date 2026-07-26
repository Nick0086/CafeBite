import { motion } from 'framer-motion';
import { DASHBOARD_METRICS } from './constants/dashboard.constants';
import MetricCard from './components/MetricCard';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.15, duration: 0.4, ease: 'easeOut' },
    }),
};

export default function DashboardIndex() {
    return (
        <div className="flex flex-col gap-4">
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                initial="hidden"
                animate="visible"
            >
                {DASHBOARD_METRICS.map((metric, index) => (
                    <motion.div key={metric.title} custom={index} variants={cardVariants}>
                        <MetricCard {...metric} icon={<metric.icon className="h-6 w-6" />} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
