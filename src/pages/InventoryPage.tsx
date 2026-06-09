import React, { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import type { InventoryItem } from '../types'

const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [editingStock, setEditingStock] = useState<{ id: number; value: string } | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<{ updated?: number; not_found?: number; errors?: string[] } | null>(null)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    api.inventory.list()
      .then((r) => setItems(Array.isArray(r.data) ? r.data : r.data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const saveStock = async (id: number, value: string) => {
    const qty = parseInt(value, 10)
    if (isNaN(qty)) { setEditingStock(null); return }
    await api.inventory.update(id, { stock_qty: qty })
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, stock_qty: qty } : item))
    setEditingStock(null)
  }

  const toggleActive = async (id: number, current: boolean) => {
    await api.inventory.update(id, { is_active: !current })
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, is_active: !current } : item))
  }

  const handleImport = async () => {
    if (!importFile) return
    setImporting(true)
    setImportResult(null)
    try {
      const r = await api.inventory.import(importFile)
      setImportResult(r.data)
      load()
    } catch (err: any) {
      setImportResult({ errors: [err?.response?.data?.detail ?? 'Ошибка импорта'] })
    } finally {
      setImporting(false)
      setImportFile(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 20, color: '#111827' }}>Склад</h2>

      {/* Import section */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, fontSize: 14, color: '#374151' }}>Импорт CSV</h3>
        <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 10px' }}>
          Формат: заголовок <code>sku,stock_qty</code>, затем строки данных
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="file"
            accept=".csv"
            ref={fileRef}
            onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            style={{ fontSize: 13 }}
          />
          <button
            onClick={handleImport}
            disabled={!importFile || importing}
            style={{ padding: '7px 16px', border: 'none', borderRadius: 6, background: importFile && !importing ? '#1A3C6E' : '#D1D5DB', color: '#fff', cursor: importFile && !importing ? 'pointer' : 'not-allowed', fontSize: 13 }}
          >
            {importing ? 'Импорт...' : 'Импортировать'}
          </button>
        </div>
        {importResult && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 6, background: importResult.errors?.length ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${importResult.errors?.length ? '#FECACA' : '#BBF7D0'}`, fontSize: 13 }}>
            {importResult.updated !== undefined && <div style={{ color: '#059669' }}>✓ Обновлено: {importResult.updated}</div>}
            {importResult.not_found !== undefined && importResult.not_found > 0 && <div style={{ color: '#D97706' }}>⚠ Не найдено: {importResult.not_found}</div>}
            {importResult.errors?.map((e, i) => <div key={i} style={{ color: '#DC2626' }}>✕ {e}</div>)}
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F3F4F6' }}>
              {['SKU', 'Название', 'Размер', 'Остаток (блоки)', 'Активен', ''].map((h) => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Загрузка...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Нет данных</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }}>{item.sku}</td>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '10px 14px', color: '#6B7280' }}>{item.size ?? '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  {editingStock?.id === item.id ? (
                    <span>
                      <input
                        type="number"
                        value={editingStock.value}
                        onChange={(e) => setEditingStock({ id: item.id, value: e.target.value })}
                        onBlur={() => saveStock(item.id, editingStock.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveStock(item.id, editingStock.value); if (e.key === 'Escape') setEditingStock(null) }}
                        autoFocus
                        style={{ width: 80, padding: '3px 8px', border: '1px solid #D1D5DB', borderRadius: 4, fontSize: 13 }}
                      />
                    </span>
                  ) : (
                    <span
                      onClick={() => setEditingStock({ id: item.id, value: String(item.stock_qty) })}
                      style={{ cursor: 'pointer', borderBottom: '1px dashed #D1D5DB', paddingBottom: 1 }}
                    >
                      {item.stock_qty}
                    </span>
                  )}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <input
                    type="checkbox"
                    checked={item.is_active}
                    onChange={() => toggleActive(item.id, item.is_active)}
                    style={{ cursor: 'pointer', width: 16, height: 16 }}
                  />
                </td>
                <td style={{ padding: '10px 14px', color: '#6B7280', fontSize: 12 }}>
                  {item.is_active ? <span style={{ color: '#059669' }}>Активен</span> : <span style={{ color: '#9CA3AF' }}>Неактивен</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InventoryPage
