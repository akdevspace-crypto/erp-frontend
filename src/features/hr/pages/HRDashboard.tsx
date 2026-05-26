import { useMemo } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useAttendanceLogs, useLeaveRequests, usePayrollPreview, useStaff } from '../hooks/useHR'

const today = new Date().toISOString().split('T')[0]
const currentMonth = new Date().toISOString().slice(0, 7)

const isManualEmployee = (empId?: string) => {
    const normalized = String(empId || '').trim().toUpperCase()
    return normalized && !normalized.startsWith('DEMO-') && !normalized.startsWith('SEED-')
}

const normalizeStatus = (value?: string) => String(value || '').trim().toUpperCase()
const money = (value: number) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`

export function HRDashboard() {
    const { data: staffData = [] } = useStaff({ includeFormer: true, scope: 'all' })
    const { data: attendanceLogs = [] } = useAttendanceLogs({ date: today, scope: 'all' })
    const { data: leaveRequests = [] } = useLeaveRequests()
    const { data: payrollRows = [] } = usePayrollPreview({ month: currentMonth, scope: 'all' })
    const staff = useMemo(() => staffData.filter((s) => isManualEmployee(s.empId)), [staffData])

    const metrics = useMemo(() => {
        const active = staff.filter((s) => !s.isDeleted && !['RESIGNED', 'TERMINATED'].includes(normalizeStatus(s.status)))
        const pendingLeave = leaveRequests.filter((request) => normalizeStatus(request.status) === 'PENDING')
        const payrollQueue = payrollRows.filter((row) => normalizeStatus(row.status) !== 'PROCESSED' && Number(row.grossPay || 0) > 0)
        const netPayable = payrollRows.reduce((total, row) => total + Number(row.netPay || 0), 0)

        return [
            { label: 'Active Staff', value: active.length, note: 'Manual staff currently working' },
            { label: 'Today Attendance', value: attendanceLogs.length, note: 'Staff check-ins logged today' },
            { label: 'Pending Leave', value: pendingLeave.length, note: 'Waiting for HR approval' },
            { label: 'Payroll Queue', value: payrollQueue.length, note: `${money(netPayable)} net payable` }
        ]
    }, [attendanceLogs.length, leaveRequests, payrollRows, staff])

    const followUps = useMemo(() => {
        const leaveItems = leaveRequests
            .filter((request) => normalizeStatus(request.status) === 'PENDING')
            .slice(0, 4)
            .map((request) => ({
                id: request.id,
                item: 'Leave approval',
                owner: request.name,
                department: request.leaveType,
                status: 'Pending'
            }))
        const payrollItems = payrollRows
            .filter((row) => normalizeStatus(row.status) !== 'PROCESSED' && Number(row.grossPay || 0) > 0)
            .slice(0, 4)
            .map((row) => ({
                id: row.id,
                item: 'Payroll processing',
                owner: row.name,
                department: row.role,
                status: row.status
            }))
        return [...leaveItems, ...payrollItems]
    }, [leaveRequests, payrollRows])

    const columns: Column<any>[] = [
        { key: 'item', header: 'HR Follow-up' },
        { key: 'owner', header: 'Staff' },
        { key: 'department', header: 'Department' },
        { key: 'status', header: 'Status', cell: (row) => <StatusHighlighter value={row.status} /> }
    ]

    return (
        <div className="flex flex-col h-full space-y-6 bg-transparent dark:bg-black">
            <PageHeader
                title="HR Dashboard"
                subtitle="Live staff strength, attendance, leave, payroll, and HR follow-ups."
                breadcrumbs={[{ label: 'Human Resource' }, { label: 'HR Dashboard' }]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {metrics.map((metric) => (
                    <div key={metric.label} className="bg-white dark:bg-black border border-gray-100/80 dark:border-white/10 rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{metric.label}</p>
                        <p className="mt-3 text-3xl font-black text-gray-900 dark:text-gray-100">{metric.value}</p>
                        <p className="mt-1 text-xs font-medium text-gray-400">{metric.note}</p>
                    </div>
                ))}
            </div>

            <DataTable
                data={followUps}
                columns={columns}
                keyExtractor={(row) => row.id}
                emptyStateMessage="No live HR follow-ups available"
            />
        </div>
    )
}
