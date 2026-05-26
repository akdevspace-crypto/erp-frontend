import { useMemo, useState } from 'react'
import { CalendarCheck, ClipboardList, PhoneCall } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { Modal } from '../../../components/Modal'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useConvertToAdmission, useEnquiries } from '../../enquiry/hooks/useEnquiry'
import type { Enquiry } from '../../enquiry/types'

export function ActiveEnquiries() {
    const navigate = useNavigate()
    const { data: enquiries = [], isLoading } = useEnquiries()
    const convertToAdmission = useConvertToAdmission()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
    const [patientName, setPatientName] = useState('')

    const activeEnquiries = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        return enquiries
            .filter((enquiry) => !enquiry.admissionId && enquiry.status !== 'Lost')
            .filter((enquiry) => {
                if (!query) return true
                return [
                    enquiry.refNo,
                    enquiry.clientName,
                    enquiry.mobile,
                    enquiry.service,
                    enquiry.patientName
                ].some((value) => String(value || '').toLowerCase().includes(query))
            })
    }, [enquiries, searchQuery])

    const openAdmissionModal = (enquiry: Enquiry) => {
        setSelectedEnquiry(enquiry)
        setPatientName(enquiry.patientName || enquiry.clientName)
    }

    const handleConvert = () => {
        if (!selectedEnquiry) return
        convertToAdmission.mutate(
            {
                id: selectedEnquiry.id,
                data: {
                    patientName,
                    status: 'ACTIVE'
                }
            },
            {
                onSuccess: () => {
                    setSelectedEnquiry(null)
                    setPatientName('')
                    navigate('/crm/admission-tracking')
                }
            }
        )
    }

    const columns: Column<Enquiry>[] = [
        {
            key: 'refNo',
            header: 'Lead ID',
            sortable: true,
            cell: (enquiry) => (
                <div className="flex flex-col">
                    <span className="font-black text-gray-900 dark:text-gray-100">{enquiry.refNo}</span>
                    <span className="text-xs font-medium text-gray-500">{new Date(enquiry.createdAt).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            key: 'clientName',
            header: 'Client',
            sortable: true,
            cell: (enquiry) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{enquiry.clientName}</span>
                    <span className="text-xs font-semibold text-primary-600">{enquiry.mobile}</span>
                </div>
            )
        },
        {
            key: 'service',
            header: 'Service',
            cell: (enquiry) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{enquiry.service}</span>
                    <span className="text-xs text-gray-500">{enquiry.mode || 'Enquiry'}</span>
                </div>
            )
        },
        {
            key: 'patientName',
            header: 'Patient',
            cell: (enquiry) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{enquiry.patientName || 'Not captured'}</span>
                    <span className="text-xs text-gray-500">{enquiry.patientHealthCondition || 'Health notes pending'}</span>
                </div>
            )
        },
        {
            key: 'automationPriority',
            header: 'Priority',
            cell: (enquiry) => <StatusHighlighter value={enquiry.automationPriority || 'COLD'} />
        },
        {
            key: 'status',
            header: 'Stage',
            cell: (enquiry) => <StatusHighlighter value={enquiry.status} />
        }
    ]

    return (
        <div className="flex h-full flex-col bg-transparent dark:bg-black">
            <PageHeader
                title="Active Enquiries"
                subtitle="Live enquiry pipeline before admission conversion."
                breadcrumbs={[{ label: 'Enquiry Desk' }, { label: 'Active Enquiries' }]}
            />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search lead, client, mobile, service, or patient..."
            />

            <DataTable
                data={activeEnquiries}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                emptyStateMessage="No active enquiries are waiting for admission."
                actionsTitle="Workflow"
                actions={(enquiry) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/crm/enquiry-follow-up')}
                            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-gray-200"
                        >
                            <PhoneCall className="mr-1.5 h-3.5 w-3.5" />
                            Follow Up
                        </button>
                        <button
                            onClick={() => openAdmissionModal(enquiry)}
                            className="inline-flex items-center rounded-lg bg-primary-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-700"
                        >
                            <CalendarCheck className="mr-1.5 h-3.5 w-3.5" />
                            Convert
                        </button>
                    </div>
                )}
            />

            <Modal
                isOpen={Boolean(selectedEnquiry)}
                onClose={() => setSelectedEnquiry(null)}
                title="Convert to Admission"
                type="success"
                confirmLabel={convertToAdmission.isPending ? 'Saving...' : 'Create Admission'}
                onConfirm={handleConvert}
            >
                <div className="mt-3 space-y-4 text-left">
                    <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4 text-sm text-primary-900">
                        <div className="flex items-center gap-2 font-black">
                            <ClipboardList className="h-4 w-4" />
                            {selectedEnquiry?.refNo} - {selectedEnquiry?.clientName}
                        </div>
                        <p className="mt-1 text-xs font-medium">{selectedEnquiry?.service} enquiry will become an active admission.</p>
                    </div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Patient Name
                        <input
                            value={patientName}
                            onChange={(event) => setPatientName(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-white/10 dark:bg-black dark:text-gray-100"
                            placeholder="Enter patient name"
                        />
                    </label>
                </div>
            </Modal>
        </div>
    )
}
