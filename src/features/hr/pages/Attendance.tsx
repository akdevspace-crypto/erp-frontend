import { useMemo, useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useAttendanceLogs } from '../hooks/useHR'

export function Attendance() {
    const { data = [], isLoading } = useAttendanceLogs({ scope: 'all' })
    const [searchQuery, setSearchQuery] = useState('')

    const filteredData = useMemo(() => {
        return data.filter((row) =>
            row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.empId.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [data, searchQuery])

    const columns: Column<any>[] = [
        { key: 'date', header: 'Date', sortable: true },
        { key: 'empId', header: 'Emp ID', sortable: true },
        { key: 'name', header: 'Staff Name', sortable: true },
        { key: 'checkIn', header: 'Check In Time' },
        { key: 'checkOut', header: 'Check Out Time' },
        { key: 'status', header: 'Daily Status', cell: (d) => <StatusHighlighter value={d.status} /> }
    ]

    return (
        <div className="flex flex-col h-full space-y-6 bg-transparent dark:bg-black">
            <PageHeader title="Daily Attendance Logs" breadcrumbs={[{ label: 'Human Resource' }, { label: 'Attendance' }]} />
            <FilterSection searchQuery={searchQuery} onSearchChange={(e) => setSearchQuery(e.target.value)} searchPlaceholder="Search employees..." />
            <DataTable
                data={filteredData}
                columns={columns}
                keyExtractor={(d) => d.id}
                isLoading={isLoading}
                emptyStateMessage="No attendance logs found"
            />
        </div>
    )
}
