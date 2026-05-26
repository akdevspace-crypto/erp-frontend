import { useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useWelcomeCalls } from '../hooks/useBusiness'

export function WelcomeCall() {
    const { data: calls, isLoading } = useWelcomeCalls()
    const [searchQuery, setSearchQuery] = useState('')

    const filteredData = (calls || []).filter((item: any) =>
        item.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const columns: Column<any>[] = [
        { key: 'sno', header: 'S.No', cell: (_, index) => <span className="text-gray-500 font-medium text-sm">{index + 1}</span> },
        { key: 'clientRef', header: 'Client Ref. No.', cell: (row) => <span className="text-sm font-semibold text-primary-600">{row.ref || '-'}</span> },
        { key: 'serviceLookingFor', header: 'Service Looking for', cell: (row) => <span className="text-sm font-bold text-gray-800">{row.service || '-'}</span> },
        { key: 'clientDetails', header: 'Client Details', cell: (row) => <span className="text-sm font-medium">{row.clientName || '-'}</span> },
        { key: 'allocatedStatus', header: 'Allocated Status', cell: (row) => <StatusHighlighter value={row.status} /> },
        { key: 'allocatedDetails', header: 'Allocated Details', cell: (row) => <span className="text-sm dark:text-gray-400">{row.notes || '-'}</span> },
        {
            key: 'actions',
            header: 'Actions',
            cell: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => console.log('Schedule', row.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow-sm transition-all active:scale-95"
                    >
                        Schedule
                    </button>
                    <button
                        onClick={() => console.log('Outcome', row.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-sm transition-all active:scale-95"
                    >
                        Outcome
                    </button>
                    <button className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold rounded shadow-sm transition-all active:scale-95">
                        History
                    </button>
                </div>
            )
        }
    ]

    return (
        <div className="flex flex-col h-full bg-gray-50/50 dark:bg-gray-900">
            <PageHeader
                title="Client Service Followup (Allocated)"
                breadcrumbs={[
                    { label: 'Home' },
                    { label: 'Service Followup' }
                ]}
            />

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-4 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-sm font-medium text-gray-600 mb-4 ml-1">Service Followup List</p>
                    <FilterSection
                        searchQuery={searchQuery}
                        onSearchChange={(e) => setSearchQuery(e.target.value)}
                        searchPlaceholder="Search..."
                    />
                </div>

                <div className="p-4">
                    <DataTable
                        data={filteredData}
                        columns={columns}
                        keyExtractor={(item: any) => item.id}
                        emptyStateMessage="No welcome calls found"
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    )
}
