export interface InventoryProduct {
    id: string
    name: string
    category: string
    unitId: string
    tenantId: string
    createdAt: string
    updatedAt: string
}

export interface InventoryStock {
    id: string
    productId: string
    product?: InventoryProduct
    quantity: number
    unitId: string
    tenantId: string
    createdAt: string
    updatedAt: string
}

export interface CreateProductPayload {
    name: string
    category: string
}

export interface UpdateStockPayload {
    productId: string
    quantity: number
    usageType?: string
    notes?: string
    issuedTo?: string
}

export interface InventoryPurchase {
    id: string
    productId: string
    product?: InventoryProduct
    quantity: number
    vendor: string
    unitId: string
    tenantId: string
    createdAt: string
    updatedAt: string
}

export interface CreatePurchasePayload {
    productId: string
    quantity: number
    vendor: string
}

export interface InventoryStockIssueRequest {
    id: string
    productId: string
    productName: string
    category: string
    quantity: number
    usageType: string
    issuedTo?: string | null
    notes?: string | null
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    requestedBy?: string | null
    requestedAt: string
    approvedBy?: string | null
    approvedAt?: string | null
    rejectedBy?: string | null
    rejectedAt?: string | null
    tenantId: string
    unitId: string
    createdAt: string
    updatedAt: string
}

export interface CreateStockIssueRequestPayload {
    productId: string
    quantity: number
    usageType: string
    issuedTo?: string
    notes?: string
}

export interface InventoryStockMovement {
    id: string
    productId: string
    product?: InventoryProduct
    movementType: 'STOCK_IN' | 'STOCK_OUT' | 'PURCHASE' | 'CURRENT_STOCK'
    quantity: number
    signedQuantity: number
    vendor?: string | null
    usageType?: string | null
    notes?: string | null
    issuedTo?: string | null
    updatedBy: string
    createdAt: string
}
