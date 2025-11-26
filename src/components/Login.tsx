import React, { useState } from 'react'
import { useAuth } from './AuthContext'
import { useLanguage } from '../hooks/useLanguage'
import { t } from '../utils/i18n'
import { authService } from '../services/authService'
import { showErrorToast } from '../services/toast'

const Login: React.FC = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [companyName, setCompanyName] = useState('')
	const [error, setError] = useState(false)
	const [emailError, setEmailError] = useState(false)
	const [isSignup, setIsSignup] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [isResetMode, setIsResetMode] = useState(false)
	const [resetSuccess, setResetSuccess] = useState(false)
	const { login, signup, isLoading } = useAuth()
	const { language, changeLanguage } = useLanguage()

	const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value)
	const validatePassword = (value: string) => value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9_!@#$%^&*()\-+=]/.test(value)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(false)
		setEmailError(false)

		if (!validateEmail(email)) {
			setEmailError(true)
			return
		}

		if (isResetMode) {
			// Forgot password flow
			if (!validatePassword(password)) {
				setError(true)
				return
			}
			try {
				setError(false)
				setResetSuccess(false)
				await authService.resetPassword(email, password)
				setResetSuccess(true)
				showErrorToast(t('auth.passwordResetSuccess', language) || 'Password reset successfully')
				setIsResetMode(false)
				setPassword('')
			} catch (err: any) {
				setError(true)
				const detail = err?.response?.data?.detail || t('auth.passwordResetFailed', language) || 'Failed to reset password'
				showErrorToast(detail)
			}
		} else {
			let success = false
			if (isSignup) {
				// Validate required fields for signup
				if (!firstName.trim() || !lastName.trim()) {
					setError(true)
					return
				}
				if (!companyName.trim()) {
					setError(true)
					return
				}
				// Web app always signs up as supplier_owner
				success = await signup(email, password, firstName, lastName, 'supplier_owner', companyName.trim())
			} else {
				success = await login(email, password)
			}

			if (!success) {
				setError(true)
				showErrorToast(
					isSignup ? t('auth.signupFailed', language) : t('auth.loginFailed', language)
				)
			}
		}
	}

	// Reset form when switching between login/signup
	const handleToggleSignup = () => {
		setIsSignup(!isSignup)
		setIsResetMode(false)
		setError(false)
		setFirstName('')
		setLastName('')
		setCompanyName('')
		setEmailError(false)
	}

	return (
		<div className="login-container">
			<div className="login-card">
				<div className="login-header">
					<h1>SupplyKZ</h1>
					<p>
						{isResetMode
							? t('auth.resetPasswordSubtitle', language) || 'Reset your password'
							: isSignup
							? t('auth.signUpSubtitle', language)
							: t('auth.signInSubtitle', language)}
					</p>
					<div style={{ marginTop: '12px' }}>
						<label
							style={{
								fontSize: '12px',
								color: '#666',
								display: 'block',
								marginBottom: '4px'
							}}
						>
							{t('settings.language', language)}
						</label>
						<select
							value={language}
							onChange={(e) => changeLanguage(e.target.value as any)}
							style={{
								width: '100%',
								padding: '6px 8px',
								borderRadius: '4px',
								border: '1px solid #ddd',
								fontSize: '12px'
							}}
						>
							<option value="en">{t('settings.english', language)}</option>
							<option value="ru">{t('settings.russian', language)}</option>
						</select>
					</div>
				</div>

				<form
					onSubmit={handleSubmit}
					className="login-form"
				>
					{error && <div className="error-message">{isSignup ? t('auth.signupFailed', language) : t('auth.loginFailed', language)}</div>}

					{isSignup && !isResetMode && (
						<>
							<div className="form-group">
								<label htmlFor="firstName">
									{t('auth.firstName', language)}
									<span className="required-indicator">*</span>
								</label>
								<input
									type="text"
									id="firstName"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									required
									disabled={isLoading}
									minLength={1}
									maxLength={100}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="lastName">
									{t('auth.lastName', language)}
									<span className="required-indicator">*</span>
								</label>
								<input
									type="text"
									id="lastName"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									required
									disabled={isLoading}
									minLength={1}
									maxLength={100}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="companyName">
									{t('auth.companyName', language)}
									<span className="required-indicator">*</span>
								</label>
								<input
									type="text"
									id="companyName"
									value={companyName}
									onChange={(e) => setCompanyName(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>
						</>
					)}

					<div className="form-group">
						<label htmlFor="email">
							{t('auth.email', language)}
							<span className="required-indicator">*</span>
						</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => {
								const value = e.target.value
								setEmail(value)
								if (!validateEmail(value)) {
									setEmailError(true)
								} else {
									setEmailError(false)
								}
							}}
							required
							disabled={isLoading}
						/>
						{emailError && <small className="field-error">{t('auth.invalidEmail', language)}</small>}
					</div>

					<div className="form-group">
						<label htmlFor="password">
							{isResetMode ? t('auth.newPassword', language) || 'New Password' : t('auth.password', language)}
							<span className="required-indicator">*</span>
						</label>
						<div className="password-input-wrapper">
							<input
								type={showPassword ? 'text' : 'password'}
								id="password"
								value={password}
								onChange={(e) => {
									const value = e.target.value
									setPassword(value)
								}}
								required
								disabled={isLoading}
								minLength={8}
								className="password-input"
							/>
							<button
								type="button"
								className="toggle-password-visibility icon-button"
								onClick={() => setShowPassword((prev) => !prev)}
								disabled={isLoading}
								aria-label={showPassword ? t('auth.hidePassword', language) : t('auth.showPassword', language)}
							>
								<span className="eye-icon">{showPassword ? '🙈' : '👁️'}</span>
							</button>
						</div>
						{(isSignup || isResetMode) && (
							<div className="password-requirements">
								<div className={password.length >= 8 ? 'password-check password-check-ok' : 'password-check'}>
									<span className="password-check-icon">{password.length >= 8 ? '✓' : '✕'}</span>
									<span>{t('auth.passwordMinLength', language)}</span>
								</div>
								<div className={/[A-Z]/.test(password) ? 'password-check password-check-ok' : 'password-check'}>
									<span className="password-check-icon">{/[A-Z]/.test(password) ? '✓' : '✕'}</span>
									<span>{t('auth.passwordUpper', language)}</span>
								</div>
								<div className={/[a-z]/.test(password) ? 'password-check password-check-ok' : 'password-check'}>
									<span className="password-check-icon">{/[a-z]/.test(password) ? '✓' : '✕'}</span>
									<span>{t('auth.passwordLower', language)}</span>
								</div>
								<div className={/[0-9_!@#$%^&*()\-+=]/.test(password) ? 'password-check password-check-ok' : 'password-check'}>
									<span className="password-check-icon">{/[0-9_!@#$%^&*()\-+=]/.test(password) ? '✓' : '✕'}</span>
									<span>{t('auth.passwordDigitOrSymbol', language)}</span>
								</div>
							</div>
						)}
					</div>

					<button
						type="submit"
						className="login-button"
						disabled={
							isLoading ||
							!validateEmail(email) ||
							(isResetMode
								? !validatePassword(password)
								: isSignup
								? !validatePassword(password) || firstName.trim().length === 0 || lastName.trim().length === 0 || companyName.trim().length === 0
								: password.trim().length === 0)
						}
					>
						{isLoading
							? isResetMode
								? t('auth.resetPassword', language) || 'Reset Password'
								: isSignup
								? t('auth.signup', language)
								: t('auth.signIn', language)
							: isResetMode
							? t('auth.resetPassword', language) || 'Reset Password'
							: isSignup
							? t('auth.signup', language)
							: t('auth.signIn', language)}
					</button>
				</form>

				<div className="auth-switch">
					<button
						type="button"
						onClick={() => {
							setIsResetMode(true)
							setIsSignup(false)
							setError(false)
							setResetSuccess(false)
						}}
						className="switch-button"
					>
						{t('auth.forgotPassword', language) || 'Forgot password?'}
					</button>
					{resetSuccess && (
						<div className="success-message">
							{t('auth.passwordResetSuccess', language) || 'Password reset successfully. You can now log in with your new password.'}
						</div>
					)}
				</div>

				<div className="auth-switch">
					<button
						type="button"
						onClick={handleToggleSignup}
						className="switch-button"
					>
						{isSignup ? t('auth.login', language) : t('auth.signup', language)}
					</button>
				</div>
			</div>
		</div>
	)
}

export default Login
