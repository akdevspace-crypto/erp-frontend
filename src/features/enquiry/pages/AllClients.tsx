import { useMemo, useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useEnquiries } from '../hooks/useEnquiry'
import { useStaff } from '../../hr/hooks/useHR'
import { EnquiryFollowUpModal } from '../components/EnquiryFollowUpModal'
import { hasConfiguredMenuPrivilege } from '../../../lib/permissions'
import { useAuthStore } from '../../../store/authStore'
import type { Staff } from '../../hr/types'

const isActiveStaff = (staff: Staff) =>
    !staff.isDeleted && String(staff.status || '').toLowerCase() !== 'terminated'

const buildStaffOptions = (staffList: Staff[], unitId: string) => {
    const configuredStaff = staffList.filter((staff) => (
        Boolean(staff.user?.id) &&
        Boolean(staff.user?.isActive) &&
        Boolean(staff.user?.role?.id) &&
        hasConfiguredMenuPrivilege(staff.metadata)
    ))
    const sameUnitStaff = staffList.filter((staff) => (
        isActiveStaff(staff) &&
        (!unitId || staff.unitId === unitId)
    ))
    const activeStaff = staffList.filter(isActiveStaff)
    const selectedStaff = configuredStaff.length > 0
        ? configuredStaff
        : sameUnitStaff.length > 0
            ? sameUnitStaff
            : activeStaff

    return selectedStaff.map((staff) => ({
        value: staff.id,
        label: `${staff.name} (ID: ${staff.empId || staff.id})`
    }))
}

export function AllClients() {
    // We map over Enquiries here because the requested layout acts as an aggregated Enquiry view.
    const { data: enquiries = [], isLoading } = useEnquiries()
    const { data: staffList = [] } = useStaff()
    const user = useAuthStore((state) => state.user)
    const activeUnitId = useAuthStore((state) => state.activeUnitId)
    const resolvedUnitId = activeUnitId || user?.unitId || ''

    const [searchQuery, setSearchQuery] = useState('')
    const [unitFilter, setUnitFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [isFollowUpOpen, setIsFollowUpOpen] = useState(false)
    const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null)

    const filteredData = useMemo(() => {
        return enquiries.filter(e => {
            const matchSearch = e.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (e.mobile && e.mobile.includes(searchQuery))
            const matchUnit = unitFilter ? e.unitId === unitFilter : true
            const matchStatus = statusFilter ? e.status === statusFilter : true
            return matchSearch && matchUnit && matchStatus
        })
    }, [enquiries, searchQuery, unitFilter, statusFilter])


    const openFollowUp = (enquiry: any) => {
        setSelectedEnquiry(enquiry)
        setIsFollowUpOpen(true)
    }

    const followUpStaffOptions = useMemo(
        () => buildStaffOptions(staffList, resolvedUnitId),
        [resolvedUnitId, staffList]
    )

    const columns: Column<any>[] = [
        {
            key: 'sno',
            header: 'S.No',
            cell: (_, index) => <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">{index + 1}</span>
        },
        {
            key: 'clientRef',
            header: 'Client Ref. No.',
            cell: (row) => <span className="text-sm font-semibold text-primary-600">REF-{row.id?.substring(0, 5).toUpperCase() || 'N/A'}</span>
        },
        {
            key: 'createdDetails',
            header: 'Created Details',
            cell: (row) => (
                <div className="flex flex-col text-sm">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{new Date(row.createdAt || Date.now()).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(row.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            )
        },
        {
            key: 'serviceLookingFor',
            header: 'Service Looking for',
            cell: (row) => <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{row.service}</span>
        },
        {
            key: 'clientDetails',
            header: 'Client Details',
            cell: (row) => (
                <div className="flex flex-col text-sm">
                    <span className="font-bold text-gray-900 dark:text-white">{row.clientName}</span>
                    <span className="text-xs text-gray-500">{row.mobile}</span>
                </div>
            )
        },
        {
            key: 'enquiryMode',
            header: 'Enquiry Mode',
            cell: (row) => (
                <span className="px-2 py-1 text-[11px] font-bold rounded shadow-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 uppercase border border-blue-100 dark:border-blue-900/50">
                    {row.mode}
                </span>
            )
        },
        { key: 'followupStatus', header: 'Followup Status', cell: (row) => <StatusHighlighter value={row.status} /> },
        {
            key: 'lastFollowedBy',
            header: 'Last Followed By',
            cell: () => <span className="text-sm text-gray-600 dark:text-gray-400">Agent</span>
        },
        {
            key: 'followUpAction',
            header: 'Follow-Up',
            cell: (row) => (
                <button
                    onClick={() => openFollowUp(row)}
                    className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                >
                    Follow-Up
                </button>
            )
        }
    ]

    return (
        <div className="flex flex-col h-full bg-transparent dark:bg-black">
            <PageHeader
                title="Client Enquiry Followup"
                breadcrumbs={[
                    { label: 'Home' },
                    { label: 'Enquiry Followup' }
                ]}
            />

            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white/10 mt-4 overflow-hidden">
                {/* Specific Layout Request: Filter controls separate header structure */}
                <div className="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/2">
                    <p className="text-sm font-medium text-gray-600 mb-4 ml-1">List of Enquiry and Followup Details</p>
                    <FilterSection
                        searchQuery={searchQuery}
                        onSearchChange={(e) => setSearchQuery(e.target.value)}
                        searchPlaceholder="Search..."
                        filters={[
                            {
                                name: 'unitFilter',
                                options: [
                                    { value: '', label: 'Universal Elder Care' }, // Defaulting to acting like 'All' or base unit based on screenshot Dropdown 1
                                    { value: 'U-001', label: 'Sunrise Unit' }
                                ],
                                value: unitFilter,
                                onChange: (e) => setUnitFilter(e.target.value)
                            },
                            {
                                name: 'statusFilter',
                                options: [
                                    { value: '', label: 'All Status' },
                                    { value: 'Open', label: 'Open' },
                                    { value: 'In Progress', label: 'In Progress' },
                                    { value: 'Converted', label: 'Converted' },
                                    { value: 'Lost', label: 'Lost' }
                                ],
                                value: statusFilter,
                                onChange: (e) => setStatusFilter(e.target.value)
                            }
                        ]}
                    />
                </div>

                <div className="p-4">
                    {isLoading ? (
                        <div className="animate-pulse bg-white dark:bg-black border border-gray-200 dark:border-white/10 shadow-sm rounded-lg h-64 p-6" />
                    ) : (
                        <DataTable
                            data={filteredData}
                            columns={columns}
                            keyExtractor={(c) => c.id || Math.random().toString()}
                            emptyStateMessage="No data available in table"
                        />
                    )}
                </div>
            </div>

            <EnquiryFollowUpModal
                isOpen={isFollowUpOpen}
                onClose={() => { setIsFollowUpOpen(false); setSelectedEnquiry(null); }}
                enquiry={selectedEnquiry}
                staffOptions={followUpStaffOptions}
            />

        </div>
    )
}
