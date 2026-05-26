import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { Drawer } from '../../../components/Drawer'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { useRoles, useStaff } from '../hooks/useHR'
import { hrService } from '../services/hr'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../../components/Toast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Edit2 } from 'lucide-react'
import { useUnits } from '../../master/hooks/useUnit'

const booleanish = z.preprocess((value) => {
    if (value === 'true') return true
    if (value === 'false') return false
    return value
}, z.boolean())

const privilegeFormSchema = z.object({
    staffId: z.string().min(1, 'Staff required'),
    unitId: z.string().min(1, 'Unit required'),
    email: z.string().email('Invalid email'),
    password: z.string().optional(),
    roleId: z.string().min(1, 'Role required'),
    isActive: booleanish.optional()
})

type PrivilegeFormInput = z.input<typeof privilegeFormSchema>
type PrivilegeFormValues = z.output<typeof privilegeFormSchema>

export function StaffPrivilege() {
    const { data: staffData = [] } = useStaff()
    const { data: roleList = [] } = useRoles()
    const { data: units = [] } = useUnits()
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const [searchQuery, setSearchQuery] = useState('')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingStaffId, setEditingStaffId] = useState<string | null>(null)
    const [changePassword, setChangePassword] = useState(false)
    const unitOptions = useMemo(() => [
        { value: '', label: '-- Select Unit --' },
        ...units.map((unit) => ({
            value: unit.id,
            label: unit.location?.label ? `${unit.name} - ${unit.location.label}` : unit.name
        }))
    ], [units])

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PrivilegeFormInput, any, PrivilegeFormValues>({
        resolver: zodResolver(privilegeFormSchema),
        defaultValues: { staffId: '', unitId: '', email: '', password: '', roleId: '', isActive: true }
    })
    const selectedStaffId = watch('staffId')

    const filteredData = staffData.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.empId.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const approvalRoleOptions = useMemo(() => {
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
            { value: '', label: '--Select Approval Authority--' },
            ...mergedRoles.map((role) => ({
                value: String(role.id || role.name),
                label: role.name
            }))
        ]
    }, [roleList])

    const handleForceLogout = async (staffId: string, roleId: string = 'Employee', email?: string) => {
        try {
            await hrService.updateStaffPrivilege(staffId, {
                loginEnabled: true,
                roleId,
                email,
                forceLogout: true
            })
            toast({ type: 'success', title: 'Forced Logout', message: 'The user will be logged out from their device shortly.' })
            queryClient.invalidateQueries({ queryKey: ['staff'] })
        } catch (error) {
            toast({ type: 'error', title: 'Error', message: 'Failed to force logout this user.' })
        }
    }

    const openAddDrawer = () => {
        setEditingStaffId(null)
        setChangePassword(true)
        reset({ staffId: '', unitId: staffData[0]?.unitId || '', email: '', password: '', roleId: '', isActive: true })
        setIsDrawerOpen(true)
    }

    const openEditDrawer = (s: any) => {
        setEditingStaffId(s.id)
        setChangePassword(!s.user)
        reset({
            staffId: s.id,
            unitId: s.unitId || '',
            email: s.user?.email || s.email || '',
            password: '',
            roleId: s.user?.role?.id || s.user?.role?.name || 'Employee',
            isActive: s.user?.isActive ?? true
        })
        setIsDrawerOpen(true)
    }

    useEffect(() => {
        if (!isDrawerOpen || editingStaffId || !selectedStaffId) return

        const selectedStaff = staffData.find((staff) => staff.id === selectedStaffId)
        if (!selectedStaff) return

        setValue('unitId', selectedStaff.unitId || '')
        setValue('email', selectedStaff.user?.email || selectedStaff.email || '')
        setValue('roleId', selectedStaff.user?.role?.id || selectedStaff.user?.role?.name || 'Employee')
        setValue('isActive', selectedStaff.user?.isActive ?? true)
        setChangePassword(!selectedStaff.user)
    }, [editingStaffId, isDrawerOpen, selectedStaffId, setValue, staffData])

    const onSubmit = async (data: PrivilegeFormValues) => {
        try {
            const selectedStaff = staffData.find((staff) => staff.id === data.staffId)
            if (!selectedStaff?.user && !data.password) {
                toast({ type: 'error', title: 'Password Required', message: 'Enter a password to create login for this staff.' })
                return
            }

            await hrService.updateStaffPrivilege(data.staffId, {
                loginEnabled: data.isActive ?? true,
                roleId: data.roleId,
                email: data.email,
                ...(changePassword && data.password ? { password: data.password } : {})
            })
            toast({ type: 'success', title: 'Success', message: 'Login privilege saved.' })
            setIsDrawerOpen(false)
            queryClient.invalidateQueries({ queryKey: ['staff'] })
        } catch (e) {
            toast({ type: 'error', title: 'Error', message: 'Failed to save privilege' })
        }
    }

    const columns: Column<any>[] = [
        { key: 'photo', header: 'Staff Photo', cell: () => <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs">IMG</div> },
        {
            key: 'name', header: 'Staff Name & Ref. ID', sortable: true, cell: (s) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{s.name}</div>
                    <div className="text-xs text-gray-500">ID: {s.empId}</div>
                </div>
            )
        },
        { key: 'designation', header: 'Staff Designation', cell: (s) => s.role },
        {
            key: 'loginId', header: 'Login - User ID', cell: (s) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{s.user ? s.user.email : 'Unassigned'}</div>
                    {s.user && <div className="text-xs text-gray-400">UUID: {s.user.id.substring(0, 8)}...</div>}
                </div>
            )
        },
        { key: 'approval', header: 'Approval Authority', cell: (s) => s.user?.role?.name || 'None' },
        { key: 'loginStatus', header: 'Login Status', cell: (s) => <StatusHighlighter value={s.user?.isActive ? 'Login Activated' : 'Login Disabled'} /> },
        {
            key: 'menuPrivilege', header: 'Menu Privilege', cell: (s) => (
                <Link to={`/hr/staff-privilege/${s.id}/edit`} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors inline-block text-center">
                    Edit Privilege
                </Link>
            )
        },
        {
            key: 'action', header: 'Action', cell: (s) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => openEditDrawer(s)}
                        className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 transition hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300"
                        title={s.user ? 'Edit Login Details' : 'Create Login Credentials'}
                    >
                        <Edit2 className="h-4 w-4" />
                        {s.user ? 'Edit Login' : 'Create Login'}
                    </button>
                    {s.user?.isActive && (
                        <button
                            onClick={() => handleForceLogout(s.id, s.user?.role?.id || s.user?.role?.name || 'Employee', s.user?.email)}
                            className="px-3 py-1 text-xs font-medium rounded text-white transition-colors bg-red-500 hover:bg-red-600"
                        >
                            Force Logout
                        </button>
                    )}
                </div>
            )
        }
    ]

    return (
        <div className="flex flex-col h-full space-y-6 bg-transparent dark:bg-black">
            <PageHeader title="Staff Login Privilege" breadcrumbs={[{ label: 'HR' }, { label: 'Privileges' }]} />

            <div className="bg-white dark:bg-black p-4 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm flex items-center justify-between">
                <div>
                    <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">List of Staffs having Login Privilege</h3>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition">Enable Live Monitoring</button>
                    <button onClick={openAddDrawer} className="inline-flex items-center px-4 py-2 shadow-sm text-[13.5px] font-medium rounded-xl text-white bg-gradient-to-r from-[#00b3a7] to-[#01867c] hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,179,167,0.2)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b3a7] transition-all active:scale-95 border border-transparent">Add New Staff</button>
                </div>
            </div>

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                searchPlaceholder="Search by name or ID..."
            />

            <DataTable
                data={filteredData}
                columns={columns}
                keyExtractor={(s) => s.id}
            />

            <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editingStaffId ? 'Edit - Staff Login Privilege' : 'Add - New Staff Login Privilege'} size="lg">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Unit Name (Branch) *" {...register('unitId')} error={errors.unitId?.message} disabled
                            options={unitOptions}
                        />

                        <Select
                            label="Staff Name *" {...register('staffId')} error={errors.staffId?.message} disabled={!!editingStaffId}
                            options={[
                                { value: '', label: '-- Select the Staff Name --' },
                                ...staffData.map(s => ({ value: s.id, label: `${s.name} - ${s.role}` }))
                            ]}
                        />

                        <Input label="User Login ID *" {...register('email')} error={errors.email?.message} />

                        <div className="relative">
                            <Input
                                label={editingStaffId && !changePassword ? 'Password' : 'Password *'}
                                type="password"
                                {...register('password')}
                                error={errors.password?.message}
                                disabled={editingStaffId !== null && !changePassword}
                            />
                            {editingStaffId && (
                                <div className="absolute top-0 right-0 flex items-center mt-1">
                                    <input
                                        type="checkbox"
                                        id="changePassword"
                                        checked={changePassword}
                                        onChange={(e) => setChangePassword(e.target.checked)}
                                        className="h-3 w-3 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="changePassword" className="ml-2 block text-xs text-gray-700 dark:text-gray-300">Change Password</label>
                                </div>
                            )}
                        </div>

                        <Select
                            label="Approval Authority *" {...register('roleId')} error={errors.roleId?.message}
                            options={approvalRoleOptions}
                        />

                        {editingStaffId && (
                            <Select
                                label="Active Status *" {...register('isActive')}
                                options={[
                                    { value: 'true', label: 'Active' },
                                    { value: 'false', label: 'Inactive' }
                                ]}
                                onChange={(e) => setValue('isActive', e.target.value === 'true')}
                            />
                        )}
                    </div>

                    <div className="pt-6 flex justify-end gap-3 mt-auto border-t border-gray-200 dark:border-white/10">
                        <button type="button" onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-white/5 font-medium shadow-sm transition-colors text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium shadow-sm transition-colors text-sm">Save</button>
                    </div>
                </form>
            </Drawer>
        </div>
    )
}
