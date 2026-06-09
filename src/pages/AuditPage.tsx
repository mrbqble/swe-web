import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import type { AuditEntry } from '../types'

const TARGET_TYPES = ['partner', 'order', 'inventory', 'faq', 'notification', 'ip_too']

const ACTION_TYPES = [
  'block',
  'unblock',
  'force_confirm_email',
  'reset_password',
  'cancel_deletion',
  'force_delete',
  'update_partner',
  'update_order',
  'update_inventory',
  'create_faq',
  'update_faq',
  'delete_faq',
  'broadcast',
  'approve_ip_too',
  'reject_ip_too',
]

const DiffView: React.FC<{ before?: Record<string, unknown>; after?: Record<string, unknown> }> = ({ before, after }) => {
  if (!before && !after) return <span style={{ color: '#9CA3AF' }}>—</span>

  const allKeys = Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]))

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6 }}>
      {allKeys.map((k) => {
        const bv = before?.[k]
        const av = after?.[k]
        const bStr = JSON.stringify(bv)
        const aStr = JSON.stringify(av)

        if (bStr === aStr) return null

        if (bv === undefined) {
          return (
            <div key={k} style={{ color: '#059669' }}>
              + {k}: {aStr}
            </div>
          )
        }
        if (av === undefined) {
          return (
            <div key={k} style={{ color: '#DC2626' }}>
              - {k}: {bStr}
            </div>
          )
        }
        return (
          <div key={k}>
            <span style={{ color: '#DC2626' }}>- {k}: {bStr}</span>
            <br />
            <span style={{ color: '#D97706' }}>+ {k}: {aStr}</span>
          </div>
        )
      })}
    </div>
  )
}

const LIMIT = 50

const AuditPage: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  const [adminId, setAdminId] = useState('')
  const [targetType, setTargetType] = useState('')
  const [actionType, setActionType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = useCallback((p: number) => {
    setLoading(true)
    const params: any = { page: p, limit: LIMIT }
    if (adminId) params.admin_id = Number(adminId)
    if (targetType) params.target_type = targetType
    if (actionType) params.action_type = actionType
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    api.audit.list(params)
      .then((r) => {
        setEntries(r.data.items ?? r.data)
        setTotal(r.data.total ?? r.data.length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [adminId, targetType, actionType, dateFrom, dateTo])

  useEffect(() => { load(page) }, [page, load])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 20, color: '#111827' }}>Журнал аудита</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          placeholder="Admin ID"
          value={adminId}
          onChange={(e) => { setAdminId(e.target.value); setPage(1) }}
          style={{ padding: '7px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, width: 120 }}
          type="number"
        />
        <select
          value={targetType}
          onChange={(e) => { setTargetType(e.target.value); setPage(1) }}
          style={{ padding: '7px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }}
        >
          <option value="">Все объекты</option>
          {TARGET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={actionType}
          onChange={(e) => { setActionType(e.target.value); setPage(1) }}
          style={{ padding: '7px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }}
        >
          <option value="">Все действия</option>
          {ACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
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
        <button
          onClick={() => { setAdminId(''); setTargetType(''); setActionType(''); setDateFrom(''); setDateTo(''); setPage(1) }}
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
              {['Дата', 'Администратор', 'Действие', 'Объект', 'Детали'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Загрузка...</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Нет записей</td></tr>
            ) : entries.map((e) => (
              <React.Fragment key={e.id}>
                <tr
                  style={{ borderTop: '1px solid #F3F4F6', cursor: (e.before_data || e.after_data) ? 'pointer' : 'default' }}
                  onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                >
                  <td style={{ padding: '10px 14px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {new Date(e.created_at).toLocaleString('ru-RU')}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 500 }}>{e.admin_name ?? `#${e.admin_id}`}</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{e.action}</code>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6B7280' }}>
                    {e.target_type ? `${e.target_type}${e.target_id ? ` #${e.target_id}` : ''}` : '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {(e.before_data || e.after_data) && (
                      <span style={{ color: '#60A5FA', fontSize: 12 }}>
                        {expanded === e.id ? '▲ Скрыть' : '▼ Показать'}
                      </span>
                    )}
                  </td>
                </tr>
                {expanded === e.id && (
                  <tr style={{ background: '#F9FAFB' }}>
                    <td colSpan={5} style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB' }}>
                      <DiffView before={e.before_data} after={e.after_data} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
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

export default AuditPage
