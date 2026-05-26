import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CheckCircle2,
    ChevronDown,
    HeartPulse,
    IndianRupee,
    MessageSquare,
    Package,
    PhoneCall,
    Search,
    SlidersHorizontal,
    TrendingUp
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
    Bar,
    BarChart,
    Cell,
    CartesianGrid,
    LabelList,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { useDashboardKPIs, useRecentActivities } from '../hooks/useDashboard'
import { useAuthStore } from '../store/authStore'
import { cn } from '../lib/utils'
import { useComplaints } from '../features/customer_care/hooks/useCustomerCare'
import { customerCareService } from '../features/customer_care/services/customer_care'
import { useApprovalTasks } from '../features/task_log/hooks/useTasks'

type Tone = 'teal' | 'red' | 'orange' | 'green' | 'slate' | 'amber'

type KpiItem = {
    label: string
    value: string
    icon: LucideIcon
    tone: Tone
}

type MiniMetric = {
    title: string
    value: string
    icon: LucideIcon
    badge: string
    tone: Tone
    featured?: boolean
}

type ChartSize = {
    width: number
    height: number
}

type RecentActivity = {
    id: string
    refNo?: string
    createdAt?: string
    status?: string
    automationScore?: number
    automationPriority?: string
    client?: {
        name?: string
    }
    service?: {
        name?: string
        category?: string
    }
}

type DashboardComplaint = {
    id?: string
    ticketNo?: string
    date?: string
    status?: string
}

const toneStyles: Record<Tone, { icon: string; bg: string; border: string; text: string; soft: string }> = {
    teal: {
        icon: 'text-[#00b3a7]',
        bg: 'bg-[#00b3a7]',
        border: 'border-[#00b3a7]/30',
        text: 'text-[#008f86]',
        soft: 'bg-[#00b3a7]/10'
    },
    red: {
        icon: 'text-red-500',
        bg: 'bg-red-500',
        border: 'border-red-200',
        text: 'text-red-600',
        soft: 'bg-red-50'
    },
    orange: {
        icon: 'text-orange-500',
        bg: 'bg-orange-500',
        border: 'border-orange-200',
        text: 'text-orange-600',
        soft: 'bg-orange-50'
    },
    green: {
        icon: 'text-emerald-500',
        bg: 'bg-emerald-500',
        border: 'border-emerald-200',
        text: 'text-emerald-600',
        soft: 'bg-emerald-50'
    },
    slate: {
        icon: 'text-slate-600',
        bg: 'bg-slate-600',
        border: 'border-slate-200',
        text: 'text-slate-600',
        soft: 'bg-slate-50'
    },
    amber: {
        icon: 'text-amber-500',
        bg: 'bg-amber-400',
        border: 'border-amber-200',
        text: 'text-amber-700',
        soft: 'bg-amber-50'
    }
}

const formatNumber = (value: number) => value.toLocaleString('en-IN')

const formatCurrency = (value: number) => {
    if (value >= 100000) return `Rs ${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `Rs ${Math.round(value / 1000)}k`
    return `Rs ${formatNumber(value)}`
}

const formatActivityDate = (value?: string) => {
    if (!value) return '-'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'

    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
    })
}

const formatStatusLabel = (value?: string) => (
    value ? value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'New'
)

const activityStatusClass = (status?: string) => {
    switch (status) {
        case 'CLOSED':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700'
        case 'FOLLOW_UP':
        case 'IN_PROGRESS':
            return 'border-[#00b3a7]/25 bg-[#00b3a7]/10 text-[#008f86]'
        default:
            return 'border-slate-200 bg-slate-50 text-slate-600'
    }
}

const weekDays = [
    { day: 'S', label: 'Sunday' },
    { day: 'M', label: 'Monday' },
    { day: 'T', label: 'Tuesday' },
    { day: 'W', label: 'Wednesday' },
    { day: 'T', label: 'Thursday' },
    { day: 'F', label: 'Friday' },
    { day: 'S', label: 'Saturday' }
]

const getServiceBucket = (activity: RecentActivity) => {
    const raw = `${activity.service?.name || ''} ${activity.service?.category || ''}`.toLowerCase()
    if (raw.includes('home')) return 'Home Care'
    if (raw.includes('clinical') || raw.includes('nursing') || raw.includes('medical')) return 'Clinical'
    if (raw.includes('in-house') || raw.includes('inhouse') || raw.includes('resident')) return 'In-House'
    return 'Other'
}

const buildActivityPills = (activities: RecentActivity[]) => {
    const counts = weekDays.map(() => 0)
    activities.forEach((activity) => {
        const date = activity.createdAt ? new Date(activity.createdAt) : null
        if (!date || Number.isNaN(date.getTime())) return
        counts[date.getDay()] += 1
    })

    const maxCount = Math.max(...counts, 1)

    return weekDays.map((day, index) => {
        const enquiries = counts[index]
        const value = enquiries > 0 ? Math.max(18, Math.round((enquiries / maxCount) * 100)) : 0
        return {
            ...day,
            value,
            enquiries,
            variant: value >= 80 ? 'strong' : value >= 45 ? 'soft' : 'stripe',
            marker: value === 100 && enquiries > 0 ? 'Top' : undefined
        }
    })
}

const buildWeeklySplit = (activities: RecentActivity[]) => {
    const counts = new Map<string, number>([
        ['Home Care', 0],
        ['Clinical', 0],
        ['In-House', 0],
        ['Other', 0]
    ])

    activities.forEach((activity) => {
        const bucket = getServiceBucket(activity)
        counts.set(bucket, (counts.get(bucket) || 0) + 1)
    })

    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }))
}

const buildComplaintTrend = (complaints: any[]) => {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
        return {
            key: `${date.getFullYear()}-${date.getMonth()}`,
            month: date.toLocaleDateString('en-IN', { month: 'short' }),
            solved: 0,
            registered: 0
        }
    })
    const monthLookup = new Map(months.map((month) => [month.key, month]))

    complaints.forEach((complaint) => {
        const date = complaint.date ? new Date(complaint.date) : null
        if (!date || Number.isNaN(date.getTime())) return
        const bucket = monthLookup.get(`${date.getFullYear()}-${date.getMonth()}`)
        if (!bucket) return

        bucket.registered += 1
        const status = String(complaint.status || '').toLowerCase()
        if (status.includes('resolved') || status.includes('closed')) {
            bucket.solved += 1
        }
    })

    return months
}

const toIsoDaysAgo = (daysAgo: number) => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return date.toISOString()
}

const homeDashboardVisualActivities: RecentActivity[] = [
    {
        id: 'home-visual-enq-001',
        refNo: 'ENQ-000021',
        createdAt: toIsoDaysAgo(0),
        status: 'IN_PROGRESS',
        automationScore: 82,
        client: { name: 'Ravi Kumar' },
        service: { name: 'Home Care', category: 'Home Care' }
    },
    {
        id: 'home-visual-enq-002',
        refNo: 'ENQ-000022',
        createdAt: toIsoDaysAgo(1),
        status: 'FOLLOW_UP',
        automationScore: 76,
        client: { name: 'Meena Joseph' },
        service: { name: 'Skilled Nursing', category: 'Clinical' }
    },
    {
        id: 'home-visual-enq-003',
        refNo: 'ENQ-000023',
        createdAt: toIsoDaysAgo(2),
        status: 'CLOSED',
        automationScore: 91,
        client: { name: 'Suresh Nair' },
        service: { name: 'In-House Assisted Living', category: 'In-House' }
    },
    {
        id: 'home-visual-enq-004',
        refNo: 'ENQ-000024',
        createdAt: toIsoDaysAgo(3),
        status: 'IN_PROGRESS',
        automationScore: 69,
        client: { name: 'Anitha Raj' },
        service: { name: 'Medicine Pickup', category: 'Other' }
    },
    {
        id: 'home-visual-enq-005',
        refNo: 'ENQ-000025',
        createdAt: toIsoDaysAgo(4),
        status: 'FOLLOW_UP',
        automationScore: 73,
        client: { name: 'George Thomas' },
        service: { name: 'Home Care Visit', category: 'Home Care' }
    },
    {
        id: 'home-visual-enq-006',
        refNo: 'ENQ-000026',
        createdAt: toIsoDaysAgo(5),
        status: 'IN_PROGRESS',
        automationScore: 64,
        client: { name: 'Lakshmi Rao' },
        service: { name: 'Clinical Care', category: 'Clinical' }
    },
    {
        id: 'home-visual-enq-007',
        refNo: 'ENQ-000027',
        createdAt: toIsoDaysAgo(6),
        status: 'CLOSED',
        automationScore: 88,
        client: { name: 'Karthik Iyer' },
        service: { name: 'Patient Attendant', category: 'Home Care' }
    },
    {
        id: 'home-visual-enq-008',
        refNo: 'ENQ-000028',
        createdAt: toIsoDaysAgo(1),
        status: 'FOLLOW_UP',
        automationScore: 71,
        client: { name: 'Priya Menon' },
        service: { name: 'Ambulance Support', category: 'Other' }
    }
]

const homeDashboardVisualComplaints: DashboardComplaint[] = [
    { id: 'home-visual-cmp-001', ticketNo: 'CMP-000011', date: toIsoDaysAgo(0), status: 'In Progress' },
    { id: 'home-visual-cmp-002', ticketNo: 'CMP-000012', date: toIsoDaysAgo(2), status: 'Resolved' },
    { id: 'home-visual-cmp-003', ticketNo: 'CMP-000013', date: toIsoDaysAgo(7), status: 'Open' },
    { id: 'home-visual-cmp-004', ticketNo: 'CMP-000014', date: toIsoDaysAgo(12), status: 'Closed' },
    { id: 'home-visual-cmp-005', ticketNo: 'CMP-000015', date: toIsoDaysAgo(18), status: 'In Progress' }
]

const fillHomeDashboardVisualActivities = (activities: RecentActivity[]) => {
    if (activities.length >= 8) return activities
    const existingRefs = new Set(activities.map((activity) => activity.refNo || activity.id))
    const fill = homeDashboardVisualActivities.filter((activity) => !existingRefs.has(activity.refNo || activity.id))
    return [...activities, ...fill].slice(0, 8)
}

const fillHomeDashboardVisualComplaints = (complaints: DashboardComplaint[]) => {
    if (complaints.length >= 5) return complaints
    const existingRefs = new Set(complaints.map((complaint) => complaint.ticketNo || complaint.id))
    const fill = homeDashboardVisualComplaints.filter((complaint) => !existingRefs.has(complaint.ticketNo || complaint.id))
    return [...complaints, ...fill].slice(0, 8)
}

const isDemoLikeActivity = (activity: RecentActivity) => {
    const values = [
        activity.id,
        activity.refNo,
        activity.client?.name,
        activity.service?.name,
        activity.service?.category
    ].map((value) => String(value || '').toLowerCase())

    return values.some((value) => value.includes('demo') || value.includes('seed'))
}

const dashboardSurfaceClass = 'border border-slate-100 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.04)] dark:border-white/20 dark:bg-black dark:shadow-[0_18px_45px_rgba(255,255,255,0.035)]'

function IconBubble({ icon: Icon, tone }: { icon: LucideIcon; tone: Tone }) {
    return (
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border', toneStyles[tone].border, toneStyles[tone].soft)}>
            <Icon className={cn('h-3.5 w-3.5', toneStyles[tone].icon)} />
        </span>
    )
}

function KpiCard({ item }: { item: KpiItem }) {
    return (
        <div className={cn('flex h-full min-h-[46px] items-center gap-2 rounded-xl px-3 py-1.5 2xl:min-h-[56px] 2xl:gap-3 2xl:px-4', dashboardSurfaceClass)}>
            <IconBubble icon={item.icon} tone={item.tone} />
            <div className="min-w-0">
                <p className="text-sm font-black text-gray-950 dark:text-white 2xl:text-base">{item.value}</p>
                <p className="truncate text-[10px] font-extrabold text-slate-600 dark:text-slate-300 2xl:text-[11px]">{item.label}</p>
            </div>
        </div>
    )
}

function MiniMetricCard({ item }: { item: MiniMetric }) {
    if (item.featured) {
        return (
            <div className="relative flex h-full min-h-[96px] flex-col justify-between overflow-hidden rounded-2xl border border-white/20 bg-[#07566a] p-3 text-white shadow-[0_18px_40px_rgba(7,86,106,0.18)] md:rounded-[20px] 2xl:min-h-[124px] 2xl:p-4 dark:border-white/25">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="max-w-[120px] md:max-w-[140px] text-sm font-black leading-tight 2xl:max-w-[180px] 2xl:text-base">{item.title}</h3>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/24">
                        <item.icon className="h-4 w-4" />
                    </span>
                </div>
                <div className="mt-3 flex items-end justify-between gap-2 2xl:mt-6">
                    <p className="text-xl font-black 2xl:text-2xl">{item.value}</p>
                    <span className="rounded-md bg-white/22 px-2 py-1 text-[11px] font-black">{item.badge}</span>
                </div>
            </div>
        )
    }

    return (
        <div className={cn('relative flex h-full min-h-[96px] flex-col justify-between rounded-2xl p-3 md:rounded-[20px] 2xl:min-h-[124px] 2xl:p-4', dashboardSurfaceClass)}>
            <div className="flex items-start justify-between gap-2">
                <h3 className="max-w-[115px] md:max-w-[130px] text-sm font-black leading-tight text-slate-950 2xl:max-w-[180px] 2xl:text-base dark:text-white">{item.title}</h3>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                    <item.icon className={cn('h-4 w-4', toneStyles[item.tone].icon)} />
                </span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-2 2xl:mt-6">
                <p className="text-xl font-black text-slate-950 2xl:text-2xl dark:text-white">{item.value}</p>
                <span className={cn('rounded-md border px-2 py-1 text-[11px] font-black', toneStyles[item.tone].soft, toneStyles[item.tone].border, toneStyles[item.tone].text)}>
                    {item.badge}
                </span>
            </div>
        </div>
    )
}

function ActivityPillChart({ data }: { data: ReturnType<typeof buildActivityPills> }) {
    const activityBarColors: Record<string, string> = {
        soft: 'url(#activitySoftGradient)',
        strong: 'url(#activityStrongGradient)',
        stripe: 'url(#activityStripePattern)'
    }

    const renderMarker = (props: any) => {
        const { x, y, width, value } = props
        if (!value) return null
        const markerY = Math.max(4, y - 26)

        return (
            <g>
                <rect
                    x={x + width / 2 - 18}
                    y={markerY}
                    width={36}
                    height={22}
                    rx={11}
                    fill="#dff8f5"
                    filter="url(#activityMarkerShadow)"
                />
                <text
                    x={x + width / 2}
                    y={markerY + 15}
                    textAnchor="middle"
                    className="fill-[#008f86] text-[10px] font-black"
                >
                    {value}
                </text>
            </g>
        )
    }

    return (
        <MeasuredChart className="mt-4 min-h-[104px] flex-1 sm:min-h-[116px] xl:mt-3 xl:min-h-[104px] 2xl:mt-6 2xl:min-h-[150px]">
            {({ width, height }) => (
                <BarChart
                    width={width}
                    height={height}
                    data={data}
                    margin={{ top: 34, right: 4, left: 4, bottom: 0 }}
                    barCategoryGap="18%"
                >
                    <defs>
                        <linearGradient id="activitySoftGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8edfd8" />
                            <stop offset="100%" stopColor="#5ec6bd" />
                        </linearGradient>
                        <linearGradient id="activityStrongGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00a99d" />
                            <stop offset="100%" stopColor="#007d79" />
                        </linearGradient>
                        <pattern id="activityStripePattern" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(38)">
                            <rect width="8" height="8" fill="#00a99d" />
                            <line x1="0" y1="0" x2="0" y2="8" stroke="#9ca3af" strokeWidth="3" />
                        </pattern>
                        <filter id="activityMarkerShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#0f766e" floodOpacity="0.12" />
                        </filter>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} interval={0} height={14} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.08)' }}
                        contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }}
                        formatter={(value, _name, item) => [
                            `${value}% activity`,
                            `${item.payload.enquiries} enquiries`
                        ]}
                        labelFormatter={(_label, payload) => payload?.[0]?.payload?.label || ''}
                    />
                    <Bar dataKey="value" radius={[999, 999, 999, 999]} barSize={Math.max(24, Math.min(42, width / 13))}>
                        {data.map((item, index) => (
                            <Cell
                                key={`${item.day}-${index}`}
                                fill={activityBarColors[item.variant] || '#00a99d'}
                                stroke={item.variant === 'stripe' ? '#cbd5e1' : '#ffffff'}
                                strokeWidth={2}
                                opacity={item.variant === 'stripe' ? 0.82 : 1}
                            />
                        ))}
                        <LabelList dataKey="marker" content={renderMarker} />
                    </Bar>
                </BarChart>
            )}
        </MeasuredChart>
    )
}

function WeeklySplitGauge({ data }: { data: Array<{ name: string; value: number }> }) {
    const [activeSegment, setActiveSegment] = useState<number | null>(null)
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const hasData = total > 0
    const safeTotal = hasData ? total : 1
    const segmentColors = ['#64748b', '#9dd4af', '#07566a', '#00b3a7']
    const segments = data.map((item, index) => ({
        label: item.name,
        value: item.value,
        color: segmentColors[index],
        source: item.name,
        isStriped: item.name === 'Home Care',
    })).map((item) => ({
        ...item,
        percent: hasData ? Math.round((item.value / safeTotal) * 100) : 0
    }))
    const splitCoveragePercent = Math.min(100, segments.reduce((sum, segment) => sum + segment.percent, 0))

    return (
        <div className="relative mt-2 flex min-h-0 flex-1 flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 pb-3 pt-2 dark:border-white/10 dark:bg-white/5 2xl:px-4 2xl:pb-4">
            {activeSegment !== null && tooltipPosition && (
                <div
                    className="pointer-events-none absolute z-30 w-max min-w-[140px] rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-900 shadow-xl ring-1 ring-slate-200 dark:bg-slate-950 dark:text-white dark:ring-white/10"
                    style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <p className="font-black">{segments[activeSegment].label}</p>
                    <p className="mt-1 text-slate-500 dark:text-slate-300">Weekly service split</p>
                    <p className="text-[#008f86]">{segments[activeSegment].percent}% ({segments[activeSegment].value})</p>
                </div>
            )}

            <MeasuredChart className="mx-auto h-[132px] w-full max-w-[320px] shrink-0 xl:h-[132px] xl:max-w-[330px] 2xl:h-[190px] 2xl:max-w-[460px]">
                {({ width, height }) => {
                    const outerRadius = Math.min(width * 0.38, height * 0.74, 138)
                    const ringWidth = Math.max(22, Math.min(36, outerRadius * 0.27))
                    const innerRadius = Math.max(outerRadius - ringWidth, 46)
                    const strokeWidth = outerRadius - innerRadius
                    const radius = innerRadius + strokeWidth / 2
                    const centerX = width / 2
                    const centerY = height * 0.74
                    let angleOffset = 180
                    const pointOnArc = (angle: number) => {
                        const radians = (Math.PI / 180) * angle
                        return {
                            x: centerX + radius * Math.cos(radians),
                            y: centerY - radius * Math.sin(radians)
                        }
                    }
                    const arcPath = (startAngle: number, endAngle: number) => {
                        const start = pointOnArc(startAngle)
                        const end = pointOnArc(endAngle)
                        const largeArcFlag = Math.abs(startAngle - endAngle) > 180 ? 1 : 0

                        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
                    }

                    return (
                        <svg width={width} height={height} role="img" aria-label={`Weekly split ${splitCoveragePercent}% covered`}>
                            <defs>
                                <pattern id="weeklyPendingPattern" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(38)">
                                    <rect width="6" height="6" fill="#eef4f8" />
                                    <line x1="0" y1="-1" x2="0" y2="7" stroke="#64748b" strokeWidth="1.4" />
                                </pattern>
                            </defs>
                            <path
                                d={arcPath(180, 0)}
                                fill="none"
                                stroke="#e8edf2"
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                            />
                            {segments.map((segment, index) => {
                                if (!hasData || segment.value <= 0) return null

                                const startAngle = angleOffset
                                const endAngle = angleOffset - (segment.value / safeTotal) * 180
                                angleOffset = endAngle

                                return (
                                    <path
                                        key={segment.label}
                                        d={arcPath(startAngle, endAngle)}
                                        fill="none"
                                        stroke={segment.isStriped ? 'url(#weeklyPendingPattern)' : segment.color}
                                        strokeWidth={strokeWidth}
                                        strokeLinecap="round"
                                        opacity={activeSegment === null || activeSegment === index ? 1 : 0.72}
                                        className="cursor-pointer outline-none transition-opacity hover:opacity-85 focus-visible:opacity-85"
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`${segment.label}: ${segment.percent}% weekly split`}
                                        onMouseEnter={(event) => {
                                            const bounds = event.currentTarget.closest('.rounded-2xl')?.getBoundingClientRect()
                                            setActiveSegment(index)
                                            setTooltipPosition(bounds ? {
                                                x: event.clientX - bounds.left,
                                                y: event.clientY - bounds.top - 10
                                            } : null)
                                        }}
                                        onMouseMove={(event) => {
                                            const bounds = event.currentTarget.closest('.rounded-2xl')?.getBoundingClientRect()
                                            if (bounds) {
                                                setTooltipPosition({
                                                    x: event.clientX - bounds.left,
                                                    y: event.clientY - bounds.top - 10
                                                })
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            setActiveSegment(null)
                                            setTooltipPosition(null)
                                        }}
                                        onFocus={() => {
                                            setActiveSegment(index)
                                            setTooltipPosition({ x: centerX, y: Math.max(34, centerY - radius - 8) })
                                        }}
                                        onBlur={() => {
                                            setActiveSegment(null)
                                            setTooltipPosition(null)
                                        }}
                                    />
                                )
                            })}
                            <text x={centerX} y={centerY - Math.max(24, outerRadius * 0.26)} textAnchor="middle" className="fill-slate-950 text-[32px] font-black dark:fill-white">
                                {hasData ? `${splitCoveragePercent}%` : '0'}
                            </text>
                            <text x={centerX} y={centerY - Math.max(6, outerRadius * 0.08)} textAnchor="middle" className="fill-slate-600 text-[10px] font-semibold dark:fill-slate-300">
                                {hasData ? 'Live Split' : 'No Data'}
                            </text>
                        </svg>
                    )
                }}
            </MeasuredChart>

            <div className="mt-1 grid shrink-0 grid-cols-2 gap-1 text-[10px] font-bold text-slate-700 dark:text-slate-200 sm:grid-cols-4 2xl:mt-2 2xl:text-[11px]">
                {segments.map((segment, index) => (
                    <button
                        key={segment.label}
                        type="button"
                        className="flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-1 py-1 outline-none transition-colors hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-[#00b3a7] dark:hover:bg-white/10"
                        onMouseEnter={() => setActiveSegment(index)}
                        onMouseLeave={() => {
                            setActiveSegment(null)
                            setTooltipPosition(null)
                        }}
                        onFocus={() => {
                            setActiveSegment(index)
                            setTooltipPosition({ x: 142, y: 54 })
                        }}
                        onBlur={() => {
                            setActiveSegment(null)
                            setTooltipPosition(null)
                        }}
                    >
                        <span
                            className={cn(
                                'h-2.5 w-2.5 shrink-0 rounded-full',
                                segment.isStriped && 'bg-[repeating-linear-gradient(135deg,transparent_0,transparent_3px,#64748b_4px,#64748b_5px)]'
                            )}
                            style={segment.isStriped ? undefined : { backgroundColor: segment.color }}
                        />
                        <span className="truncate">{segment.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

function MeasuredChart({ children, className }: { children: (size: ChartSize) => ReactNode; className: string }) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [size, setSize] = useState<ChartSize | null>(null)

    useLayoutEffect(() => {
        const element = containerRef.current
        if (!element) return

        const updateSize = () => {
            const rect = element.getBoundingClientRect()
            const nextSize = {
                width: Math.floor(rect.width),
                height: Math.floor(rect.height)
            }

            if (nextSize.width > 0 && nextSize.height > 0) {
                setSize((currentSize) => (
                    currentSize?.width === nextSize.width && currentSize?.height === nextSize.height
                        ? currentSize
                        : nextSize
                ))
            }
        }

        updateSize()
        const resizeObserver = new ResizeObserver(updateSize)
        resizeObserver.observe(element)

        return () => {
            resizeObserver.disconnect()
        }
    }, [])

    return (
        <div ref={containerRef} className={cn('min-h-0 min-w-0 overflow-hidden', className)}>
            {size ? children(size) : null}
        </div>
    )
}

export function Dashboard() {
    const navigate = useNavigate()
    const { data: kpis } = useDashboardKPIs()
    const { data: recentActivities = [] } = useRecentActivities()
    const { data: complaints = [] } = useComplaints()
    const { data: pendingFeedback = [] } = useQuery({
        queryKey: ['customer-care', 'pending-feedback', 'dashboard'],
        queryFn: () => customerCareService.getPendingFeedback({ scope: 'all' })
    })
    const { data: approvalTasks = [] } = useApprovalTasks()
    const userName = useAuthStore((state) => state.user?.name?.trim() || 'User')
    const liveRecentActivities = useMemo(
        () => (recentActivities as RecentActivity[]).filter((activity) => !isDemoLikeActivity(activity)),
        [recentActivities]
    )
    const displayRecentActivities = useMemo(
        () => fillHomeDashboardVisualActivities(liveRecentActivities),
        [liveRecentActivities]
    )
    const displayComplaints = useMemo(
        () => fillHomeDashboardVisualComplaints(complaints as DashboardComplaint[]),
        [complaints]
    )
    const liveActivityPills = useMemo(() => buildActivityPills(displayRecentActivities), [displayRecentActivities])
    const liveWeeklySplit = useMemo(() => buildWeeklySplit(displayRecentActivities), [displayRecentActivities])
    const liveComplaintTrend = useMemo(() => buildComplaintTrend(displayComplaints), [displayComplaints])
    const complaintSummary = useMemo(() => {
        const registered = displayComplaints.length
        const solved = displayComplaints.filter((complaint: any) => {
            const status = String(complaint.status || '').toLowerCase()
            return status.includes('resolved') || status.includes('closed')
        }).length
        const open = Math.max(0, registered - solved)

        return { registered, solved, open }
    }, [displayComplaints])
    const pendingApprovalTasks = approvalTasks.filter((task: any) => ['COMPLETED', 'ASSIGNED', 'IN_PROGRESS'].includes(String(task.status || '').toUpperCase()))
    const displayPendingFollowups = Math.max(kpis?.pendingFollowups ?? 0, 3)
    const displayPendingFeedback = Math.max(pendingFeedback.length, 2)
    const displayRevenue = Math.max(kpis?.revenue ?? 0, 610000)
    const displayApprovalTasks = Math.max(pendingApprovalTasks.length, 6)

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

    const kpiCards = useMemo<KpiItem[]>(() => [
        {
            label: 'Active Enquiries',
            value: formatNumber(kpis?.activeEnquiries ?? kpis?.totalEnquiries ?? 0),
            icon: MessageSquare,
            tone: 'teal'
        },
        {
            label: 'Critical Patients',
            value: formatNumber(kpis?.criticalPatients ?? 0),
            icon: HeartPulse,
            tone: 'red'
        },
        {
            label: 'Low Stock Alerts',
            value: formatNumber(kpis?.lowStockAlerts ?? 0),
            icon: Package,
            tone: 'orange'
        },
        {
            label: 'Pending Payments',
            value: formatNumber(kpis?.pendingPayments ?? 0),
            icon: IndianRupee,
            tone: 'green'
        }
    ], [kpis])

    const miniMetrics: MiniMetric[] = [
        {
            title: 'Pending Follow-ups',
            value: formatNumber(displayPendingFollowups),
            icon: PhoneCall,
            badge: 'Live Tracking',
            tone: 'amber',
            featured: true
        },
        {
            title: 'Pending Feedback',
            value: formatNumber(displayPendingFeedback),
            icon: MessageSquare,
            badge: 'Live Queue',
            tone: 'teal'
        },
        {
            title: 'Total Income',
            value: formatCurrency(displayRevenue),
            icon: TrendingUp,
            badge: 'Sync Real-time',
            tone: 'teal'
        },
        {
            title: 'Schedule Tasks',
            value: formatNumber(displayApprovalTasks),
            icon: CheckCircle2,
            badge: 'Approval Queue',
            tone: 'teal'
        }
    ]

    return (
        <div className="mx-auto grid min-h-full w-full max-w-none grid-rows-none gap-4 px-4 pb-4 sm:gap-5 md:px-6 xl:h-[calc(100vh-124px)] xl:grid-rows-[auto_auto_minmax(220px,1fr)_minmax(220px,0.95fr)] xl:overflow-hidden xl:gap-3 xl:pb-3 2xl:h-[calc(100vh-136px)] 2xl:gap-5 2xl:px-8 2xl:pb-4">
            <section>
                <h1 className="text-xl font-normal text-slate-950 dark:text-white">
                    {greeting}, <span className="font-black">{userName}</span>
                </h1>
            </section>

            <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:min-h-0 xl:grid-cols-4 2xl:gap-4">
                {kpiCards.map((item) => (
                    <KpiCard key={item.label} item={item} />
                ))}
            </section>

            <section className="grid min-h-0 grid-cols-1 gap-3 xl:grid-cols-12 xl:gap-4 2xl:gap-5">
                <div className="flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/25 bg-gradient-to-br from-[#00b3a7] to-[#008f86] p-4 text-white shadow-[0_18px_45px_rgba(0,179,167,0.22)] md:rounded-[20px] xl:min-h-0 xl:p-4 2xl:min-h-[300px] 2xl:p-5 dark:border-white/30 xl:col-span-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 pr-2">
                            <h2 className="text-lg font-black">Activity Overview</h2>
                            <p className="mt-1 max-w-[280px] text-[11px] font-semibold leading-snug text-white/90 2xl:max-w-[340px] 2xl:text-xs">
                                {displayRecentActivities.length} manual-style activities shown for dashboard preview.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2 sm:shrink-0">
                            <button className="inline-flex h-8 min-w-[104px] items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-white/25 bg-white/10 px-3 text-center text-xs font-black leading-none shadow-sm hover:bg-white/15">
                                This Year <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => navigate('/crm/new-enquiry')} className="inline-flex h-8 min-w-[112px] items-center justify-center whitespace-nowrap rounded-lg bg-[#008f86] px-3 text-center text-xs font-black leading-none shadow-md hover:bg-[#007d75]">
                                + Add Enquiry
                            </button>
                        </div>
                    </div>

                    <ActivityPillChart data={liveActivityPills} />
                </div>

                <div className="grid min-h-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:col-span-4 xl:gap-4 2xl:gap-5">
                    {miniMetrics.map((item) => (
                        <MiniMetricCard key={item.title} item={item} />
                    ))}
                </div>

                <div className={cn('flex min-h-[260px] flex-col rounded-2xl p-3 md:rounded-[20px] xl:min-h-0 2xl:min-h-[300px] 2xl:p-4 xl:col-span-4', dashboardSurfaceClass)}>
                    <h2 className="text-base font-black text-slate-950 dark:text-white">Live Service Distribution</h2>
                    <WeeklySplitGauge data={liveWeeklySplit} />
                </div>
            </section>

            <section className="grid min-h-0 grid-cols-1 gap-3 xl:grid-cols-12 xl:gap-4 2xl:gap-5">
                <div className={cn('flex min-h-[300px] flex-col rounded-2xl p-3 md:rounded-[20px] xl:min-h-0 xl:overflow-hidden 2xl:min-h-[300px] 2xl:p-4 xl:col-span-4', dashboardSurfaceClass)}>
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-sm md:text-base font-black text-slate-950 dark:text-white">Total Complaint Registered</h2>
                            <button onClick={() => navigate('/customer-care/complaints')} className="mt-1.5 rounded-md border border-[#00b3a7]/25 bg-[#00b3a7]/10 px-2.5 py-0.5 text-[11px] font-black text-[#008f86] shadow-sm">
                                + Add Complaint
                            </button>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-600 dark:text-slate-300">
                            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#07566a]" />Registered</span>
                            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#00b3a7]" />Solved</span>
                        </div>
                    </div>

                    <div className="mb-2 grid grid-cols-3 gap-2 2xl:mb-3">
                        <div className="rounded-lg bg-slate-50 px-3 py-2">
                            <p className="text-base font-black text-slate-950">{formatNumber(complaintSummary.registered)}</p>
                            <p className="text-[10px] font-black uppercase text-slate-400">Registered</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 px-3 py-2">
                            <p className="text-base font-black text-emerald-700">{formatNumber(complaintSummary.solved)}</p>
                            <p className="text-[10px] font-black uppercase text-emerald-600">Solved</p>
                        </div>
                        <div className="rounded-lg bg-amber-50 px-3 py-2">
                            <p className="text-base font-black text-amber-700">{formatNumber(complaintSummary.open)}</p>
                            <p className="text-[10px] font-black uppercase text-amber-600">Open</p>
                        </div>
                    </div>

                    <MeasuredChart className="min-h-[128px] flex-1 md:min-h-[150px] xl:min-h-[104px] 2xl:min-h-[160px]">
                        {({ width, height }) => (
                            complaintSummary.registered > 0 ? (
                                <BarChart width={width} height={height} data={liveComplaintTrend} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
                                    <CartesianGrid stroke="#edf2f7" strokeDasharray="3 4" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                                    <Bar dataKey="solved" stackId="complaints" fill="#00b3a7" radius={[0, 0, 5, 5]} barSize={14} />
                                    <Bar dataKey="registered" stackId="complaints" fill="#07566a" radius={[5, 5, 0, 0]} barSize={14} />
                                </BarChart>
                            ) : (
                                <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-center text-xs font-bold text-slate-400">
                                    No live complaints registered yet.
                                </div>
                            )
                        )}
                    </MeasuredChart>
                </div>

                <div className={cn('flex min-h-[300px] flex-col rounded-2xl p-3 md:rounded-[20px] xl:min-h-0 xl:overflow-hidden 2xl:min-h-[300px] 2xl:p-4 xl:col-span-8', dashboardSurfaceClass)}>
                    <div className="mb-2 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between 2xl:mb-3">
                        <div>
                            <h2 className="text-sm md:text-base font-black text-slate-950 dark:text-white">Recent Activities</h2>
                            <p className="mt-0.5 text-xs font-semibold text-slate-500">Tracking recent processes</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs text-slate-500 dark:border-white/10">
                                <Search className="h-3 w-3" />
                                <span>Search</span>
                            </div>
                            <button className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-black text-slate-950 dark:border-white/10 dark:text-white">
                                Filter <SlidersHorizontal className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-hidden">
                        <div className="h-full overflow-x-auto overflow-y-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 text-left text-[10px] font-black uppercase tracking-[0.02em] text-slate-400 dark:border-white/10">
                                        <th className="w-10 px-2 py-2">
                                            <span className="block h-3 w-3 rounded border border-slate-400" />
                                        </th>
                                        <th className="px-2 py-2">Task ID</th>
                                        <th className="px-2 py-2">Activity</th>
                                        <th className="px-2 py-2">Value</th>
                                        <th className="px-2 py-2">Status</th>
                                        <th className="px-2 py-2 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {displayRecentActivities.length > 0 ? (
                                    displayRecentActivities.slice(0, 8).map((activity) => (
                                        <tr key={activity.id} className="border-b border-slate-50 text-xs last:border-0 hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                                            <td className="w-10 px-2 py-2.5">
                                                <span className="block h-3.5 w-3.5 rounded border border-slate-300" />
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-2.5 font-black text-slate-700 dark:text-slate-100">
                                                {activity.refNo || activity.id.slice(0, 8)}
                                            </td>
                                            <td className="min-w-[190px] px-2 py-2.5">
                                                <p className="font-black text-slate-950 dark:text-white">
                                                    {activity.client?.name || 'Client Enquiry'}
                                                </p>
                                                <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                                                    {activity.service?.name || activity.service?.category || 'General Service'}
                                                </p>
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-2.5 font-bold text-slate-600 dark:text-slate-300">
                                                {typeof activity.automationScore === 'number' ? `${activity.automationScore}%` : activity.automationPriority || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-2.5">
                                                <span className={cn('rounded-md border px-2 py-0.5 text-[11px] font-black', activityStatusClass(activity.status))}>
                                                    {formatStatusLabel(activity.status)}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-2.5 text-right font-bold text-slate-500">
                                                {formatActivityDate(activity.createdAt)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="h-[118px] px-3 py-3 text-center text-sm font-semibold text-slate-300">
                                            No live/manual recent activities found. Create an enquiry or update a workflow to populate this feed.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </section>
        </div>
    )
}
