import { useMemo, useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useStaff } from '../hooks/useHR'

export function DocumentTracker() {
    const { data: staff = [] } = useStaff({ includeFormer: true })
    const [searchQuery, setSearchQuery] = useState('')

    const documents = useMemo(() => {
        if (staff.length === 0) return []

        const documentTypes = ['Aadhaar', 'Police Verification', 'Medical Fitness', 'Training Certificate']
        return staff.slice(0, 12).map((s, index) => ({
            id: `${s.id}-doc`,
            empId: s.empId,
            name: s.name,
            documentType: documentTypes[index % documentTypes.length],
            expiryDate: `2026-${String(6 + (index % 6)).padStart(2, '0')}-${String(10 + index).padStart(2, '0')}`,
            status: index % 4 === 0 ? 'Expiring Soon' : index % 5 === 0 ? 'Missing' : 'Valid'
        }))
    }, [staff])

    const filteredData = useMemo(() => {
        return documents.filter((row) =>
            row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.documentType.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [documents, searchQuery])

    const columns: Column<any>[] = [
        { key: 'empId', header: 'Emp ID', sortable: true },
        { key: 'name', header: 'Staff Name', sortable: true },
        { key: 'documentType', header: 'Document' },
        { key: 'expiryDate', header: 'Expiry Date', sortable: true },
        { key: 'status', header: 'Status', cell: (row) => <StatusHighlighter value={row.status} /> }
    ]

    return (
        <div className="flex flex-col h-full space-y-6 bg-transparent dark:bg-black">
            <PageHeader
                title="Document Tracker"
                subtitle="Monitor staff documents, missing records, and expiry alerts."
                breadcrumbs={[{ label: 'Human Resource' }, { label: 'Document Tracker' }]}
            />
            <FilterSection searchQuery={searchQuery} onSearchChange={(e) => setSearchQuery(e.target.value)} searchPlaceholder="Search documents..." />
            <DataTable
                data={filteredData}
                columns={columns}
                keyExtractor={(row) => row.id}
                emptyStateMessage="No document records found"
            />
        </div>
    )
}
