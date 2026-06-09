import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import type { Partner, AccountState } from '../types'

const TIERS = ['partner', 'expert', 'leader', 'top_partner']

const tierLabel: Record<string, string> = {
  partner: 'Партнёр',
  expert: 'Эксперт',
  leader: 'Лидер',
  top_partner: 'Топ-партнёр',
}

const tierColor: Record<string, string> = {
  partner: '#6B7280',
  expert: '#2563EB',
  leader: '#7C3AED',
  top_partner: '#D97706',
}

const STATE_OPTIONS: { value: AccountState | ''; label: string }[] = [
  { value: '', label: 'Все состояния' },
  { value: 'email_unconfirmed', label: 'Email не подтверждён' },
  { value: 'active', label: 'Активен' },
  { value: 'soft_deleting', label: 'Ожидает удаления' },
  { value: 'blocked', label: 'Заблокирован' },
  { value: 'deleted', label: 'Удалён' },
]

const stateColor: Record<string, string> = {
  email_unconfirmed: '#D97706',
  active: '#059669',
  soft_deleting: '#EA580C',
  blocked: '#DC2626',
  deleted: '#6B7280',
}

const stateLabel: Record<string, string> = {
  email_unconfirmed: 'Email не подтверждён',
  active: 'Активен',
  soft_deleting: 'Ожидает удаления',
  blocked: 'Заблокирован',
  deleted: 'Удалён',
}

const Badge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      background: color + '22',
      color,
    }}
  >
    {label}
  </span>
)

const daysUntil = (dateStr: string): number => {
  const ms = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

const PartnersPage: React.FC = () => {
  const navigate = useNavigate()
  const [partners, setPartners] = useState<Partner[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [statusTier, setStatusTier] = useState('')
  const [accountState, setAccountState] = useState<AccountState | ''>('')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const LIMIT = 50

  const load = useCallback(
    (p: number, s: string, c: string, tier: string, state: AccountState | '') => {
      setLoading(true)
      const params: Record<string, unknown> = { page: p, limit: LIMIT }
      if (s) params.search = s
      if (c) params.city = c
      if (tier) params.status_tier = tier
      if (state) params.account_state = state
      api.partners
        .list(params as any)
        .then((r) => {
          setPartners(r.data.items ?? r.data)
          setTotal(r.data.total ?? r.data.length)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    },
    []
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(page, search, city, statusTier, accountState), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [page, search, city, statusTier, accountState, load])

  const reset = () => {
    setSearch('')
    setCity('')
    setStatusTier('')
    setAccountState('')
    setPage(1)
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 20, color: '#111827' }}>Партнёры</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          placeholder="Поиск по имени, телефону, email, реф-коду..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          style={{ padding: '7px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, width: 280 }}
        />
        <input
          placeholder="Город"
          value={city}
          onChange={(e) => { setCity(e.target.value); setPage(1) }}
          style={{ padding: '7px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, width: 140 }}
        />
        <select
          value={statusTier}
          onChange={(e) => { setStatusTier(e.target.value); setPage(1) }}
          style={{ padding: '7px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }}
        >
          <option value="">Все статусы</option>
          {TIERS.map((t) => (
            <option key={t} value={t}>{tierLabel[t]}</option>
          ))}
        </select>
        <select
          value={accountState}
          onChange={(e) => { setAccountState(e.target.value as AccountState | ''); setPage(1) }}
          style={{ padding: '7px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }}
        >
          {STATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={reset}
          style={{ padding: '7px 14px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13 }}
        >
          Сбросить
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F3F4F6' }}>
              {['ID', 'ФИО', 'Телефон', 'Реф-код', 'Спонсор', 'Город', 'Статус', 'Состояние', 'Зарег.'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Загрузка...</td></tr>
            ) : partners.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Нет данных</td></tr>
            ) : partners.map((p) => {
              const color = stateColor[p.account_state] ?? '#6B7280'
              const label = stateLabel[p.account_state] ?? p.account_state
              return (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/partners/${p.id}`)}
                  style={{ borderTop: '1px solid #F3F4F6', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '9px 12px', color: '#6B7280' }}>{p.id}</td>
                  <td style={{ padding: '9px 12px', fontWeight: 500, color: '#111827' }}>
                    {[p.last_name, p.first_name, p.middle_name].filter(Boolean).join(' ')}
                  </td>
                  <td style={{ padding: '9px 12px' }}>{p.phone}</td>
                  <td style={{ padding: '9px 12px', fontFamily: 'monospace' }}>{p.ref_code}</td>
                  <td style={{ padding: '9px 12px', color: '#6B7280' }}>
                    {p.sponsor ? p.sponsor.ref_code : '—'}
                  </td>
                  <td style={{ padding: '9px 12px' }}>{p.city ?? '—'}</td>
                  <td style={{ padding: '9px 12px' }}>
                    <Badge label={tierLabel[p.status_tier] ?? p.status_tier} color={tierColor[p.status_tier] ?? '#6B7280'} />
                  </td>
                  <td style={{ padding: '9px 12px' }}>
                    <Badge label={label} color={color} />
                    {p.account_state === 'soft_deleting' && p.deletion_scheduled_at && (
                      <div style={{ fontSize: 11, color: '#EA580C', marginTop: 2 }}>
                        {daysUntil(p.deletion_scheduled_at)} дн. до удаления
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '9px 12px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {new Date(p.created_at).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, fontSize: 13, color: '#6B7280' }}>
        <span>Всего: {total}</span>
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          style={{ padding: '5px 14px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: page <= 1 ? '#D1D5DB' : '#374151' }}
        >
          ← Назад
        </button>
        <span>Стр. {page} / {totalPages || 1}</span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          style={{ padding: '5px 14px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: page >= totalPages ? '#D1D5DB' : '#374151' }}
        >
          Вперёд →
        </button>
      </div>
    </div>
  )
}

export default PartnersPage
