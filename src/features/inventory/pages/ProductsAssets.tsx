import { InventoryCategoryProducts } from './InventoryCategoryProducts'

export function AssetProducts() {
    return (
        <InventoryCategoryProducts
            category="medical"
            categoryLabel="Medical Assets"
            title="Medical Assets"
            subtitle="Live medical asset product master and opening stock for UHC inventory."
            addLabel="Add Medical Asset"
            productHeader="Medical Asset"
            searchPlaceholder="Search medical asset..."
            emptyStateMessage="No live medical assets found"
            breadcrumbs={[{ label: 'UHC' }, { label: 'Inventory' }, { label: 'Medical Assets' }]}
            placeholder="Pulse oximeter, BP monitor..."
        />
    )
}
