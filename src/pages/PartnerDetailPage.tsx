import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { showToast } from '../services/toast'
import type { Partner } from '../types'

const tierLabel: Record<string, string> = {
  partner: 'Партнёр',
  expert: 'Эксперт',
  leader: 'Лидер',
  top_partner: 'Топ-партнёр',
}
const tierColor: Record<string, string> = {
  partner: '#6B7280', expert: '#2563EB', leader: '#7C3AED', top_partner: '#D97706',
}
const TIERS = ['partner', 'expert', 'leader', 'top_partner']

const Badge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: color + '22', color }}>
    {label}
  </span>
)

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 14, color: '#111827' }}>{value ?? '—'}</div>
  </div>
)

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 20, marginBottom: 20 }}>
    <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1A3C6E' }}>{title}</h3>
    {children}
  </div>
)

type EditField = 'status_tier' | 'city' | 'is_active' | 'is_frozen' | null

const PartnerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [editField, setEditField] = useState<EditField>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [resetResult, setResetResult] = useState('')
  const [showResetModal, setShowResetModal] = useState(false)

  const load = () => {
    if (!id) return
    setLoading(true)
    api.partners.get(Number(id))
      .then((r) => setPartner(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line

  const patch = async (data: Record<string, unknown>) => {
    if (!id) return
    setSaving(true)
    try {
      await api.partners.update(Number(id), data as any)
      load()
    } catch {
      showToast('Ошибка сохранения', undefined, 'error')
    } finally {
      setSaving(false)
      setEditField(null)
    }
  }

  const openEdit = (field: EditField, current: string) => {
    setEditField(field)
    setEditValue(current)
  }

  const handleResetPassword = async () => {
    if (!id) return
    setSaving(true)
    try {
      const r = await api.partners.resetPassword(Number(id))
      setResetResult(r.data?.temporary_password ?? 'Пароль сброшен')
      setShowResetModal(true)
    } catch {
      showToast('Ошибка сброса пароля', undefined, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyEmail = async () => {
    if (!id) return
    try {
      await api.partners.forceVerifyEmail(Number(id))
      showToast('Email подтверждён', undefined, 'success')
      load()
    } catch {
      showToast('Ошибка', undefined, 'error')
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Загрузка...</div>
  if (!partner) return <div style={{ padding: 40, textAlign: 'center', color: '#EF4444' }}>Партнёр не найден</div>

  const fullName = [partner.last_name, partner.first_name, partner.middle_name].filter(Boolean).join(' ')

  return (
    <div style={{ maxWidth: 900 }}>
      <button onClick={() => navigate('/partners')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 13, marginBottom: 16, padding: 0 }}>
        ← К списку партнёров
      </button>

      {/* Header */}
      <Card title="">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{fullName}</div>
            <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>{partner.phone} · {partner.ref_code}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge label={tierLabel[partner.status_tier] ?? partner.status_tier} color={tierColor[partner.status_tier] ?? '#6B7280'} />
              {partner.is_frozen
                ? <Badge label="Заморожен" color="#D97706" />
                : partner.is_active
                ? <Badge label="Активен" color="#059669" />
                : <Badge label="Неактивен" color="#EF4444" />}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => patch({ is_frozen: !partner.is_frozen })}
              disabled={saving}
              style={{ padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: partner.is_frozen ? '#D1FAE5' : '#FEF3C7', color: partner.is_frozen ? '#059669' : '#D97706' }}
            >
              {partner.is_frozen ? 'Разморозить' : 'Заморозить'}
            </button>
            <button
              onClick={() => patch({ is_active: !partner.is_active })}
              disabled={saving}
              style={{ padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: partner.is_active ? '#FEE2E2' : '#D1FAE5', color: partner.is_active ? '#DC2626' : '#059669' }}
            >
              {partner.is_active ? 'Заблокировать' : 'Разблокировать'}
            </button>
            <button
              onClick={handleResetPassword}
              disabled={saving}
              style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #D1D5DB', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: '#fff', color: '#374151' }}
            >
              Сбросить пароль
            </button>
            {!partner.email_verified && (
              <button
                onClick={handleVerifyEmail}
                style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #BFDBFE', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: '#EFF6FF', color: '#1D4ED8' }}
              >
                Подтвердить email
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Personal data */}
      <Card title="Личные данные">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
          <Field label="Email" value={
            <span>{partner.email} {partner.email_verified ? <span style={{ color: '#059669' }}>✓</span> : <span style={{ color: '#EF4444' }}>✗</span>}</span>
          } />
          <Field label="Город" value={
            editField === 'city' ? (
              <span>
                <input value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ padding: '3px 8px', border: '1px solid #D1D5DB', borderRadius: 4, fontSize: 13 }} autoFocus />
                <button onClick={() => patch({ city: editValue })} style={{ marginLeft: 6, padding: '3px 10px', border: 'none', borderRadius: 4, background: '#1A3C6E', color: '#fff', cursor: 'pointer', fontSize: 12 }}>✓</button>
                <button onClick={() => setEditField(null)} style={{ marginLeft: 4, padding: '3px 8px', border: 'none', borderRadius: 4, background: '#E5E7EB', cursor: 'pointer', fontSize: 12 }}>✕</button>
              </span>
            ) : (
              <span onClick={() => openEdit('city', partner.city ?? '')} style={{ cursor: 'pointer', borderBottom: '1px dashed #D1D5DB' }}>{partner.city ?? '—'} ✏️</span>
            )
          } />
          <Field label="Статус" value={
            editField === 'status_tier' ? (
              <span>
                <select value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ padding: '3px 8px', border: '1px solid #D1D5DB', borderRadius: 4, fontSize: 13 }} autoFocus>
                  {TIERS.map((t) => <option key={t} value={t}>{tierLabel[t]}</option>)}
                </select>
                <button onClick={() => patch({ status_tier: editValue })} style={{ marginLeft: 6, padding: '3px 10px', border: 'none', borderRadius: 4, background: '#1A3C6E', color: '#fff', cursor: 'pointer', fontSize: 12 }}>✓</button>
                <button onClick={() => setEditField(null)} style={{ marginLeft: 4, padding: '3px 8px', border: 'none', borderRadius: 4, background: '#E5E7EB', cursor: 'pointer', fontSize: 12 }}>✕</button>
              </span>
            ) : (
              <span onClick={() => openEdit('status_tier', partner.status_tier)} style={{ cursor: 'pointer', borderBottom: '1px dashed #D1D5DB' }}>
                <Badge label={tierLabel[partner.status_tier] ?? partner.status_tier} color={tierColor[partner.status_tier] ?? '#6B7280'} /> ✏️
              </span>
            )
          } />
          <Field label="Реферальный код" value={<span style={{ fontFamily: 'monospace' }}>{partner.ref_code}</span>} />
          <Field label="Дата регистрации" value={new Date(partner.created_at).toLocaleString('ru-RU')} />
        </div>
      </Card>

      {/* Sponsor */}
      {partner.sponsor && (
        <Card title="Спонсор">
          <div
            onClick={() => navigate(`/partners/${partner.sponsor!.id}`)}
            style={{ cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'center' }}
          >
            <div>
              <div style={{ fontWeight: 500, color: '#111827' }}>
                {partner.sponsor.last_name} {partner.sponsor.first_name}
              </div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>{partner.sponsor.phone} · {partner.sponsor.ref_code}</div>
            </div>
            <span style={{ color: '#60A5FA', fontSize: 13 }}>→ Открыть</span>
          </div>
        </Card>
      )}

      {/* IP/TOO */}
      {partner.ip_too && (
        <Card title="ИП/ТОО">
          <div style={{ display: 'flex', gap: 24 }}>
            <Field label="Тип" value={partner.ip_too.type} />
            <Field label="ИИН/БИН" value={partner.ip_too.iin_bin} />
            <Field label="Статус" value={
              <Badge
                label={partner.ip_too.status}
                color={partner.ip_too.status === 'verified' ? '#059669' : partner.ip_too.status === 'rejected' ? '#EF4444' : '#D97706'}
              />
            } />
            {partner.ip_too.rejection_reason && (
              <Field label="Причина отказа" value={partner.ip_too.rejection_reason} />
            )}
          </div>
        </Card>
      )}

      {/* Downline */}
      {partner.downline_count !== undefined && (
        <Card title="Прямая реферальная сеть">
          <div style={{ color: '#374151' }}>Прямых партнёров: <strong>{partner.downline_count}</strong></div>
        </Card>
      )}

      {/* Sessions */}
      {partner.sessions && partner.sessions.length > 0 && (
        <Card title="Последние сессии">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F3F4F6' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Устройство</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>IP</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Последняя активность</th>
              </tr>
            </thead>
            <tbody>
              {partner.sessions.map((s, i) => (
                <tr key={i} style={{ borderTop: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '8px 12px' }}>{s.device ?? '—'}</td>
                  <td style={{ padding: '8px 12px' }}>{s.ip ?? '—'}</td>
                  <td style={{ padding: '8px 12px' }}>{new Date(s.last_active).toLocaleString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Reset password modal */}
      {showResetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 360 }}>
            <h3 style={{ marginTop: 0 }}>Пароль сброшен</h3>
            <div style={{ background: '#F3F4F6', borderRadius: 6, padding: '10px 14px', fontFamily: 'monospace', fontSize: 16, marginBottom: 20 }}>
              {resetResult}
            </div>
            <button onClick={() => setShowResetModal(false)} style={{ width: '100%', padding: '9px 0', border: 'none', borderRadius: 6, background: '#1A3C6E', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PartnerDetailPage
