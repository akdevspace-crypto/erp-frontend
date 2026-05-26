import { useMemo, useState } from 'react'
import { CheckCircle, Receipt, Save, Search, XCircle } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { DataTable, type Column } from '../../../components/DataTable'
import { Modal } from '../../../components/Modal'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useApproveTransaction, useInvoices, useRecordInvoicePayment, useUpdateTransaction } from '../../accounts/hooks/useAccounts'

export function Invoice() {
    const { data: transactions = [], isLoading } = useInvoices()
    const approveTransaction = useApproveTransaction()
    const updateTransaction = useUpdateTransaction()
    const recordPayment = useRecordInvoicePayment()
    const [search, setSearch] = useState('')
    const [amountEdits, setAmountEdits] = useState<Record<string, string>>({})
    const [paymentInvoice, setPaymentInvoice] = useState<any | null>(null)
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        mode: 'Cash',
        remarks: ''
    })

    const openPaymentModal = (invoice: any) => {
        setPaymentInvoice(invoice)
        setPaymentForm({
            amount: String(invoice.balanceAmount || invoice.amountValue || ''),
            mode: invoice.mode || 'Cash',
            remarks: `Payment received for ${invoice.receiptNo}`
        })
    }

    const invoices = useMemo(() => {
        const query = search.trim().toLowerCase()
        return transactions
            .filter((transaction) => transaction.type === 'INVOICE')
            .filter((transaction) => {
                if (!query) return true
                return [
                    transaction.receiptNo,
                    transaction.clientName,
                    transaction.category,
                    transaction.notes,
                    transaction.currentStatus
                ].some((value) => String(value || '').toLowerCase().includes(query))
            })
            .map((transaction) => ({
                ...transaction,
                amountLabel: `Rs ${Number(transaction.amount || 0).toFixed(2)}`,
                amountValue: Number(transaction.amount || 0),
                paidAmount: Number(transaction.metadata?.paidAmount || 0),
                balanceAmount: Number(
                    transaction.metadata?.balanceAmount
                    ?? Math.max(0, Number(transaction.amount || 0) - Number(transaction.metadata?.paidAmount || 0))
                ),
                paymentStatus: transaction.metadata?.paymentStatus || (Number(transaction.metadata?.paidAmount || 0) > 0 ? 'PARTIAL' : 'UNPAID'),
                allocationRef: transaction.metadata?.allocationRef || '-',
                taskRefNo: transaction.metadata?.taskRefNo || '-'
            }))
    }, [transactions, search])

    const postInvoice = async (invoice: any) => {
        const amount = Number(amountEdits[invoice.id] ?? invoice.amountValue ?? invoice.amount ?? 0)

        if (!Number.isFinite(amount) || amount <= 0) return

        const shouldSaveAmount = Number(invoice.amountValue || invoice.amount || 0) !== amount

        try {
            if (shouldSaveAmount) {
                await updateTransaction.mutateAsync({
                    id: invoice.id,
                    data: { amount }
                })
            }

            await approveTransaction.mutateAsync({
                id: invoice.id,
                status: 'APPROVED',
                comments: `Invoice ${invoice.receiptNo} posted by finance`
            })

            setAmountEdits((prev) => {
                const next = { ...prev }
                delete next[invoice.id]
                return next
            })
        } catch {
            // Toast handling lives in the account mutations.
        }
    }

    const saveInvoiceAmount = (invoice: any) => {
        const amount = Number(amountEdits[invoice.id] ?? invoice.amountValue ?? invoice.amount ?? 0)

        if (!Number.isFinite(amount) || amount <= 0) return

        updateTransaction.mutate({
            id: invoice.id,
            data: { amount }
        })
    }

    const rejectInvoice = (invoice: any) => {
        approveTransaction.mutate({
            id: invoice.id,
            status: 'REJECTED',
            comments: `Invoice ${invoice.receiptNo} rejected by finance`
        })
    }

    const collectPayment = () => {
        if (!paymentInvoice) return

        const amount = Number(paymentForm.amount)
        if (!Number.isFinite(amount) || amount <= 0 || amount > Number(paymentInvoice.balanceAmount || 0) + 0.01) return

        recordPayment.mutate({
            id: paymentInvoice.id,
            data: {
                amount,
                mode: paymentForm.mode,
                remarks: paymentForm.remarks
            }
        }, {
            onSuccess: () => setPaymentInvoice(null)
        })
    }

    const columns: Column<any>[] = [
        { key: 'receiptNo', header: 'Invoice No', cell: (row) => <span className="font-semibold text-primary-600">{row.receiptNo}</span> },
        { key: 'clientName', header: 'Client', cell: (row) => <span className="font-medium">{row.clientName || '-'}</span> },
        { key: 'category', header: 'Service', cell: (row) => row.category || '-' },
        { key: 'allocationRef', header: 'Allocation', cell: (row) => row.allocationRef },
        { key: 'taskRefNo', header: 'Duty Ref', cell: (row) => row.taskRefNo },
        {
            key: 'amount',
            header: 'Amount',
            cell: (row) => row.currentStatus === 'CREATED' ? (
                <div className="flex max-w-[180px] items-center gap-2">
                    <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={amountEdits[row.id] ?? String(row.amountValue || '')}
                        onChange={(event) => setAmountEdits((prev) => ({ ...prev, [row.id]: event.target.value }))}
                        className="h-9 w-28 rounded-md border border-gray-200 bg-white px-2 text-sm font-semibold outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        placeholder="Amount"
                    />
                    <button
                        type="button"
                        onClick={() => saveInvoiceAmount(row)}
                        disabled={updateTransaction.isPending || Number(amountEdits[row.id] ?? row.amountValue ?? 0) <= 0}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary-200 bg-primary-50 text-primary-700 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                        title="Save amount"
                    >
                        <Save className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <div className="space-y-1">
                    <span className="block font-semibold">{row.amountLabel}</span>
                    {row.currentStatus === 'POSTED' && (
                        <span className="block text-xs font-semibold text-gray-500">
                            Paid Rs {Number(row.paidAmount || 0).toFixed(2)} / Due Rs {Number(row.balanceAmount || 0).toFixed(2)}
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            cell: (row) => (
                <div className="space-y-1">
                    <StatusHighlighter value={row.currentStatus} />
                    {row.currentStatus === 'POSTED' && <StatusHighlighter value={row.paymentStatus} />}
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            cell: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => postInvoice(row)}
                        disabled={
                            row.currentStatus !== 'CREATED' ||
                            approveTransaction.isPending ||
                            updateTransaction.isPending ||
                            Number(amountEdits[row.id] ?? row.amountValue ?? 0) <= 0
                        }
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                    >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Post
                    </button>
                    <button
                        type="button"
                        onClick={() => rejectInvoice(row)}
                        disabled={row.currentStatus !== 'CREATED' || approveTransaction.isPending}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                    </button>
                    <button
                        type="button"
                        onClick={() => openPaymentModal(row)}
                        disabled={row.currentStatus !== 'POSTED' || row.balanceAmount <= 0 || recordPayment.isPending}
                        className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                    >
                        <Receipt className="h-3.5 w-3.5" />
                        Collect
                    </button>
                </div>
            )
        }
    ]

    return (
        <div className="flex h-full min-w-0 flex-col">
            <PageHeader
                title="Invoice"
                breadcrumbs={[{ label: 'Finance' }, { label: 'Invoice' }]}
            />

            <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex max-w-md items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search invoices..."
                        className="w-full bg-transparent text-sm outline-none"
                    />
                </div>
            </div>

            <DataTable
                data={invoices}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                emptyStateMessage="No service invoices available"
            />

            <Modal
                isOpen={Boolean(paymentInvoice)}
                onClose={() => setPaymentInvoice(null)}
                title="Collect Payment"
                type="success"
                confirmLabel="Generate Receipt"
                confirmDisabled={
                    recordPayment.isPending ||
                    !paymentInvoice ||
                    Number(paymentForm.amount) <= 0 ||
                    Number(paymentForm.amount) > Number(paymentInvoice?.balanceAmount || 0) + 0.01
                }
                onConfirm={collectPayment}
            >
                {paymentInvoice && (
                    <div className="mt-4 space-y-4 text-left">
                        <div className="rounded-xl border border-primary-100 bg-primary-50 p-3">
                            <p className="text-sm font-black text-gray-900">{paymentInvoice.receiptNo}</p>
                            <p className="text-xs font-semibold text-gray-600">{paymentInvoice.clientName || 'Client'} - {paymentInvoice.category || 'Service'}</p>
                            <p className="mt-2 text-xs font-bold text-gray-700">
                                Balance: Rs {Number(paymentInvoice.balanceAmount || 0).toFixed(2)}
                            </p>
                        </div>

                        <label className="block">
                            <span className="text-xs font-bold text-gray-700">Payment Amount</span>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={paymentForm.amount}
                                onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
                                className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            />
                        </label>

                        <label className="block">
                            <span className="text-xs font-bold text-gray-700">Payment Mode</span>
                            <select
                                value={paymentForm.mode}
                                onChange={(event) => setPaymentForm((prev) => ({ ...prev, mode: event.target.value }))}
                                className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            >
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Card">Card</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </label>

                        <label className="block">
                            <span className="text-xs font-bold text-gray-700">Receipt Notes</span>
                            <textarea
                                value={paymentForm.remarks}
                                onChange={(event) => setPaymentForm((prev) => ({ ...prev, remarks: event.target.value }))}
                                className="mt-1 min-h-20 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            />
                        </label>
                    </div>
                )}
            </Modal>
        </div>
    )
}
