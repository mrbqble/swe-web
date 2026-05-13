import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, Navigate } from 'react-router-dom'
import {
  Users,
  ShieldCheck,
  Package,
  Box,
  HelpCircle,
  Bell,
  MessageSquare,
  FileText,
} from 'lucide-react'
import { useAuth } from './AuthContext'
import { api } from '../services/api'

const SIDEBAR_BG = '#1A3C6E'
const ACTIVE_COLOR = '#60A5FA'

const navItems = [
  { to: '/partners', label: 'Партнёры', Icon: Users },
  { to: '/ip-too', label: 'IP/TOO Queue', Icon: ShieldCheck, badge: true },
  { to: '/orders', label: 'Заказы', Icon: Package },
  { to: '/inventory', label: 'Склад', Icon: Box },
  { to: '/faq', label: 'FAQ', Icon: HelpCircle },
  { to: '/broadcast', label: 'Рассылка', Icon: Bell },
  { to: '/suggestions', label: 'Предложения', Icon: MessageSquare },
  { to: '/audit', label: 'Журнал аудита', Icon: FileText },
]

export const Layout: React.FC = () => {
  const { admin, logout } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    api.ipToo.pending().then((r) => {
      const data = r.data
      setPendingCount(Array.isArray(data) ? data.length : (data?.total ?? 0))
    }).catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div
        style={{
          width: 240,
          minWidth: 240,
          background: SIDEBAR_BG,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          overflowY: 'auto',
        }}
      >
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.5 }}>iCare Admin</span>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(({ to, label, Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 20px',
                color: isActive ? ACTIVE_COLOR : 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 400,
                background: isActive ? 'rgba(96,165,250,0.1)' : 'transparent',
                borderLeft: isActive ? `3px solid ${ACTIVE_COLOR}` : '3px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge && pendingCount > 0 && (
                <span
                  style={{
                    background: '#EF4444',
                    color: '#fff',
                    borderRadius: 10,
                    padding: '1px 7px',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <div
          style={{
            height: 56,
            background: '#fff',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <span style={{ fontWeight: 600, color: '#1A3C6E', fontSize: 16 }}>iCare Admin</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#374151', fontSize: 14 }}>{admin?.name ?? admin?.email}</span>
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: '1px solid #D1D5DB',
                borderRadius: 6,
                padding: '5px 14px',
                cursor: 'pointer',
                color: '#374151',
                fontSize: 14,
              }}
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, background: '#F9FAFB', padding: 24, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export const ProtectedLayout: React.FC = () => {
  const { admin, isLoading } = useAuth()
  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Загрузка...</div>
  if (!admin) return <Navigate to="/login" replace />
  return <Layout />
}
