import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import type { Partner } from '../types'

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

const PartnersPage: React.FC = () => {
  const navigate = useNavigate()
  const [partners, setPartners] = useState<Partner[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [statusTier, setStatusTier] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'frozen'>('all')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const LIMIT = 50

  const load = useCallback(
    (p: number, s: string, c: string, tier: string, af: 'all' | 'active' | 'frozen') => {
      setLoading(true)
      const params: Record<string, unknown> = { page: p, limit: LIMIT }
      if (s) params.search = s
      if (c) params.city = c
      if (tier) params.status_tier = tier
      if (af === 'active') params.is_active = true
      if (af === 'frozen') params.is_frozen = true
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
    debounceRef.current = setTimeout(() => load(page, search, city, statusTier, activeFilter), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [page, search, city, statusTier, activeFilter, load])

  const reset = () => {
    setSearch('')
    setCity('')
    setStatusTier('')
    setActiveFilter('all')
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
        <div style={{ display: 'flex', gap: 0, border: '1px solid #D1D5DB', borderRadius: 6, overflow: 'hidden' }}>
          {(['all', 'active', 'frozen'] as const).map((v) => (
            <button
              key={v}
              onClick={() => { setActiveFilter(v); setPage(1) }}
              style={{
                padding: '7px 14px',
                border: 'none',
                background: activeFilter === v ? '#1A3C6E' : '#fff',
                color: activeFilter === v ? '#fff' : '#374151',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {v === 'all' ? 'Все' : v === 'active' ? 'Активные' : 'Заморожены'}
            </button>
          ))}
        </div>
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
              {['ID', 'ФИО', 'Телефон', 'Email', 'Реф-код', 'Спонсор', 'Город', 'Статус', 'Активен', 'Зарег.'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Загрузка...</td></tr>
            ) : partners.length === 0 ? (
              <tr><td colSpan={10} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Нет данных</td></tr>
            ) : partners.map((p) => (
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
                <td style={{ padding: '9px 12px' }}>
                  {p.email_verified ? (
                    <span title={p.email}>✓ {p.email}</span>
                  ) : (
                    <span style={{ color: '#EF4444' }}>✗ {p.email}</span>
                  )}
                </td>
                <td style={{ padding: '9px 12px', fontFamily: 'monospace' }}>{p.ref_code}</td>
                <td style={{ padding: '9px 12px', color: '#6B7280' }}>
                  {p.sponsor ? p.sponsor.ref_code : '—'}
                </td>
                <td style={{ padding: '9px 12px' }}>{p.city ?? '—'}</td>
                <td style={{ padding: '9px 12px' }}>
                  <Badge label={tierLabel[p.status_tier] ?? p.status_tier} color={tierColor[p.status_tier] ?? '#6B7280'} />
                </td>
                <td style={{ padding: '9px 12px' }}>
                  {p.is_frozen ? (
                    <Badge label="Заморожен" color="#D97706" />
                  ) : p.is_active ? (
                    <Badge label="Активен" color="#059669" />
                  ) : (
                    <Badge label="Неактивен" color="#EF4444" />
                  )}
                </td>
                <td style={{ padding: '9px 12px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                  {new Date(p.created_at).toLocaleDateString('ru-RU')}
                </td>
              </tr>
            ))}
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
