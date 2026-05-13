import React, { useState } from 'react'
import { api } from '../services/api'

type Audience = 'all' | 'city' | 'date_range'

const BroadcastPage: React.FC = () => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<Audience>('all')
  const [city, setCity] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ queued?: number } | null>(null)
  const [error, setError] = useState('')

  const canSend = title.trim() && body.trim() && (audience !== 'city' || city.trim()) && (audience !== 'date_range' || (dateFrom && dateTo))

  const send = async () => {
    setSending(true)
    setError('')
    try {
      const data: any = { title, body, audience }
      if (audience === 'city') data.city = city
      if (audience === 'date_range') { data.date_from = dateFrom; data.date_to = dateTo }
      const r = await api.notifications.broadcast(data)
      setResult(r.data)
      setConfirm(false)
      setTitle(''); setBody(''); setCity(''); setDateFrom(''); setDateTo(''); setAudience('all')
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Ошибка отправки')
    } finally {
      setSending(false)
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }

  return (
    <div style={{ maxWidth: 680 }}>
      <h2 style={{ marginTop: 0, marginBottom: 24, color: '#111827' }}>Рассылка уведомлений</h2>

      {result && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#059669', fontWeight: 600 }}>
          ✓ Отправлено {result.queued} партнёрам
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 24, marginBottom: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>
            Заголовок <span style={{ color: '#9CA3AF' }}>({title.length}/60)</span>
          </label>
          <input
            style={inputStyle}
            value={title}
            maxLength={60}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок уведомления"
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>
            Текст <span style={{ color: '#9CA3AF' }}>({body.length}/200)</span>
          </label>
          <textarea
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
            value={body}
            maxLength={200}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Текст уведомления..."
          />
        </div>

        {/* Audience selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Аудитория</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(['all', 'city', 'date_range'] as Audience[]).map((v) => (
              <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="radio" name="audience" value={v} checked={audience === v} onChange={() => setAudience(v)} />
                {v === 'all' ? 'Все активные партнёры' : v === 'city' ? 'По городу' : 'По дате регистрации'}
              </label>
            ))}
          </div>
        </div>

        {audience === 'city' && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Город</label>
            <input style={{ ...inputStyle, width: 240 }} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Алматы" />
          </div>
        )}

        {audience === 'date_range' && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
            <div>
              <label style={labelStyle}>Зарег. с</label>
              <input type="date" style={{ ...inputStyle, width: 180 }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>по</label>
              <input type="date" style={{ ...inputStyle, width: 180 }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '8px 12px', color: '#DC2626', fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button
          onClick={() => setConfirm(true)}
          disabled={!canSend}
          style={{ padding: '9px 24px', border: 'none', borderRadius: 6, background: canSend ? '#1A3C6E' : '#D1D5DB', color: '#fff', cursor: canSend ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 14 }}
        >
          Отправить
        </button>
      </div>

      {/* Preview card */}
      {(title || body) && (
        <div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Предпросмотр</div>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', padding: '14px 16px', maxWidth: 340, border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1A3C6E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>i</div>
              <span style={{ fontSize: 12, color: '#6B7280' }}>iCare</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{title || 'Заголовок...'}</div>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{body || 'Текст уведомления...'}</div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 400 }}>
            <h3 style={{ marginTop: 0 }}>Подтверждение</h3>
            <p style={{ color: '#374151', lineHeight: 1.5 }}>
              Отправить уведомление партнёрам?<br />
              <strong>Действие нельзя отменить.</strong>
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirm(false)} style={{ padding: '8px 18px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13 }}>Отмена</button>
              <button onClick={send} disabled={sending} style={{ padding: '8px 18px', border: 'none', borderRadius: 6, background: '#1A3C6E', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                {sending ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BroadcastPage
