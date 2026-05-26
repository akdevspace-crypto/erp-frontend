import { useMemo, useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useStaff } from '../hooks/useHR'

export function ShiftRoster() {
    const { data: staff = [] } = useStaff()
    const [searchQuery, setSearchQuery] = useState('')

    const roster = useMemo(() => {
        if (staff.length === 0) return []

        const shifts = ['Morning', 'Evening', 'Night']
        return staff.slice(0, 12).map((s, index) => ({
            id: `${s.id}-shift`,
            empId: s.empId,
            name: s.name,
            department: s.department,
            shift: shifts[index % shifts.length],
            date: `2026-05-${String(14 + (index % 7)).padStart(2, '0')}`,
            location: index % 2 === 0 ? 'Care Unit' : 'Operations Block',
            status: index % 4 === 0 ? 'Replacement Needed' : 'Assigned'
        }))
    }, [staff])

    const filteredData = useMemo(() => {
        return roster.filter((row) =>
            row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.shift.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [roster, searchQuery])

    const columns: Column<any>[] = [
        { key: 'date', header: 'Date', sortable: true },
        { key: 'shift', header: 'Shift', sortable: true },
        { key: 'name', header: 'Staff Name' },
        { key: 'department', header: 'Department' },
        { key: 'location', header: 'Location' },
        { key: 'status', header: 'Status', cell: (row) => <StatusHighlighter value={row.status} /> }
    ]

    return (
        <div className="flex flex-col h-full space-y-6 bg-transparent dark:bg-black">
            <PageHeader
                title="Shift Roster"
                subtitle="Plan staff shifts and spot replacement gaps."
                breadcrumbs={[{ label: 'Human Resource' }, { label: 'Shift Roster' }]}
            />
            <FilterSection searchQuery={searchQuery} onSearchChange={(e) => setSearchQuery(e.target.value)} searchPlaceholder="Search roster..." />
            <DataTable
                data={filteredData}
                columns={columns}
                keyExtractor={(row) => row.id}
                emptyStateMessage="No shift roster rows found"
            />
        </div>
    )
}
