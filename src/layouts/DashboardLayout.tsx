import { useEffect, useRef, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import axios from "axios"
import { Sidebar, subMenus } from "./Sidebar"
import { Navbar } from "./Navbar"
import { api } from "../lib/axios"
import { useAuthStore } from "../store/authStore"
import { connectRealtimeSocket, realtimeSocket } from "../lib/realtimeSocket"
import { useToast } from "../components/Toast"
import { CallNotificationCenter } from "../components/CallNotificationCenter"
import { canAccessPath } from "../lib/access"

const aggregateMenuKeys = new Set(["Home", "UNCF", "UEC", "UHC", "UA", "UEO", "Client Portal", "Super Admin", "Admin Files"])

const concreteMenuOverrides: Array<{ prefix: string, menu: string }> = [
    { prefix: "/admin-files", menu: "Admin Files" }
]

const getRoleName = (role: unknown, fallback = "Employee") => {
    if (!role) return fallback
    if (typeof role === "string") return role
    if (typeof role === "object" && "name" in role) {
        const roleName = (role as { name?: unknown }).name
        return typeof roleName === "string" && roleName.trim() ? roleName : fallback
    }
    return fallback
}

export default function DashboardLayout() {
    const [activeMenu, setActiveMenu] = useState("Home")
    const sessionSyncInFlightRef = useRef(false)
    const location = useLocation()
    const token = useAuthStore((state) => state.token)
    const user = useAuthStore((state) => state.user)
    const activeUnitId = useAuthStore((state) => state.activeUnitId)
    const setUser = useAuthStore((state) => state.setUser)
    const { toast } = useToast()
    const authDebug = import.meta.env.VITE_AUTH_DEBUG === 'true'

    useEffect(() => {
        const path = location.pathname

        if (path.startsWith("/workflow/timeline")) {
            return
        }

        const concreteMenu = concreteMenuOverrides.find((item) => path.startsWith(item.prefix))

        if (concreteMenu) {
            const canUseConcreteMenu = (subMenus[concreteMenu.menu] || []).some((item) =>
                canAccessPath(user, item.href) && path.startsWith(item.href)
            )

            if (canUseConcreteMenu) {
                setActiveMenu((current) => current === concreteMenu.menu ? current : concreteMenu.menu)
            }
            return
        }

        // Prefer concrete module buckets before aggregate unit buckets like UNCF/UA.
        const menuEntries = Object.entries(subMenus)
        const foundMenu = [
            ...menuEntries.filter(([key]) => !aggregateMenuKeys.has(key)),
            ...menuEntries.filter(([key]) => aggregateMenuKeys.has(key))
        ].find(([_, items]) =>
            items.some(item =>
                canAccessPath(user, item.href) && (
                    path.startsWith(item.href) ||
                    (item.href === '/dashboard' && path === '/')
                )
            )
        )

        if (foundMenu) {
            setActiveMenu((current) => current === foundMenu[0] ? current : foundMenu[0])
        }
    }, [location.pathname, user])

    useEffect(() => {
        if (!token || !user) return

        let ignore = false
        let intervalId: number | undefined

        const syncSessionUser = async () => {
            if (sessionSyncInFlightRef.current) return
            sessionSyncInFlightRef.current = true

            try {
                const response = await api.get('/profile/me', { timeout: 30000 })
                const sessionUser = response.data?.data?.sessionUser

                if (!ignore && sessionUser) {
                    if (authDebug) {
                        console.debug('[AUTH][profile-sync]', {
                            userId: sessionUser.id,
                            hasUnitId: Boolean(sessionUser.unitId),
                            permissions: sessionUser.permissions?.length || 0,
                        })
                    }

                    setUser({
                        id: sessionUser.id,
                        name: sessionUser.name,
                        email: sessionUser.email,
                        mobile: sessionUser.mobile || null,
                        role: getRoleName(sessionUser.role, getRoleName(user.role)),
                        permissions: Array.isArray(sessionUser.permissions) ? sessionUser.permissions : [],
                        unitAccess: Array.isArray(sessionUser.unitAccess) ? sessionUser.unitAccess : [sessionUser.unitId].filter(Boolean),
                        unitId: sessionUser.unitId,
                        staffId: sessionUser.staffId || null,
                        empId: sessionUser.empId || null,
                        menuPrivilege: sessionUser.menuPrivilege || null
                    })
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    return
                }
                if (authDebug) {
                    console.debug('[AUTH][profile-sync-failed]', error)
                }
                if (authDebug) {
                    console.debug('Failed to refresh session user', error)
                }
            } finally {
                sessionSyncInFlightRef.current = false
            }
        }

        syncSessionUser()
        intervalId = window.setInterval(syncSessionUser, 60000)

        return () => {
            ignore = true
            if (intervalId) {
                window.clearInterval(intervalId)
            }
        }
    }, [setUser, token, user?.id])

    useEffect(() => {
        if (!token || !user?.id) return

        connectRealtimeSocket()

        const handleNotification = (payload: {
            userId?: string
            message: string
            type?: string
        }) => {
            if (payload.userId !== user.id) return

            toast({
                type: payload.type === 'ENQUIRY_FOLLOW_UP_ASSIGNED' ? 'info' : 'info',
                title: 'New Notification',
                message: payload.message
            })
        }

        realtimeSocket.on('notification:new', handleNotification)

        return () => {
            realtimeSocket.off('notification:new', handleNotification)
        }
    }, [activeUnitId, token, toast, user?.id])

    return (
        <div className="h-dvh min-h-dvh w-full bg-[#f4f6f8] dark:bg-black font-sans text-gray-900 dark:text-gray-100 overflow-hidden relative flex flex-col p-2 md:p-4">
            {/* Top Navbar spans full width initially to house the logo, pills, and right icons */}
            <Navbar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

            <div className="flex flex-1 min-h-0 overflow-hidden mt-2 gap-2 md:mt-4 md:gap-4 2xl:mt-6 2xl:gap-6">
                {/* Slim Floating Sidebar */}
                <Sidebar activeMenu={activeMenu} />

                {/* Main Dashboard Area */}
                <main className="flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-0 rounded-2xl md:rounded-[32px]">
                    <Outlet />
                </main>
            </div>

            <CallNotificationCenter />
        </div>
    )
}
