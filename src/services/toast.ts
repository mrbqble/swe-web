type ToastPayload = {
	id: string
	message?: string
	title?: string
	type?: 'info' | 'success' | 'error'
}

type ToastInput = Omit<ToastPayload, 'id'>
type ToastHandler = (msg: ToastPayload) => void

class ToastBus {
	private handlers: ToastHandler[] = []

	subscribe(h: ToastHandler) {
		this.handlers.push(h)
		return () => {
			this.handlers = this.handlers.filter((x) => x !== h)
		}
	}

	publish(payload: ToastInput) {
		const p: ToastPayload = { id: String(Date.now()) + Math.random().toString(16).slice(2), ...payload }
		this.handlers.slice().forEach((h) => {
			try {
				h(p)
			} catch {
				// ignore handler errors
			}
		})
	}
}

export const toastBus = new ToastBus()

export function showToast(message: string, title?: string, type: ToastPayload['type'] = 'info') {
	toastBus.publish({ message, title, type })
}

export function showErrorToast(message: string, title?: string) {
	showToast(message, title, 'error')
}
