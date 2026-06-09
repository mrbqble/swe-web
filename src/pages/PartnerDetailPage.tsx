import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { showToast } from '../services/toast'
import type { Partner, RefCodeHistoryEntry } from '../types'

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

const stateLabel: Record<string, string> = {
  email_unconfirmed: 'Email не подтверждён',
  active: 'Активен',
  soft_deleting: 'Ожидает удаления',
  blocked: 'Заблокирован',
  deleted: 'Удалён',
}
const stateColor: Record<string, string> = {
  email_unconfirmed: '#D97706',
  active: '#059669',
  soft_deleting: '#EA580C',
  blocked: '#DC2626',
  deleted: '#6B7280',
}

const languageLabel: Record<string, string> = {
  ru: 'Русский',
  kk: 'Казахский',
}

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

const Card: React.FC<{ title: string; children: React.ReactNode; borderColor?: string }> = ({ title, children, borderColor }) => (
  <div style={{ background: '#fff', border: `1px solid ${borderColor ?? '#E5E7EB'}`, borderRadius: 8, padding: 20, marginBottom: 20 }}>
    {title && <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1A3C6E' }}>{title}</h3>}
    {children}
  </div>
)

type ModalKind =
  | { type: 'block' }
  | { type: 'unblock' }
  | { type: 'cancel_deletion' }
  | { type: 'force_delete_1' }
  | { type: 'force_delete_2' }
  | null

const ConfirmModal: React.FC<{
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}> = ({ title, body, confirmLabel, onConfirm, onCancel, danger }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
    <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
      <h3 style={{ marginTop: 0, color: danger ? '#DC2626' : '#111827' }}>{title}</h3>
      <p style={{ color: '#374151', marginBottom: 28, lineHeight: 1.6 }}>{body}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{ padding: '8px 20px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13 }}
        >
          Отмена
        </button>
        <button
          onClick={onConfirm}
          style={{ padding: '8px 20px', border: 'none', borderRadius: 6, background: danger ? '#DC2626' : '#1A3C6E', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
)

const daysUntil = (dateStr: string): number => {
  const ms = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

const fmtDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

type EditField = 'status_tier' | 'city' | null

const PartnerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [refHistory, setRefHistory] = useState<RefCodeHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editField, setEditField] = useState<EditField>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [resetResult, setResetResult] = useState('')
  const [showResetModal, setShowResetModal] = useState(false)
  const [modal, setModal] = useState<ModalKind>(null)

  const load = () => {
    if (!id) return
    setLoading(true)
    Promise.all([
      api.partners.get(Number(id)),
      api.partners.refCodeHistory(Number(id)).catch(() => ({ data: [] })),
    ])
      .then(([partnerRes, historyRes]) => {
        setPartner(partnerRes.data)
        const hist = historyRes.data
        setRefHistory(Array.isArray(hist) ? hist : hist?.items ?? [])
      })
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
      setResetResult(r.data?.temporary_password ?? 'Письмо с инструкциями отправлено партнёру')
      setShowResetModal(true)
    } catch {
      showToast('Ошибка сброса пароля', undefined, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmEmail = async () => {
    if (!id) return
    try {
      await api.partners.forceConfirmEmail(Number(id))
      showToast('Email подтверждён', undefined, 'success')
      load()
    } catch {
      showToast('Ошибка', undefined, 'error')
    }
  }

  const handleBlock = async () => {
    if (!id) return
    setSaving(true)
    try {
      await api.partners.block(Number(id))
      showToast('Партнёр заблокирован', undefined, 'success')
      load()
    } catch {
      showToast('Ошибка блокировки', undefined, 'error')
    } finally {
      setSaving(false)
      setModal(null)
    }
  }

  const handleUnblock = async () => {
    if (!id) return
    setSaving(true)
    try {
      await api.partners.unblock(Number(id))
      showToast('Партнёр разблокирован', undefined, 'success')
      load()
    } catch {
      showToast('Ошибка разблокировки', undefined, 'error')
    } finally {
      setSaving(false)
      setModal(null)
    }
  }

  const handleCancelDeletion = async () => {
    if (!id) return
    setSaving(true)
    try {
      await api.partners.cancelDeletion(Number(id))
      showToast('Удаление отменено, аккаунт восстановлен', undefined, 'success')
      load()
    } catch {
      showToast('Ошибка отмены удаления', undefined, 'error')
    } finally {
      setSaving(false)
      setModal(null)
    }
  }

  const handleForceDelete = async () => {
    if (!id) return
    setSaving(true)
    try {
      await api.partners.forceDelete(Number(id))
      showToast('Партнёр удалён', undefined, 'success')
      navigate('/partners')
    } catch {
      showToast('Ошибка принудительного удаления', undefined, 'error')
      setSaving(false)
      setModal(null)
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Загрузка...</div>
  if (!partner) return <div style={{ padding: 40, textAlign: 'center', color: '#EF4444' }}>Партнёр не найден</div>

  const fullName = [partner.last_name, partner.first_name, partner.middle_name].filter(Boolean).join(' ')
  const acctColor = stateColor[partner.account_state] ?? '#6B7280'
  const acctLabel = stateLabel[partner.account_state] ?? partner.account_state

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
              <Badge label={acctLabel} color={acctColor} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {partner.account_state === 'active' && (
              <button
                onClick={() => setModal({ type: 'block' })}
                disabled={saving}
                style={{ padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: '#FEE2E2', color: '#DC2626' }}
              >
                Заблокировать
              </button>
            )}
            {partner.account_state === 'blocked' && (
              <button
                onClick={() => setModal({ type: 'unblock' })}
                disabled={saving}
                style={{ padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: '#D1FAE5', color: '#059669' }}
              >
                Разблокировать
              </button>
            )}
            <button
              onClick={handleResetPassword}
              disabled={saving}
              style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #D1D5DB', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: '#fff', color: '#374151' }}
            >
              Сбросить пароль
            </button>
            {partner.account_state === 'email_unconfirmed' && (
              <button
                onClick={handleConfirmEmail}
                style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #BFDBFE', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: '#EFF6FF', color: '#1D4ED8' }}
              >
                Подтвердить email
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Deletion section — only when soft_deleting */}
      {partner.account_state === 'soft_deleting' && (
        <Card title="Запрос на удаление аккаунта" borderColor="#FED7AA">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: '#374151', marginBottom: 6 }}>
                Партнёр запросил удаление аккаунта.
              </div>
              {partner.deletion_scheduled_at && (
                <div style={{ fontSize: 14, color: '#374151', marginBottom: 4 }}>
                  <strong>Дата удаления:</strong> {fmtDate(partner.deletion_scheduled_at)}
                </div>
              )}
              {partner.deletion_scheduled_at && (
                <div style={{ fontSize: 13, color: '#EA580C', fontWeight: 600 }}>
                  Осталось {daysUntil(partner.deletion_scheduled_at)} дн.
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setModal({ type: 'cancel_deletion' })}
                disabled={saving}
                style={{ padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: '#D1FAE5', color: '#059669' }}
              >
                Отменить удаление
              </button>
              <button
                onClick={() => setModal({ type: 'force_delete_1' })}
                disabled={saving}
                style={{ padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: '#DC2626', color: '#fff' }}
              >
                Удалить немедленно
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Personal data */}
      <Card title="Личные данные">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
          <Field label="Email" value={
            <span>
              {partner.email}{' '}
              {partner.email_verified
                ? <span style={{ color: '#059669' }}>✓</span>
                : <span style={{ color: '#EF4444' }}>✗</span>}
            </span>
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
          <Field label="Дата регистрации" value={new Date(partner.created_at).toLocaleString('ru-RU')} />
          <Field label="Welcome Screen пройден" value={partner.welcomed ? 'Да' : 'Нет'} />
        </div>
      </Card>

      {/* Ref code */}
      <Card title="Реферальный код">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
          <Field label="Текущий код" value={<span style={{ fontFamily: 'monospace', fontSize: 15 }}>{partner.ref_code}</span>} />
          <Field label="Изменение кода" value={
            partner.ref_code_changed ? (
              refHistory.length > 0 ? (
                <span style={{ fontFamily: 'monospace', fontSize: 13 }}>
                  {refHistory[0].old_ref_code} → {refHistory[0].new_ref_code}
                  <span style={{ color: '#6B7280', fontFamily: 'sans-serif', fontSize: 12, marginLeft: 6 }}>
                    {fmtDate(refHistory[0].changed_at)}
                  </span>
                </span>
              ) : (
                <span style={{ color: '#6B7280', fontSize: 13 }}>Изменён (история недоступна)</span>
              )
            ) : (
              <span style={{ color: '#6B7280', fontSize: 13 }}>Изменений не было (доступна 1 замена)</span>
            )
          } />
        </div>
      </Card>

      {/* Compliance */}
      <Card title="Соответствие (RK 94-V)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
          <Field label="Язык приложения" value={
            partner.language ? (languageLabel[partner.language] ?? partner.language) : '—'
          } />
          <Field label="Принятая оферта" value={
            partner.consent_version && partner.consent_recorded_at
              ? `Принял оферту v${partner.consent_version} от ${fmtDate(partner.consent_recorded_at)}`
              : partner.consent_version
              ? `v${partner.consent_version}`
              : '—'
          } />
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

      {/* Confirmation modals */}
      {modal?.type === 'block' && (
        <ConfirmModal
          title="Заблокировать партнёра?"
          body={`${fullName} потеряет доступ к приложению. Все активные сессии будут завершены.`}
          confirmLabel="Заблокировать"
          danger
          onConfirm={handleBlock}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === 'unblock' && (
        <ConfirmModal
          title="Разблокировать партнёра?"
          body={`${fullName} снова получит доступ к приложению. Партнёру будет отправлено уведомление.`}
          confirmLabel="Разблокировать"
          onConfirm={handleUnblock}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === 'cancel_deletion' && (
        <ConfirmModal
          title="Отменить удаление аккаунта?"
          body={`Аккаунт ${fullName} будет восстановлен и переведён в статус «Активен». Запрос на удаление будет отменён.`}
          confirmLabel="Отменить удаление"
          onConfirm={handleCancelDeletion}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === 'force_delete_1' && (
        <ConfirmModal
          title="Удалить аккаунт немедленно?"
          body={`Вы собираетесь немедленно удалить аккаунт ${fullName}. ПИИ будут обезличены, сессии завершены. Это действие необратимо.`}
          confirmLabel="Да, продолжить"
          danger
          onConfirm={() => setModal({ type: 'force_delete_2' })}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === 'force_delete_2' && (
        <ConfirmModal
          title="Подтвердите окончательное удаление"
          body="Последнее предупреждение: аккаунт будет удалён без возможности восстановления. Вы уверены?"
          confirmLabel="Удалить навсегда"
          danger
          onConfirm={handleForceDelete}
          onCancel={() => setModal(null)}
        />
      )}

      {/* Reset password modal */}
      {showResetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 360 }}>
            <h3 style={{ marginTop: 0 }}>Сброс пароля</h3>
            <div style={{ background: '#F3F4F6', borderRadius: 6, padding: '10px 14px', fontFamily: 'monospace', fontSize: 14, marginBottom: 20 }}>
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
