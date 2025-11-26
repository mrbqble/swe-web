// Internationalization utilities for web app

export type Language = 'en' | 'ru'

export interface Translations {
	[key: string]: string | Translations
}

// English translations
const enTranslations: Translations = {
	common: {
		loading: 'Loading...',
		error: 'Error',
		success: 'Success',
		cancel: 'Cancel',
		save: 'Save',
		delete: 'Delete',
		edit: 'Edit',
		close: 'Close',
		confirm: 'Confirm',
		back: 'Back',
		search: 'Search',
		filter: 'Filter',
		actions: 'Actions',
		status: 'Status',
		date: 'Date',
		total: 'Total',
		view: 'View',
		yes: 'Yes',
		no: 'No',
		accessDenied: 'Access Denied',
		supplierOnly: 'This application is for supplier staff only.'
	},
	auth: {
		login: 'Login',
		logout: 'Logout',
		signup: 'Sign Up',
		email: 'Email',
		password: 'Password',
		newPassword: 'New Password',
		firstName: 'First Name',
		lastName: 'Last Name',
		companyName: 'Company Name',
		signIn: 'Sign In',
		createAccount: 'Create Account',
		signInSubtitle: 'Sign in to your account',
		signUpSubtitle: 'Create your account',
		resetPasswordSubtitle: 'Reset your password',
		allFieldsRequired: 'All fields are required',
		invalidEmail: 'Invalid email address',
		loginFailed: 'Login failed. Please check your credentials.',
		signupFailed: 'Sign up failed. Please try again.',
		passwordResetSuccess: 'Password reset successfully. You can now log in with your new password.',
		passwordResetFailed: 'Failed to reset password. Please check the email and try again.',
		firstLastRequired: 'First name and last name are required',
		companyRequired: 'Company name is required for supplier owners',
		passwordMinLength: 'At least 8 characters',
		passwordUpper: 'At least one uppercase letter',
		passwordLower: 'At least one lowercase letter',
		passwordDigitOrSymbol: 'At least one number or symbol',
		showPassword: 'Show password',
		hidePassword: 'Hide password',
		resetPassword: 'Reset Password',
		forgotPassword: 'Forgot password?'
	},
	orders: {
		title: 'Orders',
		orderNumber: 'Order',
		customer: 'Customer',
		amount: 'Amount',
		items: 'items',
		accept: 'Accept',
		reject: 'Reject',
		startProcessing: 'Start Processing',
		complete: 'Complete',
		viewDetails: 'View Details',
		noOrders: 'No orders found',
		allStatus: 'All Status',
		pending: 'Pending',
		accepted: 'Accepted',
		inProgress: 'In Progress',
		completed: 'Completed',
		rejected: 'Rejected',
		filterByConsumer: 'Filter by consumer...',
		filterByDate: 'Filter by date'
	},
	orderDetail: {
		title: 'Order Details',
		consumerInfo: 'Consumer Information',
		orderInfo: 'Order Information',
		orderItems: 'Order Items',
		product: 'Product',
		sku: 'SKU',
		quantity: 'Quantity',
		unitPrice: 'Unit Price',
		subtotal: 'Subtotal',
		name: 'Name',
		organization: 'Organization',
		email: 'Email',
		created: 'Created',
		acceptOrder: 'Accept Order',
		rejectOrder: 'Reject Order',
		startProcessing: 'Start Processing',
		markAsCompleted: 'Mark as Completed',
		openChat: 'Open Chat',
		readOnly: 'You have read-only access to orders. Only owners and managers can update order status.'
	},
	complaints: {
		title: 'Complaints',
		complaintNumber: 'Complaint',
		customer: 'Customer',
		subject: 'Subject',
		priority: 'Priority',
		updated: 'Updated',
		escalate: 'Escalate',
		resolve: 'Resolve',
		viewDetails: 'View Details',
		noComplaints: 'No complaints found',
		allStatus: 'All Status',
		open: 'Open',
		escalated: 'Escalated',
		resolved: 'Resolved',
		allPriority: 'All Priority',
		high: 'High',
		medium: 'Medium',
		low: 'Low'
	},
	complaintDetail: {
		title: 'Complaint Details',
		consumerInfo: 'Consumer Information',
		complaintInfo: 'Complaint Information',
		description: 'Description',
		resolution: 'Resolution',
		enterResolution: 'Enter Resolution',
		resolutionPlaceholder: 'Enter resolution details...',
		saveResolution: 'Save Resolution',
		escalateToManager: 'Escalate to Manager',
		markAsResolved: 'Mark as Resolved',
		resolveComplaint: 'Resolve Complaint',
		noPermission: 'You do not have permission to manage this complaint.',
		consumerFeedback: 'Consumer Feedback',
		satisfied: 'Satisfied',
		notSatisfied: 'Not Satisfied'
	},
	chat: {
		title: 'Chat',
		searchChats: 'Search chats...',
		selectChat: 'Select a chat to start messaging',
		typeMessage: 'Type a message...',
		send: 'Send',
		salesRep: 'Sales Rep',
		lastActive: 'Last active',
		order: 'Order'
	},
	linkManagement: {
		title: 'Link Management',
		description: 'Manage consumer connection requests and active business relationships',
		incomingRequests: 'Incoming Requests',
		activeLinks: 'Active Links',
		consumer: 'Consumer',
		organization: 'Organization',
		date: 'Date',
		approve: 'Approve',
		reject: 'Reject',
		block: 'Block',
		unlink: 'Unlink',
		noRequests: 'No link requests found',
		noActiveLinks: 'No active links found. Approved link requests will appear here.',
		linkedSince: 'Linked Since',
		viewOnly: 'View only'
	},
	catalog: {
		title: 'Catalog Management',
		description: 'Manage your product catalog and inventory',
		products: 'Products',
		addProduct: 'Add Product',
		editProduct: 'Edit Product',
		productName: 'Name',
		productDescription: 'Description',
		price: 'Price (KZT)',
		currency: 'Currency',
		sku: 'SKU',
		stockQuantity: 'Stock Quantity',
		unit: 'Unit (e.g., pcs, kg)',
		minOrderQty: 'Min Order Quantity',
		discountPercent: 'Discount Percent (0-100)',
		leadTime: 'Lead Time (days)',
		deliveryAvailable: 'Delivery Available',
		pickupAvailable: 'Pickup Available',
		productActive: 'Product is Active',
		active: 'Active',
		inactive: 'Inactive',
		deactivate: 'Deactivate',
		activate: 'Activate',
		delete: 'Delete',
		noProducts: 'No products found'
	},
	settings: {
		title: 'Settings',
		supplierProfile: 'Supplier Profile',
		teamManagement: 'Team Management',
		accountSettings: 'Account Settings',
		language: 'Language',
		english: 'English',
		russian: 'Russian',
		companyName: 'Company Name',
		description: 'Description',
		phone: 'Phone',
		address: 'Address',
		website: 'Website',
		active: 'Active',
		inactive: 'Inactive',
		deactivateAccount: 'Deactivate Account',
		deleteAccount: 'Delete Account',
		addTeamMember: 'Add Team Member',
		name: 'Name',
		email: 'Email',
		role: 'Role',
		manager: 'Manager',
		sales: 'Sales Representative'
	}
}

// Russian translations
const ruTranslations: Translations = {
	common: {
		loading: 'Загрузка...',
		error: 'Ошибка',
		success: 'Успешно',
		cancel: 'Отмена',
		save: 'Сохранить',
		delete: 'Удалить',
		edit: 'Редактировать',
		close: 'Закрыть',
		confirm: 'Подтвердить',
		back: 'Назад',
		search: 'Поиск',
		filter: 'Фильтр',
		actions: 'Действия',
		status: 'Статус',
		date: 'Дата',
		total: 'Итого',
		view: 'Просмотр',
		yes: 'Да',
		no: 'Нет',
		accessDenied: 'Доступ запрещен',
		supplierOnly: 'Это приложение предназначено только для сотрудников поставщика.'
	},
	auth: {
		login: 'Вход',
		logout: 'Выход',
		signup: 'Регистрация',
		email: 'Электронная почта',
		password: 'Пароль',
		newPassword: 'Новый пароль',
		firstName: 'Имя',
		lastName: 'Фамилия',
		companyName: 'Название компании',
		signIn: 'Войти',
		createAccount: 'Создать аккаунт',
		signInSubtitle: 'Войдите в свой аккаунт',
		signUpSubtitle: 'Создайте аккаунт',
		resetPasswordSubtitle: 'Сброс пароля',
		allFieldsRequired: 'Все поля обязательны',
		invalidEmail: 'Неверный адрес электронной почты',
		loginFailed: 'Ошибка входа. Проверьте свои учетные данные.',
		signupFailed: 'Ошибка регистрации. Попробуйте еще раз.',
		passwordResetSuccess: 'Пароль успешно изменен. Теперь вы можете войти с новым паролем.',
		passwordResetFailed: 'Не удалось изменить пароль. Проверьте адрес электронной почты и попробуйте еще раз.',
		firstLastRequired: 'Имя и фамилия обязательны',
		companyRequired: 'Название компании обязательно для владельцев поставщика',
		passwordMinLength: 'Не менее 8 символов',
		passwordUpper: 'Как минимум одна заглавная буква',
		passwordLower: 'Как минимум одна строчная буква',
		passwordDigitOrSymbol: 'Как минимум одна цифра или символ',
		showPassword: 'Показать пароль',
		hidePassword: 'Скрыть пароль',
		resetPassword: 'Сбросить пароль',
		forgotPassword: 'Забыли пароль?'
	},
	orders: {
		title: 'Заказы',
		orderNumber: 'Заказ',
		customer: 'Клиент',
		amount: 'Сумма',
		items: 'товаров',
		accept: 'Принять',
		reject: 'Отклонить',
		startProcessing: 'Начать обработку',
		complete: 'Завершить',
		viewDetails: 'Подробности',
		noOrders: 'Заказы не найдены',
		allStatus: 'Все статусы',
		pending: 'Ожидание',
		accepted: 'Принят',
		inProgress: 'В обработке',
		completed: 'Завершен',
		rejected: 'Отклонен',
		filterByConsumer: 'Фильтр по клиенту...',
		filterByDate: 'Фильтр по дате'
	},
	orderDetail: {
		title: 'Детали заказа',
		consumerInfo: 'Информация о клиенте',
		orderInfo: 'Информация о заказе',
		orderItems: 'Товары заказа',
		product: 'Товар',
		sku: 'Артикул',
		quantity: 'Количество',
		unitPrice: 'Цена за единицу',
		subtotal: 'Промежуточный итог',
		name: 'Имя',
		organization: 'Организация',
		email: 'Электронная почта',
		created: 'Создан',
		acceptOrder: 'Принять заказ',
		rejectOrder: 'Отклонить заказ',
		startProcessing: 'Начать обработку',
		markAsCompleted: 'Отметить как завершенный',
		openChat: 'Открыть чат',
		readOnly: 'У вас есть доступ только для просмотра заказов. Только владельцы и менеджеры могут обновлять статус заказа.'
	},
	complaints: {
		title: 'Жалобы',
		complaintNumber: 'Жалоба',
		customer: 'Клиент',
		subject: 'Тема',
		priority: 'Приоритет',
		updated: 'Обновлено',
		escalate: 'Эскалировать',
		resolve: 'Решить',
		viewDetails: 'Подробности',
		noComplaints: 'Жалобы не найдены',
		allStatus: 'Все статусы',
		open: 'Открыта',
		escalated: 'Эскалирована',
		resolved: 'Решена',
		allPriority: 'Все приоритеты',
		high: 'Высокий',
		medium: 'Средний',
		low: 'Низкий'
	},
	complaintDetail: {
		title: 'Детали жалобы',
		consumerInfo: 'Информация о клиенте',
		complaintInfo: 'Информация о жалобе',
		description: 'Описание',
		resolution: 'Решение',
		enterResolution: 'Введите решение',
		resolutionPlaceholder: 'Введите детали решения...',
		saveResolution: 'Сохранить решение',
		escalateToManager: 'Эскалировать менеджеру',
		markAsResolved: 'Отметить как решенную',
		resolveComplaint: 'Решить жалобу',
		noPermission: 'У вас нет разрешения на управление этой жалобой.',
		consumerFeedback: 'Отзыв клиента',
		satisfied: 'Удовлетворен',
		notSatisfied: 'Не удовлетворен'
	},
	chat: {
		title: 'Чат',
		searchChats: 'Поиск чатов...',
		selectChat: 'Выберите чат для начала обмена сообщениями',
		typeMessage: 'Введите сообщение...',
		send: 'Отправить',
		salesRep: 'Торговый представитель',
		lastActive: 'Последняя активность',
		order: 'Заказ'
	},
	linkManagement: {
		title: 'Управление связями',
		description: 'Управление запросами на подключение клиентов и активными деловыми отношениями',
		incomingRequests: 'Входящие запросы',
		activeLinks: 'Активные связи',
		consumer: 'Клиент',
		organization: 'Организация',
		date: 'Дата',
		approve: 'Одобрить',
		reject: 'Отклонить',
		block: 'Заблокировать',
		unlink: 'Отвязать',
		noRequests: 'Запросы на связь не найдены',
		noActiveLinks: 'Активные связи не найдены. Одобренные запросы на связь появятся здесь.',
		linkedSince: 'Связан с',
		viewOnly: 'Только просмотр'
	},
	catalog: {
		title: 'Управление каталогом',
		description: 'Управление каталогом товаров и складскими запасами',
		products: 'Товары',
		addProduct: 'Добавить товар',
		editProduct: 'Редактировать товар',
		productName: 'Название',
		productDescription: 'Описание',
		price: 'Цена (KZT)',
		currency: 'Валюта',
		sku: 'Артикул',
		stockQuantity: 'Количество на складе',
		unit: 'Единица измерения (например, шт, кг)',
		minOrderQty: 'Минимальное количество заказа',
		discountPercent: 'Процент скидки (0-100)',
		leadTime: 'Время выполнения (дни)',
		deliveryAvailable: 'Доставка доступна',
		pickupAvailable: 'Самовывоз доступен',
		productActive: 'Товар активен',
		active: 'Активен',
		inactive: 'Неактивен',
		deactivate: 'Деактивировать',
		activate: 'Активировать',
		delete: 'Удалить',
		noProducts: 'Товары не найдены'
	},
	settings: {
		title: 'Настройки',
		supplierProfile: 'Профиль поставщика',
		teamManagement: 'Управление командой',
		accountSettings: 'Настройки аккаунта',
		language: 'Язык',
		english: 'Английский',
		russian: 'Русский',
		companyName: 'Название компании',
		description: 'Описание',
		phone: 'Телефон',
		address: 'Адрес',
		website: 'Веб-сайт',
		active: 'Активен',
		inactive: 'Неактивен',
		deactivateAccount: 'Деактивировать аккаунт',
		deleteAccount: 'Удалить аккаунт',
		addTeamMember: 'Добавить участника команды',
		name: 'Имя',
		email: 'Электронная почта',
		role: 'Роль',
		manager: 'Менеджер',
		sales: 'Торговый представитель'
	}
}

const translations: Record<Language, Translations> = {
	en: enTranslations,
	ru: ruTranslations
}

// Get current language from localStorage or default to 'en'
export const getLanguage = (): Language => {
	if (typeof window === 'undefined') return 'en'
	const stored = localStorage.getItem('language') as Language
	return stored && (stored === 'en' || stored === 'ru') ? stored : 'en'
}

// Set language
export const setLanguage = (lang: Language): void => {
	if (typeof window !== 'undefined') {
		localStorage.setItem('language', lang)
		document.documentElement.lang = lang
		// Trigger a custom event to notify components of language change
		window.dispatchEvent(new Event('languagechange'))
	}
}

// Get translation by key path (e.g., 'orders.title' -> 'Orders')
export const t = (key: string, lang?: Language): string => {
	const currentLang = lang || getLanguage()
	const keys = key.split('.')
	let value: any = translations[currentLang]

	for (const k of keys) {
		if (value && typeof value === 'object' && k in value) {
			value = value[k]
		} else {
			// Fallback to English if key not found
			value = translations.en
			for (const fallbackKey of keys) {
				if (value && typeof value === 'object' && fallbackKey in value) {
					value = value[fallbackKey]
				} else {
					return key // Return key if translation not found
				}
			}
			break
		}
	}

	return typeof value === 'string' ? value : key
}

// Format currency in KZT
export const formatCurrency = (amount: number | string, lang?: Language): string => {
	const num = typeof amount === 'string' ? parseFloat(amount) : amount
	const currentLang = lang || getLanguage()

	// Always use KZT currency symbol and formatting
	if (currentLang === 'ru') {
		return `${num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₸`
	}
	return `₸${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Format date based on language
export const formatDate = (date: Date | string, lang?: Language): string => {
	const dateObj = date instanceof Date ? date : new Date(date)
	const currentLang = lang || getLanguage()
	const locale = currentLang === 'ru' ? 'ru-RU' : 'en-US'

	return dateObj.toLocaleDateString(locale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	})
}

// Format date and time
export const formatDateTime = (date: Date | string, lang?: Language): string => {
	const dateObj = date instanceof Date ? date : new Date(date)
	const currentLang = lang || getLanguage()
	const locale = currentLang === 'ru' ? 'ru-RU' : 'en-US'

	return dateObj.toLocaleString(locale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}
