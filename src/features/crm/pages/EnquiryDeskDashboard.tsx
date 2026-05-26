import { useMemo } from 'react'
import { Activity, ArrowRight, CalendarClock, ClipboardList, Headset, RefreshCw, TrendingUp, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '../../../components/PageHeader'
import { useWorkflowTimelines } from '../../workflow/services/workflowTimeline'
import { getRoleWorkflowActionItems } from '../../workflow/utils/actionQueue'
import { useAuthStore } from '../../../store/authStore'
import { useAdmissions, useEnquiries } from '../../enquiry/hooks/useEnquiry'
import type { Enquiry } from '../../enquiry/types'

const statusColors: Record<string, string> = {
    HOT: '#F43F5E',
    WARM: '#F59E0B',
    PENDING: '#14B8A6',
    ADMITTED: '#10B981',
    DOCUMENTS_PENDING: '#6366F1',
    PAYMENT_PENDING: '#0B5D6B'
}

const trendData = [
    { month: 'Jan', enquiries: 18, followUps: 12, admissions: 4 },
    { month: 'Feb', enquiries: 24, followUps: 16, admissions: 6 },
    { month: 'Mar', enquiries: 21, followUps: 18, admissions: 5 },
    { month: 'Apr', enquiries: 29, followUps: 20, admissions: 8 },
    { month: 'May', enquiries: 34, followUps: 25, admissions: 9 },
    { month: 'Jun', enquiries: 31, followUps: 22, admissions: 7 }
]

const quickLinks = [
    { label: 'Active Enquiries', href: '/crm/active-enquiries' },
    { label: 'New Enquiry', href: '/crm/new-enquiry' },
    { label: 'Follow-up Queue', href: '/crm/enquiry-follow-up' },
    { label: 'Admission Tracking', href: '/crm/admission-tracking' }
]

function MetricCard({ label, value, helper, icon: Icon }: { label: string; value: string | number; helper: string; icon: typeof Activity }) {
    return (
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                    <Icon className="h-5 w-5" />
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
            </div>
            <p className="mt-4 text-2xl font-black leading-none text-gray-950 dark:text-gray-100">{value}</p>
            <p className="mt-2 text-sm font-black text-gray-700 dark:text-gray-200">{label}</p>
            <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{helper}</p>
        </div>
    )
}

function WorkflowPulse() {
    const { data: timelines = [], isLoading } = useWorkflowTimelines('')

    const metrics = useMemo(() => {
        const converted = timelines.filter((item) => item.stages.some((stage) => stage.key === 'admission' && stage.complete)).length
        const closed = timelines.filter((item) => item.openItems.length === 0 || String(item.currentStep).toLowerCase().includes('closed')).length
        const pendingPayment = timelines.filter((item) => Number(item.summary.balanceAmount || 0) > 0).length

        return { converted, closed, pendingPayment }
    }, [timelines])

    return (
        <section className="rounded-lg border border-primary-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary-600">Operational Workflow</p>
                    <h2 className="mt-1 text-lg font-black text-gray-950 dark:text-gray-100">Enquiry conversion reflection</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Tracks enquiries after creation through admission, allocation, invoice, and payment.
                    </p>
                </div>
                <Link
                    to="/workflow/timeline"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary-600 px-4 text-xs font-black text-white shadow-sm transition hover:bg-primary-700"
                >
                    Open Timeline
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-lg bg-gray-50 px-3 py-3">
                    <p className="text-xl font-black text-gray-950">{isLoading ? '-' : timelines.length}</p>
                    <p className="text-xs font-bold text-gray-500">Tracked Enquiries</p>
                </div>
                <div className="rounded-lg bg-emerald-50 px-3 py-3">
                    <p className="text-xl font-black text-emerald-800">{isLoading ? '-' : metrics.converted}</p>
                    <p className="text-xs font-bold text-emerald-700">Admissions</p>
                </div>
                <div className="rounded-lg bg-amber-50 px-3 py-3">
                    <p className="text-xl font-black text-amber-800">{isLoading ? '-' : metrics.pendingPayment}</p>
                    <p className="text-xs font-bold text-amber-700">Payment Pending</p>
                </div>
                <div className="rounded-lg bg-primary-50 px-3 py-3">
                    <p className="text-xl font-black text-primary-800">{isLoading ? '-' : metrics.closed}</p>
                    <p className="text-xs font-bold text-primary-700">Closed</p>
                </div>
            </div>
        </section>
    )
}

function RoleActionQueue() {
    const user = useAuthStore((state) => state.user)
    const { data: timelines = [], isLoading } = useWorkflowTimelines('')
    const actions = useMemo(() => getRoleWorkflowActionItems(timelines, user), [timelines, user])

    return (
        <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary-600">My Action Queue</p>
                    <h2 className="mt-1 text-lg font-black text-gray-950 dark:text-gray-100">Enquiry desk actions</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Shows enquiry workflow items that need desk action.
                    </p>
                </div>
                <Link
                    to="/workflow/timeline"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-xs font-black text-gray-700 shadow-sm transition hover:border-primary-300 hover:text-primary-600 dark:border-white/10 dark:bg-black dark:text-gray-100"
                >
                    Review All
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
                {isLoading ? (
                    <div className="rounded-xl bg-gray-50 px-4 py-5 text-sm font-bold text-gray-500">
                        Loading enquiry actions...
                    </div>
                ) : actions.length === 0 ? (
                    <div className="rounded-xl bg-emerald-50 px-4 py-5 text-sm font-bold text-emerald-700">
                        No pending enquiry desk actions.
                    </div>
                ) : actions.map((action) => (
                    <Link
                        key={action.id}
                        to={action.href}
                        className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition hover:border-primary-200 hover:bg-primary-50"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-black text-gray-900">{action.title}</p>
                                <p className="mt-1 text-xs font-medium text-gray-600">{action.description}</p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${
                                action.severity === 'high'
                                    ? 'bg-red-100 text-red-700'
                                    : action.severity === 'medium'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-gray-200 text-gray-600'
                            }`}>
                                {action.severity}
                            </span>
                        </div>
                        <p className="mt-2 text-xs font-bold text-primary-700">
                            {action.workflowRef} - {action.clientName} - {action.owner}
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    )
}

const hasStage = (item: { stages: Array<{ key: string; complete: boolean }> }, key: string) =>
    item.stages.some((stage) => stage.key === key && stage.complete)

export function EnquiryDeskDashboard() {
    const { data: timelines = [], isLoading: isWorkflowLoading } = useWorkflowTimelines('')
    const { data: enquiries = [], isLoading: isEnquiriesLoading } = useEnquiries()
    const { data: admissions = [], isLoading: isAdmissionsLoading } = useAdmissions()
    const isLoading = isWorkflowLoading || isEnquiriesLoading || isAdmissionsLoading

    const enquiryRows = enquiries as Enquiry[]
    const liveActiveEnquiries = useMemo(() => (
        enquiryRows.filter((enquiry) => !enquiry.admissionId && enquiry.status !== 'Converted' && enquiry.status !== 'Lost')
    ), [enquiryRows])

    const dashboardActiveEnquiries: Enquiry[] = liveActiveEnquiries
    const dashboardAdmissions = admissions
    const conversionRate = dashboardActiveEnquiries.length
        ? Math.round((dashboardAdmissions.length / (dashboardActiveEnquiries.length + dashboardAdmissions.length)) * 100)
        : 0

    const workflowMetrics = useMemo(() => {
        const active = timelines.filter((item) => !hasStage(item, 'admission') && !hasStage(item, 'allocation')).length
        const admissionsInPipeline = timelines.filter((item) => hasStage(item, 'admission') && !hasStage(item, 'closure')).length
        const renewalConverted = timelines.filter((item) => item.renewal?.convertedEnquiryRefNo).length
        const needsAttention = timelines.filter((item) => item.openItems.length > 0).length
        const liveConversionRate = timelines.length ? Math.round((admissionsInPipeline / timelines.length) * 100) : conversionRate

        return {
            active: timelines.length ? active : dashboardActiveEnquiries.length,
            followUpsDue: timelines.length ? needsAttention : dashboardActiveEnquiries.length,
            admissionsInPipeline: timelines.length ? admissionsInPipeline : dashboardAdmissions.length,
            clientsTracked: timelines.length ? timelines.length : dashboardActiveEnquiries.length + dashboardAdmissions.length,
            renewalConverted,
            conversionRate: liveConversionRate
        }
    }, [conversionRate, dashboardActiveEnquiries.length, dashboardAdmissions.length, timelines])

    const prioritySplit = useMemo(() => {
        const getCount = (priority: string) => dashboardActiveEnquiries.filter((row) => String('automationPriority' in row ? row.automationPriority : row.status) === priority).length
        return [
            { name: 'Hot', value: getCount('HOT') },
            { name: 'Warm', value: getCount('WARM') },
            { name: 'Pending', value: dashboardActiveEnquiries.length - getCount('HOT') - getCount('WARM') }
        ].filter((item) => item.value > 0)
    }, [dashboardActiveEnquiries])

    const serviceSplit = useMemo(() => dashboardActiveEnquiries.reduce<Array<{ name: string; value: number }>>((items, row) => {
        const service = String(row.service || 'Standard')
        const existing = items.find((item) => item.name === service)
        if (existing) {
            existing.value += 1
            return items
        }
        return [...items, { name: service, value: 1 }]
    }, []), [dashboardActiveEnquiries])

    const urgentRows = useMemo(() => dashboardActiveEnquiries.slice(0, 8).map((row) => ({
        id: String(row.id || row.refNo),
        refNo: String(row.refNo),
        name: String(row.clientName || 'Unknown Client'),
        service: String(row.service || 'Standard'),
        owner: String(row.lastFollowedBy || 'Enquiry Desk'),
        due: String(row.lastFollowUp || 'Follow-up')
    })), [dashboardActiveEnquiries])

    const staffWorkload = useMemo(() => {
        const workload = liveActiveEnquiries.reduce<Record<string, number>>((items, row) => {
            const owner = row.lastFollowedBy || 'Enquiry Desk'
            items[owner] = (items[owner] || 0) + 1
            return items
        }, {})
        const rows = Object.entries(workload).map(([name, value]) => ({ name, value })).slice(0, 6)
        return rows
    }, [liveActiveEnquiries])

    return (
        <div className="w-full min-w-0 space-y-4 px-2 pb-6 sm:px-4 2xl:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <PageHeader
                    title="Enquiry Desk Dashboard"
                    subtitle="Lead intake, enquiry follow-up, client conversion, and admission movement."
                    breadcrumbs={[{ label: 'UEO' }, { label: 'Enquiry Desk' }, { label: 'Dashboard' }]}
                />
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.href}
                            to={link.href}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-xs font-black text-gray-700 shadow-sm transition hover:border-primary-300 hover:text-primary-600 dark:border-white/10 dark:bg-black dark:text-gray-100"
                        >
                            {link.label}
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    ))}
                </div>
            </div>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Active Enquiries"
                    value={isLoading ? '-' : workflowMetrics.active}
                    helper="Open leads before admission or allocation"
                    icon={Headset}
                />
                <MetricCard
                    label="Follow-ups Due"
                    value={isLoading ? '-' : workflowMetrics.followUpsDue}
                    helper="Workflow items needing enquiry desk attention"
                    icon={CalendarClock}
                />
                <MetricCard
                    label="Admissions In Pipeline"
                    value={isLoading ? '-' : workflowMetrics.admissionsInPipeline}
                    helper={`${workflowMetrics.conversionRate}% enquiry to admission movement`}
                    icon={ClipboardList}
                />
                <MetricCard
                    label="Clients Tracked"
                    value={isLoading ? '-' : workflowMetrics.clientsTracked}
                    helper={`${workflowMetrics.renewalConverted} renewal conversions captured`}
                    icon={Users}
                />
            </section>

            <section className="rounded-lg border border-amber-100 bg-amber-50/60 p-4 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-amber-700">Workflow Attention</p>
                        <h2 className="mt-1 text-lg font-black text-gray-950 dark:text-gray-100">What the enquiry desk should watch now</h2>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Live workflow counts are shown from enquiry, admission, and workflow records.
                        </p>
                    </div>
                    <Link
                        to="/workflow/timeline"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-amber-200 bg-white px-4 text-xs font-black text-amber-800 shadow-sm transition hover:border-amber-300 hover:bg-amber-100"
                    >
                        Inspect Exceptions
                        <RefreshCw className="h-3.5 w-3.5" />
                    </Link>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-amber-100 bg-white px-4 py-3">
                        <p className="text-2xl font-black text-amber-800">{isLoading ? '-' : workflowMetrics.active}</p>
                        <p className="text-xs font-black uppercase tracking-wide text-amber-700">New or open enquiry</p>
                    </div>
                    <div className="rounded-lg border border-amber-100 bg-white px-4 py-3">
                        <p className="text-2xl font-black text-amber-800">{isLoading ? '-' : workflowMetrics.followUpsDue}</p>
                        <p className="text-xs font-black uppercase tracking-wide text-amber-700">Follow-up / stuck item</p>
                    </div>
                    <div className="rounded-lg border border-amber-100 bg-white px-4 py-3">
                        <p className="text-2xl font-black text-amber-800">{isLoading ? '-' : workflowMetrics.renewalConverted}</p>
                        <p className="text-xs font-black uppercase tracking-wide text-amber-700">Renewal converted to enquiry</p>
                    </div>
                </div>
            </section>

            <WorkflowPulse />

            <RoleActionQueue />

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                <div className="min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-black text-gray-950 dark:text-gray-100">Enquiry Movement</h2>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly enquiry, follow-up, and admission trend</p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-primary-500" />
                    </div>
                    <div className="h-[260px] w-full min-w-[1px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <BarChart data={trendData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="enquiries" fill="#14B8A6" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="followUps" fill="#0B5D6B" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="admissions" fill="#94D2A5" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                    <h2 className="text-lg font-black text-gray-950 dark:text-gray-100">Priority Split</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current active enquiry urgency</p>
                    <div className="mt-4 h-[260px] w-full min-w-[1px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <PieChart>
                                <Pie data={prioritySplit} dataKey="value" nameKey="name" innerRadius="52%" outerRadius="76%" paddingAngle={4}>
                                    {prioritySplit.map((entry) => <Cell key={entry.name} fill={statusColors[entry.name.toUpperCase()] || '#14B8A6'} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
                <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                    <h2 className="text-lg font-black text-gray-950 dark:text-gray-100">Urgent Enquiries</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hot and overdue leads that need desk action</p>
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-[620px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-black uppercase tracking-wide text-gray-400 dark:border-white/10">
                                    <th className="py-3">Lead</th>
                                    <th className="py-3">Client</th>
                                    <th className="py-3">Service</th>
                                    <th className="py-3">Owner</th>
                                    <th className="py-3">Follow-up</th>
                                </tr>
                            </thead>
                            <tbody>
                                {urgentRows.map((row) => (
                                    <tr key={row.id} className="border-b border-gray-50 last:border-0 dark:border-white/5">
                                        <td className="py-3 font-black text-gray-900 dark:text-gray-100">{row.refNo}</td>
                                        <td className="py-3 font-semibold text-gray-700 dark:text-gray-200">{row.name}</td>
                                        <td className="py-3 text-gray-600 dark:text-gray-300">{row.service}</td>
                                        <td className="py-3 text-gray-600 dark:text-gray-300">{row.owner}</td>
                                        <td className="py-3">
                                            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700">{row.due}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                        <h2 className="text-lg font-black text-gray-950 dark:text-gray-100">Service Demand</h2>
                        <div className="mt-4 space-y-3">
                            {serviceSplit.map((item) => (
                                <div key={item.name}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="font-bold text-gray-700 dark:text-gray-200">{item.name}</span>
                                        <span className="font-black text-primary-600">{item.value}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100">
                                        <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.max(18, item.value * 25)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                        <h2 className="text-lg font-black text-gray-950 dark:text-gray-100">Staff Follow-up Load</h2>
                        <div className="mt-4 h-[190px] w-full min-w-[1px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                <BarChart data={staffWorkload} layout="vertical" margin={{ top: 0, right: 16, left: 6, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#0B5D6B" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
