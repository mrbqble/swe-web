import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ChatSession, ChatMessage } from '../types'
import { dataService } from '../services/dataService'
import { useAuth } from './AuthContext'
import { usePermissions } from '../hooks/usePermissions'

interface ChatProps {
	consumerId?: number
	onContextClear?: () => void
}

const Chat: React.FC<ChatProps> = ({ consumerId, onContextClear }) => {
	const [sessions, setSessions] = useState<ChatSession[]>([])
	const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [newMessage, setNewMessage] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const { user } = useAuth()
	const permissions = usePermissions()

	const loadSessions = useCallback(async () => {
		try {
			setIsLoading(true)
			const response = await dataService.getChatSessions(1, 100) // Load all sessions

			setSessions(response.items)

			// If consumerId is provided, find and select that session
			if (consumerId && response.items.length > 0) {
				// Find session by consumerId from backend data
				const targetSession = response.items.find((session: ChatSession) => {
					const backendData = (session as any).backendData
					return backendData?.consumer_id === consumerId
				})

				if (targetSession) {
					setSelectedSession(targetSession)
					if (onContextClear) {
						onContextClear()
					}
				} else if (!selectedSession) {
					setSelectedSession(response.items[0])
				}
			} else if (response.items.length > 0 && !selectedSession) {
				setSelectedSession(response.items[0])
			}
		} catch (error) {
			console.error('Failed to load chat sessions:', error)
			setSessions([])
		} finally {
			setIsLoading(false)
		}
	}, [selectedSession, consumerId, onContextClear])

	const loadMessages = useCallback(
		async (sessionId: string) => {
			if (!sessionId) return
			try {
				const response = await dataService.getChatMessages(parseInt(sessionId), 1, 100) // Load all messages

				// Transform messages to include isOwn based on current user
				const transformedMessages = response.items.map((msg) => ({
					...msg,
					isOwn: msg.senderId === user?.id
				}))
				setMessages(transformedMessages)
				// Scroll to bottom after messages load
				setTimeout(() => scrollToBottom(), 100)
			} catch (error) {
				console.error('Failed to load messages:', error)
				setMessages([])
			}
		},
		[user]
	)

	const sendMessage = async () => {
		if (!newMessage.trim() || !selectedSession) return
		if (!user?.id) {
			alert('You must be logged in to send messages')
			return
		}
		if (!permissions.canSendMessages) {
			alert('You do not have permission to send messages')
			return
		}

		const messageData = {
			id: Date.now().toString(),
			sessionId: selectedSession.id,
			senderId: user.id,
			senderName: user.name,
			text: newMessage,
			timestamp: new Date().toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit'
			}),
			isOwn: true
		}

		// Optimistically add message to UI
		setMessages((prev) => [...prev, messageData])
		setNewMessage('')

		try {
			// Send to backend
			await dataService.sendMessage(parseInt(selectedSession.id), newMessage)
			// Reload messages to get the actual message from backend
			await loadMessages(selectedSession.id)
		} catch (error) {
			console.error('Failed to send message:', error)
			alert('Failed to send message')
			// Remove optimistic message on error
			setMessages((prev) => prev.filter((msg) => msg.id !== messageData.id))
		}
	}

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	// Load messages when a session is selected
	useEffect(() => {
		if (selectedSession) {
			loadMessages(selectedSession.id)
		} else {
			setMessages([])
		}
	}, [selectedSession, loadMessages])

	// Load sessions on mount
	useEffect(() => {
		loadSessions()
	}, [loadSessions])

	// Scroll to bottom when messages change
	useEffect(() => {
		scrollToBottom()
	}, [messages])

	const filteredSessions = sessions.filter(
		(session) =>
			session.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			session.salesRepName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			session.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
	)

	if (isLoading) {
		return (
			<div>
				<div className="header">
					<h1>Chat</h1>
				</div>
				<div className="loading">Loading chats...</div>
			</div>
		)
	}

	return (
		<div>
			<div className="header">
				<h1>Chat</h1>
			</div>

			<div style={{ display: 'flex', gap: '20px', height: '70vh' }}>
				{/* Sidebar */}
				<div
					className="sidebar"
					style={{
						width: '300px',
						background: 'white',
						borderRadius: '8px',
						padding: '20px',
						display: 'flex',
						flexDirection: 'column'
					}}
				>
					<input
						type="text"
						placeholder="Search chats..."
						className="search-input"
						style={{ width: '100%', marginBottom: '20px' }}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>

					<div style={{ flex: 1, overflowY: 'auto' }}>
						{filteredSessions.map((session) => (
							<div
								key={session.id}
								className={`chat-session ${selectedSession?.id === session.id ? 'active' : ''}`}
								onClick={() => setSelectedSession(session)}
								style={{
									padding: '15px',
									borderBottom: '1px solid #eee',
									cursor: 'pointer',
									backgroundColor: selectedSession?.id === session.id ? '#f5f5f5' : 'transparent',
									borderRadius: '4px',
									marginBottom: '5px'
								}}
							>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'start'
									}}
								>
									<div style={{ fontWeight: '500' }}>{session.consumerName}</div>
									{session.unread && (
										<div
											style={{
												width: '8px',
												height: '8px',
												backgroundColor: '#007bff',
												borderRadius: '50%'
											}}
										/>
									)}
								</div>
								<div
									style={{
										color: '#666',
										fontSize: '14px',
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										marginTop: '5px'
									}}
								>
									{session.lastMessage}
								</div>
								<div style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>{session.timestamp}</div>
							</div>
						))}
					</div>
				</div>

				{/* Chat Area */}
				<div
					className="chat-area"
					style={{
						flex: 1,
						background: 'white',
						borderRadius: '8px',
						display: 'flex',
						flexDirection: 'column'
					}}
				>
					{selectedSession ? (
						<>
							{/* Chat Header */}
							<div
								style={{
									padding: '20px',
									borderBottom: '1px solid #eee',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center'
								}}
							>
								<div>
									<h3 style={{ margin: 0 }}>{selectedSession.consumerName}</h3>
									<p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
										{selectedSession.orderId && `Order: #${selectedSession.orderId} • `}
										Sales Rep: {selectedSession.salesRepName}
									</p>
								</div>
								<div style={{ color: '#666', fontSize: '14px' }}>Last active: {selectedSession.timestamp}</div>
							</div>

							{/* Messages */}
							<div
								style={{
									flex: 1,
									padding: '20px',
									overflowY: 'auto',
									display: 'flex',
									flexDirection: 'column',
									gap: '15px'
								}}
							>
								{messages.map((message) => (
									<div
										key={message.id}
										style={{
											display: 'flex',
											justifyContent: message.isOwn ? 'flex-end' : 'flex-start'
										}}
									>
										<div
											style={{
												maxWidth: '70%',
												padding: '12px 16px',
												borderRadius: '18px',
												backgroundColor: message.isOwn ? '#007bff' : '#f1f1f1',
												color: message.isOwn ? 'white' : '#333'
											}}
										>
											{!message.isOwn && (
												<div
													style={{
														fontWeight: '500',
														fontSize: '14px',
														marginBottom: '4px'
													}}
												>
													{message.senderName}
												</div>
											)}
											<div>{message.text}</div>
											{message.fileUrl && (
												<div style={{ marginTop: '8px' }}>
													<a
														href={message.fileUrl}
														target="_blank"
														rel="noopener noreferrer"
														style={{
															color: message.isOwn ? 'white' : '#007bff',
															textDecoration: 'underline'
														}}
													>
														📎 Attachment
													</a>
												</div>
											)}
											<div
												style={{
													fontSize: '11px',
													opacity: 0.7,
													textAlign: 'right',
													marginTop: '4px'
												}}
											>
												{message.timestamp}
											</div>
										</div>
									</div>
								))}
								<div ref={messagesEndRef} />
							</div>

							{/* Message Input */}
							<div
								style={{
									padding: '20px',
									borderTop: '1px solid #eee',
									display: 'flex',
									gap: '10px'
								}}
							>
								<input
									type="text"
									placeholder="Type a message..."
									style={{
										flex: 1,
										padding: '12px 16px',
										border: '1px solid #ddd',
										borderRadius: '24px',
										outline: 'none'
									}}
									value={newMessage}
									onChange={(e) => setNewMessage(e.target.value)}
									onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
								/>
								<button
									className="btn btn-primary"
									onClick={sendMessage}
									disabled={!newMessage.trim()}
									style={{ borderRadius: '24px', padding: '12px 24px' }}
								>
									Send
								</button>
							</div>
						</>
					) : (
						<div
							style={{
								flex: 1,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: '#666'
							}}
						>
							<h3>Select a chat to start messaging</h3>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default Chat
