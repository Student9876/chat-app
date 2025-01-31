import {useEffect, useRef, useState} from "react";
import {io, Socket} from "socket.io-client";
import Image from "next/image";
import {ChevronLeft} from "lucide-react";
import attachIcon from "./icons/attach-file.png";
import sendIcon from "./icons/send.png";
import {MessageType, UserType, TitleType} from "@/types";

interface ChatProps {
	chatId: string;
	currentUser: TitleType;
	onBack?: () => void;
	isMobile?: boolean;
}

const Chat = ({chatId, currentUser, onBack, isMobile}: ChatProps) => {
	const [messages, setMessages] = useState<MessageType[]>([]);
	const [socket, setSocket] = useState<Socket | null>(null);
	const [newMessage, setNewMessage] = useState("");
	const [user, setUser] = useState<UserType | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	const BACKEND_URL = process.env.BACKEND_URL;
	const fetchMessages = async (chatId: string) => {
		try {
			const response = await fetch(`${BACKEND_URL}/api/messages/${chatId}`);
			const data = await response.json();
			setMessages(data || []);
		} catch (error) {
			console.error("Failed to fetch messages:", error);
		}
	};

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

	useEffect(() => {
		const newSocket = io(`${BACKEND_URL}`, {
			withCredentials: true,
			transports: ["websocket"],
		});

		setSocket(newSocket);

		newSocket.on("connect", () => {
			console.log("Connected to server:", newSocket.id);
			newSocket.emit("joinChat", chatId);
		});

		newSocket.on("messageReceived", (newMessage: MessageType) => {
			setMessages((prevMessages) => [...prevMessages, newMessage]);
		});

		return () => {
			newSocket.off("messageReceived");
			newSocket.disconnect();
		};
	}, [chatId]);

	useEffect(() => {
		fetchMessages(chatId);
	}, [chatId]);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		initializeUserAndToken();
	}, []);

	const sendMessage = async () => {
		if (!socket || !newMessage.trim()) return;

		const messageData = {
			chatId,
			senderId: user?.id,
			content: newMessage.trim(),
			type: "text",
		};

		try {
			const response = await fetch(`${BACKEND_URL}/api/messages/send`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(messageData),
			});
			const data = await response.json();
			socket.emit("sendMessage", data);
		} catch (error) {
			console.error("Error sending message:", error);
		} finally {
			setNewMessage("");
		}
	};

	const handleImageUpload = async (chatId: string, file: File) => {
		if (!socket) return;

		const formData = new FormData();
		formData.append("image", file);
		formData.append("chatId", chatId);
		formData.append("senderId", String(user?.id) || "");

		const token = localStorage.getItem("token");

		try {
			const response = await fetch(`${BACKEND_URL}/api/images/upload`, {
				method: "POST",
				headers: {Authorization: `Bearer ${token}`},
				body: formData,
			});

			const data = await response.json();
			socket.emit("sendMessage", data);
		} catch (error) {
			console.error("Error sending message:", error);
		} finally {
			setNewMessage("");
		}
	};

	return (
		<div className="flex flex-col h-full">
			{/* User profile section with back button */}
			<div className="p-4 bg-white shadow-md flex items-center">
				{isMobile && (
					<button onClick={onBack} className="mr-2 cursor-pointer hover:bg-gray-100 p-1 rounded-full">
						<ChevronLeft className="w-6 h-6 text-gray-600" />
					</button>
				)}
				<div className="flex-1">
					<h2 className="text-lg font-semibold">{currentUser.userName}</h2>
				</div>
			</div>

			{/* Messages Section */}
			<div className="flex-1 overflow-y-auto p-4 bg-gray-50">
				{messages.map((message) => (
					<div key={message._id} className={`mb-2 ${message.senderId === user?.id ? "text-right" : "text-left"}`}>
						{message.type === "text" ? (
							<div className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md">{message.content}</div>
						) : (
							<Image
								src={message.content}
								alt="Sent image"
								className="inline-block max-w-xs max-h-40 rounded-lg shadow-md"
								width={200}
								height={200}
							/>
						)}
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Section */}
			<div className="p-4 bg-white shadow-md flex items-center">
				<label htmlFor="imageUpload" className="cursor-pointer">
					<Image src={attachIcon} alt="Attachment" className="w-6 h-6 mr-4" />
				</label>
				<input
					id="imageUpload"
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(e) => handleImageUpload(chatId, e.target.files?.[0] as File)}
				/>
				<input
					type="text"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && sendMessage()}
					placeholder="Type a message"
					className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
				/>
				<label onClick={sendMessage} className="cursor-pointer">
					<Image src={sendIcon} alt="Attachment" className="w-6 h-6 ml-4" />
				</label>
			</div>
		</div>
	);
};

export default Chat;
