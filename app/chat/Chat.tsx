import {useEffect, useRef, useState} from "react";
import {io, Socket} from "socket.io-client";

interface Message {
	_id: string;
	chatId: string;
	senderId: string;
	content: string;
	type: string;
	createdAt: string;
}

interface User {
	id: string;
	username: string;
	email: string;
}

const Chat = ({chatId}: {chatId: string}) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [socket, setSocket] = useState<Socket | null>(null);
	const [newMessage, setNewMessage] = useState("");
	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	// Fetch chat messages
	const fetchMessages = async () => {
		try {
			const response = await fetch(`http://localhost:5000/api/messages/${chatId}`);
			const data = await response.json();
			setMessages(data || []);
		} catch (error) {
			console.error("Failed to fetch messages:", error);
		}
	};

	// Scroll to the latest message
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
	};
	const initializeUserAndToken = () => {
		const user = localStorage.getItem("user");
		const token = localStorage.getItem("token");
		if (user && token) {
			setUser(JSON.parse(user));
			setToken(token);
		}
	};
	// Setup WebSocket connection
	useEffect(() => {
		const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
			withCredentials: true,
			transports: ["websocket"],
		});

		setSocket(newSocket);

		newSocket.on("connect", () => {
			console.log("Connected to server:", newSocket.id);
			newSocket.emit("joinChat", chatId);
		});

		newSocket.on("messageReceived", (newMessage: Message) => {
			setMessages((prevMessages) => [...prevMessages, newMessage]);
		});

		return () => {
			newSocket.off("messageReceived");
			newSocket.disconnect();
		};
	}, [chatId]);

	// Fetch messages when the chatId changes
	useEffect(() => {
		fetchMessages();
	}, [chatId]);

	// Auto-scroll to the latest message when messages are updated
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Initialize user and token from localStorage
	useEffect(() => {
		initializeUserAndToken();
	}, []);

	const sendMessage = async () => {
		if (!socket || !newMessage.trim()) return;

		const messageData = {
			chatId,
			senderId: user?.id, // Replace with the authenticated user's ID
			content: newMessage.trim(),
			type: "text",
		};

		console.log("Sending message:", messageData);

		try {
			// Save the message in the backend
			const response = await fetch("http://localhost:5000/api/messages/send", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(messageData),
			});
			const data = await response.json();
			console.log("Message sent:", response.status, data);
			if (response.status) {
				// Update local state for instant feedback
				// setMessages((prevMessages) => [...prevMessages, data]);
				// Emit message via Socket.IO for real-time
				console.log("Emitting message:", data);
				try {
					socket.emit("sendMessage", data);
				} catch (error) {
					console.error("Failed to emit message:", error);
				}
			} else {
				console.error("Failed to send message:", data);
			}
		} catch (error) {
			console.error("Error sending message:", error);
		} finally {
			setNewMessage("");
		}
	};

	return (
		<div className="flex flex-col h-screen">
			{/* Messages Section */}
			<div className="flex-1 overflow-y-auto p-4 bg-gray-50">
				{messages.map((message) => (
					<div key={message._id} className={`mb-2 ${message.senderId === user?.id ? "text-right" : "text-left"}`}>
						<div className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md">{message.content}</div>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Section */}
			<div className="p-4 bg-white shadow-md flex">
				<input
					type="text"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && sendMessage()}
					placeholder="Type a message"
					className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
				/>
				<button onClick={sendMessage} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
					Send
				</button>
			</div>
		</div>
	);
};

export default Chat;
