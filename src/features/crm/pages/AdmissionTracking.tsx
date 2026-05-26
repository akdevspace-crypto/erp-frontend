import { useMemo, useState } from 'react'
import { FileText, HeartPulse, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { Modal } from '../../../components/Modal'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useAdmissions } from '../../enquiry/hooks/useEnquiry'
import type { AdmissionRecord } from '../../enquiry/types'
import { useCreateAllocation } from '../../allocation/hooks/useAllocation'
import { useUnits } from '../../master/hooks/useUnit'

const careTypeOptions = [
    { value: 'HOME_CARE', label: 'Home Care' },
    { value: 'CLINICAL', label: 'Clinical Care' },
    { value: 'IN_HOUSE', label: 'In-House Care' },
    { value: 'OTHERS', label: 'Other / Ambulance Support' }
]

export function AdmissionTracking() {
    const navigate = useNavigate()
    const { data: admissions = [], isLoading } = useAdmissions()
    const { data: units = [] } = useUnits()
    const createAllocation = useCreateAllocation()
    const [searchQuery, setSearchQuery] = useState('')
    const [handoffAdmission, setHandoffAdmission] = useState<AdmissionRecord | null>(null)
    const [careType, setCareType] = useState('HOME_CARE')
    const [handoffNotes, setHandoffNotes] = useState('')

    const targetCareUnitId = useMemo(() => {
        const careUnit = units.find((unit) => (
            unit.unitId === 'UHC' ||
            unit.shortName === 'UHC' ||
            unit.name.toLowerCase().includes('health care')
        ))

        return careUnit?.id || null
    }, [units])

    const filteredAdmissions = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return admissions

        return admissions.filter((admission) => (
            [
                admission.refNo,
                admission.patientName,
                admission.clientName,
                admission.mobile,
                admission.service,
                admission.status
            ].some((value) => String(value || '').toLowerCase().includes(query))
        ))
    }, [admissions, searchQuery])

    const openHandoff = (admission: AdmissionRecord) => {
        setHandoffAdmission(admission)
        setCareType('HOME_CARE')
        setHandoffNotes(admission.patientHealthCondition || admission.remarks || '')
    }

    const handleHandoff = () => {
        if (!handoffAdmission) return
        const allocationRoutes: Record<string, string> = {
            HOME_CARE: '/allocation/home-care',
            CLINICAL: '/allocation/clinical-care',
            IN_HOUSE: '/allocation/inhouse-care',
            OTHERS: '/allocation/others'
        }

        createAllocation.mutate(
            {
                enquiryId: handoffAdmission.enquiryId,
                targetUnitId: targetCareUnitId || undefined,
                staffId: null,
                type: careType,
                status: 'PENDING',
                startDate: new Date().toISOString(),
                metadata: {
                    admissionId: handoffAdmission.id,
                    patientName: handoffAdmission.patientName,
                    clientName: handoffAdmission.clientName,
                    service: handoffAdmission.service,
                    targetUnitId: targetCareUnitId || null,
                    healthCondition: handoffAdmission.patientHealthCondition || null,
                    notes: handoffNotes || null,
                    handoffSource: 'ADMISSION_TRACKING'
                }
            },
            {
                onSuccess: () => {
                    setHandoffAdmission(null)
                    setHandoffNotes('')
                    navigate(allocationRoutes[careType] || '/allocation/home-care')
                }
            }
        )
    }

    const columns: Column<AdmissionRecord>[] = [
        {
            key: 'refNo',
            header: 'Admission Source',
            sortable: true,
            cell: (admission) => (
                <div className="flex flex-col">
                    <span className="font-black text-gray-900 dark:text-gray-100">{admission.refNo}</span>
                    <span className="text-xs font-medium text-gray-500">From enquiry</span>
                </div>
            )
        },
        {
            key: 'patientName',
            header: 'Patient',
            sortable: true,
            cell: (admission) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{admission.patientName}</span>
                    <span className="text-xs text-gray-500">{admission.patientAge || 'Age not captured'} · {admission.patientGender || 'Gender not captured'}</span>
                </div>
            )
        },
        {
            key: 'clientName',
            header: 'Client Contact',
            cell: (admission) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{admission.clientName}</span>
                    <span className="text-xs font-semibold text-primary-600">{admission.mobile}</span>
                </div>
            )
        },
        {
            key: 'service',
            header: 'Service',
            cell: (admission) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{admission.service}</span>
                    <span className="text-xs text-gray-500">{admission.serviceCategory || admission.mode || 'Admission service'}</span>
                </div>
            )
        },
        {
            key: 'admittedAt',
            header: 'Admitted On',
            sortable: true,
            cell: (admission) => (
                <span className="font-medium">
                    {new Date(admission.admittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            cell: (admission) => <StatusHighlighter value={admission.status} />
        }
    ]

    return (
        <div className="flex h-full flex-col bg-transparent dark:bg-black">
            <PageHeader
                title="Admission Tracking"
                subtitle="Converted enquiries now tracked as active admissions."
                breadcrumbs={[{ label: 'UEO' }, { label: 'Admission Tracking' }]}
            />

            <div className="mb-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                            <HeartPulse className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{admissions.length}</p>
                            <p className="text-xs font-bold text-gray-500">Total Admissions</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                    <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{admissions.filter((item) => item.status === 'ACTIVE').length}</p>
                    <p className="text-xs font-bold text-gray-500">Active Cases</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary-600" />
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{admissions.filter((item) => !item.patientHealthCondition).length}</p>
                            <p className="text-xs font-bold text-gray-500">Clinical Notes Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search admission, patient, client, mobile, or service..."
            />

            <DataTable
                data={filteredAdmissions}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                emptyStateMessage="No admissions have been created from enquiries yet."
                actionsTitle="Handoff"
                actions={(admission) => (
                    <button
                        onClick={() => openHandoff(admission)}
                        className="inline-flex items-center rounded-lg bg-primary-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-700"
                    >
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                        Assign Care
                    </button>
                )}
            />

            <Modal
                isOpen={Boolean(handoffAdmission)}
                onClose={() => setHandoffAdmission(null)}
                title="Admission Handoff"
                type="info"
                confirmLabel={createAllocation.isPending ? 'Assigning...' : 'Create Handoff'}
                onConfirm={handleHandoff}
            >
                <div className="mt-3 space-y-4 text-left">
                    <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4 text-sm text-primary-900">
                        <p className="font-black">{handoffAdmission?.patientName}</p>
                        <p className="mt-1 text-xs font-medium">
                            {handoffAdmission?.refNo} · {handoffAdmission?.service} · {handoffAdmission?.clientName}
                        </p>
                    </div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Care Type
                        <select
                            value={careType}
                            onChange={(event) => setCareType(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-white/10 dark:bg-black dark:text-gray-100"
                        >
                            {careTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Handoff Notes
                        <textarea
                            value={handoffNotes}
                            onChange={(event) => setHandoffNotes(event.target.value)}
                            rows={3}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-white/10 dark:bg-black dark:text-gray-100"
                            placeholder="Care requirement, urgency, preferred timing, or patient condition"
                        />
                    </label>
                </div>
            </Modal>
        </div>
    )
}
