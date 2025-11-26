import React, { useEffect, useState } from 'react'
import { toastBus } from '../services/toast'

type Toast = {
	id: string
	message?: string
	title?: string
	type?: 'info' | 'success' | 'error'
}

const TOAST_DURATION = 4000

const ToastHost: React.FC = () => {
	const [toasts, setToasts] = useState<Toast[]>([])

	useEffect(() => {
		const unsub = toastBus.subscribe((t) => {
			setToasts((prev) => [...prev, t])
			const timer = setTimeout(() => {
				setToasts((prev) => prev.filter((x) => x.id !== t.id))
			}, TOAST_DURATION)
			return () => clearTimeout(timer)
		})
		return () => {
			unsub()
		}
	}, [])

	if (toasts.length === 0) return null

	return (
		<div
			style={{
				position: 'fixed',
				top: 16,
				right: 16,
				zIndex: 9999,
				display: 'flex',
				flexDirection: 'column',
				gap: 8
			}}
		>
			{toasts.map((t) => (
				<div
					key={t.id}
					style={{
						minWidth: 260,
						maxWidth: 360,
						backgroundColor: t.type === 'error' ? '#f56565' : '#2d3748',
						color: '#fff',
						padding: '10px 14px',
						borderRadius: 6,
						boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
						fontSize: 14
					}}
				>
					{t.title && <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.title}</div>}
					{t.message && <div>{t.message}</div>}
				</div>
			))}
		</div>
	)
}

export default ToastHost


