import { useMemo, useState } from 'react'
import { CheckCircle2, CircleDashed, ClipboardList, KeyRound } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { Modal } from '../../../components/Modal'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useAdmissions, useCreateAdmissionClientPortalAccess } from '../../enquiry/hooks/useEnquiry'
import type { AdmissionRecord } from '../../enquiry/types'

const getFormStatus = (admission: AdmissionRecord) => {
    const completed = [
        admission.patientName,
        admission.clientName,
        admission.mobile,
        admission.service,
        admission.patientHealthCondition,
        admission.clientAddress
    ].filter(Boolean).length

    if (completed >= 6) return 'COMPLETE'
    if (completed >= 4) return 'REVIEW'
    return 'PENDING'
}

export function AdmissionForms() {
    const { data: admissions = [], isLoading } = useAdmissions()
    const createPortalAccess = useCreateAdmissionClientPortalAccess()
    const [searchQuery, setSearchQuery] = useState('')
    const [portalAdmission, setPortalAdmission] = useState<AdmissionRecord | null>(null)
    const [portalEmail, setPortalEmail] = useState('')
    const [portalMobile, setPortalMobile] = useState('')
    const [portalPassword, setPortalPassword] = useState('')
    const [portalRoleName, setPortalRoleName] = useState<'Family Member' | 'Client Family Member'>('Family Member')

    const formRows = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        const rows = admissions.map((admission) => ({
            ...admission,
            formStatus: getFormStatus(admission)
        }))

        if (!query) return rows
        return rows.filter((admission) => (
            [
                admission.refNo,
                admission.patientName,
                admission.clientName,
                admission.mobile,
                admission.service,
                admission.formStatus
            ].some((value) => String(value || '').toLowerCase().includes(query))
        ))
    }, [admissions, searchQuery])

    const completeCount = formRows.filter((row) => row.formStatus === 'COMPLETE').length
    const pendingCount = formRows.filter((row) => row.formStatus !== 'COMPLETE').length

    const columns: Column<AdmissionRecord & { formStatus: string }>[] = [
        {
            key: 'refNo',
            header: 'Form ID',
            cell: (admission) => (
                <div className="flex flex-col">
                    <span className="font-black text-gray-900 dark:text-gray-100">FORM-{admission.refNo}</span>
                    <span className="text-xs text-gray-500">Admission {admission.id.slice(0, 8)}</span>
                </div>
            )
        },
        {
            key: 'patientName',
            header: 'Patient',
            sortable: true,
            cell: (admission) => (
                <div className="flex flex-col">
                    <span className="font-bold">{admission.patientName}</span>
                    <span className="text-xs text-gray-500">{admission.patientHealthCondition || 'Health condition pending'}</span>
                </div>
            )
        },
        {
            key: 'clientName',
            header: 'Guardian / Client',
            cell: (admission) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{admission.clientName}</span>
                    <span className="text-xs font-semibold text-primary-600">{admission.mobile}</span>
                </div>
            )
        },
        {
            key: 'service',
            header: 'Care Requirement',
            cell: (admission) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{admission.service}</span>
                    <span className="text-xs text-gray-500">{admission.clientAddress || 'Address pending'}</span>
                </div>
            )
        },
        {
            key: 'formStatus',
            header: 'Form Status',
            cell: (admission) => <StatusHighlighter value={admission.formStatus} />
        }
    ]

    const openPortalAccess = (admission: AdmissionRecord) => {
        setPortalAdmission(admission)
        setPortalEmail(admission.email || '')
        setPortalMobile(admission.mobile || '')
        setPortalPassword('')
        setPortalRoleName('Family Member')
    }

    const handleCreatePortalAccess = () => {
        if (!portalAdmission) return

        createPortalAccess.mutate(
            {
                admissionId: portalAdmission.id,
                data: {
                    email: portalEmail.trim(),
                    mobile: portalMobile.trim(),
                    password: portalPassword,
                    roleName: portalRoleName
                }
            },
            {
                onSuccess: () => {
                    setPortalAdmission(null)
                    setPortalPassword('')
                }
            }
        )
    }

    return (
        <div className="flex h-full flex-col bg-transparent dark:bg-black">
            <PageHeader
                title="Admission Forms"
                subtitle="Admission document readiness based on converted enquiry data."
                breadcrumbs={[{ label: 'UEO' }, { label: 'Admission Forms' }]}
            />

            <div className="mb-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="h-5 w-5 text-primary-600" />
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{formRows.length}</p>
                            <p className="text-xs font-bold text-gray-500">Forms Generated</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{completeCount}</p>
                            <p className="text-xs font-bold text-gray-500">Complete</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
                    <div className="flex items-center gap-3">
                        <CircleDashed className="h-5 w-5 text-orange-500" />
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{pendingCount}</p>
                            <p className="text-xs font-bold text-gray-500">Needs Review</p>
                        </div>
                    </div>
                </div>
            </div>

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search form, patient, client, mobile, service, or status..."
            />

            <DataTable
                data={formRows}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                emptyStateMessage="No admission forms are available yet."
                actionsTitle="Portal Access"
                actions={(admission) => (
                    <button
                        onClick={() => openPortalAccess(admission)}
                        className="inline-flex items-center rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-black text-primary-700 hover:border-primary-400 hover:bg-primary-100"
                    >
                        <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                        Enable Login
                    </button>
                )}
            />

            <Modal
                isOpen={Boolean(portalAdmission)}
                onClose={() => setPortalAdmission(null)}
                title="Client Portal Access"
                type="info"
                confirmLabel={createPortalAccess.isPending ? 'Creating...' : 'Create Access'}
                confirmDisabled={createPortalAccess.isPending || !portalEmail.trim() || portalPassword.length < 6}
                onConfirm={handleCreatePortalAccess}
            >
                <div className="mt-3 space-y-4 text-left">
                    <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4 text-sm text-primary-900">
                        <p className="font-black">{portalAdmission?.clientName}</p>
                        <p className="mt-1 text-xs font-medium">
                            {portalAdmission?.refNo} - {portalAdmission?.patientName} - {portalAdmission?.service}
                        </p>
                    </div>

                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Role
                        <select
                            value={portalRoleName}
                            onChange={(event) => setPortalRoleName(event.target.value as 'Family Member' | 'Client Family Member')}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-white/10 dark:bg-black dark:text-gray-100"
                        >
                            <option value="Family Member">Family Member</option>
                            <option value="Client Family Member">Client Family Member</option>
                        </select>
                    </label>

                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Login Email
                        <input
                            value={portalEmail}
                            onChange={(event) => setPortalEmail(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-white/10 dark:bg-black dark:text-gray-100"
                            placeholder="client@example.com"
                        />
                    </label>

                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Mobile
                        <input
                            value={portalMobile}
                            onChange={(event) => setPortalMobile(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-white/10 dark:bg-black dark:text-gray-100"
                            placeholder="Client mobile number"
                        />
                    </label>

                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Temporary Password
                        <input
                            type="password"
                            value={portalPassword}
                            onChange={(event) => setPortalPassword(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-white/10 dark:bg-black dark:text-gray-100"
                            placeholder="Minimum 6 characters"
                        />
                    </label>

                    <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                        Use the same client email or mobile so the family portal shows only this client&apos;s live data.
                    </p>
                </div>
            </Modal>
        </div>
    )
}
