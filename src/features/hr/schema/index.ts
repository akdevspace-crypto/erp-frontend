import { z } from 'zod'

const booleanish = z.preprocess((value) => {
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase()
        if (['true', '1', 'yes', 'on'].includes(normalized)) return true
        if (['false', '0', 'no', 'off', ''].includes(normalized)) return false
    }
    return value
}, z.boolean())

export const staffSchema = z.object({
    empId: z.string().optional(),
    photoUrl: z.string().optional(),
    name: z.string().min(2, 'Name is required'),
    role: z.string().min(1, 'Designation is required'),
    department: z.string().min(1, 'Department is required'),
    unitId: z.string().min(1, 'Unit is required'),
    phone: z.string().min(10, 'Personal Mobile required'),
    email: z.string().email('Personal Email required').optional().or(z.literal('')),
    officialPhone: z.string().optional(),
    officialEmail: z.string().email('Official Email invalid').optional().or(z.literal('')),
    monthlySalary: z.string().optional(),
    fixedAllowance: z.string().optional(),
    fixedDeduction: z.string().optional(),
    salaryType: z.string().optional(),
    exitDate: z.string().optional(),
    exitReason: z.string().optional(),
    exitRemarks: z.string().optional(),
    settlementStatus: z.string().optional(),
    settlementLastSalary: z.string().optional(),
    settlementAllowance: z.string().optional(),
    settlementDeduction: z.string().optional(),
    settlementPayable: z.string().optional(),
    joiningDate: z.string().min(1, 'Joining date is required'),
    gender: z.string().min(1, 'Gender is required'),
    address: z.string().optional(),
    bloodGroup: z.string().optional(),
    languageKnown: z.string().optional(),
    dateOfBirth: z.string().optional(),
    maritalStatus: z.string().optional(),
    aadhaarNo: z.string().optional(),
    aadhaarDocument: z.any().optional(),
    resumeDocument: z.any().optional(),
    createLogin: booleanish.optional(),
    loginEmail: z.string().email('Login Email invalid').optional().or(z.literal('')),
    loginPassword: z.string().min(6, 'Login password must be at least 6 characters').optional().or(z.literal('')),
    loginRoleId: z.string().optional(),
    roleId: z.string().optional(),
    status: z.enum(['Working', 'Resigned', 'Terminated', 'Active', 'On Leave']).optional(),
    metadata: z.any().optional()
}).superRefine((data, ctx) => {
    if (!data.createLogin) return

    if (!data.loginEmail) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Login Email is required',
            path: ['loginEmail']
        })
    }

    if (!data.loginPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Login Password is required',
            path: ['loginPassword']
        })
    }

    if (!data.loginRoleId && !data.roleId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Role is required',
            path: ['loginRoleId']
        })
    }
})

export type StaffFormInput = z.input<typeof staffSchema>
export type StaffFormValues = z.output<typeof staffSchema>
