import {useEffect, useState} from "react";
import io, {Socket} from "socket.io-client";

interface Message {
	_id: string;
	chatId: string;
	senderId: string;
	content: string;
	type: string; // e.g., 'text'
	createdAt: string;
}

const Chat = ({chatId}: {chatId: string}) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const newSocket = io("http://localhost:5000", {
			withCredentials: true,
			transports: ["websocket", "polling"],
		});
		setSocket(newSocket);

		newSocket.on("connect", () => {
			console.log("Connected to server");
		});

		newSocket.on("disconnect", () => {
			console.log("Disconnected from server");
		});

		newSocket.emit("joinChat", chatId);

		newSocket.on("messageReceived", (newMessage: Message) => {
			setMessages((prevMessages) => [...prevMessages, newMessage]);
		});

		return () => {
			newSocket.off("messageReceived");
			newSocket.disconnect();
		};
	}, [chatId]);

	const sendMessage = (content: string) => {
		if (!socket) return;

		const messageData = {
			chatId,
			senderId: "userId", // Replace with actual user ID
			content,
			type: "text",
			metadata: {},
		};

		socket.emit("sendMessage", messageData);
	};

	return (
		<div>
			<div>
				{messages.map((message) => (
					<div key={message._id}>{message.content}</div>
				))}
			</div>
			<input
				type="text"
				onKeyDown={(e) => {
					if (e.key === "Enter" && e.currentTarget.value.trim()) {
						sendMessage(e.currentTarget.value.trim());
						e.currentTarget.value = ""; // Clear input field
					}
				}}
			/>
		</div>
	);
};

export default Chat;
