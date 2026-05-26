import type { User } from '../../../store/authStore'
import type { WorkflowTimeline } from '../services/workflowTimeline'

export type WorkflowActionItem = {
    id: string
    title: string
    description: string
    owner: string
    severity: 'high' | 'medium' | 'low'
    href: string
    workflowRef: string
    clientName: string
}

const normalizeRole = (role: User['role'] | undefined) => {
    if (!role) return ''
    if (typeof role === 'string') return role.trim().toLowerCase().replace(/_/g, ' ')
    return String(role.name || '').trim().toLowerCase().replace(/_/g, ' ')
}

const hasRoleSignal = (role: string, signals: string[]) => signals.some((signal) => role.includes(signal))

const getStage = (workflow: WorkflowTimeline, key: string) => workflow.stages.find((stage) => stage.key === key)

const makeItem = (
    workflow: WorkflowTimeline,
    id: string,
    title: string,
    description: string,
    owner: string,
    severity: WorkflowActionItem['severity'],
    href = '/workflow/timeline'
): WorkflowActionItem => ({
    id: `${workflow.id}-${id}`,
    title,
    description,
    owner,
    severity,
    href,
    workflowRef: workflow.refNo,
    clientName: workflow.clientName
})

export const getRoleWorkflowActionItems = (workflows: WorkflowTimeline[], user: User | null | undefined) => {
    const role = normalizeRole(user?.role)
    const isAllAccess = Boolean(user?.permissions?.includes('ALL_ACCESS') && !user?.staffId)

    const isEnquiryRole = isAllAccess || hasRoleSignal(role, ['enquiry', 'admission', 'follow-up', 'customer relations'])
    const isAllocationRole = isAllAccess || hasRoleSignal(role, ['allocation', 'patient care', 'medical monitor', 'elder care', 'uhc admin'])
    const isStaffRole = Boolean(user?.staffId) || hasRoleSignal(role, ['profile task'])
    const isApprovalRole = isAllAccess || hasRoleSignal(role, ['task log', 'admin', 'coordinator'])
    const isFinanceRole = isAllAccess || hasRoleSignal(role, ['finance', 'billing'])

    const items = workflows.flatMap((workflow) => {
        const admission = getStage(workflow, 'admission')
        const allocation = getStage(workflow, 'allocation')
        const task = getStage(workflow, 'task')
        const approval = getStage(workflow, 'approval')
        const invoice = getStage(workflow, 'invoice')
        const payment = getStage(workflow, 'payment')
        const closure = getStage(workflow, 'closure')
        const workflowItems: WorkflowActionItem[] = []

        if (isEnquiryRole && !admission?.complete && !allocation?.complete) {
            workflowItems.push(makeItem(
                workflow,
                'enquiry-conversion',
                'Convert enquiry',
                'Enquiry is created but has not moved to admission or allocation.',
                'Enquiry Desk',
                'high',
                '/crm/active-enquiries'
            ))
        }

        if (isAllocationRole && admission?.complete && !allocation?.complete) {
            workflowItems.push(makeItem(
                workflow,
                'allocation-needed',
                'Create care allocation',
                'Admission exists but care allocation is not completed.',
                'Care Allocation',
                'high',
                '/allocation/clinical-care'
            ))
        }

        if ((isAllocationRole || isStaffRole) && allocation?.complete && !task?.complete) {
            workflowItems.push(makeItem(
                workflow,
                'duty-pending',
                isStaffRole ? 'Complete assigned duty' : 'Monitor staff duty',
                'Care allocation exists but staff duty is not completed.',
                isStaffRole ? 'Assigned Staff' : 'Care Allocation',
                'medium',
                isStaffRole ? '/profile/tasks' : '/allocation/clinical-care'
            ))
        }

        if (isApprovalRole && task?.complete && !approval?.complete) {
            workflowItems.push(makeItem(
                workflow,
                'approval-pending',
                'Approve completed duty',
                'Staff duty is completed and waiting for admin approval.',
                'Approval Desk',
                'medium',
                '/task-log/daily-approval'
            ))
        }

        if (isFinanceRole && invoice?.complete && Number(workflow.summary.balanceAmount || 0) > 0) {
            workflowItems.push(makeItem(
                workflow,
                'payment-pending',
                'Collect payment',
                'Invoice is posted but full payment is not collected.',
                'Finance',
                'high',
                '/finance/invoice'
            ))
        }

        if (isFinanceRole && payment?.complete && !closure?.complete) {
            workflowItems.push(makeItem(
                workflow,
                'closure-pending',
                'Confirm workflow closure',
                'Payment is collected but workflow closure is still pending.',
                'Finance',
                'medium',
                '/workflow/timeline'
            ))
        }

        return workflowItems
    })

    return items.slice(0, 8)
}
