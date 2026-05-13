import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { FaqItem, FaqCreate } from '../types'

const emptyForm = (): FaqCreate => ({
  question_ru: '',
  question_kz: '',
  answer_ru: '',
  answer_kz: '',
  sort_order: 0,
  is_published: false,
})

const FaqPage: React.FC = () => {
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<{ open: boolean; editing: FaqItem | null }>({ open: false, editing: null })
  const [form, setForm] = useState<FaqCreate>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    api.faq.list()
      .then((r) => setItems(Array.isArray(r.data) ? r.data : r.data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm(emptyForm())
    setModal({ open: true, editing: null })
  }

  const openEdit = (item: FaqItem) => {
    setForm({
      question_ru: item.question_ru,
      question_kz: item.question_kz ?? '',
      answer_ru: item.answer_ru,
      answer_kz: item.answer_kz ?? '',
      sort_order: item.sort_order,
      is_published: item.is_published,
    })
    setModal({ open: true, editing: item })
  }

  const save = async () => {
    setSaving(true)
    try {
      if (modal.editing) {
        await api.faq.update(modal.editing.id, form)
      } else {
        await api.faq.create(form)
      }
      load()
      setModal({ open: false, editing: null })
    } catch {}
    finally { setSaving(false) }
  }

  const del = async (id: number) => {
    await api.faq.delete(id)
    setDeleteConfirm(null)
    load()
  }

  const togglePublish = async (item: FaqItem) => {
    await api.faq.update(item.id, { is_published: !item.is_published })
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_published: !item.is_published } : i))
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '7px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#111827' }}>FAQ</h2>
        <button onClick={openCreate} style={{ padding: '8px 18px', border: 'none', borderRadius: 6, background: '#1A3C6E', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          + Добавить вопрос
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F3F4F6' }}>
              {['Sort', 'Вопрос (RU)', 'Опубл.', 'Действия'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Загрузка...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Нет вопросов</td></tr>
            ) : [...items].sort((a, b) => a.sort_order - b.sort_order).map((item) => (
              <tr key={item.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                <td style={{ padding: '10px 14px', color: '#6B7280', width: 60 }}>{item.sort_order}</td>
                <td style={{ padding: '10px 14px', maxWidth: 400 }}>
                  <div style={{ fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.question_ru}</div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button
                    onClick={() => togglePublish(item)}
                    style={{ padding: '3px 10px', border: 'none', borderRadius: 10, background: item.is_published ? '#D1FAE5' : '#F3F4F6', color: item.is_published ? '#059669' : '#9CA3AF', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                  >
                    {item.is_published ? 'Да' : 'Нет'}
                  </button>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(item)} style={{ padding: '4px 10px', border: '1px solid #D1D5DB', borderRadius: 5, background: '#fff', cursor: 'pointer', fontSize: 12 }}>Изменить</button>
                    {deleteConfirm === item.id ? (
                      <>
                        <button onClick={() => del(item.id)} style={{ padding: '4px 10px', border: 'none', borderRadius: 5, background: '#DC2626', color: '#fff', cursor: 'pointer', fontSize: 12 }}>Удалить</button>
                        <button onClick={() => setDeleteConfirm(null)} style={{ padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: 5, background: '#fff', cursor: 'pointer', fontSize: 12 }}>Отмена</button>
                      </>
                    ) : (
                      <button onClick={() => setDeleteConfirm(item.id)} style={{ padding: '4px 10px', border: '1px solid #FECACA', borderRadius: 5, background: '#fff', color: '#DC2626', cursor: 'pointer', fontSize: 12 }}>Удалить</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>{modal.editing ? 'Редактировать вопрос' : 'Добавить вопрос'}</h3>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Вопрос (RU) *</label>
              <input style={inputStyle} value={form.question_ru} onChange={(e) => setForm({ ...form, question_ru: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Вопрос (KZ)</label>
              <input style={inputStyle} value={form.question_kz} onChange={(e) => setForm({ ...form, question_kz: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Ответ (RU) *</label>
              <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={form.answer_ru} onChange={(e) => setForm({ ...form, answer_ru: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Ответ (KZ)</label>
              <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={form.answer_kz} onChange={(e) => setForm({ ...form, answer_kz: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Порядок сортировки</label>
              <input type="number" style={{ ...inputStyle, width: 100 }} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="publish-cb" checked={!!form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
              <label htmlFor="publish-cb" style={{ fontSize: 13, cursor: 'pointer' }}>Опубликовать сразу</label>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal({ open: false, editing: null })} style={{ padding: '8px 18px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13 }}>Отмена</button>
              <button
                onClick={save}
                disabled={saving || !form.question_ru.trim() || !form.answer_ru.trim()}
                style={{ padding: '8px 18px', border: 'none', borderRadius: 6, background: saving || !form.question_ru.trim() || !form.answer_ru.trim() ? '#D1D5DB' : '#1A3C6E', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FaqPage
