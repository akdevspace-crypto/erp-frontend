import { Sun, Moon, LayoutDashboard, Users, Calendar, CalendarClock, HeartPulse, LogOut, Settings, HelpCircle, Database, Briefcase, FileBox, IndianRupee, Activity, Shield, ClipboardList, CheckSquare, Headset, Receipt, CreditCard, PenTool, User, Bell, Package, ShoppingCart, Key, Trash, MessageSquare, PhoneCall, FileText, HandHelping, MapPin, Building2, Network, Badge, Bed, TrendingUp, TrendingDown, Wallet, Landmark, UserCog, GraduationCap, Clock, DoorOpen, ListChecks, BookOpen, CookingPot, Shirt, Pill, ClipboardCheck, Stethoscope, Ambulance, Truck, Wrench, Radio, Mail, MessageCircle, MessagesSquare, FilePenLine, FolderArchive } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useAuthStore } from '../store/authStore'
import { canAccessPath } from '../lib/access'

type MenuLink = { name: string, icon: any, href: string }

const roleDashboardOwners: Record<string, string> = {
    '/master/dashboard': 'master data manager',
    '/finance/dashboard': 'finance manager',
    '/hr/manager-dashboard': 'hr manager',
    '/security/dashboard': 'security supervisor',
    '/cms/dashboard': 'cms manager',
    '/admin-files/dashboard': 'admin files manager',
    '/task-user/dashboard': 'profile task user',
    '/uec/elder-care-dashboard': 'elder care admin',
    '/inhouse-care/dashboard': 'in-house care manager',
    '/operations/dashboard': 'elder operations manager',
    '/inventory/elder-dashboard': 'elder inventory manager',
    '/task-log/dashboard': 'task log coordinator',
    '/finance/elder-dashboard': 'elder finance manager',
    '/healthcare/patient-care-dashboard': 'patient care manager',
    '/healthcare/medical-monitor-dashboard': 'medical monitor coordinator',
    '/allocation/dashboard': 'care allocation manager',
    '/inventory/medical-dashboard': 'medical inventory manager',
    '/ambulance/booking-dashboard': 'ambulance booking coordinator',
    '/ambulance/dispatch-dashboard': 'dispatch manager',
    '/ambulance/fleet-dashboard': 'fleet manager',
    '/ambulance/billing-dashboard': 'ambulance billing manager',
    '/ambulance/emergency-dashboard': 'emergency call coordinator',
    '/crm/dashboard': 'enquiry desk manager',
    '/crm/follow-up-dashboard': 'follow-up coordinator',
    '/customer-care/dashboard': 'customer relations manager',
    '/omnichannel/dashboard': 'omnichannel coordinator',
    '/crm/admissions-dashboard': 'admissions coordinator'
}

const withoutRoleDashboards = (links: MenuLink[]) =>
    links.filter((link) => !roleDashboardOwners[link.href])

const getNormalizedRole = (role: unknown) => {
    if (!role) return ''
    if (typeof role === 'string') return role.trim().toLowerCase()
    if (typeof role === 'object' && 'name' in role) {
        const roleName = (role as { name?: unknown }).name
        return typeof roleName === 'string' ? roleName.trim().toLowerCase() : ''
    }
    return ''
}

const getRoleDashboardLink = (role: string) => {
    const entry = Object.entries(roleDashboardOwners).find(([, ownerRole]) => ownerRole === role)
    if (!entry) return null

    const [href] = entry
    return Object.values(subMenus).flat().find((link) => link.href === href) || null
}

const masterMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/master/dashboard' },
    { name: 'City Master', icon: MapPin, href: '/master/city' },
    { name: 'Unit Master', icon: Building2, href: '/master/unit' },
    { name: 'Client Services', icon: HandHelping, href: '/master/client-services' },
    { name: 'Department Master', icon: Network, href: '/master/department' },
    { name: 'Designation Master', icon: Badge, href: '/master/designation' },
    { name: 'Labour Services', icon: Users, href: '/master/labour-services' },
    { name: 'Payment Category', icon: CreditCard, href: '/master/payment-category' },
    { name: 'Vendor Master', icon: Briefcase, href: '/master/vendor' },
    { name: 'Room Management', icon: Bed, href: '/master/room' }
]

const financeMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/finance/dashboard' },
    { name: 'Cashbox', icon: Wallet, href: '/finance/cashbox' },
    { name: 'Income', icon: TrendingUp, href: '/finance/income' },
    { name: 'Expense', icon: TrendingDown, href: '/finance/expense' },
    { name: 'Pending Payments', icon: IndianRupee, href: '/finance/pending-payments' },
    { name: 'Allowance Tracking', icon: Landmark, href: '/finance/allowance-tracking' },
    { name: 'Invoice', icon: Receipt, href: '/finance/invoice' },
    { name: 'Renewals', icon: Calendar, href: '/finance/renewals' }
]

const hrMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/hr/manager-dashboard' },
    { name: 'HR Dashboard', icon: Activity, href: '/hr/dashboard' },
    { name: 'Staff Management', icon: Users, href: '/hr/staff' },
    { name: 'Staff Privileges', icon: UserCog, href: '/hr/staff-privilege' },
    { name: 'Leave Management', icon: FilePenLine, href: '/hr/leave' },
    { name: 'Shift Roster', icon: Clock, href: '/hr/roster' },
    { name: 'Document Tracker', icon: FileBox, href: '/hr/documents' },
    { name: 'Training Compliance', icon: GraduationCap, href: '/hr/training' },
    { name: 'Labour Management', icon: HandHelping, href: '/hr/labour' },
    { name: 'Recruitment', icon: Briefcase, href: '/hr/recruitment' },
    { name: 'Attendance', icon: ListChecks, href: '/hr/attendance' },
    { name: 'Holiday Mapping', icon: Calendar, href: '/hr/holiday' },
    { name: 'Payroll', icon: CreditCard, href: '/hr/payroll' },
    { name: 'HR Reports', icon: FileText, href: '/hr/reports' }
]

const securityMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/security/dashboard' },
    { name: 'Gate Management', icon: DoorOpen, href: '/security/gate-management' },
    { name: 'Visitor Management', icon: Users, href: '/security/visitor-management' },
    { name: 'Staff Register', icon: UserCog, href: '/security/staff-register' },
    { name: 'Vehicle Register', icon: Truck, href: '/security/vehicle-register' },
    { name: 'Entry Logs', icon: ClipboardList, href: '/security/entry-logs' },
    { name: 'Security Reports', icon: FileText, href: '/security/reports' },
    { name: 'OTP Logs', icon: Key, href: '/security/otp-logs' }
]

const cmsMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/cms/dashboard' },
    { name: 'Blogs', icon: PenTool, href: '/cms/blogs' },
    { name: 'FAQ', icon: HelpCircle, href: '/cms/faq' },
    { name: 'Events', icon: Calendar, href: '/cms/events' }
]

const profileMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/task-user/dashboard' },
    { name: 'My Profile', icon: User, href: '/profile/me' },
    { name: 'Daily Task', icon: ClipboardList, href: '/profile/tasks' },
    { name: 'My Attendance', icon: ListChecks, href: '/profile/attendance' },
    { name: 'My Leave', icon: Calendar, href: '/profile/leave' },
    { name: 'Notifications', icon: Bell, href: '/profile/notifications' }
]

const clientPortalMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/client-portal/dashboard' },
    { name: 'My Profile', icon: User, href: '/client-portal/profile' },
    { name: 'My Services', icon: HandHelping, href: '/client-portal/services' },
    { name: 'My Medicines', icon: Pill, href: '/client-portal/medicines' },
    { name: 'My Complaints', icon: MessageSquare, href: '/client-portal/complaints' },
    { name: 'Notifications', icon: Bell, href: '/client-portal/notifications' }
]

const superAdminMenus: MenuLink[] = [
    { name: 'User Management', icon: User, href: '/super-admin/users' }
]

const inHouseCareMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/inhouse-care/dashboard' },
    { name: 'In-House Revenue', icon: IndianRupee, href: '/inhouse-care/revenue' },
    { name: 'In-House Vitals', icon: Activity, href: '/inhouse-care/vitals' },
    { name: 'ADL Daily Living', icon: CheckSquare, href: '/healthcare/adl' }
]

const organizationDashboardMenus: Record<string, MenuLink> = {
    UNCF: { name: 'UNCF Dashboard', icon: LayoutDashboard, href: '/uncf/dashboard' },
    ElderCare: { name: 'Dashboard', icon: LayoutDashboard, href: '/uec/elder-care-dashboard' },
    UEC: { name: 'UEC Dashboard', icon: LayoutDashboard, href: '/uec/dashboard' },
    UHC: { name: 'UHC Dashboard', icon: LayoutDashboard, href: '/uhc/dashboard' },
    UA: { name: 'UA Dashboard', icon: LayoutDashboard, href: '/ua/dashboard' },
    UEO: { name: 'UEO Dashboard', icon: LayoutDashboard, href: '/ueo/dashboard' }
}

const adminFileMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin-files/dashboard' },
    { name: 'UNCF Documents', icon: FileText, href: '/admin-files/uncf-documents' },
    { name: 'Staff Files', icon: UserCog, href: '/admin-files/staff-files' },
    { name: 'Client Files', icon: Users, href: '/admin-files/client-files' },
    { name: 'Finance Files', icon: FolderArchive, href: '/admin-files/finance-files' },
    { name: 'UEC Licence Files', icon: Shield, href: '/admin-files/uec-licence-files' },
    { name: 'Admin Record Books', icon: BookOpen, href: '/admin-files/record-books' },
    { name: 'Nursing Files', icon: HeartPulse, href: '/admin-files/nursing-files' },
    { name: 'Watchman Files', icon: DoorOpen, href: '/admin-files/watchman-files' }
]

const elderOperationsMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/operations/dashboard' },
    { name: 'Food Preparation', icon: CookingPot, href: '/operations/food-preparation' },
    { name: 'Nutrition Planning', icon: Calendar, href: '/operations/nutrition-planning' },
    { name: 'Laundry Management', icon: Shirt, href: '/operations/laundry-management' },
    { name: 'Maintenance', icon: Settings, href: '/operations/maintenance' },
    { name: 'Waste Management', icon: Trash, href: '/operations/waste-management' }
]

const elderInventoryMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/inventory/elder-dashboard' },
    { name: 'Ration Products', icon: Package, href: '/inventory/products/ration' },
    { name: 'Stationary Products', icon: FilePenLine, href: '/inventory/products/stationary' },
    { name: 'Electrical & Plumbing', icon: Wrench, href: '/inventory/products/electrical-plumbing' },
    { name: 'Stock', icon: Database, href: '/inventory/stock' },
    { name: 'Stock Issue', icon: ClipboardCheck, href: '/inventory/stock-issue' },
    { name: 'Medicine Requests', icon: Pill, href: '/healthcare/medicine-requests' },
    { name: 'Medicine Issue Log', icon: ClipboardList, href: '/healthcare/medicine-issue-log' },
    { name: 'Medication Schedule', icon: CalendarClock, href: '/healthcare/medication-schedule' },
    { name: 'Stock Movements', icon: ListChecks, href: '/inventory/stock-movements' },
    { name: 'Purchase Orders', icon: ShoppingCart, href: '/inventory/purchase-orders' },
    { name: 'Low Stock Alerts', icon: Bell, href: '/inventory/low-stock-alerts' }
]

const taskLogMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/task-log/dashboard' },
    { name: 'Assign Daily Task', icon: ClipboardList, href: '/task-log/assign-daily' },
    { name: 'Assign Schedule Task', icon: Calendar, href: '/task-log/assign-schedule' },
    { name: 'Daily Task Approval', icon: ClipboardCheck, href: '/task-log/daily-approval' },
    { name: 'Schedule Task Approval', icon: CheckSquare, href: '/task-log/schedule-approval' }
]

const healthcareMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/healthcare/patient-care-dashboard' },
    { name: 'Dashboard', icon: LayoutDashboard, href: '/healthcare/medical-monitor-dashboard' },
    { name: 'Critical Patients', icon: HeartPulse, href: '/healthcare/critical-patients' },
    { name: 'Patient Dashboard', icon: Stethoscope, href: '/healthcare/patient-dashboard' },
    { name: 'Vital Form', icon: ClipboardCheck, href: '/healthcare/vitals' },
    { name: 'Medical Monitor', icon: Activity, href: '/healthcare/medical-monitor' },
    { name: 'Medication Management', icon: Pill, href: '/healthcare/medication-management' },
    { name: 'Medicine Requests', icon: ClipboardCheck, href: '/healthcare/medicine-requests' },
    { name: 'Medicine Issue Log', icon: ClipboardList, href: '/healthcare/medicine-issue-log' },
    { name: 'Medication Schedule', icon: CalendarClock, href: '/healthcare/medication-schedule' },
    { name: 'Nutrition & Diet', icon: ClipboardList, href: '/healthcare/nutrition-diet' }
]

const allocationMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/allocation/dashboard' },
    { name: 'Clinical Care Allocation', icon: HeartPulse, href: '/allocation/clinical-care' },
    { name: 'Home Care Allocation', icon: Users, href: '/allocation/home-care' },
    { name: 'In-House Care Allocation', icon: CheckSquare, href: '/allocation/inhouse-care' },
    { name: 'Other Care Allocation', icon: Briefcase, href: '/allocation/others' }
]

const medicalInventoryMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/inventory/medical-dashboard' },
    { name: 'Medical Assets', icon: Package, href: '/inventory/products/assets' },
    { name: 'Purchase Orders', icon: ShoppingCart, href: '/inventory/purchase-orders' },
    { name: 'Stock', icon: Database, href: '/inventory/stock' },
    { name: 'Stock Issue', icon: ClipboardCheck, href: '/inventory/stock-issue' },
    { name: 'Medicine Requests', icon: Pill, href: '/healthcare/medicine-requests' },
    { name: 'Medicine Issue Log', icon: ClipboardList, href: '/healthcare/medicine-issue-log' },
    { name: 'Medication Schedule', icon: CalendarClock, href: '/healthcare/medication-schedule' },
    { name: 'Stock Movements', icon: ListChecks, href: '/inventory/stock-movements' }
]

const ambulanceServiceMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/ambulance/booking-dashboard' },
    { name: 'Dashboard', icon: LayoutDashboard, href: '/ambulance/dispatch-dashboard' },
    { name: 'Dashboard', icon: LayoutDashboard, href: '/ambulance/fleet-dashboard' },
    { name: 'Ambulance Bookings', icon: Ambulance, href: '/ambulance/bookings' },
    { name: 'Dispatch Management', icon: Radio, href: '/ambulance/dispatch' },
    { name: 'Vehicle & Fleet', icon: Truck, href: '/ambulance/fleet' },
    { name: 'Driver & Staff Assignment', icon: Users, href: '/ambulance/staff-assignment' },
    { name: 'Trip Sheets', icon: ClipboardList, href: '/ambulance/trip-sheets' }
]

const ambulanceSupportMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/ambulance/emergency-dashboard' },
    { name: 'Dashboard', icon: LayoutDashboard, href: '/ambulance/billing-dashboard' },
    { name: 'Ambulance Maintenance', icon: Settings, href: '/ambulance/maintenance' },
    { name: 'Ambulance Billing', icon: Receipt, href: '/ambulance/billing' },
    { name: 'Emergency Call Logs', icon: PhoneCall, href: '/ambulance/call-logs' },
    { name: 'Field Duty', icon: Briefcase, href: '/hr/field-duty' }
]

const enquiryMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/crm/dashboard' },
    { name: 'Dashboard', icon: LayoutDashboard, href: '/crm/follow-up-dashboard' },
    { name: 'Dashboard', icon: LayoutDashboard, href: '/crm/admissions-dashboard' },
    { name: 'Active Enquiries', icon: Activity, href: '/crm/active-enquiries' },
    { name: 'Enquiry Follow-up', icon: Calendar, href: '/crm/enquiry-follow-up' },
    { name: 'New Enquiry', icon: Headset, href: '/crm/new-enquiry' },
    { name: 'All Clients', icon: Users, href: '/crm/clients' },
    { name: 'Admission Tracking', icon: ClipboardCheck, href: '/crm/admission-tracking' },
    { name: 'Admission Forms', icon: FilePenLine, href: '/crm/admission-forms' }
]

const customerCareMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/customer-care/dashboard' },
    { name: 'Welcome Call', icon: PhoneCall, href: '/business/welcome-call' },
    { name: 'Customer Care', icon: Headset, href: '/crm/customer-care' },
    { name: 'Pending Feedbacks', icon: MessageSquare, href: '/customer-care/pending-feedback' },
    { name: 'Customer Complaints', icon: HelpCircle, href: '/customer-care/complaints' },
    { name: 'Feedback', icon: MessageCircle, href: '/crm/feedback' },
    { name: 'Service History', icon: ClipboardList, href: '/customer-care/service-history' }
]

const omnichannelMenus: MenuLink[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/omnichannel/dashboard' },
    { name: 'Conversations', icon: MessagesSquare, href: '/omnichannel/conversations' },
    { name: 'Email', icon: Mail, href: '/omnichannel/email' },
    { name: 'WhatsApp', icon: MessageCircle, href: '/omnichannel/whatsapp' },
    { name: 'SMS', icon: MessageSquare, href: '/omnichannel/sms' },
    { name: 'Missed Calls', icon: Radio, href: '/omnichannel/missed-calls' },
    { name: 'Calls', icon: PhoneCall, href: '/omnichannel/calls' }
]

export const subMenus: Record<string, MenuLink[]> = {
    'Home': [
        { name: 'Home', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Workflow Timeline', icon: Activity, href: '/workflow/timeline' },
        { name: 'Reports', icon: FileText, href: '/reports/dashboard' },
        ...adminFileMenus
    ],
    'UNCF': [
        organizationDashboardMenus.UNCF,
        ...withoutRoleDashboards(masterMenus),
        ...withoutRoleDashboards(financeMenus),
        ...withoutRoleDashboards(hrMenus),
        ...withoutRoleDashboards(securityMenus),
        ...withoutRoleDashboards(cmsMenus)
    ],
    'Super Admin': superAdminMenus,
    'Master': masterMenus,
    'Finance': financeMenus,
    'Human Resource': hrMenus,
    'Security': securityMenus,
    'CMS': cmsMenus,
    'Profile': profileMenus,
    'Client Portal': clientPortalMenus,
    'Admin Files': adminFileMenus,

    'UEC': [
        organizationDashboardMenus.UEC,
        ...withoutRoleDashboards(inHouseCareMenus),
        ...withoutRoleDashboards(elderOperationsMenus),
        ...withoutRoleDashboards(elderInventoryMenus),
        { name: 'In-House Expense', icon: Receipt, href: '/finance/inhouse-expense' },
        ...withoutRoleDashboards(taskLogMenus)
    ],
    'In-House Care': inHouseCareMenus,
    'Elder Operations': elderOperationsMenus,
    'Elder Inventory': elderInventoryMenus,
    'Elder Finance': [{ name: 'Dashboard', icon: LayoutDashboard, href: '/finance/elder-dashboard' }, { name: 'In-House Expense', icon: Receipt, href: '/finance/inhouse-expense' }],
    'Task Log': taskLogMenus,

    'UHC': [
        organizationDashboardMenus.UHC,
        ...withoutRoleDashboards(healthcareMenus),
        ...withoutRoleDashboards(allocationMenus),
        ...withoutRoleDashboards(medicalInventoryMenus)
    ],
    'Healthcare': healthcareMenus,
    'Care Allocation': allocationMenus,
    'Medical Inventory': medicalInventoryMenus,

    'UA': [
        organizationDashboardMenus.UA,
        ...withoutRoleDashboards(ambulanceServiceMenus),
        ...withoutRoleDashboards(ambulanceSupportMenus)
    ],
    'Ambulance Services': ambulanceServiceMenus,
    'Ambulance Support': ambulanceSupportMenus,

    'UEO': [
        organizationDashboardMenus.UEO,
        ...withoutRoleDashboards(enquiryMenus),
        ...withoutRoleDashboards(customerCareMenus),
        ...withoutRoleDashboards(omnichannelMenus)
    ],
    'Enquiry Desk': enquiryMenus,
    'Customer Relations': customerCareMenus,
    'Omnichannel': omnichannelMenus
}

export function Sidebar({ activeMenu }: { activeMenu: string }) {
    const location = useLocation()
    const navigate = useNavigate()
    const user = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout)
    const normalizedRole = getNormalizedRole(user?.role)
    const isStaffSelfService = Boolean(user?.staffId)
    const isClientPortal = ['family member', 'client', 'client family member'].includes(normalizedRole)
    const canShowLink = (link: MenuLink) => {
        const ownerRole = roleDashboardOwners[link.href]
        if (link.href === '/task-user/dashboard' && user?.staffId) return canAccessPath(user, link.href)
        if (ownerRole && ownerRole !== normalizedRole) return false
        return canAccessPath(user, link.href)
    }

    const homeLinks = subMenus['Home'].filter(canShowLink)
    const uncfLinks = subMenus['UNCF'].filter(canShowLink)
    const fallbackLinks = homeLinks.length > 0 ? homeLinks : uncfLinks
    const currentLinks = (isStaffSelfService ? profileMenus : isClientPortal ? clientPortalMenus : (subMenus[activeMenu] || [])).filter(canShowLink)
    const baseVisibleLinks = currentLinks.length > 0 ? currentLinks : fallbackLinks
    const roleDashboardLink = getRoleDashboardLink(normalizedRole)
    const combinedLinks = roleDashboardLink && !isStaffSelfService && canShowLink(roleDashboardLink) && !baseVisibleLinks.some((link) => link.href === roleDashboardLink.href)
        ? [roleDashboardLink, ...baseVisibleLinks]
        : baseVisibleLinks
    const visibleLinks = Array.from(new Map(combinedLinks.map((link) => [link.href, link])).values())
    const canAccessSettings = canAccessPath(user, '/settings')

    return (
        <aside className="w-[56px] hover:w-[236px] transition-[width] duration-300 ease-in-out shrink-0 h-full relative z-40 group md:block hidden">
            <div className="w-full h-full flex flex-col items-start gap-4 pointer-events-none">

                {/* Split 1: Theme Toggle Container (RIGID) */}
                <div className="bg-white dark:bg-black dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 rounded-full w-[56px] flex flex-col items-center py-2 shrink-0 pointer-events-auto transition-all">
                    <button
                        onClick={() => document.documentElement.classList.remove('dark')}
                        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-[#1E1E1E] text-white shadow-sm mb-1 transition-all dark:bg-transparent dark:text-gray-500 dark:hover:text-gray-300 dark:shadow-none"
                        title="Light Theme"
                    >
                        <Sun className="w-4 h-4 shrink-0" />
                    </button>
                    <button
                        onClick={() => document.documentElement.classList.add('dark')}
                        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-800 dark:text-gray-200 transition-all dark:bg-primary-500 dark:text-white dark:shadow-sm"
                        title="Dark Theme"
                    >
                        <Moon className="w-4 h-4 shrink-0" />
                    </button>
                </div>

                {/* Split 2: Menu Icons Container (EXPANDS) */}
                <div className="bg-white dark:bg-black dark:border-white/10 shadow-lg sm:shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 rounded-[28px] w-full flex-1 flex flex-col items-center py-3 px-1.5 overflow-y-auto [&::-webkit-scrollbar]:w-0 pointer-events-auto transition-all duration-300">
                    <div className="flex flex-col gap-2 w-full">
                        {visibleLinks.map((link) => {
                            const isActive = location.pathname === link.href || (link.href === '/dashboard' && location.pathname === '/')
                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    title={link.name}
                                    className={cn(
                                        "h-11 w-full rounded-full flex items-center justify-center group-hover:justify-start group-hover:px-4 transition-all shrink-0",
                                        isActive ? "bg-primary-500 text-white shadow-md relative" : "text-gray-400 hover:bg-primary-50 hover:text-primary-500 relative border border-transparent hover:border-primary-100"
                                    )}
                                >
                                    <link.icon className="w-[18px] h-[18px] shrink-0" />
                                    {/* Auto-expand text snippet */}
                                    <span className="opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-[160px] transition-all overflow-hidden whitespace-nowrap text-[13px] font-bold ml-0 group-hover:ml-3">
                                        {link.name}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Split 3: Bottom Actions Container (RIGID) */}
                <div className="bg-white dark:bg-black dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 rounded-full w-[56px] flex flex-col items-center py-2 shrink-0 pointer-events-auto transition-all gap-1">
                    {canAccessSettings ? (
                        <button onClick={() => navigate('/settings')} className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100 transition-all" title="Settings">
                            <Settings className="w-[18px] h-[18px] shrink-0" />
                        </button>
                    ) : null}
                    <button onClick={() => { logout(); navigate('/auth/login', { replace: true }); }} className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all" title="Logout">
                        <LogOut className="w-[18px] h-[18px] shrink-0" />
                    </button>
                </div>

            </div>
        </aside>
    )
}
