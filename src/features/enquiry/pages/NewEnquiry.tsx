import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { useAddEnquiry } from '../hooks/useEnquiry'
import { useUnits } from '../../master/hooks/useUnit'
import { useClientServices } from '../../master/services/client-service'
import { enquirySchema, type EnquiryFormValues } from '../schema'
import { useAuthStore } from '../../../store/authStore'

const fallbackServices = [
    'Home Care',
    'Clinical Care',
    'In-House Assisted Living',
    'Dementia Care',
    'Skilled Nursing',
    'Post Operative Care',
    'Ambulance Support'
]

const defaultValues: EnquiryFormValues = {
    unitId: '',
    service: '',
    mode: 'Call',
    clientName: '',
    mobile: '',
    email: '',
    comments: '',
    status: 'Open',
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientHealthCondition: '',
    clientAddress: '',
    clientLocation: '',
    remarks: ''
}

export function NewEnquiry() {
    const addEnquiry = useAddEnquiry()
    const { data: units = [] } = useUnits()
    const { data: services = [] } = useClientServices()
    const user = useAuthStore((state) => state.user)
    const activeUnitId = useAuthStore((state) => state.activeUnitId)
    const resolvedUnitId = activeUnitId || user?.unitId || ''

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EnquiryFormValues>({
        resolver: zodResolver(enquirySchema),
        defaultValues: {
            ...defaultValues,
            unitId: resolvedUnitId
        }
    })

    const unitOptions = useMemo(() => {
        const apiUnits = units.map(u => ({ value: u.id, label: u.name }))
        if (apiUnits.length > 0) return apiUnits
        if (resolvedUnitId) return [{ value: resolvedUnitId, label: user?.unitAccess?.includes('*') ? 'Current Unit' : 'Assigned Unit' }]
        return []
    }, [resolvedUnitId, units, user?.unitAccess])

    const serviceOptions = useMemo(() => {
        const apiServices = services
            .map(s => String(s.name || s.code || '').trim())
            .filter(Boolean)
            .map(name => ({ value: name, label: name }))

        if (apiServices.length > 0) return apiServices
        return fallbackServices.map(name => ({ value: name, label: name }))
    }, [services])

    useEffect(() => {
        if (resolvedUnitId) setValue('unitId', resolvedUnitId)
    }, [resolvedUnitId, setValue])

    const onSubmit = (data: EnquiryFormValues) => {
        const payload = {
            ...data,
            unitId: data.unitId || resolvedUnitId
        }

        addEnquiry.mutate(payload, {
            onSuccess: () => reset({ ...defaultValues, unitId: resolvedUnitId })
        })
    }

    return (
        <div className="flex h-full w-full min-w-0 flex-col overflow-hidden pb-1 bg-transparent dark:bg-black">
            <PageHeader title="New Enquiry" breadcrumbs={[{ label: 'Enquiry Desk' }, { label: 'New Enquiry' }]} />

            <div className="flex min-h-0 flex-1 flex-col rounded-[24px] border border-white/50 bg-white/60 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-black sm:p-5 2xl:p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-8 overflow-y-auto pb-8 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/10 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
                    <div className="mx-auto mt-2 w-full max-w-none space-y-8 2xl:mt-4">
                        <div>
                            <h3 className="mb-5 border-b dark:border-white/10 pb-3 text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl">Client Basic Details</h3>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3 2xl:gap-6">
                                <Select
                                    label="Unit Name (Branch) *"
                                    {...register('unitId')}
                                    error={errors.unitId?.message}
                                    options={unitOptions}
                                    placeholder="-- Select the Unit Name --"
                                    disabled={unitOptions.length <= 1}
                                />
                                <Select
                                    label="Service Looking for *"
                                    {...register('service')}
                                    error={errors.service?.message}
                                    options={serviceOptions}
                                    placeholder="-- Select the Service Looking for --"
                                />

                                <Select label="Enquiry Mode *" {...register('mode')} error={errors.mode?.message} options={[{ value: 'Call', label: 'Call' }, { value: 'Walk-in', label: 'Walk-in' }, { value: 'Website', label: 'Website' }, { value: 'Reference', label: 'Reference' }]} placeholder="-- Select the Enquiry Mode --" />
                                <div className="hidden 2xl:block" />

                                <Input label="Client Name *" placeholder="Enter Client Full Name" {...register('clientName')} error={errors.clientName?.message} />
                                <Input label="Client Mobile No. *" placeholder="Enter Client Mobile No." {...register('mobile')} error={errors.mobile?.message} />

                                <Input label="Client Email" placeholder="Enter Client Email Address" {...register('email')} error={errors.email?.message} />
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-[#FF0000] dark:text-[#ff4444]">Client Comments</label>
                                    <textarea {...register('comments')} rows={3} placeholder="Enter Client Comments" className="flex w-full rounded-md border border-gray-300 dark:border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100" />
                                </div>

                                <Select
                                    label="Enquiry Status *"
                                    {...register('status')}
                                    error={errors.status?.message}
                                    options={[
                                        { value: 'Emergency', label: 'Emergency → → →' },
                                        { value: 'Important', label: 'Important → →' },
                                        { value: 'Just Enquiry', label: 'Just Enquiry →' },
                                        { value: 'Open', label: 'Open' },
                                        { value: 'In Progress', label: 'In Progress' },
                                        { value: 'Converted', label: 'Converted' },
                                        { value: 'Lost', label: 'Lost' }
                                    ]}
                                    placeholder="-- Select the Enquiry Status --"
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-5 border-b dark:border-white/10 pb-3 text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl">Home Care / In-Patient Details</h3>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4 2xl:gap-6">
                                <Input label="Patient Name *" placeholder="Enter InPatient Full Name" {...register('patientName')} error={errors.patientName?.message} />
                                <Select label="Patient Age" {...register('patientAge')} error={errors.patientAge?.message} options={[{ value: '0 to 10', label: '0 to 10' }, { value: '10 to 18', label: '10 to 18' }, { value: '18 to 30', label: '18 to 30' }, { value: '30 to 45', label: '30 to 45' }, { value: '45 to 60', label: '45 to 60' }, { value: '60+', label: '60+' }]} placeholder="-- Select the Patient Age Group --" />

                                <Select label="Patient Gender" {...register('patientGender')} error={errors.patientGender?.message} options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} placeholder="-- Select the InPatient Gender --" />
                                <Input label="Patient Health Condition" placeholder="Enter InPatient Health Condition" {...register('patientHealthCondition')} error={errors.patientHealthCondition?.message} />
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-5 border-b dark:border-white/10 pb-3 text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl">Advanced Details</h3>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4 2xl:gap-6">
                                <Input label="Client Address" placeholder="Enter Client Full Address" {...register('clientAddress')} error={errors.clientAddress?.message} />
                                <Input label="Client Location (City)" placeholder="Enter Client Location (City Name)" {...register('clientLocation')} error={errors.clientLocation?.message} />

                                <div className="md:col-span-2 2xl:col-span-4">
                                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Remarks (Narration)</label>
                                    <textarea {...register('remarks')} rows={3} placeholder="Enter Client Remarks" className="flex w-full rounded-md border border-gray-300 dark:border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-end gap-3 pt-4 sm:flex-row">
                        <button type="button" onClick={() => reset(defaultValues)} className="rounded border border-gray-300 dark:border-white/10 bg-white dark:bg-transparent px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                            Reset All
                        </button>
                        <button type="submit" disabled={addEnquiry.isPending} className="flex items-center gap-2 rounded bg-gradient-to-r from-[#00b3a7] to-[#01867c] px-6 py-2.5 text-[13.5px] font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,179,167,0.2)] disabled:opacity-50">
                            <Save className="h-4 w-4" />
                            Save Enquiry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
