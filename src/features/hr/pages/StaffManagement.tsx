import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Edit2, Eye, Trash2, Upload, X } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { Drawer } from '../../../components/Drawer'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { staffSchema, type StaffFormInput, type StaffFormValues } from '../schema'
import type { Staff } from '../types'
import { useStaff, useAddStaff, useUpdateStaff, useDeleteStaff, useRoles } from '../hooks/useHR'
import { useUnits } from '../../master/hooks/useUnit'
import { useAuthStore } from '../../../store/authStore'

const getStaffMetadata = (staff?: Staff | null) => (
    staff?.metadata && typeof staff.metadata === 'object' ? staff.metadata : {}
)

const getStaffDocument = (staff: Staff, key: 'aadhaarDocument' | 'resumeDocument') => {
    const metadata = getStaffMetadata(staff)
    return metadata.documents?.[key]
}

const isExStaffRecord = (staff: Staff) => {
    const status = String(staff.status || 'Working').toLowerCase()
    return Boolean(staff.isDeleted) || status.includes('resign') || status.includes('term')
}

const money = (value: unknown) => {
    const amount = Number(value || 0)
    return amount > 0 ? `Rs ${amount.toLocaleString('en-IN')}` : '-'
}

export function StaffManagement() {
    const { data: staffData = [] } = useStaff({ includeFormer: true })
    const { data: units = [] } = useUnits()
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || '')
    const setActiveUnitId = useAuthStore((state) => state.setActiveUnitId)
    const addStaff = useAddStaff()
    const updateStaff = useUpdateStaff()
    const deleteStaff = useDeleteStaff()
    const { data: roleList = [] } = useRoles()
    const unitOptions = useMemo(() => {
        const options = units.map((unit) => ({
            value: unit.id,
            label: unit.location?.label ? `${unit.name} - ${unit.location.label}` : unit.name
        }))

        return [
            { value: '', label: '-- Select Unit --' },
            ...options
        ]
    }, [units])
    const unitLabelById = useMemo(
        () => new Map(units.map((unit) => [unit.id, unit.location?.label ? `${unit.name}\n${unit.location.label}` : unit.name])),
        [units]
    )
    const activeUnitLabel = unitLabelById.get(activeUnitId)?.replace('\n', ' - ') || 'Selected Unit'
    const bloodGroupOptions = useMemo(() => ([
        { value: '', label: '-- Select the Blood Group --' },
        { value: 'A+', label: 'A+' },
        { value: 'A-', label: 'A-' },
        { value: 'B+', label: 'B+' },
        { value: 'B-', label: 'B-' },
        { value: 'AB+', label: 'AB+' },
        { value: 'AB-', label: 'AB-' },
        { value: 'O+', label: 'O+' },
        { value: 'O-', label: 'O-' }
    ]), [])
    const loginRoleOptions = useMemo(() => {
        const fallbackRoles = [
            { id: 'Admin', name: 'Admin' },
            { id: 'Employee', name: 'Employee' }
        ]

        const normalizedRoleNames = new Set(
            roleList
                .map((role) => String(role.name || '').trim().toLowerCase())
                .filter(Boolean)
        )

        const mergedRoles = [
            ...roleList,
            ...fallbackRoles.filter((role) => !normalizedRoleNames.has(role.name.toLowerCase()))
        ]

        return [
            { value: '', label: '-- Select Role --' },
            ...mergedRoles.map((role) => ({
                value: String(role.id || role.name),
                label: role.name
            }))
        ]
    }, [roleList])

    const [viewType, setViewType] = useState<'Active' | 'ExStaff'>('Active')
    const [searchQuery, setSearchQuery] = useState('')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [editingStaffId, setEditingStaffId] = useState<string | null>(null)
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
    const [profilePreview, setProfilePreview] = useState('')
    const [cameraOpen, setCameraOpen] = useState(false)
    const [cameraError, setCameraError] = useState('')
    const [aadhaarDocumentName, setAadhaarDocumentName] = useState('')
    const [resumeDocumentName, setResumeDocumentName] = useState('')
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const { register, watch, setValue, handleSubmit, reset, setError, clearErrors, formState: { errors } } = useForm<StaffFormInput, any, StaffFormValues>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            empId: '', photoUrl: '', name: '', role: '', department: '', unitId: '',
            phone: '', email: '', officialPhone: '', officialEmail: '',
            monthlySalary: '', fixedAllowance: '', fixedDeduction: '', salaryType: 'Monthly',
            exitDate: '', exitReason: '', exitRemarks: '',
            settlementStatus: 'Pending', settlementLastSalary: '', settlementAllowance: '', settlementDeduction: '', settlementPayable: '',
            joiningDate: '', gender: '', address: '', bloodGroup: '',
            languageKnown: '', dateOfBirth: '', maritalStatus: '', aadhaarNo: '',
            status: 'Working',
            createLogin: false,
            loginEmail: '',
            loginPassword: '',
            loginRoleId: ''
        }
    })

    const createLoginEnabled = watch('createLogin')

    const suggestUniqueLoginEmail = () => {
        const rawName = String(watch('name') || 'staff')
        const slug = rawName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '.')
            .replace(/^\.+|\.+$/g, '') || 'staff'
        const suffix = Date.now().toString().slice(-5)

        setValue('loginEmail', `${slug}.${suffix}@staff.unisenth.local`, { shouldDirty: true, shouldValidate: true })
        clearErrors('loginEmail')
    }

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null
        }

        setCameraOpen(false)
    }

    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [])

    useEffect(() => {
        if (!isDrawerOpen) {
            stopCamera()
            setCameraError('')
        }
    }, [isDrawerOpen])

    const resizeImageToDataUrl = (source: string): Promise<string> => new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => {
            const maxSize = 720
            const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
            const width = Math.max(1, Math.round(image.width * scale))
            const height = Math.max(1, Math.round(image.height * scale))
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const context = canvas.getContext('2d')

            if (!context) {
                reject(new Error('Canvas not available'))
                return
            }

            context.drawImage(image, 0, 0, width, height)
            resolve(canvas.toDataURL('image/jpeg', 0.85))
        }
        image.onerror = () => reject(new Error('Image load failed'))
        image.src = source
    })

    const readFileAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = () => reject(new Error('File read failed'))
        reader.readAsDataURL(file)
    })

    const setProfilePhoto = (photoUrl: string) => {
        setProfilePreview(photoUrl)
        setValue('photoUrl', photoUrl, { shouldDirty: true })
    }

    const handleProfileFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            window.alert('Please choose an image file only.')
            event.target.value = ''
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            window.alert('Profile photo must be 2MB or smaller.')
            event.target.value = ''
            return
        }

        try {
            const rawDataUrl = await readFileAsDataUrl(file)
            const optimizedDataUrl = await resizeImageToDataUrl(rawDataUrl)
            setProfilePhoto(optimizedDataUrl)
        } catch (error) {
            console.error('Failed to process profile photo', error)
            window.alert('Could not process the selected image.')
        } finally {
            event.target.value = ''
        }
    }

    const openCamera = async () => {
        try {
            setCameraError('')
            stopCamera()
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            streamRef.current = stream
            setCameraOpen(true)

            requestAnimationFrame(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }
            })
        } catch (error) {
            console.error('Webcam unavailable', error)
            setCameraError('Could not access the webcam. Please allow camera permission and try again.')
        }
    }

    const capturePhoto = async () => {
        const video = videoRef.current
        if (!video || !video.videoWidth || !video.videoHeight) return

        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const context = canvas.getContext('2d')
        if (!context) return

        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        try {
            const optimizedDataUrl = await resizeImageToDataUrl(canvas.toDataURL('image/jpeg', 0.9))
            setProfilePhoto(optimizedDataUrl)
            stopCamera()
        } catch (error) {
            console.error('Failed to capture webcam image', error)
            window.alert('Could not capture photo from webcam.')
        }
    }

    const clearProfilePhoto = () => {
        setProfilePreview('')
        setValue('photoUrl', '', { shouldDirty: true })
        stopCamera()
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleDocumentSelection = (
        event: React.ChangeEvent<HTMLInputElement>,
        field: 'aadhaarDocument' | 'resumeDocument',
        setName: (name: string) => void,
        allowedTypes: string[],
        maxSizeMb = 5
    ) => {
        const file = event.target.files?.[0]
        if (!file) {
            setValue(field, undefined, { shouldDirty: true })
            clearErrors(field)
            setName('')
            return
        }

        if (!allowedTypes.includes(file.type)) {
            window.alert('Invalid document type selected.')
            event.target.value = ''
            return
        }

        if (file.size > maxSizeMb * 1024 * 1024) {
            window.alert(`Document must be ${maxSizeMb}MB or smaller.`)
            event.target.value = ''
            return
        }

        setValue(field, file, { shouldDirty: true })
        clearErrors(field)
        setName(file.name)
    }

    const filteredData = staffData.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.empId.toLowerCase().includes(searchQuery.toLowerCase())

        const isExStaff = isExStaffRecord(s);
        const matchesView = viewType === 'ExStaff' ? isExStaff : !isExStaff;

        return matchesSearch && matchesView;
    })

    const activeStaffCount = staffData.filter((staff) => !isExStaffRecord(staff)).length
    const exStaffCount = staffData.filter(isExStaffRecord).length
    const loginEnabledCount = staffData.filter((staff) => Boolean(staff.user?.isActive)).length
    const pendingDocumentCount = staffData.filter((staff) => !getStaffDocument(staff, 'aadhaarDocument') || !getStaffDocument(staff, 'resumeDocument')).length

    const handleAdd = () => {
        setEditingStaffId(null)
        reset({
            empId: '', photoUrl: '', name: '', role: '', department: '', unitId: activeUnitId,
            phone: '', email: '', officialPhone: '', officialEmail: '',
            monthlySalary: '', fixedAllowance: '', fixedDeduction: '', salaryType: 'Monthly',
            exitDate: '', exitReason: '', exitRemarks: '',
            settlementStatus: 'Pending', settlementLastSalary: '', settlementAllowance: '', settlementDeduction: '', settlementPayable: '',
            joiningDate: '', gender: '', address: '', bloodGroup: '',
            languageKnown: '', dateOfBirth: '', maritalStatus: '', aadhaarNo: '',
            aadhaarDocument: undefined,
            resumeDocument: undefined,
            status: 'Working',
            createLogin: false,
            loginEmail: '',
            loginPassword: '',
            loginRoleId: ''
        })
        setProfilePreview('')
        setAadhaarDocumentName('')
        setResumeDocumentName('')
        setCameraError('')
        clearErrors()
        stopCamera()
        setIsDrawerOpen(true)
    }

    const handleEdit = (s: Staff) => {
        setEditingStaffId(s.id)
        // map existing data
        reset({
            empId: s.empId || '',
            photoUrl: s.photoUrl || '',
            name: s.name,
            role: s.role,
            department: s.department,
            unitId: s.unitId || '',
            phone: s.phone,
            email: s.email || '',
            officialPhone: (s as any).metadata?.officialPhone || '',
            officialEmail: (s as any).metadata?.officialEmail || '',
            monthlySalary: String((s as any).metadata?.payroll?.monthlySalary || ''),
            fixedAllowance: String((s as any).metadata?.payroll?.fixedAllowance || ''),
            fixedDeduction: String((s as any).metadata?.payroll?.fixedDeduction || ''),
            salaryType: (s as any).metadata?.payroll?.salaryType || 'Monthly',
            exitDate: (s as any).metadata?.exit?.date || '',
            exitReason: (s as any).metadata?.exit?.reason || '',
            exitRemarks: (s as any).metadata?.exit?.remarks || '',
            settlementStatus: (s as any).metadata?.finalSettlement?.status || 'Pending',
            settlementLastSalary: String((s as any).metadata?.finalSettlement?.lastSalary || ''),
            settlementAllowance: String((s as any).metadata?.finalSettlement?.allowance || ''),
            settlementDeduction: String((s as any).metadata?.finalSettlement?.deduction || ''),
            settlementPayable: String((s as any).metadata?.finalSettlement?.payable || ''),
            joiningDate: s.joiningDate,
            gender: (s as any).metadata?.gender || '',
            address: (s as any).metadata?.address || '',
            bloodGroup: (s as any).metadata?.bloodGroup || '',
            languageKnown: (s as any).metadata?.languageKnown || '',
            dateOfBirth: (s as any).metadata?.dateOfBirth || '',
            maritalStatus: (s as any).metadata?.maritalStatus || '',
            aadhaarNo: (s as any).metadata?.aadhaarNo || '',
            aadhaarDocument: undefined,
            resumeDocument: undefined,
            status: (s.status === 'Resigned' || s.status === 'Terminated' ? s.status : 'Working') as any,
            createLogin: false,
            loginEmail: '',
            loginPassword: '',
            loginRoleId: ''
        })
        setProfilePreview(s.photoUrl || '')
        setAadhaarDocumentName((s as any).metadata?.documents?.aadhaarDocument?.fileName || '')
        setResumeDocumentName((s as any).metadata?.documents?.resumeDocument?.fileName || '')
        setCameraError('')
        clearErrors()
        stopCamera()
        setIsDrawerOpen(true)
    }

    const handleView = (s: Staff) => {
        setSelectedStaff(s)
        setIsViewOpen(true)
    }

    const getServerFieldName = (pathValue: unknown): keyof StaffFormValues | null => {
        const path = Array.isArray(pathValue) ? pathValue[pathValue.length - 1] : pathValue
        const normalizedPath = typeof path === 'string' ? path : ''

        if (!normalizedPath) return null

        const fieldMap: Record<string, keyof StaffFormValues> = {
            empId: 'empId',
            firstName: 'name',
            lastName: 'name',
            designation: 'role',
            department: 'department',
            unitId: 'unitId',
            phone: 'phone',
            email: 'email',
            joiningDate: 'joiningDate',
            gender: 'gender',
            address: 'address',
            bloodGroup: 'bloodGroup',
            languageKnown: 'languageKnown',
            dateOfBirth: 'dateOfBirth',
            maritalStatus: 'maritalStatus',
            aadhaarNo: 'aadhaarNo',
            aadhaarDocument: 'aadhaarDocument',
            resumeDocument: 'resumeDocument',
            createLogin: 'createLogin',
            loginEmail: 'loginEmail',
            loginPassword: 'loginPassword',
            loginRoleId: 'loginRoleId',
            roleId: 'loginRoleId',
            exitDate: 'exitDate',
            exitReason: 'exitReason',
            exitRemarks: 'exitRemarks',
            settlementStatus: 'settlementStatus',
            settlementLastSalary: 'settlementLastSalary',
            settlementAllowance: 'settlementAllowance',
            settlementDeduction: 'settlementDeduction',
            settlementPayable: 'settlementPayable'
        }

        return fieldMap[normalizedPath] || null
    }

    const focusField = (fieldName: keyof StaffFormValues) => {
        const element = document.querySelector<HTMLElement>(`[name="${fieldName}"]`)
        if (!element) return

        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
    }

    const applyServerErrors = (error: any) => {
        clearErrors()

        const responseData = error?.response?.data
        const issues = Array.isArray(responseData?.errors) ? responseData.errors : []
        let firstField: keyof StaffFormValues | null = null

        for (const issue of issues) {
            const fieldName = getServerFieldName(issue?.path)
            const message = issue?.message || responseData?.message || 'Please check this field.'

            if (!fieldName) continue

            setError(fieldName, { type: 'server', message })
            if (!firstField) firstField = fieldName
        }

        if (!firstField) {
            const fallbackMessage = String(responseData?.message || error?.message || 'Failed to save staff details.')
            const lowerMessage = fallbackMessage.toLowerCase()

            if (lowerMessage.includes('aadhaar document')) {
                firstField = 'aadhaarDocument'
                setError('aadhaarDocument', { type: 'server', message: fallbackMessage })
            } else if (lowerMessage.includes('resume')) {
                firstField = 'resumeDocument'
                setError('resumeDocument', { type: 'server', message: fallbackMessage })
            } else if (lowerMessage.includes('aadhaar')) {
                firstField = 'aadhaarNo'
                setError('aadhaarNo', { type: 'server', message: fallbackMessage })
            } else if (lowerMessage.includes('login email')) {
                firstField = 'loginEmail'
                setError('loginEmail', { type: 'server', message: fallbackMessage })
            } else if (lowerMessage.includes('email is already in use')) {
                firstField = createLoginEnabled ? 'loginEmail' : 'email'
                setError(firstField, {
                    type: 'server',
                    message: createLoginEnabled
                        ? 'Login email is already in use. Use a different login email or uncheck Create Login.'
                        : fallbackMessage
                })
            } else if (lowerMessage.includes('login password')) {
                firstField = 'loginPassword'
                setError('loginPassword', { type: 'server', message: fallbackMessage })
            } else if (lowerMessage.includes('role')) {
                firstField = 'loginRoleId'
                setError('loginRoleId', { type: 'server', message: fallbackMessage })
            } else {
                setError('root.server' as any, { type: 'server', message: fallbackMessage })
            }
        }

        if (firstField) {
            window.setTimeout(() => focusField(firstField), 0)
        }
    }

    const onSubmit = (formData: StaffFormValues) => {
        clearErrors()
        const existingMetadata = getStaffMetadata(staffData.find((staff) => staff.id === editingStaffId))
        const isLeavingStaff = formData.status === 'Resigned' || formData.status === 'Terminated'
        const exitMetadata = isLeavingStaff ? {
            ...(existingMetadata.exit && typeof existingMetadata.exit === 'object' ? existingMetadata.exit : {}),
            date: formData.exitDate || new Date().toISOString().split('T')[0],
            reason: formData.exitReason || '',
            remarks: formData.exitRemarks || '',
            recordedAt: new Date().toISOString()
        } : existingMetadata.exit
        const settlementMetadata = isLeavingStaff ? {
            ...(existingMetadata.finalSettlement && typeof existingMetadata.finalSettlement === 'object' ? existingMetadata.finalSettlement : {}),
            status: formData.settlementStatus || 'Pending',
            lastSalary: Number(formData.settlementLastSalary || 0),
            allowance: Number(formData.settlementAllowance || 0),
            deduction: Number(formData.settlementDeduction || 0),
            payable: Number(formData.settlementPayable || 0),
            recordedAt: new Date().toISOString()
        } : existingMetadata.finalSettlement

        const payload = {
            ...formData,
            photoUrl: formData.photoUrl || profilePreview || undefined,
            // Pack new optional fields into metadata for compatibility with the generic backend endpoint context
            metadata: {
                ...existingMetadata,
                officialPhone: formData.officialPhone,
                officialEmail: formData.officialEmail,
                payroll: {
                    ...(existingMetadata.payroll && typeof existingMetadata.payroll === 'object' ? existingMetadata.payroll : {}),
                    monthlySalary: Number(formData.monthlySalary || 0),
                    fixedAllowance: Number(formData.fixedAllowance || 0),
                    fixedDeduction: Number(formData.fixedDeduction || 0),
                    salaryType: formData.salaryType || 'Monthly'
                },
                ...(exitMetadata ? { exit: exitMetadata } : {}),
                ...(settlementMetadata ? { finalSettlement: settlementMetadata } : {}),
                gender: formData.gender,
                address: formData.address,
                bloodGroup: formData.bloodGroup,
                languageKnown: formData.languageKnown,
                dateOfBirth: formData.dateOfBirth,
                maritalStatus: formData.maritalStatus,
                aadhaarNo: formData.aadhaarNo
            }
        }

        if (editingStaffId) {
            updateStaff.mutate({ staffId: editingStaffId, data: payload }, {
                onSuccess: () => setIsDrawerOpen(false),
                onError: applyServerErrors
            })
        } else {
            addStaff.mutate(payload, {
                onSuccess: (createdStaff) => {
                    if (createdStaff.unitId) {
                        setActiveUnitId(createdStaff.unitId)
                    }
                    setIsDrawerOpen(false)
                },
                onError: applyServerErrors
            })
        }
    }

    const columns: Column<Staff>[] = [
        { key: 'sno', header: 'S.No', cell: () => null, sortable: false },
        {
            key: 'unit', header: 'Unit Name', cell: (s) => (
                <div className="flex flex-col">
                    {(() => {
                        const label = unitLabelById.get(s.unitId) || 'Unknown Unit'
                        const [unitName, locationName] = label.split('\n')

                        return (
                            <>
                                <span className="text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">{unitName}</span>
                                {locationName && (
                                    <span className="text-xs text-gray-500">{locationName}</span>
                                )}
                            </>
                        )
                    })()}
                </div>
            )
        },
        {
            key: 'photo', header: 'Staff Photo', cell: (s) => (
                s.photoUrl ? (
                    <img src={s.photoUrl} alt={s.name} className="h-8 w-8 rounded-full object-cover border border-gray-200 shrink-0" />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">IMG</div>
                )
            )
        },
        {
            key: 'name', header: 'Staff Name & Ref. ID', cell: (s) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{s.name}</span>
                    <span className="text-xs text-gray-500 font-medium">ID: {s.empId || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'designation', header: 'Staff Designation', cell: (s) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{s.role}</span>
                    <span className="text-xs text-gray-500">{s.department}</span>
                </div>
            )
        },
        {
            key: 'erpAccess', header: 'ERP Access', cell: (s) => (
                <div className="flex flex-col items-start gap-1">
                    <StatusHighlighter value={s.user?.isActive ? 'Login Active' : s.user ? 'Login Disabled' : 'No Login'} />
                    {s.user?.role?.name ? <span className="text-[10px] font-semibold text-gray-500">{s.user.role.name}</span> : null}
                </div>
            )
        },
        { key: 'joiningDate', header: 'Date of Joining', cell: (s) => <span className="text-sm font-medium">{s.joiningDate || '-'}</span> },
        {
            key: 'contact', header: 'Staff Contact No.', cell: (s) => (
                <div className="flex flex-col text-xs text-gray-500">
                    <span>Personal : <span className="text-blue-500 font-medium">{s.phone}</span></span>
                </div>
            )
        },
        {
            key: 'status', header: 'Status', cell: (s) => {
                const isEx = Boolean(s.isDeleted) || viewType === 'ExStaff' || s.status === 'Resigned' || s.status === 'Terminated';
                const exitDate = getStaffMetadata(s).exit?.date || s.deletedAt?.split?.('T')?.[0] || '-'
                return isEx ? (
                    <div className="flex flex-col items-start gap-1">
                        <StatusHighlighter value={s.isDeleted ? 'Archived' : (s.status || 'Ex-Staff')} />
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Exit: {exitDate}</span>
                    </div>
                ) : (
                    <StatusHighlighter value="Working" />
                )
            }
        },
        {
            key: 'action', header: 'Action', cell: (s) => (
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                    <button onClick={() => handleView(s)} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded hover:bg-blue-600 transition shadow-sm"><Eye className="w-3.5 h-3.5" /> View</button>
                    <button onClick={() => handleEdit(s)} className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-500 text-white text-xs font-semibold rounded hover:bg-teal-600 transition shadow-sm"><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={() => { if (window.confirm('Are you sure you want to delete this staff member?')) deleteStaff.mutate(s.id) }} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 text-white text-xs font-semibold rounded hover:bg-red-600 transition shadow-sm"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
            )
        }
    ]

    columns[0].cell = (item) => filteredData.findIndex((a: any) => a.id === item.id) + 1

    return (
        <div className="flex h-full min-w-0 flex-col space-y-4 bg-transparent dark:bg-black sm:space-y-6">
            <PageHeader title="Staff Management" breadcrumbs={[{ label: 'Home' }, { label: 'Staff Management' }]} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-black p-4 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm gap-4 2xl:p-5">
                <div className="text-gray-900 font-medium tracking-wide text-sm">{viewType === 'ExStaff' ? "List of Ex-Staff's" : "List of Staff's"}</div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                    <label className="flex w-full flex-col gap-1 text-xs font-bold text-gray-500 sm:w-72">
                        Viewing Unit
                        <select
                            value={activeUnitId}
                            onChange={(event) => setActiveUnitId(event.target.value || null)}
                            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-white/10 dark:bg-black dark:text-gray-100"
                            title={`Currently showing staff from ${activeUnitLabel}`}
                        >
                            {unitOptions.map((option) => (
                                <option key={option.value || 'empty'} value={option.value}>
                                    {option.value ? option.label : '-- Select Viewing Unit --'}
                                </option>
                            ))}
                        </select>
                    </label>
                    {viewType === 'Active' ? (
                        <button onClick={() => setViewType('ExStaff')} className="px-4 py-2 bg-red-500 text-white text-[13.5px] font-medium rounded-xl hover:bg-red-600 transition shadow-sm border border-transparent">
                            Ex-Staff List
                        </button>
                    ) : (
                        <button onClick={() => setViewType('Active')} className="px-4 py-2 bg-green-500 text-white text-[13.5px] font-medium rounded-xl hover:bg-green-600 transition shadow-sm border border-transparent">
                            Active Staff List
                        </button>
                    )}
                    <button onClick={handleAdd} className="inline-flex items-center px-4 py-2.5 shadow-sm text-[13.5px] font-medium rounded-xl text-white bg-gradient-to-r from-[#00b3a7] to-[#01867c] hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,179,167,0.2)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b3a7] transition-all active:scale-95 border border-transparent">
                        Add New Staff
                    </button>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Active Staff', value: activeStaffCount, note: 'Available for assignment and duty flow' },
                    { label: 'ERP Login Active', value: loginEnabledCount, note: 'Staff with current login access' },
                    { label: 'Document Pending', value: pendingDocumentCount, note: 'Missing Aadhaar or resume upload' },
                    { label: 'Ex-Staff', value: exStaffCount, note: 'Archived or resigned staff records' }
                ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="text-2xl font-black text-gray-950">{item.value}</p>
                        <p className="mt-1 text-sm font-black text-gray-900">{item.label}</p>
                        <p className="mt-1 text-xs font-medium text-gray-500">{item.note}</p>
                    </div>
                ))}
            </div>

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                searchPlaceholder="Search..."
            />

            <DataTable
                data={filteredData}
                columns={columns}
                keyExtractor={(s) => s.id}
            />

            <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editingStaffId ? "Edit - Staff" : "Add - New Staff"} size="xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    <div className="mx-auto w-full max-w-none space-y-8">
                        {(errors as any).root?.server?.message ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {(errors as any).root.server.message}
                            </div>
                        ) : null}

                        {/* Profile Photo */}
                        <div className="flex items-center justify-center flex-col gap-4">
                            <label className="text-sm border-b border-gray-200 w-full text-center pb-2 font-bold text-gray-700">Profile Photo <span className="text-xs font-normal text-gray-500">(Images only. Max 2MB)</span></label>
                            <input type="hidden" {...register('photoUrl')} />

                            <div className="h-28 w-28 rounded-full border-2 border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 overflow-hidden flex items-center justify-center">
                                {profilePreview ? (
                                    <img src={profilePreview} alt="Profile preview" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-xs font-semibold text-gray-400 text-center px-3">No photo selected</span>
                                )}
                            </div>

                            <div className="flex flex-wrap justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload Photo
                                </button>
                                <button
                                    type="button"
                                    onClick={cameraOpen ? stopCamera : openCamera}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                                >
                                    <Camera className="w-4 h-4" />
                                    {cameraOpen ? 'Close Camera' : 'Capture Live Photo'}
                                </button>
                                {(profilePreview || cameraOpen) && (
                                    <button
                                        type="button"
                                        onClick={clearProfilePhoto}
                                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear
                                    </button>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleProfileFileChange}
                                className="hidden"
                            />

                            {cameraError ? <p className="text-xs text-red-500">{cameraError}</p> : null}

                            {cameraOpen && (
                                <div className="w-full max-w-md space-y-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
                                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-black">
                                        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex justify-center">
                                        <button
                                            type="button"
                                            onClick={capturePhoto}
                                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                                        >
                                            Take Snapshot
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 2xl:grid-cols-3">
                            <Select label="Unit Name" {...register('unitId')} error={errors.unitId?.message} options={unitOptions} />
                            <div className="hidden 2xl:block"></div>

                            <Input label="Staff Name *" placeholder="Enter Full Name" {...register('name')} error={errors.name?.message} />
                            <Input label="Date of Joining *" type="date" {...register('joiningDate')} error={errors.joiningDate?.message} />

                            <Input label="Personal Mobile No." placeholder="Enter Personal Mobile No." {...register('phone')} error={errors.phone?.message} />
                            <Input label="Personal Email" placeholder="Enter Personal Email Address" type="email" {...register('email')} error={errors.email?.message} />

                            <Input label="Official Mobile No." placeholder="Enter Official Mobile No." {...register('officialPhone')} error={errors.officialPhone?.message} />
                            <Input label="Official Email" placeholder="Enter Official Email Address" type="email" {...register('officialEmail')} error={errors.officialEmail?.message} />

                            <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-4 md:col-span-2 2xl:col-span-3">
                                <p className="text-sm font-black text-gray-900">Payroll Setup</p>
                                <p className="mt-1 text-xs font-medium text-gray-500">These values feed the live payroll preview. Leave blank if salary is not finalized.</p>
                            </div>
                            <Select label="Salary Type" {...register('salaryType')} options={[{ value: 'Monthly', label: 'Monthly' }, { value: 'Daily', label: 'Daily' }, { value: 'Hourly', label: 'Hourly' }]} />
                            <Input label="Monthly Salary" type="number" min="0" step="1" placeholder="Enter gross salary" {...register('monthlySalary')} error={errors.monthlySalary?.message} />
                            <Input label="Fixed Allowance" type="number" min="0" step="1" placeholder="Enter fixed allowance" {...register('fixedAllowance')} error={errors.fixedAllowance?.message} />
                            <Input label="Fixed Deduction" type="number" min="0" step="1" placeholder="Enter fixed deduction" {...register('fixedDeduction')} error={errors.fixedDeduction?.message} />

                            <div className="rounded-lg border border-orange-100 bg-orange-50/80 p-4 md:col-span-2 2xl:col-span-3">
                                <p className="text-sm font-black text-gray-900">Exit & Final Settlement</p>
                                <p className="mt-1 text-xs font-medium text-gray-500">Use this only when staff resigns or is terminated. Former staff will stay in HR history and stay blocked from assignment, attendance, and payroll queues.</p>
                            </div>
                            <Select label="Staff Status" {...register('status')} options={[
                                { value: 'Working', label: 'Working' },
                                { value: 'On Leave', label: 'On Leave' },
                                { value: 'Resigned', label: 'Resigned' },
                                { value: 'Terminated', label: 'Terminated' }
                            ]} />
                            <Input label="Exit Date" type="date" {...register('exitDate')} error={errors.exitDate?.message} />
                            <Input label="Exit Reason" placeholder="Resignation, termination, personal reason..." {...register('exitReason')} error={errors.exitReason?.message} />
                            <Input label="Exit Remarks" placeholder="Final HR remarks" {...register('exitRemarks')} error={errors.exitRemarks?.message} />
                            <Select label="Settlement Status" {...register('settlementStatus')} options={[
                                { value: 'Pending', label: 'Pending' },
                                { value: 'In Progress', label: 'In Progress' },
                                { value: 'Paid', label: 'Paid' },
                                { value: 'Hold', label: 'Hold' }
                            ]} />
                            <Input label="Last Salary" type="number" min="0" step="1" placeholder="Final salary component" {...register('settlementLastSalary')} error={errors.settlementLastSalary?.message} />
                            <Input label="Settlement Allowance" type="number" min="0" step="1" placeholder="Pending allowance" {...register('settlementAllowance')} error={errors.settlementAllowance?.message} />
                            <Input label="Settlement Deduction" type="number" min="0" step="1" placeholder="Recoveries/deductions" {...register('settlementDeduction')} error={errors.settlementDeduction?.message} />
                            <Input label="Final Payable" type="number" min="0" step="1" placeholder="Net payable amount" {...register('settlementPayable')} error={errors.settlementPayable?.message} />

                            {!editingStaffId && (
                                <>
                                    <div className="md:col-span-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <input type="checkbox" {...register('createLogin')} />
                                            Create Login (Optional)
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enable only if this staff member needs ERP access. Leave unchecked if they only need to be available for duty assignment.
                                        </p>
                                        {errors.createLogin?.message ? (
                                            <p className="mt-2 text-sm text-red-500">{errors.createLogin.message}</p>
                                        ) : null}
                                    </div>

                                    {createLoginEnabled && (
                                        <>
                                            <Input
                                                label="Login Email *"
                                                type="email"
                                                placeholder="staff.name@staff.unisenth.local"
                                                autoComplete="off"
                                                {...register('loginEmail')}
                                                error={errors.loginEmail?.message}
                                            />
                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={suggestUniqueLoginEmail}
                                                    className="h-10 w-full rounded-xl border border-[#00b3a7]/40 bg-[#e6fffb] px-3 text-sm font-semibold text-[#007f78] transition hover:bg-[#d5fbf6]"
                                                >
                                                    Use unique login email
                                                </button>
                                            </div>
                                            <Input
                                                label="Login Password *"
                                                type="password"
                                                placeholder="Enter Login Password"
                                                autoComplete="new-password"
                                                {...register('loginPassword')}
                                                error={errors.loginPassword?.message}
                                            />
                                            <Select
                                                label="Login Role *"
                                                {...register('loginRoleId')}
                                                error={errors.loginRoleId?.message}
                                                options={loginRoleOptions}
                                            />
                                            <div className="hidden md:block"></div>
                                        </>
                                    )}
                                </>
                            )}

                            <Select label="Department *" {...register('department')} error={errors.department?.message} options={[{ value: '', label: '-- Select the Department --' }, { value: 'Medical', label: 'Medical' }, { value: 'Nursing', label: 'Nursing' }, { value: 'House Keeping', label: 'House Keeping' }]} />
                            <Select label="Designation *" {...register('role')} error={errors.role?.message} options={[{ value: '', label: '-- Select the Designation --' }, { value: 'Doctor', label: 'Doctor' }, { value: 'Nurse', label: 'Nurse' }, { value: 'House Keepers', label: 'House Keepers' }]} />

                            <Select label="Gender *" {...register('gender')} error={errors.gender?.message} options={[{ value: '', label: '-- Select the Gender --' }, { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]} />
                            <Input label="Address" placeholder="Enter Full Address" {...register('address')} error={errors.address?.message} />

                            <Select label="Blood Group" {...register('bloodGroup')} options={bloodGroupOptions} />
                            <Input label="Language Known" placeholder="Select the Documents Submitted" {...register('languageKnown')} error={errors.languageKnown?.message} />

                            <Input label="Date of Birth" type="date" {...register('dateOfBirth')} error={errors.dateOfBirth?.message} />
                            <Select label="Marital Status" {...register('maritalStatus')} error={errors.maritalStatus?.message} options={[{ value: '', label: '-- Select the Marital Status --' }, { value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }]} />

                            <Input label="Aadhaar No" placeholder="Enter the Aadhaar No." {...register('aadhaarNo')} error={errors.aadhaarNo?.message} />

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Aadhaar Document <span className="text-xs font-normal text-gray-500">(PDF/JPG/PNG. Max 5MB)</span></label>
                                <input
                                    name="aadhaarDocument"
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={(e) => handleDocumentSelection(e, 'aadhaarDocument', setAadhaarDocumentName, ['application/pdf', 'image/png', 'image/jpeg'])}
                                    className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 dark:file:border-white/10 file:rounded-md file:text-sm file:font-semibold file:bg-gray-50 dark:file:bg-black file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-100 dark:hover:file:bg-white/5 border py-1 ${errors.aadhaarDocument?.message ? 'border-red-500' : 'border-gray-300 dark:border-white/10'}`}
                                />
                                {aadhaarDocumentName ? <span className="text-xs text-gray-500">Selected: {aadhaarDocumentName}</span> : null}
                                {errors.aadhaarDocument?.message ? <p className="text-sm text-red-500">{String(errors.aadhaarDocument.message)}</p> : null}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Resume <span className="text-xs font-normal text-gray-500">(PDF/DOCX. Max 5MB)</span></label>
                                <input
                                    name="resumeDocument"
                                    type="file"
                                    accept=".pdf,.docx"
                                    onChange={(e) => handleDocumentSelection(e, 'resumeDocument', setResumeDocumentName, ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])}
                                    className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 dark:file:border-white/10 file:rounded-md file:text-sm file:font-semibold file:bg-gray-50 dark:file:bg-black file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-100 dark:hover:file:bg-white/5 border py-1 ${errors.resumeDocument?.message ? 'border-red-500' : 'border-gray-300 dark:border-white/10'}`}
                                />
                                {resumeDocumentName ? <span className="text-xs text-gray-500">Selected: {resumeDocumentName}</span> : null}
                                {errors.resumeDocument?.message ? <p className="text-sm text-red-500">{String(errors.resumeDocument.message)}</p> : null}
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 md:col-span-2">
                                <p className="font-black text-gray-800">Original Documents Submitted</p>
                                <p className="mt-1 text-xs font-medium">
                                    Current live storage supports Aadhaar and resume uploads here. Other original document categories are maintained from Admin Files.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3 mt-auto border-t border-gray-200 dark:border-white/10">
                            <button
                                type="button"
                                onClick={() => setIsDrawerOpen(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-white/5 font-medium shadow-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={addStaff.isPending || updateStaff.isPending}
                                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium shadow-sm disabled:opacity-50 transition-colors"
                            >
                                {addStaff.isPending || updateStaff.isPending ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </form>
            </Drawer>

            <Drawer isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="View - Staff Details" size="lg">

                {selectedStaff && (
                    <div className="space-y-5">
                        <div className="rounded-2xl border border-primary-100 bg-primary-50/70 p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {selectedStaff.photoUrl ? (
                                    <img src={selectedStaff.photoUrl} alt={selectedStaff.name} className="h-24 w-24 rounded-2xl border border-white object-cover shadow-sm" />
                                ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-primary-100 bg-white text-sm font-black text-primary-600">IMG</div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-2xl font-black text-gray-950">{selectedStaff.name}</p>
                                    <p className="mt-1 text-sm font-bold text-gray-600">{selectedStaff.role} - {selectedStaff.department}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <StatusHighlighter value={isExStaffRecord(selectedStaff) ? selectedStaff.status || 'Ex-Staff' : 'Working'} />
                                        <StatusHighlighter value={selectedStaff.user?.isActive ? 'Login Active' : selectedStaff.user ? 'Login Disabled' : 'No Login'} />
                                        <StatusHighlighter value={getStaffDocument(selectedStaff, 'aadhaarDocument') && getStaffDocument(selectedStaff, 'resumeDocument') ? 'Documents Uploaded' : 'Documents Pending'} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                { label: 'Employee ID', value: selectedStaff.empId || 'N/A' },
                                { label: 'Unit', value: unitLabelById.get(selectedStaff.unitId)?.replace('\n', ' - ') || 'Unknown Unit' },
                                { label: 'Joining Date', value: selectedStaff.joiningDate || '-' },
                                { label: 'ERP Role', value: selectedStaff.user?.role?.name || '-' },
                                { label: 'Login Email', value: selectedStaff.user?.email || '-' },
                                { label: 'Personal Email', value: selectedStaff.email || '-' },
                                { label: 'Personal Mobile', value: selectedStaff.phone || '-' },
                                { label: 'Official Mobile', value: getStaffMetadata(selectedStaff).officialPhone || '-' },
                                { label: 'Official Email', value: getStaffMetadata(selectedStaff).officialEmail || '-' },
                                { label: 'Salary Type', value: getStaffMetadata(selectedStaff).payroll?.salaryType || '-' },
                                { label: 'Monthly Salary', value: getStaffMetadata(selectedStaff).payroll?.monthlySalary ? `Rs ${Number(getStaffMetadata(selectedStaff).payroll.monthlySalary).toLocaleString('en-IN')}` : '-' },
                                { label: 'Fixed Allowance', value: getStaffMetadata(selectedStaff).payroll?.fixedAllowance ? `Rs ${Number(getStaffMetadata(selectedStaff).payroll.fixedAllowance).toLocaleString('en-IN')}` : '-' },
                                { label: 'Fixed Deduction', value: getStaffMetadata(selectedStaff).payroll?.fixedDeduction ? `Rs ${Number(getStaffMetadata(selectedStaff).payroll.fixedDeduction).toLocaleString('en-IN')}` : '-' },
                                { label: 'Exit Date', value: getStaffMetadata(selectedStaff).exit?.date || '-' },
                                { label: 'Exit Reason', value: getStaffMetadata(selectedStaff).exit?.reason || '-' },
                                { label: 'Settlement Status', value: getStaffMetadata(selectedStaff).finalSettlement?.status || '-' },
                                { label: 'Last Salary', value: money(getStaffMetadata(selectedStaff).finalSettlement?.lastSalary) },
                                { label: 'Settlement Allowance', value: money(getStaffMetadata(selectedStaff).finalSettlement?.allowance) },
                                { label: 'Settlement Deduction', value: money(getStaffMetadata(selectedStaff).finalSettlement?.deduction) },
                                { label: 'Final Payable', value: money(getStaffMetadata(selectedStaff).finalSettlement?.payable) },
                                { label: 'Gender', value: getStaffMetadata(selectedStaff).gender || '-' },
                                { label: 'Blood Group', value: getStaffMetadata(selectedStaff).bloodGroup || '-' },
                                { label: 'Language Known', value: getStaffMetadata(selectedStaff).languageKnown || '-' },
                                { label: 'Date of Birth', value: getStaffMetadata(selectedStaff).dateOfBirth || '-' },
                                { label: 'Marital Status', value: getStaffMetadata(selectedStaff).maritalStatus || '-' },
                                { label: 'Aadhaar No.', value: getStaffMetadata(selectedStaff).aadhaarNo || '-' },
                                { label: 'Aadhaar Verification', value: getStaffMetadata(selectedStaff).aadhaarVerification?.status || 'Not verified' }
                            ].map((item) => (
                                <div key={item.label} className="rounded-lg border border-gray-100 bg-white p-3">
                                    <p className="text-xs font-black uppercase tracking-wide text-gray-400">{item.label}</p>
                                    <p className="mt-1 break-words text-sm font-bold text-gray-900">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                            <p className="text-sm font-black text-gray-900">Address</p>
                            <p className="mt-1 text-sm font-medium text-gray-600">{getStaffMetadata(selectedStaff).address || '-'}</p>
                        </div>

                        {isExStaffRecord(selectedStaff) && (
                            <div className="rounded-lg border border-orange-100 bg-orange-50/80 p-4">
                                <p className="text-sm font-black text-gray-900">Exit Remarks</p>
                                <p className="mt-1 text-sm font-medium text-gray-600">{getStaffMetadata(selectedStaff).exit?.remarks || '-'}</p>
                            </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                { label: 'Aadhaar Document', document: getStaffDocument(selectedStaff, 'aadhaarDocument') },
                                { label: 'Resume', document: getStaffDocument(selectedStaff, 'resumeDocument') }
                            ].map((item) => (
                                <div key={item.label} className="rounded-lg border border-gray-100 bg-white p-4">
                                    <p className="text-sm font-black text-gray-900">{item.label}</p>
                                    {item.document?.fileUrl ? (
                                        <a href={item.document.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex rounded-full bg-primary-50 px-3 py-1.5 text-xs font-black text-primary-700 hover:bg-primary-100">
                                            View Uploaded File
                                        </a>
                                    ) : (
                                        <p className="mt-2 text-xs font-semibold text-gray-400">Not uploaded yet</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Drawer>
        </div >
    )
}
