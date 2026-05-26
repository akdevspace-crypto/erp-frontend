import { useMemo, useState } from 'react'
import { IndianRupee } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useInvoices } from '../../accounts/hooks/useAccounts'
import { useInHouseAllocations } from '../../allocation/hooks/useAllocation'

const money = (value: number) => `Rs ${Number(value || 0).toFixed(2)}`

const isDemoLike = (value?: unknown) => {
    const normalized = String(value || '').trim().toUpperCase()
    return normalized.startsWith('DEMO-') || normalized.startsWith('SEED-') || normalized.includes('DEMO-') || normalized.includes('SEED-')
}

export function Revenue() {
    const [searchQuery, setSearchQuery] = useState('')
    const { data: invoices = [], isLoading: invoicesLoading } = useInvoices()
    const { data: allocations = [], isLoading: allocationsLoading } = useInHouseAllocations()

    const rows = useMemo(() => {
        const allocationMap = new Map(allocations.map((allocation: any) => [allocation.id, allocation]))
        return invoices
            .filter((invoice: any) => {
                const allocation = allocationMap.get(invoice.allocationId) as any
                const isInHouse = allocationMap.has(invoice.allocationId) || String(invoice.category || '').toLowerCase().includes('in-house')
                const hasDemoIdentity = [
                    invoice.refNo,
                    invoice.receiptNo,
                    invoice.clientName,
                    invoice.category,
                    invoice.notes,
                    invoice.metadata?.allocationRef,
                    invoice.metadata?.taskRefNo,
                    invoice.metadata?.patientName,
                    allocation?.ref,
                    allocation?.clientName
                ].some(isDemoLike)
                return isInHouse && !hasDemoIdentity
            })
            .map((invoice: any) => {
                const allocation = allocationMap.get(invoice.allocationId) as any
                const amount = Number(invoice.amount || 0)
                const paidAmount = Number(invoice.metadata?.paidAmount || 0)
                const balanceAmount = Number(invoice.metadata?.balanceAmount ?? Math.max(0, amount - paidAmount))
                return {
                    id: invoice.id,
                    refNo: invoice.refNo || invoice.receiptNo,
                    service: invoice.category || allocation?.service || 'In-House Care',
                    clientName: invoice.clientName || allocation?.clientName || '-',
                    guardian: allocation?.guardian || allocation?.mobile || '-',
                    amount,
                    paidAmount,
                    balanceAmount,
                    status: balanceAmount <= 0 && amount > 0 ? 'Paid' : String(invoice.status || 'Created'),
                    date: invoice.date || invoice.createdAt
                }
            })
    }, [allocations, invoices])

    const visibleRows = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        return rows.filter((row) => !query || [
            row.refNo,
            row.service,
            row.clientName,
            row.guardian,
            row.status
        ].some((value) => String(value || '').toLowerCase().includes(query)))
    }, [rows, searchQuery])

    const totalRevenue = rows.reduce((sum, row) => sum + row.amount, 0)
    const totalPaid = rows.reduce((sum, row) => sum + row.paidAmount, 0)
    const totalDue = rows.reduce((sum, row) => sum + row.balanceAmount, 0)

    const columns: Column<any>[] = [
        { key: 'sno', header: 'S.No', cell: (_row, index) => index + 1 },
        { key: 'refNo', header: 'Invoice', cell: (row) => <span className="font-black text-primary-700">{row.refNo || '-'}</span> },
        { key: 'service', header: 'Service Details', cell: (row) => <span className="font-bold text-slate-900">{row.service}</span> },
        { key: 'clientName', header: 'Client Details', cell: (row) => <span className="font-semibold">{row.clientName}</span> },
        { key: 'guardian', header: 'Guardian / Contact', cell: (row) => row.guardian || '-' },
        {
            key: 'dailyRevenue',
            header: 'Revenue',
            cell: (row) => (
                <div className="text-sm">
                    <p className="font-black">{money(row.amount)}</p>
                    <p className="text-xs font-semibold text-slate-500">Paid {money(row.paidAmount)} / Due {money(row.balanceAmount)}</p>
                </div>
            )
        },
        { key: 'status', header: 'Status', cell: (row) => <StatusHighlighter value={row.status} /> }
    ]

    return (
        <div className="flex h-full flex-col">
            <PageHeader
                title="In-House Care Revenue"
                subtitle="Live in-house billing and collection view from invoice and receipt data."
                breadcrumbs={[{ label: 'In-House Care' }, { label: 'Revenue' }]}
            />

            <div className="mb-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-teal-700 shadow-sm">
                    <IndianRupee className="mb-2 h-5 w-5" />
                    <p className="text-2xl font-black">{money(totalRevenue)}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Total Billed</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700 shadow-sm">
                    <p className="text-2xl font-black">{money(totalPaid)}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Collected</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-700 shadow-sm">
                    <p className="text-2xl font-black">{money(totalDue)}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Pending</p>
                </div>
            </div>

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search invoice, client, service, status..."
            />

            <DataTable
                data={visibleRows}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={invoicesLoading || allocationsLoading}
                emptyStateMessage="No live in-house revenue found. Complete an in-house duty and invoice flow first."
            />
        </div>
    )
}
