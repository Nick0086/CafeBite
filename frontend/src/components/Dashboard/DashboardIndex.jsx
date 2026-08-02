import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, ChevronRight, ClipboardList, ExternalLink, LayoutGrid, MessageSquare, QrCode, Sparkles, Store, Utensils } from 'lucide-react';
import { Link } from 'react-router';

import SmartMenuLogo from '@/assets/SVG/smart-menu-logo.svg?react';
import { PermissionsContext } from '@/contexts/PermissionsContext';
import { useContext } from 'react';

const setupSteps = [
    {
        number: '01',
        title: 'Build your menu',
        description: 'Add categories, dishes, prices, photos, and descriptions in a few clicks.',
        href: '/menu-management',
        label: 'Open menu manager',
        icon: Utensils,
    },
    {
        number: '02',
        title: 'Create table QR codes',
        description: 'Give every table its own QR code so guests reach the right menu instantly.',
        href: '/qr-management',
        label: 'Create QR codes',
        icon: QrCode,
    },
    {
        number: '03',
        title: 'Share your digital menu',
        description: 'Put your QR codes on tables, counters, receipts, and social media.',
        href: '/qr-management',
        label: 'View sharing tools',
        icon: ExternalLink,
    },
    {
        number: '04',
        title: 'Listen and improve',
        description: 'Read customer feedback and use it to make every visit better.',
        href: '/ticket-management',
        label: 'View feedback',
        icon: MessageSquare,
    },
];

const features = [
    {
        title: 'Menu management',
        description: 'Keep your complete menu fresh without reprinting anything.',
        icon: ClipboardList,
        href: '/menu-management',
        accent: 'bg-amber-50 text-amber-700',
    },
    {
        title: 'Smart QR access',
        description: 'One scan takes guests to a fast, phone-friendly menu.',
        icon: QrCode,
        href: '/qr-management',
        accent: 'bg-indigo-50 text-indigo-700',
    },
    {
        title: 'Customer connection',
        description: 'Turn guest feedback into repeat visits and stronger service.',
        icon: MessageSquare,
        href: '/ticket-management',
        accent: 'bg-emerald-50 text-emerald-700',
    },
];

const fadeUp = (reduceMotion, delay = 0) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : delay },
});

export default function DashboardIndex() {
    const reduceMotion = useReducedMotion();
    const { permissions } = useContext(PermissionsContext);
    const firstName = permissions?.first_name || 'there';

    return (
        <div className="min-h-full text-slate-950">
            <div className="mx-auto max-w-[1380px] p-2 md:p-0">
                <motion.section
                    {...fadeUp(reduceMotion)}
                    className="relative overflow-hidden rounded-[26px] bg-[#17143a] px-5 py-7 text-white shadow-[0_20px_60px_-28px_rgba(23,20,58,0.65)] sm:px-8 sm:py-9 lg:px-12 lg:py-11"
                >
                    <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
                    <div className="relative max-w-3xl">
                        <div className="mb-7 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg shadow-black/10">
                                <SmartMenuLogo className="h-7 w-7" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-200">SmartMenu guide</p>
                                <p className="text-sm text-white/60">Your venue, beautifully organised</p>
                            </div>
                        </div>
                        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-300">
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            Welcome back, {firstName}
                        </p>
                        <h1 className="max-w-2xl text-3xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-5xl">
                            Everything your restaurant needs to serve better.
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-6 text-indigo-100/75 sm:text-base">
                            SmartMenu helps you create a polished digital menu, connect every table with a scan, and turn customer feedback into action.
                        </p>
                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <Link
                                to="/menu-management"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 text-sm font-bold text-[#17143a] transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#17143a]"
                            >
                                Start with your menu <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <Link
                                to="/profile-management"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                Complete your profile
                            </Link>
                        </div>
                    </div>
                    <div className="relative mt-9 hidden w-72 shrink-0 self-end lg:absolute lg:bottom-9 lg:right-12 lg:block">
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                            <div className="mb-4 flex items-center justify-between text-xs text-white/60">
                                <span>Today&apos;s focus</span>
                                <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-emerald-300">On track</span>
                            </div>
                            <div className="mb-3 flex items-end justify-between">
                                <span className="text-3xl font-bold">1 of 4</span>
                                <span className="text-xs text-white/50">steps complete</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full w-1/4 rounded-full bg-amber-300" />
                            </div>
                            <p className="mt-3 text-xs leading-5 text-white/60">Set up your menu first. Your customers will see the difference immediately.</p>
                        </div>
                    </div>
                </motion.section>

                <motion.section {...fadeUp(reduceMotion, 0.08)} className="mt-9">
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Your launch plan</p>
                            <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Get SmartMenu ready</h2>
                        </div>
                        <span className="hidden text-sm text-slate-500 sm:block">A simple path from setup to service</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {setupSteps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={step.number}
                                    {...fadeUp(reduceMotion, 0.12 + index * 0.06)}
                                    className="group relative flex min-h-[230px] flex-col rounded-2xl border border-slate-200/80 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50"
                                >
                                    <div className="mb-7 flex items-center justify-between">
                                        <span className="text-xs font-bold tracking-[0.18em] text-slate-400">{step.number}</span>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                                            <Icon className="h-5 w-5" aria-hidden="true" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold tracking-[-0.02em]">{step.title}</h3>
                                    <p className="mt-2 text-sm leading-5 text-slate-500">{step.description}</p>
                                    <Link to={step.href} className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-bold text-indigo-600 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                                        {step.label} <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.section>

                <motion.section {...fadeUp(reduceMotion, 0.18)} className="mt-9 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Why SmartMenu</p>
                                <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em]">Built for busy restaurant &amp; food teams</h2>
                            </div>
                            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 sm:flex">
                                <Store className="h-5 w-5" aria-hidden="true" />
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {features.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <Link key={feature.title} to={feature.href} className="group rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                                        <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${feature.accent}`}>
                                            <Icon className="h-5 w-5" aria-hidden="true" />
                                        </div>
                                        <h3 className="text-sm font-bold">{feature.title}</h3>
                                        <p className="mt-2 text-xs leading-5 text-slate-500">{feature.description}</p>
                                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-600">Explore <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden="true" /></span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-[#f1edff] p-5 sm:p-7">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                            <LayoutGrid className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <h2 className="mt-5 text-2xl font-bold tracking-[-0.03em]">A smoother service starts here.</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600">Less paper. Fewer menu updates. More time for the details that make guests come back.</p>
                        <ul className="mt-5 space-y-3">
                            {['Update prices without reprinting', 'Give guests a faster menu experience', 'Keep your brand consistent everywhere'].map((item) => (
                                <li key={item} className="flex items-start gap-2 text-sm font-medium text-slate-700">
                                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white"><Check className="h-3 w-3" aria-hidden="true" /></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
