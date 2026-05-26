import { AmbulanceRegisterPage, type AmbulanceRegisterConfig } from './AmbulanceRegisterPage'

const config: AmbulanceRegisterConfig = {
    type: 'FLEET',
    title: 'Vehicle & Fleet',
    subtitle: 'Live ambulance vehicle register and readiness status.',
    addLabel: 'Add Vehicle',
    emptyMessage: 'No live ambulance vehicles found. Add a vehicle to start fleet tracking.',
    initialStatus: 'AVAILABLE',
    statuses: ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'AVAILABLE'],
    fields: [
        { key: 'vehicleNo', label: 'Vehicle No.', required: true, placeholder: 'TN 00 AB 0000' },
        { key: 'vehicleType', label: 'Vehicle Type', required: true, placeholder: 'Basic / ICU / Oxygen' },
        { key: 'driverName', label: 'Assigned Driver' },
        { key: 'baseLocation', label: 'Base Location' },
        { key: 'lastServiceDate', label: 'Last Service Date', type: 'datetime-local' },
        { key: 'remarks', label: 'Remarks' }
    ],
    columns: [
        { key: 'vehicleNo', header: 'Vehicle No.' },
        { key: 'vehicleType', header: 'Type' },
        { key: 'driverName', header: 'Driver' },
        { key: 'baseLocation', header: 'Base' },
        { key: 'lastServiceDate', header: 'Last Service' }
    ]
}

export function VehicleFleet() {
    return <AmbulanceRegisterPage config={config} />
}
