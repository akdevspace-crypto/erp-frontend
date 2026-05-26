import { Activity, AlertCircle, BarChart3, ClipboardCheck, IndianRupee, LineChart as LineIcon, RefreshCw, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '../components/PageHeader'
import { SkeletonLoader } from '../components/SkeletonLoader'
import { useOrganizationDashboard } from '../hooks/useOrganizationDashboard'
import type { OrganizationDashboardData, OrganizationKPI } from '../services/organizationDashboardService'

const orgFallbacks = {
    uncf: { code: 'UNCF', title: 'UNCF Dashboard', subtitle: 'Foundation-wide administration, finance, HR, security, CMS, and profile monitoring.' },
    uec: { code: 'UEC', title: 'UEC Dashboard', subtitle: 'Elder care overview and operations monitoring.' },
    uhc: { code: 'UHC', title: 'UHC Dashboard', subtitle: 'Healthcare overview and patient monitoring.' },
    ua: { code: 'UA', title: 'UA Dashboard', subtitle: 'Ambulance operations and service monitoring.' },
    ueo: { code: 'UEO', title: 'UEO Dashboard', subtitle: 'Enquiry office and customer relations monitoring.' }
}

const fallbackDashboards: Record<string, OrganizationDashboardData> = {
    UNCF: {
        ...orgFallbacks.uncf,
        accent: '#00A89D',
        kpis: [
            { label: 'Active Enquiries', value: 0, tone: 'teal' },
            { label: 'Critical Patients', value: 0, tone: 'rose' },
            { label: 'Low Stock Alerts', value: 0, tone: 'amber' },
            { label: 'Pending Payments', value: 0, tone: 'green' },
            { label: 'Total Income', value: 0, format: 'currency', tone: 'teal' },
            { label: 'Schedule Tasks', value: 0, tone: 'blue' },
            { label: 'Complaints', value: 0, tone: 'violet' },
            { label: 'Recent Activities', value: 0, tone: 'orange' }
        ],
        trend: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map((name) => ({ name, enquiries: 0, income: 0, tasks: 0 })),
        taskStatus: [{ name: 'No Tasks', value: 1 }],
        activities: []
    },
    UEC: {
        ...orgFallbacks.uec,
        accent: '#00B3A4',
        kpis: [
            { label: 'Active Residents', value: 0, tone: 'teal' },
            { label: 'In-House Care', value: 0, tone: 'blue' },
            { label: 'Daily Tasks', value: 0, tone: 'green' },
            { label: 'Pending Tasks', value: 0, tone: 'amber' },
            { label: 'Revenue', value: 0, format: 'currency', tone: 'teal' },
            { label: 'Laundry Open', value: 0, tone: 'violet' },
            { label: 'Maintenance Open', value: 0, tone: 'rose' },
            { label: 'Low Stock', value: 0, tone: 'amber' }
        ],
        trend: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map((name) => ({ name, residents: 0, tasks: 0, revenue: 0 })),
        taskStatus: [{ name: 'No Tasks', value: 1 }],
        activities: []
    },
    UHC: {
        ...orgFallbacks.uhc,
        accent: '#0B5D6B',
        kpis: [
            { label: 'Patients', value: 0, tone: 'blue' },
            { label: 'Active Admissions', value: 0, tone: 'green' },
            { label: 'Critical Vitals', value: 0, tone: 'rose' },
            { label: 'Medical Assignments', value: 0, tone: 'teal' },
            { label: 'Medications', value: 0, tone: 'violet' },
            { label: 'Nutrition Plans', value: 0, tone: 'amber' },
            { label: 'Clinical Care', value: 0, tone: 'blue' },
            { label: 'Pending Approvals', value: 0, tone: 'amber' }
        ],
        trend: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map((name) => ({ name, patients: 0, vitals: 0, assignments: 0 })),
        taskStatus: [{ name: 'No Tasks', value: 1 }],
        activities: []
    },
    UA: {
        ...orgFallbacks.ua,
        accent: '#F97316',
        kpis: [
            { label: 'Bookings', value: 0, tone: 'orange' },
            { label: 'Dispatch Active', value: 0, tone: 'blue' },
            { label: 'Field Duty', value: 0, tone: 'teal' },
            { label: 'Emergency Calls', value: 0, tone: 'rose' },
            { label: 'Missed Calls', value: 0, tone: 'amber' },
            { label: 'Billing', value: 0, format: 'currency', tone: 'green' },
            { label: 'Maintenance', value: 0, tone: 'violet' },
            { label: 'Active Staff', value: 0, tone: 'blue' }
        ],
        trend: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map((name) => ({ name, calls: 0, bookings: 0, billing: 0 })),
        taskStatus: [{ name: 'No Tasks', value: 1 }],
        activities: []
    },
    UEO: {
        ...orgFallbacks.ueo,
        accent: '#14B8A6',
        kpis: [
            { label: 'Active Enquiries', value: 0, tone: 'teal' },
            { label: 'New Leads', value: 0, tone: 'blue' },
            { label: 'Follow-ups', value: 0, tone: 'amber' },
            { label: 'Admissions', value: 0, tone: 'green' },
            { label: 'Complaints', value: 0, tone: 'rose' },
            { label: 'Feedbacks', value: 0, tone: 'violet' },
            { label: 'Conversations', value: 0, tone: 'blue' },
            { label: 'Missed Calls', value: 0, tone: 'amber' }
        ],
        trend: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map((name) => ({ name, enquiries: 0, followups: 0, complaints: 0 })),
        taskStatus: [{ name: 'No Tasks', value: 1 }],
        activities: []
    }
}

const mergeDashboardData = (fallback: OrganizationDashboardData, data?: OrganizationDashboardData) => ({
    ...fallback,
    ...data,
    kpis: data?.kpis?.length ? data.kpis : fallback.kpis,
    trend: data?.trend?.length ? data.trend : fallback.trend,
    taskStatus: data?.taskStatus?.length ? data.taskStatus : fallback.taskStatus,
    activities: data?.activities || fallback.activities
})

const toneStyles: Record<string, { bg: string; text: string; icon: string }> = {
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', icon: 'bg-teal-500' },
    blue: { bg: 'bg-sky-50', text: 'text-sky-700', icon: 'bg-sky-500' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'bg-amber-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', icon: 'bg-rose-500' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', icon: 'bg-violet-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'bg-orange-500' }
}

const chartColors = ['#00B3A4', '#0B5D6B', '#94D2A5', '#F59E0B', '#6366F1', '#F43F5E']

const formatValue = (kpi: OrganizationKPI) => {
    if (kpi.format === 'currency') {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(kpi.value || 0)
    }

    return new Intl.NumberFormat('en-IN').format(kpi.value || 0)
}

const getTrendKeys = (trend: Array<Record<string, string | number>>) => {
    const first = trend[0] || {}
    return Object.keys(first).filter((key) => key !== 'name').slice(0, 3)
}

function KpiCard({ kpi, index }: { kpi: OrganizationKPI; index: number }) {
    const Icon = kpi.format === 'currency' ? IndianRupee : index % 3 === 0 ? Activity : index % 3 === 1 ? ClipboardCheck : TrendingUp
    const tone = toneStyles[kpi.tone] || toneStyles.teal

    return (
        <div className="min-h-[116px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
            <div className="flex items-start justify-between gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone.bg}`}>
                    <Icon className={`h-5 w-5 ${tone.text}`} />
                </div>
                <span className={`h-2.5 w-2.5 rounded-full ${tone.icon}`} />
            </div>
            <p className="mt-4 text-2xl font-black leading-none text-gray-950 dark:text-gray-100">{formatValue(kpi)}</p>
            <p className="mt-2 text-sm font-bold text-gray-500 dark:text-gray-400">{kpi.label}</p>
        </div>
    )
}

export function OrganizationDashboard() {
    const params = useParams()
    const routeOrg = (params.org || 'uncf').toLowerCase() as keyof typeof orgFallbacks
    const fallback = orgFallbacks[routeOrg] || orgFallbacks.uncf
    const { data, isLoading, isError, refetch, isFetching } = useOrganizationDashboard(fallback.code)
    const dashboard = mergeDashboardData(fallbackDashboards[fallback.code], data)

    const trendKeys = useMemo(() => getTrendKeys(dashboard.trend), [dashboard.trend])
    const primaryKey = trendKeys[0]

    if (isLoading) return <SkeletonLoader />

    return (
        <div className="w-full min-w-0 space-y-4 px-2 pb-6 sm:px-4 2xl:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <PageHeader
                    title={dashboard.title}
                    subtitle={dashboard.subtitle}
                    breadcrumbs={[{ label: dashboard.code }, { label: 'Dashboard' }]}
                />
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 shadow-sm transition hover:border-primary-300 hover:text-primary-600 sm:w-auto dark:border-white/10 dark:bg-black dark:text-gray-100"
                >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {isError && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    <AlertCircle className="h-4 w-4" />
                    Live organization analytics could not be loaded. Showing an empty dashboard shell.
                </div>
            )}

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
                {dashboard.kpis.map((kpi, index) => <KpiCard key={kpi.label} kpi={kpi} index={index} />)}
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
                <div className="min-h-[360px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-black text-gray-950 dark:text-gray-100">Six Month Trend</h2>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Volume and performance by month</p>
                        </div>
                        <LineIcon className="h-5 w-5 text-primary-500" />
                    </div>
                    <div className="h-[290px] w-full min-w-[1px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <AreaChart data={dashboard.trend} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                                <defs>
                                    {trendKeys.map((key, index) => (
                                        <linearGradient key={key} id={`${dashboard.code}-${key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={chartColors[index]} stopOpacity={0.28} />
                                            <stop offset="95%" stopColor={chartColors[index]} stopOpacity={0.02} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip />
                                <Legend />
                                {trendKeys.map((key, index) => (
                                    <Area
                                        key={key}
                                        type="monotone"
                                        dataKey={key}
                                        stroke={chartColors[index]}
                                        fill={`url(#${dashboard.code}-${key})`}
                                        strokeWidth={3}
                                        dot={{ r: 3 }}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="min-h-[360px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black text-gray-950 dark:text-gray-100">Task Status</h2>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current workload split</p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-primary-500" />
                    </div>
                    <div className="h-[290px] w-full min-w-[1px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <PieChart>
                                <Pie data={dashboard.taskStatus} dataKey="value" nameKey="name" innerRadius="52%" outerRadius="78%" paddingAngle={3}>
                                    {dashboard.taskStatus.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(360px,0.42fr)_minmax(0,0.58fr)]">
                <div className="min-h-[300px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                    <h2 className="text-lg font-black text-gray-950 dark:text-gray-100">Primary Monitor</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fast comparison for the leading metric</p>
                    <div className="mt-4 h-[230px] w-full min-w-[1px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <BarChart data={dashboard.trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip />
                                {primaryKey && <Bar dataKey={primaryKey} radius={[8, 8, 0, 0]} fill={dashboard.accent} barSize={36} />}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="min-h-[300px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                    <h2 className="text-lg font-black text-gray-950 dark:text-gray-100">Recent Activity</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Latest workflow updates from the database</p>
                    <div className="mt-4 space-y-3">
                        {dashboard.activities.length > 0 ? dashboard.activities.map((activity) => (
                            <div key={activity.id} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: dashboard.accent }} />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-gray-900 dark:text-gray-100">{activity.title}</p>
                                    <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm font-bold text-gray-400 dark:border-white/10">
                                No recent activity found
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
