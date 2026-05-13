import React, { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import type { IpTooItem } from '../types'

const IpTooQueuePage: React.FC = () => {
  const [items, setItems] = useState<IpTooItem[]>([])
  const [loading, setLoading] = useState(false)
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = () => {
    setLoading(true)
    api.ipToo
      .pending()
      .then((r) => setItems(Array.isArray(r.data) ? r.data : r.data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, 30000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const approve = async (id: number) => {
    await api.ipToo.verify(id, 'approve')
    load()
  }

  const reject = async (id: number) => {
    if (!rejectReason.trim()) return
    await api.ipToo.verify(id, 'reject', rejectReason)
    setRejectId(null)
    setRejectReason('')
    load()
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 20, color: '#111827' }}>
        ИП/ТОО на проверке{items.length > 0 ? ` (${items.length})` : ''}
      </h2>

      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F3F4F6' }}>
              {['Партнёр', 'Телефон', 'Тип', 'ИИН/БИН', 'Дата подачи', 'Действия'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Загрузка...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Нет заявок на проверке</td></tr>
            ) : items.map((item) => (
              <React.Fragment key={item.id}>
                <tr style={{ borderTop: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{item.partner_name}</td>
                  <td style={{ padding: '10px 14px' }}>{item.partner_phone}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, background: '#EFF6FF', color: '#1D4ED8', fontWeight: 600, fontSize: 12 }}>{item.type}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{item.iin_bin}</td>
                  <td style={{ padding: '10px 14px', color: '#6B7280' }}>
                    {new Date(item.submitted_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => approve(item.id)}
                        style={{ padding: '5px 12px', border: 'none', borderRadius: 6, background: '#D1FAE5', color: '#059669', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                      >
                        Подтвердить
                      </button>
                      {rejectId === item.id ? null : (
                        <button
                          onClick={() => { setRejectId(item.id); setRejectReason('') }}
                          style={{ padding: '5px 12px', border: 'none', borderRadius: 6, background: '#FEE2E2', color: '#DC2626', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                        >
                          Отклонить
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {rejectId === item.id && (
                  <tr>
                    <td colSpan={6} style={{ padding: '8px 14px 14px', background: '#FFF7ED', borderTop: '1px solid #FED7AA' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Причина отказа..."
                          autoFocus
                          style={{ flex: 1, padding: '6px 10px', border: '1px solid #FCD34D', borderRadius: 6, fontSize: 13 }}
                        />
                        <button
                          onClick={() => reject(item.id)}
                          disabled={!rejectReason.trim()}
                          style={{ padding: '6px 14px', border: 'none', borderRadius: 6, background: '#DC2626', color: '#fff', cursor: rejectReason.trim() ? 'pointer' : 'not-allowed', fontSize: 13 }}
                        >
                          Отклонить
                        </button>
                        <button
                          onClick={() => setRejectId(null)}
                          style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13 }}
                        >
                          Отмена
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default IpTooQueuePage
