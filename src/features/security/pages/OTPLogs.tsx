import { PageHeader } from '../../../components/PageHeader'
import { DataTable, type Column } from '../../../components/DataTable'

type OTPLog = {
    id: string
    mobile: string
    purpose: string
    status: string
    createdAt: string
}

export function OTPLogs() {
    const columns: Column<OTPLog>[] = [
        { key: 'mobile', header: 'Mobile' },
        { key: 'purpose', header: 'Purpose' },
        { key: 'status', header: 'Status' },
        { key: 'createdAt', header: 'Created At' }
    ]

    return (
        <div className="flex h-full flex-col space-y-6 bg-transparent">
            <PageHeader
                title="OTP Logs"
                subtitle="OTP verification is not enabled yet. Visitor movement is currently tracked from Gate Management."
                breadcrumbs={[{ label: 'Security' }, { label: 'OTP Logs' }]}
            />

            <DataTable
                data={[]}
                columns={columns}
                keyExtractor={(entry) => entry.id}
                emptyStateMessage="No OTP logs yet. OTP verification can be added after visitor check-in/out flow is confirmed."
            />
        </div>
    )
}
