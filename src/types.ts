export interface AdminUser {
  id: number
  email: string
  name: string
}

export type AccountState = 'email_unconfirmed' | 'active' | 'soft_deleting' | 'blocked' | 'deleted'

export interface PartnerListParams {
  page?: number
  limit?: number
  search?: string
  city?: string
  status_tier?: string
  account_state?: AccountState | ''
}

export interface PartnerUpdate {
  status_tier?: string
  city?: string
}

export interface OrderListParams {
  page?: number
  limit?: number
  status?: string
  date_from?: string
  date_to?: string
  search?: string
}

export interface FaqCreate {
  question_ru: string
  question_kz?: string
  answer_ru: string
  answer_kz?: string
  sort_order?: number
  is_published?: boolean
}

export interface BroadcastData {
  title: string
  body: string
  audience: 'all' | 'city' | 'date_range'
  city?: string
  date_from?: string
  date_to?: string
}

export interface AuditParams {
  page?: number
  limit?: number
  admin_id?: number
  target_type?: string
  action_type?: string
  date_from?: string
  date_to?: string
}

export interface Partner {
  id: number
  first_name: string
  last_name: string
  middle_name?: string
  phone: string
  email: string
  email_verified: boolean
  ref_code: string
  ref_code_changed: boolean
  city?: string
  status_tier: string
  account_state: AccountState
  welcomed: boolean
  deletion_scheduled_at?: string | null
  language?: string
  consent_version?: string
  consent_recorded_at?: string | null
  created_at: string
  sponsor?: {
    id: number
    first_name: string
    last_name: string
    phone: string
    ref_code: string
  }
  ip_too?: {
    id: number
    type: string
    status: string
    iin_bin: string
    submitted_at: string
    rejection_reason?: string
  }
  downline_count?: number
  sessions?: Array<{
    device?: string
    ip?: string
    last_active: string
  }>
}

export interface RefCodeHistoryEntry {
  id: number
  user_id: number
  old_ref_code: string
  new_ref_code: string
  changed_at: string
}

export interface IpTooItem {
  id: number
  partner_id: number
  partner_name: string
  partner_phone: string
  type: 'ИП' | 'ТОО'
  iin_bin: string
  submitted_at: string
}

export interface Order {
  id: number
  partner_name?: string
  partner_phone?: string
  blocks: number
  amount: number
  status: string
  payment_status?: string
  created_at: string
}

export interface InventoryItem {
  id: number
  sku: string
  name: string
  size?: string
  stock_qty: number
  is_active: boolean
}

export interface FaqItem {
  id: number
  question_ru: string
  question_kz?: string
  answer_ru: string
  answer_kz?: string
  sort_order: number
  is_published: boolean
}

export interface Suggestion {
  id: number
  partner_phone?: string
  partner_name?: string
  text: string
  created_at: string
  is_read: boolean
}

export interface AuditEntry {
  id: number
  admin_id: number
  admin_name?: string
  action: string
  target_type?: string
  target_id?: number
  before_data?: Record<string, unknown>
  after_data?: Record<string, unknown>
  created_at: string
}
