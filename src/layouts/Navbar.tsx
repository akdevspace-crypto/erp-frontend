import { Search, Bell, MessageSquare, PhoneCall, User, ChevronDown, Menu, X, ClipboardList } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import { subMenus } from './Sidebar'
import { ChatModal } from '../components/OmnichannelChatModal'
import { NotificationModal } from '../components/NotificationModal'
import { useUnits } from '../features/master/hooks/useUnit'
import { useAuthStore } from '../store/authStore'
import { canAccessPath, canAccessUncfDashboard, getDefaultRouteForUser, hasAllAccess, hasUnitAccess } from '../lib/access'

export function Navbar({ activeMenu, setActiveMenu }: { activeMenu: string, setActiveMenu: (m: string) => void }) {
    const navigate = useNavigate()
    const [showChatModal, setShowChatModal] = useState(false)
    const [focusConversationId, setFocusConversationId] = useState<string | null>(null)
    const [openCallCenter, setOpenCallCenter] = useState(false)
    const [showNotificationModal, setShowNotificationModal] = useState(false)
    const [openMenuGroup, setOpenMenuGroup] = useState<string | null>(null)
    const [showAccountMenu, setShowAccountMenu] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { data: units = [] } = useUnits()
    const user = useAuthStore((state) => state.user)
    const activeUnitId = useAuthStore((state) => state.activeUnitId)
    const setActiveUnitId = useAuthStore((state) => state.setActiveUnitId)
    const isStaffSelfService = Boolean(user?.staffId)
    const normalizedRole = typeof user?.role === 'string'
        ? user.role.trim().toLowerCase()
        : String(user?.role?.name || '').trim().toLowerCase()
    const isClientPortal = ['family member', 'client', 'client family member'].includes(normalizedRole)
    const roleScopedMenuGroups: Record<string, Array<{ name: string, items: string[] }>> = {
        'uncf admin': [{ name: 'UNCF', items: ['UNCF', 'Master', 'Finance', 'Human Resource', 'Security', 'CMS', 'Profile'] }],
        'master data manager': [{ name: 'Master', items: ['Master'] }],
        'finance manager': [{ name: 'Finance', items: ['Finance'] }],
        'hr manager': [{ name: 'Human Resource', items: ['Human Resource'] }],
        'security supervisor': [{ name: 'Security', items: ['Security'] }],
        'cms manager': [{ name: 'CMS', items: ['CMS'] }],
        'admin files manager': [{ name: 'Admin Files', items: ['Admin Files'] }],
        'profile task user': [{ name: 'Profile', items: ['Profile'] }],
        'elder care admin': [{ name: 'UEC', items: ['UEC', 'In-House Care', 'Elder Operations', 'Elder Inventory', 'Elder Finance', 'Task Log'] }],
        'in-house care manager': [{ name: 'In-House Care', items: ['In-House Care'] }],
        'elder operations manager': [{ name: 'Elder Operations', items: ['Elder Operations'] }],
        'elder inventory manager': [{ name: 'Elder Inventory', items: ['Elder Inventory'] }],
        'task log coordinator': [{ name: 'Task Log', items: ['Task Log'] }],
        'elder finance manager': [{ name: 'Elder Finance', items: ['Elder Finance'] }],
        'uhc admin': [{ name: 'UHC', items: ['UHC', 'Healthcare', 'Care Allocation', 'Medical Inventory'] }],
        'patient care manager': [{ name: 'Healthcare', items: ['Healthcare'] }],
        'medical monitor coordinator': [{ name: 'Healthcare', items: ['Healthcare'] }],
        'care allocation manager': [{ name: 'Care Allocation', items: ['Care Allocation'] }],
        'medical inventory manager': [{ name: 'Medical Inventory', items: ['Medical Inventory'] }],
        'ua admin': [{ name: 'UA', items: ['UA', 'Ambulance Services', 'Ambulance Support'] }],
        'ambulance booking coordinator': [{ name: 'Ambulance Services', items: ['Ambulance Services'] }],
        'dispatch manager': [{ name: 'Ambulance Services', items: ['Ambulance Services'] }],
        'fleet manager': [{ name: 'Ambulance Services', items: ['Ambulance Services'] }],
        'ambulance billing manager': [{ name: 'Ambulance Support', items: ['Ambulance Support'] }],
        'emergency call coordinator': [{ name: 'Ambulance Support', items: ['Ambulance Support'] }],
        'ueo admin': [{ name: 'UEO', items: ['UEO', 'Enquiry Desk', 'Customer Relations', 'Omnichannel'] }],
        'enquiry desk manager': [{ name: 'Enquiry Desk', items: ['Enquiry Desk'] }],
        'follow-up coordinator': [{ name: 'Enquiry Desk', items: ['Enquiry Desk'] }],
        'admissions coordinator': [{ name: 'Enquiry Desk', items: ['Enquiry Desk'] }],
        'customer relations manager': [{ name: 'Customer Relations', items: ['Customer Relations'] }],
        'omnichannel coordinator': [{ name: 'Omnichannel', items: ['Omnichannel'] }]
    }
    const menuGroups = useMemo(() => (
        isStaffSelfService ? [
            { name: 'Home', items: ['Home'] },
            { name: 'Profile', items: ['Profile'] }
        ] : isClientPortal ? [
            { name: 'Client Portal', items: ['Client Portal'] }
        ] : roleScopedMenuGroups[normalizedRole] || [
            { name: 'Home', items: ['Home'] },
            { name: 'UNCF', items: ['UNCF', 'Master', 'Finance', 'Human Resource', 'Security', 'CMS', 'Profile'] },
            { name: 'UEC', items: ['UEC', 'In-House Care', 'Elder Operations', 'Elder Inventory', 'Elder Finance', 'Task Log'] },
            { name: 'UHC', items: ['UHC', 'Healthcare', 'Care Allocation', 'Medical Inventory'] },
            { name: 'UA', items: ['UA', 'Ambulance Services', 'Ambulance Support'] },
            { name: 'UEO', items: ['UEO', 'Enquiry Desk', 'Customer Relations', 'Omnichannel'] }
        ]
    ), [isClientPortal, isStaffSelfService, normalizedRole])
    const accessibleUnits = useMemo(
        () => hasAllAccess(user) ? units : units.filter((unit) => hasUnitAccess(user, unit.id)),
        [units, user]
    )
    const canAccessMenu = useCallback((menu: string) => {
        if (menu === 'UNCF' && !canAccessUncfDashboard(user)) return false

        const menuLinks = subMenus[menu] || []
        return menuLinks.some((link) => canAccessPath(user, link.href))
    }, [user])
    const visibleMenuGroups = useMemo(() => (
        menuGroups
            .map((group) => ({
                ...group,
                items: group.items.filter((item) => canAccessMenu(item))
            }))
            .filter((group) => group.items.length > 0)
    ), [canAccessMenu, menuGroups])
    const canAccessSuperAdmin = !isStaffSelfService && canAccessMenu('Super Admin')
    const canAccessAdminFiles = !isStaffSelfService && canAccessMenu('Admin Files')
    const canAccessClientPortal = !isStaffSelfService && !isClientPortal && canAccessMenu('Client Portal')
    const visibleMenus = useMemo(() => [
        ...visibleMenuGroups.flatMap((group) => group.items),
        ...(canAccessSuperAdmin ? ['Super Admin'] : []),
        ...(canAccessClientPortal ? ['Client Portal'] : [])
    ], [canAccessClientPortal, canAccessSuperAdmin, visibleMenuGroups])
    const validActiveMenus = useMemo(() => [
        ...visibleMenus,
        ...(canAccessAdminFiles ? ['Admin Files'] : []),
        ...(canAccessMenu('Home') ? ['Home'] : [])
    ], [canAccessAdminFiles, canAccessMenu, visibleMenus])
    const menuUnitCodes: Record<string, string> = {
        UNCF: 'UNCF',
        Master: 'UNCF',
        Finance: 'UNCF',
        'Human Resource': 'UNCF',
        Security: 'UNCF',
        CMS: 'UNCF',
        Profile: 'UNCF',
        UEC: 'UEC',
        'In-House Care': 'UEC',
        'Elder Operations': 'UEC',
        'Elder Inventory': 'UEC',
        'Elder Finance': 'UEC',
        'Task Log': 'UEC',
        UHC: 'UHC',
        Healthcare: 'UHC',
        'Care Allocation': 'UHC',
        'Medical Inventory': 'UHC',
        UA: 'UA',
        'Ambulance Services': 'UA',
        'Ambulance Support': 'UA',
        UEO: 'UEO',
        'Enquiry Desk': 'UEO',
        'Customer Relations': 'UEO',
        Omnichannel: 'UEO',
    }
    const resolveUnitForMenu = (menu: string) => {
        const unitCode = menuUnitCodes[menu]
        if (!unitCode) return null

        return accessibleUnits.find((unit) => {
            const code = String(unit.unitId || '').trim().toUpperCase()
            const shortName = String(unit.shortName || '').trim().toUpperCase()
            const name = String(unit.name || '').trim().toUpperCase()
            return code === unitCode || shortName === unitCode || name.includes(unitCode)
        }) || null
    }
    const activateMenu = (menu: string) => {
        setOpenMenuGroup(null)
        setActiveMenu(menu)

        if (menu === 'Client Portal' && !isClientPortal) {
            navigate('/client-portal/access')
            return
        }

        const menuUnit = resolveUnitForMenu(menu)
        if (menuUnit && menuUnit.id !== activeUnitId) {
            setActiveUnitId(menuUnit.id)
        }

        if (menu === 'UHC' || menu === 'UA' || menu === 'UEO') {
            const defaultRoute = getDefaultRouteForUser(user)
            if (
                defaultRoute.startsWith('/uhc') ||
                defaultRoute.startsWith('/healthcare') ||
                defaultRoute.startsWith('/allocation') ||
                defaultRoute.startsWith('/inventory') ||
                defaultRoute.startsWith('/ua') ||
                defaultRoute.startsWith('/ambulance') ||
                defaultRoute.startsWith('/hr/field-duty') ||
                defaultRoute.startsWith('/ueo') ||
                defaultRoute.startsWith('/crm') ||
                defaultRoute.startsWith('/business') ||
                defaultRoute.startsWith('/customer-care') ||
                defaultRoute.startsWith('/omnichannel')
            ) {
                navigate(defaultRoute)
                return
            }
        }

        const nextLink = (subMenus[menu] || []).find((link) => canAccessPath(user, link.href))
        if (nextLink) {
            navigate(nextLink.href)
        }
    }
    const getGroupActive = (items: string[]) => items.includes(activeMenu)
    const getGroupTarget = (items: string[]) => {
        if (items.includes(activeMenu)) return activeMenu
        return items[0]
    }
    const getDropdownItems = (group: { name: string, items: string[] }) =>
        group.items.filter((item) => item !== group.name)
    const resolvedActiveUnitId = activeUnitId || user?.unitId || ''
    const safeActiveUnitId = accessibleUnits.some((unit) => unit.id === resolvedActiveUnitId)
        ? resolvedActiveUnitId
        : (accessibleUnits[0]?.id || '')
    const profileRoute = isClientPortal ? '/client-portal/profile' : '/profile/me'
    const accountLinks = [
        { name: 'My Profile', icon: User, href: profileRoute },
        ...(isClientPortal
            ? [{ name: 'Notifications', icon: Bell, href: '/client-portal/notifications' }]
            : [
                { name: 'Daily Task', icon: ClipboardList, href: '/profile/tasks' },
                { name: 'Notifications', icon: Bell, href: '/profile/notifications' }
            ])
    ].filter((link) => canAccessPath(user, link.href))

    useEffect(() => {
        if (!accessibleUnits.length) return
        if (accessibleUnits.some((unit) => unit.id === resolvedActiveUnitId)) return

        const nextUnitId = accessibleUnits[0]?.id
        if (!nextUnitId || activeUnitId === nextUnitId) return

        setActiveUnitId(nextUnitId)
    }, [accessibleUnits, activeUnitId, resolvedActiveUnitId, setActiveUnitId])

    useEffect(() => {
        if (!visibleMenus.length) return
        if (validActiveMenus.includes(activeMenu)) return

        const fallbackMenu = visibleMenus[0]
        if (!fallbackMenu || fallbackMenu === activeMenu) return

        setActiveMenu(fallbackMenu)
    }, [activeMenu, setActiveMenu, validActiveMenus, visibleMenus])

    useEffect(() => {
        const handleOpenChat = (event: Event) => {
            const customEvent = event as CustomEvent<{ conversationId?: string | null }>
            setFocusConversationId(customEvent.detail?.conversationId || null)
            setOpenCallCenter(false)
            setShowChatModal(true)
        }

        window.addEventListener('omnichannel:open-chat', handleOpenChat)

        return () => {
            window.removeEventListener('omnichannel:open-chat', handleOpenChat)
        }
    }, [])

    return (
        <>
            <header className="flex items-center justify-between w-full h-[56px] shrink-0 overflow-visible relative gap-2">
                <div className="flex items-center gap-2 md:gap-3 shrink-0 w-auto min-w-0 lg:min-w-[180px] 2xl:min-w-[220px]">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <img src="/logo.png" alt="UNI Senth" className="h-8 md:h-12 w-auto object-contain" />
                    <span className="font-black text-lg md:text-[22px] tracking-tight text-gray-900 dark:text-gray-100 hidden md:block">
                        UNI <span className="text-primary-500">Senth</span>
                    </span>
                </div>

                {/* Center: Five grouped menu tabs with hover dropdowns */}
                <div className="hidden lg:flex flex-none w-fit max-w-[min(48vw,760px)] items-center justify-center gap-1 bg-white dark:bg-black dark:border-white/10 rounded-full p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 mx-3 xl:mx-6 overflow-visible whitespace-nowrap pointer-events-auto relative z-30">
                    {visibleMenuGroups.map((group) => (
                        <div
                            key={group.name}
                            className="relative"
                            onMouseEnter={() => setOpenMenuGroup(group.name)}
                            onMouseLeave={() => setOpenMenuGroup(null)}
                        >
                            <button
                                onClick={() => activateMenu(getGroupTarget(group.items))}
                                className={cn(
                                    "px-3 xl:px-5 py-2 rounded-full text-[12px] font-bold transition-all shrink-0 flex items-center gap-2",
                                    getGroupActive(group.items)
                                        ? "bg-primary-500 text-white shadow-sm"
                                        : "text-gray-500 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-white/5"
                                )}
                            >
                                <span>{group.name}</span>
                                {group.items.length > 1 ? <ChevronDown className="w-3.5 h-3.5" /> : null}
                            </button>

                            {getDropdownItems(group).length > 0 && openMenuGroup === group.name ? (
                                <div className="absolute left-1/2 top-[calc(100%-1px)] z-50 flex min-w-[190px] -translate-x-1/2 flex-col gap-1 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-black p-2 shadow-xl transition-all">
                                    {getDropdownItems(group).map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => activateMenu(item)}
                                            className={cn(
                                                "w-full rounded-xl px-3 py-2 text-left text-[12px] font-bold transition-colors",
                                                activeMenu === item
                                                    ? "bg-primary-500 text-white"
                                                    : "text-gray-600 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-500 dark:hover:bg-white/5"
                                            )}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-2 xl:gap-3 shrink-0 relative z-20">
                    {canAccessSuperAdmin ? (
                        <button
                            onClick={() => activateMenu('Super Admin')}
                            className={cn(
                                "hidden md:inline-flex items-center rounded-full px-4 py-2 text-[12px] font-bold shadow-[0_2px_12px_rgba(0,0,0,0.02)] border transition-all",
                                activeMenu === 'Super Admin'
                                    ? "border-primary-500 bg-primary-500 text-white"
                                    : "border-gray-100 bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-500 dark:border-white/10 dark:bg-black dark:text-gray-300 dark:hover:bg-white/5"
                            )}
                        >
                            User Management
                        </button>
                    ) : null}
                    {canAccessClientPortal ? (
                        <button
                            onClick={() => activateMenu('Client Portal')}
                            className={cn(
                                "hidden md:inline-flex items-center rounded-full px-4 py-2 text-[12px] font-bold shadow-[0_2px_12px_rgba(0,0,0,0.02)] border transition-all",
                                activeMenu === 'Client Portal'
                                    ? "border-primary-500 bg-primary-500 text-white"
                                    : "border-gray-100 bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-500 dark:border-white/10 dark:bg-black dark:text-gray-300 dark:hover:bg-white/5"
                            )}
                        >
                            Client Portal
                        </button>
                    ) : null}
                    <div className="flex items-center bg-white dark:bg-black dark:border-white/10 rounded-full p-1 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 gap-1 px-2 xl:px-3 py-1 xl:mr-2">
                        <button onClick={() => {
                            const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true })
                            document.dispatchEvent(event)
                        }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors"><Search className="w-[16px] h-[16px]" /></button>
                        <button onClick={() => setShowNotificationModal(true)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 relative transition-colors">
                            <Bell className="w-[16px] h-[16px]" />
                            <span className="absolute top-[6px] right-[6px] w-[5px] h-[5px] bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>
                        <button onClick={() => {
                            setFocusConversationId(null)
                            setOpenCallCenter(true)
                            setShowChatModal(true)
                        }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors" title="Call"><PhoneCall className="w-[16px] h-[16px]" /></button>
                        <button onClick={() => {
                            setFocusConversationId(null)
                            setOpenCallCenter(false)
                            setShowChatModal(true)
                        }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors"><MessageSquare className="w-[16px] h-[16px]" /></button>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowAccountMenu((value) => !value)}
                            className="flex items-center bg-white dark:bg-black dark:border-white/10 rounded-full p-1.5 pr-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-white/10 gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors active:scale-[0.98]"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-black/20 flex items-center justify-center border border-gray-200 dark:border-white/10 shrink-0 text-gray-500 dark:text-gray-400">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="hidden xl:flex flex-col text-left">
                                <span className="text-[12px] font-bold text-gray-900 dark:text-gray-100 leading-tight">{user?.name || 'User'}</span>
                                <span className="text-[10px] font-medium text-gray-400">{user?.email || 'admin@erp.com'}</span>
                            </div>
                            <ChevronDown className="hidden xl:block w-3.5 h-3.5 text-gray-400" />
                        </button>
                        {showAccountMenu ? (
                            <div className="absolute right-0 top-[48px] z-50 w-52 rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-black">
                                {accountLinks.map((link) => (
                                    <button
                                        key={link.href}
                                        onClick={() => {
                                            setShowAccountMenu(false)
                                            navigate(link.href)
                                        }}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 dark:text-gray-200 dark:hover:bg-white/5"
                                    >
                                        <link.icon className="h-4 w-4 text-gray-400" />
                                        {link.name}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            </header>
            {showChatModal ? (
                <ChatModal
                    isOpen={showChatModal}
                    onClose={() => {
                        setShowChatModal(false)
                        setFocusConversationId(null)
                        setOpenCallCenter(false)
                    }}
                    focusConversationId={focusConversationId}
                    openCallCenter={openCallCenter}
                />
            ) : null}
            <NotificationModal isOpen={showNotificationModal} onClose={() => setShowNotificationModal(false)} />

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-black shadow-xl">
                        <div className="flex flex-col h-full">
                            {/* Mobile Menu Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    <img src="/logo.png" alt="UNI Senth" className="h-8 w-auto object-contain" />
                                    <span className="font-black text-lg text-gray-900 dark:text-gray-100">
                                        UNI <span className="text-primary-500">Senth</span>
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Mobile Menu Content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-2">
                                    {visibleMenuGroups.map((group) => (
                                        <div key={group.name} className="space-y-1">
                                            <button
                                                onClick={() => activateMenu(getGroupTarget(group.items))}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-xl font-bold transition-colors",
                                                    getGroupActive(group.items)
                                                        ? "bg-primary-500 text-white"
                                                        : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-500 dark:hover:bg-white/5"
                                                )}
                                            >
                                                {group.name}
                                            </button>
                                            {getDropdownItems(group).length > 0 && (
                                                <div className="ml-4 space-y-1">
                                                    {getDropdownItems(group).map((item) => (
                                                        <button
                                                            key={item}
                                                            onClick={() => activateMenu(item)}
                                                            className={cn(
                                                                "w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                                                activeMenu === item
                                                                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/5"
                                                            )}
                                                        >
                                                            {item}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {(canAccessSuperAdmin || canAccessClientPortal) && (
                                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
                                        <div className="space-y-2">
                                            {canAccessSuperAdmin ? (
                                                <button
                                                    onClick={() => activateMenu('Super Admin')}
                                                    className={cn(
                                                        "w-full text-left px-4 py-3 rounded-xl font-bold transition-colors",
                                                        activeMenu === 'Super Admin'
                                                            ? "bg-primary-500 text-white"
                                                            : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-500 dark:hover:bg-white/5"
                                                    )}
                                                >
                                                    User Management
                                                </button>
                                            ) : null}
                                            {canAccessClientPortal ? (
                                                <button
                                                    onClick={() => activateMenu('Client Portal')}
                                                    className={cn(
                                                        "w-full text-left px-4 py-3 rounded-xl font-bold transition-colors",
                                                        activeMenu === 'Client Portal'
                                                            ? "bg-primary-500 text-white"
                                                            : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-500 dark:hover:bg-white/5"
                                                    )}
                                                >
                                                    Client Portal
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                )}

                                {/* Mobile Unit Selector */}
                                {canAccessAdminFiles && (
                                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Unit</label>
                                            <select
                                                value={safeActiveUnitId}
                                                onChange={(e) => setActiveUnitId(e.target.value)}
                                                className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg text-sm"
                                            >
                                                {accessibleUnits.map((unit) => (
                                                    <option key={unit.id} value={unit.id}>
                                                        {unit.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
