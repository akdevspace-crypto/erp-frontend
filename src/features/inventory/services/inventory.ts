import { api } from '../../../lib/axios'
import type { CreateProductPayload, CreatePurchasePayload, CreateStockIssueRequestPayload, InventoryProduct, InventoryPurchase, InventoryStock, InventoryStockIssueRequest, InventoryStockMovement, UpdateStockPayload } from '../types'

export const inventoryService = {
    getProducts: async (): Promise<InventoryProduct[]> => {
        const response = await api.get('/product')
        return response.data?.data || []
    },

    createProduct: async (payload: CreateProductPayload): Promise<InventoryProduct> => {
        const response = await api.post('/product', payload)
        return response.data?.data
    },

    getStock: async (): Promise<InventoryStock[]> => {
        const response = await api.get('/stock')
        return response.data?.data || []
    },

    getStockMovements: async (): Promise<InventoryStockMovement[]> => {
        const response = await api.get('/stock/movements')
        return response.data?.data || []
    },

    updateStock: async (payload: UpdateStockPayload): Promise<InventoryStock> => {
        const response = await api.post('/stock/update', payload)
        return response.data?.data
    },

    getPurchases: async (): Promise<InventoryPurchase[]> => {
        const response = await api.get('/purchase')
        return response.data?.data || []
    },

    createPurchase: async (payload: CreatePurchasePayload): Promise<InventoryPurchase> => {
        const response = await api.post('/purchase', payload)
        return response.data?.data
    },

    getStockIssueRequests: async (): Promise<InventoryStockIssueRequest[]> => {
        const response = await api.get('/stock/issue-requests')
        return response.data?.data || []
    },

    createStockIssueRequest: async (payload: CreateStockIssueRequestPayload): Promise<InventoryStockIssueRequest> => {
        const response = await api.post('/stock/issue-requests', payload)
        return response.data?.data
    },

    approveStockIssueRequest: async (id: string): Promise<InventoryStockIssueRequest> => {
        const response = await api.post(`/stock/issue-requests/${id}/approve`)
        return response.data?.data
    },

    rejectStockIssueRequest: async (id: string): Promise<InventoryStockIssueRequest> => {
        const response = await api.post(`/stock/issue-requests/${id}/reject`)
        return response.data?.data
    }
}
