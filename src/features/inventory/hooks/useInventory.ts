import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../../components/Toast'
import { inventoryService } from '../services/inventory'

const resolveErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || fallback

export const useInventoryProducts = () => {
    return useQuery({
        queryKey: ['inventory-products'],
        queryFn: inventoryService.getProducts
    })
}

export const useInventoryStock = () => {
    return useQuery({
        queryKey: ['inventory-stock'],
        queryFn: inventoryService.getStock
    })
}

export const useInventoryStockMovements = () => {
    return useQuery({
        queryKey: ['inventory-stock-movements'],
        queryFn: inventoryService.getStockMovements
    })
}

export const useInventoryPurchases = () => {
    return useQuery({
        queryKey: ['inventory-purchases'],
        queryFn: inventoryService.getPurchases
    })
}

export const useInventoryStockIssueRequests = () => {
    return useQuery({
        queryKey: ['inventory-stock-issue-requests'],
        queryFn: inventoryService.getStockIssueRequests
    })
}

export const useCreateInventoryProduct = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: inventoryService.createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory-products'] })
            toast({ type: 'success', title: 'Product Added', message: 'Inventory product saved successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Product Failed', message: resolveErrorMessage(error, 'Failed to save product') })
        }
    })
}

export const useUpdateInventoryStock = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: inventoryService.updateStock,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory-stock'] })
            queryClient.invalidateQueries({ queryKey: ['inventory-stock-movements'] })
            queryClient.invalidateQueries({ queryKey: ['inventory-products'] })
            toast({ type: 'success', title: 'Stock Updated', message: 'Inventory stock updated successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Stock Failed', message: resolveErrorMessage(error, 'Failed to update stock') })
        }
    })
}

export const useCreateInventoryPurchase = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: inventoryService.createPurchase,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory-purchases'] })
            queryClient.invalidateQueries({ queryKey: ['inventory-stock'] })
            queryClient.invalidateQueries({ queryKey: ['inventory-stock-movements'] })
            toast({ type: 'success', title: 'Purchase Recorded', message: 'Purchase saved and stock increased successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Purchase Failed', message: resolveErrorMessage(error, 'Failed to record purchase') })
        }
    })
}

export const useCreateInventoryStockIssueRequest = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: inventoryService.createStockIssueRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory-stock-issue-requests'] })
            toast({ type: 'success', title: 'Issue Requested', message: 'Stock issue request saved for approval' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Request Failed', message: resolveErrorMessage(error, 'Failed to save stock issue request') })
        }
    })
}

export const useApproveInventoryStockIssueRequest = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: inventoryService.approveStockIssueRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory-stock-issue-requests'] })
            queryClient.invalidateQueries({ queryKey: ['inventory-stock'] })
            queryClient.invalidateQueries({ queryKey: ['inventory-stock-movements'] })
            toast({ type: 'success', title: 'Issue Approved', message: 'Stock reduced and movement recorded' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Approval Failed', message: resolveErrorMessage(error, 'Failed to approve stock issue') })
        }
    })
}

export const useRejectInventoryStockIssueRequest = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: inventoryService.rejectStockIssueRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory-stock-issue-requests'] })
            toast({ type: 'success', title: 'Issue Rejected', message: 'Stock issue request closed' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Reject Failed', message: resolveErrorMessage(error, 'Failed to reject stock issue') })
        }
    })
}
