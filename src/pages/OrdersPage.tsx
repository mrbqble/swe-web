import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import type { Order } from '../types'

const STATUSES = ['placed', 'paid', 'packed', 'shipped', 'delivered', 'cancelled']

const statusLabel: Record<string, string> = {
  placed: 'Размещён',
  paid: 'Оплачен',
  packed: 'Упакован',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

const statusColor: Record<string, string> = {
  placed: '#6B7280',
  paid: '#2563EB',
  packed: '#7C3AED',
  shipped: '#D97706',
  delivered: '#059669',
  cancelled: '#EF4444',
}

const forwardTransitions: Record<string, string[]> = {
  placed: ['paid', 'cancelled'],
  paid: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: (statusColor[status] ?? '#6B7280') + '22', color: statusColor[status] ?? '#6B7280' }}>
    {statusLabel[status] ?? status}
  </span>
)

const LIMIT = 50

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback((p: number) => {
    setLoading(true)
    const params: Record<string, unknown> = { page: p, limit: LIMIT }
    if (statusFilter) params.status = statusFilter
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    if (search) params.search = search
    api.orders.list(params as any)
      .then((r) => {
        setOrders(r.data.items ?? r.data)
        setTotal(r.data.total ?? r.data.length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [statusFilter, dateFrom, dateTo, search])

  useEffect(() => { load(page) }, [page, load])

  const changeStatus = async (id: number, status: string) => {
    await api.orders.updateStatus(id, status)
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 20, color: '#111827' }}>Заказы</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          style={{ padding: '7px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }}
        >
          <option value="">Все статусы</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
          style={{ padding: '7px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }}
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
          style={{ padding: '7px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }}
        />
        <input
          placeholder="Поиск по партнёру..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          style={{ padding: '7px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, width: 220 }}
        />
        <button
          onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setSearch(''); setPage(1) }}
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
              {['ID', 'Партнёр', 'Блоки', 'Сумма', 'Статус', 'Оплата', 'Дата', 'Действия'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Загрузка...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Нет заказов</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                <td style={{ padding: '10px 12px', color: '#6B7280' }}>#{o.id}</td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 500 }}>{o.partner_name ?? '—'}</div>
                  <div style={{ color: '#6B7280', fontSize: 12 }}>{o.partner_phone}</div>
                </td>
                <td style={{ padding: '10px 12px' }}>{o.blocks}</td>
                <td style={{ padding: '10px 12px' }}>{o.amount?.toLocaleString('ru-RU')} ₸</td>
                <td style={{ padding: '10px 12px' }}><StatusBadge status={o.status} /></td>
                <td style={{ padding: '10px 12px', color: '#6B7280', fontSize: 12 }}>{o.payment_status ?? '—'}</td>
                <td style={{ padding: '10px 12px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                  {new Date(o.created_at).toLocaleDateString('ru-RU')}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {forwardTransitions[o.status]?.length > 0 && (
                    <select
                      defaultValue=""
                      onChange={(e) => { if (e.target.value) changeStatus(o.id, e.target.value) }}
                      style={{ padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: 5, fontSize: 12, cursor: 'pointer' }}
                    >
                      <option value="" disabled>Изменить...</option>
                      {forwardTransitions[o.status].map((s) => (
                        <option key={s} value={s}>{statusLabel[s]}</option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, fontSize: 13, color: '#6B7280' }}>
        <span>Всего: {total}</span>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
          style={{ padding: '5px 14px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: page <= 1 ? '#D1D5DB' : '#374151' }}>
          ← Назад
        </button>
        <span>Стр. {page} / {totalPages || 1}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
          style={{ padding: '5px 14px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: page >= totalPages ? '#D1D5DB' : '#374151' }}>
          Вперёд →
        </button>
      </div>
    </div>
  )
}

export default OrdersPage
