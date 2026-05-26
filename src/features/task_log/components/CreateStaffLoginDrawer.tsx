import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Drawer } from '../../../components/Drawer'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { useCreateStaffLogin, useRoles } from '../../hr/hooks/useHR'
import type { Staff } from '../../hr/types'

const createStaffLoginSchema = z.object({
    email: z.string().email('Valid login email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    roleId: z.string().min(1, 'Role is required')
})

type CreateStaffLoginValues = z.infer<typeof createStaffLoginSchema>

interface CreateStaffLoginDrawerProps {
    isOpen: boolean
    onClose: () => void
    staff: Staff | null
    onCreated?: () => Promise<void> | void
}

export function CreateStaffLoginDrawer({ isOpen, onClose, staff, onCreated }: CreateStaffLoginDrawerProps) {
    const createStaffLogin = useCreateStaffLogin()
    const { data: roles = [], isLoading: isLoadingRoles } = useRoles()

    const roleOptions = useMemo(() => {
        const fallbackRoles = [
            { id: 'Admin', name: 'Admin' },
            { id: 'Employee', name: 'Employee' }
        ]

        const normalizedRoleNames = new Set(
            roles
                .map((role) => String(role.name || '').trim().toLowerCase())
                .filter(Boolean)
        )

        const mergedRoles = [
            ...roles,
            ...fallbackRoles.filter((role) => !normalizedRoleNames.has(role.name.toLowerCase()))
        ]

        return [
            { value: '', label: '-- Select Role --' },
            ...mergedRoles.map((role) => ({
                value: String(role.id || role.name),
                label: role.name
            }))
        ]
    }, [roles])

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateStaffLoginValues>({
        resolver: zodResolver(createStaffLoginSchema),
        defaultValues: {
            email: '',
            password: '',
            roleId: ''
        }
    })

    useEffect(() => {
        if (!isOpen) return
        reset({
            email: staff?.email || '',
            password: '',
            roleId: ''
        })
    }, [isOpen, staff, reset])

    const onSubmit = async (data: CreateStaffLoginValues) => {
        if (!staff) return
        await createStaffLogin.mutateAsync({
            staffId: staff.id,
            data
        })
        if (onCreated) {
            await onCreated()
        }
        onClose()
    }

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={`Create Login for ${staff?.name || 'Staff'}`}
            size="md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                    label="Login Email *"
                    type="email"
                    placeholder="Enter login email"
                    {...register('email')}
                    error={errors.email?.message}
                />

                <Input
                    label="Password *"
                    type="password"
                    placeholder="Enter password"
                    {...register('password')}
                    error={errors.password?.message}
                />

                <Select
                    label="Role *"
                    {...register('roleId')}
                    error={errors.roleId?.message}
                    disabled={isLoadingRoles}
                    options={roleOptions}
                />

                <div className="pt-6 flex justify-end gap-3 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium shadow-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={createStaffLogin.isPending || isLoadingRoles}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium shadow-sm disabled:opacity-50 transition-colors"
                    >
                        {createStaffLogin.isPending ? 'Creating...' : 'Create Login'}
                    </button>
                </div>
            </form>
        </Drawer>
    )
}
