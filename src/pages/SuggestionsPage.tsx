import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { Suggestion } from '../types'

const SuggestionsPage: React.FC = () => {
  const [items, setItems] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 50

  const load = (p: number, unread: boolean) => {
    setLoading(true)
    const params: any = { page: p, limit: LIMIT }
    if (unread) params.is_read = false
    api.suggestions.list(params)
      .then((r) => {
        setItems(r.data.items ?? r.data)
        setTotal(r.data.total ?? r.data.length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page, unreadOnly) }, [page, unreadOnly]) // eslint-disable-line

  const markRead = async (id: number) => {
    await api.suggestions.markRead(id)
    setItems((prev) => prev.map((s) => s.id === id ? { ...s, is_read: true } : s))
  }

  const unreadCount = items.filter((s) => !s.is_read).length
  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#111827' }}>
          Книга предложений{unreadCount > 0 ? ` (${unreadCount} непрочитанных)` : ''}
        </h2>
        <div style={{ display: 'flex', gap: 0, border: '1px solid #D1D5DB', borderRadius: 6, overflow: 'hidden' }}>
          <button onClick={() => { setUnreadOnly(false); setPage(1) }} style={{ padding: '7px 14px', border: 'none', background: !unreadOnly ? '#1A3C6E' : '#fff', color: !unreadOnly ? '#fff' : '#374151', cursor: 'pointer', fontSize: 13 }}>
            Все
          </button>
          <button onClick={() => { setUnreadOnly(true); setPage(1) }} style={{ padding: '7px 14px', border: 'none', background: unreadOnly ? '#1A3C6E' : '#fff', color: unreadOnly ? '#fff' : '#374151', cursor: 'pointer', fontSize: 13 }}>
            Непрочитанные
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F3F4F6' }}>
              {['ID', 'Партнёр', 'Текст', 'Дата', 'Статус', ''].map((h) => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Загрузка...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Нет предложений</td></tr>
            ) : items.map((s) => (
              <React.Fragment key={s.id}>
                <tr
                  style={{ borderTop: '1px solid #F3F4F6', background: s.is_read ? '#fff' : '#FFFBEB', cursor: 'pointer' }}
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                >
                  <td style={{ padding: '10px 14px', color: '#6B7280' }}>{s.id}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 500 }}>{s.partner_name ?? '—'}</div>
                    <div style={{ color: '#6B7280', fontSize: 12 }}>{s.partner_phone}</div>
                  </td>
                  <td style={{ padding: '10px 14px', maxWidth: 300 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#374151' }}>
                      {s.text}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {new Date(s.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {s.is_read ? (
                      <span style={{ color: '#9CA3AF', fontSize: 12 }}>Прочитано</span>
                    ) : (
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} title="Непрочитано" />
                    )}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {!s.is_read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markRead(s.id) }}
                        style={{ padding: '4px 10px', border: '1px solid #D1D5DB', borderRadius: 5, background: '#fff', cursor: 'pointer', fontSize: 12 }}
                      >
                        Отметить прочитанным
                      </button>
                    )}
                  </td>
                </tr>
                {expanded === s.id && (
                  <tr style={{ background: '#F9FAFB' }}>
                    <td colSpan={6} style={{ padding: '12px 20px', color: '#374151', lineHeight: 1.6, fontSize: 13, borderTop: '1px solid #E5E7EB' }}>
                      {s.text}
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

export default SuggestionsPage
