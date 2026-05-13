import axios from 'axios'
import { token } from './token'
import type {
  PartnerListParams,
  PartnerUpdate,
  OrderListParams,
  FaqCreate,
  BroadcastData,
  AuditParams,
} from '../types'

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

instance.interceptors.request.use((config) => {
  const t = token.get()
  if (t) config.headers.Authorization = `Bearer ${t}`
  return config
})

instance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      token.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  auth: {
    login: (email: string, password: string) =>
      instance.post('/admin/auth/login', { email, password }),
    me: () => instance.get('/admin/auth/me'),
  },
  partners: {
    list: (params: PartnerListParams) =>
      instance.get('/admin/partners', { params }),
    get: (id: number) => instance.get(`/admin/partners/${id}`),
    update: (id: number, data: Partial<PartnerUpdate>) =>
      instance.patch(`/admin/partners/${id}`, data),
    forceVerifyEmail: (id: number) =>
      instance.post(`/admin/partners/${id}/force-verify-email`),
    resetPassword: (id: number) =>
      instance.post(`/admin/partners/${id}/reset-password`),
  },
  ipToo: {
    pending: () => instance.get('/admin/ip-too/pending'),
    verify: (id: number, action: 'approve' | 'reject', reason?: string) =>
      instance.patch(`/admin/ip-too/${id}/verify`, { action, rejection_reason: reason }),
  },
  orders: {
    list: (params: OrderListParams) =>
      instance.get('/admin/orders', { params }),
    updateStatus: (id: number, status: string) =>
      instance.patch(`/admin/orders/${id}/status`, { status }),
  },
  inventory: {
    list: () => instance.get('/admin/inventory'),
    update: (productId: number, data: { stock_qty?: number; is_active?: boolean }) =>
      instance.patch(`/admin/inventory/${productId}`, data),
    import: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return instance.post('/admin/inventory/import', form)
    },
  },
  faq: {
    list: () => instance.get('/admin/faq'),
    create: (data: FaqCreate) => instance.post('/admin/faq', data),
    update: (id: number, data: Partial<FaqCreate>) =>
      instance.patch(`/admin/faq/${id}`, data),
    delete: (id: number) => instance.delete(`/admin/faq/${id}`),
  },
  notifications: {
    broadcast: (data: BroadcastData) =>
      instance.post('/admin/notifications/broadcast', data),
  },
  suggestions: {
    list: (params: { page?: number; limit?: number; is_read?: boolean }) =>
      instance.get('/admin/suggestions', { params }),
    markRead: (id: number) => instance.patch(`/admin/suggestions/${id}/read`),
  },
  audit: {
    list: (params: AuditParams) => instance.get('/admin/audit', { params }),
  },
}
