import {useEffect, useRef, useState} from "react";
import {io, Socket} from "socket.io-client";
import Image from "next/image";
import {ChevronLeft, Paperclip, Send} from "lucide-react";
import {MessageType, UserType, TitleType} from "@/types";
import {useQueryClient} from "@tanstack/react-query";
import {useMessages} from "../hooks/useMessages";
import {useSendMessage} from "../hooks/useSendMessage";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

interface ChatProps {
	chatId: string;
	currentUser: TitleType;
	onBack?: () => void;
	isMobile?: boolean;
}

const Chat = ({chatId, currentUser, onBack, isMobile}: ChatProps) => {
	const queryClient = useQueryClient();
	const { data: messages = [], isLoading: isMessagesLoading } = useMessages(chatId);
	const sendMessageMutation = useSendMessage();

	const [socket, setSocket] = useState<Socket | null>(null);
	const [newMessage, setNewMessage] = useState("");
	const [user, setUser] = useState<UserType | null>(null);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	const BACKEND_URL = process.env.BACKEND_URL;

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
	};

	const initializeUserAndToken = () => {
		const user = localStorage.getItem("user");
		if (user) {
			setUser(JSON.parse(user));
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
			if (newMessage.chatId === chatId) {
				queryClient.setQueryData<MessageType[]>(["messages", chatId], (old) => {
					if (!old) return [newMessage];
					const exists = old.some((m) => m._id === newMessage._id);
					if (exists) return old;
					return [...old, newMessage];
				});
			}
		});

		return () => {
			newSocket.off("messageReceived");
			newSocket.disconnect();
		};
	}, [chatId, BACKEND_URL, queryClient]);

	useEffect(() => {
		scrollToBottom();
	}, [messages, isMessagesLoading]);

	useEffect(() => {
		initializeUserAndToken();
	}, []);

	const sendMessage = async () => {
		if (!socket || !newMessage.trim() || !user) return;

		const messageText = newMessage.trim();
		setNewMessage("");

		const messagePayload = {
			chatId,
			senderId: user.id,
			content: messageText,
			type: "text",
		};

		const tempId = `opt-${Date.now()}`;

		try {
			const savedMessage = await sendMessageMutation.mutateAsync({
				payload: messagePayload,
				tempId,
			});
			socket.emit("sendMessage", savedMessage);
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};

	const handleImageUpload = async (chatId: string, file: File) => {
		if (!socket || !user) return;

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
			// Add the new image message to the query cache
			queryClient.setQueryData<MessageType[]>(["messages", chatId], (old) => {
				if (!old) return [data];
				return [...old, data];
			});
			socket.emit("sendMessage", data);
		} catch (error) {
			console.error("Error sending message:", error);
		} finally {
			setNewMessage("");
		}
	};

	const headerInitial = currentUser.userName ? currentUser.userName.charAt(0).toUpperCase() : "U";

	return (
		<div className="flex flex-col h-full bg-background">
			{/* Top Bar Header */}
			<div className="p-4 bg-card border-b border-border flex items-center gap-3 shadow-sm">
				{isMobile && (
					<Button variant="ghost" size="icon" onClick={onBack} className="mr-1 h-9 w-9 rounded-full select-none cursor-pointer">
						<ChevronLeft className="w-5 h-5" />
					</Button>
				)}
				<Avatar className="h-9 w-9 border border-border">
					<AvatarFallback className="bg-primary/10 text-primary font-semibold uppercase text-xs">
						{headerInitial}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<h2 className="text-sm font-semibold truncate leading-none mb-1 text-foreground">{currentUser.userName}</h2>
					<div className="flex items-center gap-1.5 leading-none">
						<span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
						<span className="text-[10px] text-muted-foreground font-medium">Active now</span>
					</div>
				</div>
			</div>

			{/* Messages Feed */}
			<ScrollArea className="flex-1 p-4 bg-muted/10">
				<div className="space-y-3 pr-3">
					{isMessagesLoading ? (
						<div className="space-y-4 py-4 h-full flex flex-col justify-end">
							<div className="flex items-end gap-2 max-w-[70%]">
								<div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
								<div className="bg-card border border-border/50 h-10 w-44 rounded-2xl rounded-bl-none animate-pulse" />
							</div>
							<div className="flex items-end gap-2 justify-end max-w-[70%] ml-auto">
								<div className="bg-primary/10 h-14 w-52 rounded-2xl rounded-br-none animate-pulse" />
							</div>
							<div className="flex items-end gap-2 max-w-[70%]">
								<div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
								<div className="bg-card border border-border/50 h-10 w-32 rounded-2xl rounded-bl-none animate-pulse" />
							</div>
						</div>
					) : messages.length > 0 ? (
						messages.map((message) => {
							const isOwn = message.senderId === user?.id;
							return (
								<div key={message._id} className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
									{!isOwn && (
										<Avatar className="h-7 w-7 border border-border shrink-0 select-none">
											<AvatarFallback className="bg-primary/10 text-primary font-semibold uppercase text-[10px]">
												{headerInitial}
											</AvatarFallback>
										</Avatar>
									)}

									<div className="flex flex-col max-w-[75%] md:max-w-[65%]">
										<div
											className={`p-3 text-sm shadow-sm relative rounded-2xl leading-relaxed break-words whitespace-pre-wrap transition-all duration-150
												${
													isOwn
														? "bg-primary text-primary-foreground rounded-br-none"
														: "bg-card border border-border text-foreground rounded-bl-none"
												}
											`}
										>
											{message.type === "text" ? (
												<p>{message.content}</p>
											) : (
												<div className="relative rounded-lg overflow-hidden border border-border/10 bg-muted/20">
													<Image
														src={message.content}
														alt="Sent attachment"
														className="object-cover max-w-full max-h-60 rounded-md"
														width={280}
														height={200}
														unoptimized
													/>
												</div>
											)}
										</div>
									</div>
								</div>
							);
						})
					) : (
						<div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2 py-12 select-none">
							<div className="w-10 h-10 bg-card border border-border rounded-2xl flex items-center justify-center shadow-sm">
								<Send className="w-4 h-4 text-primary rotate-45" />
							</div>
							<h4 className="text-sm font-semibold text-foreground">Wave hello!</h4>
							<p className="text-xs">Start the conversation with {currentUser.userName}.</p>
						</div>
					)}
				</div>
			</ScrollArea>

			{/* Message Input Panel */}
			<div className="p-4 bg-card border-t border-border flex items-center gap-3">
				<label htmlFor="imageUpload" className="h-9 w-9 flex items-center justify-center bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground rounded-xl cursor-pointer transition-colors shadow-sm shrink-0">
					<Paperclip className="w-4 h-4" />
				</label>
				<input
					id="imageUpload"
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) handleImageUpload(chatId, file);
					}}
				/>
				
				<Input
					type="text"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && sendMessage()}
					placeholder="Write your message..."
					className="flex-1 h-9 shadow-inner"
				/>

				<Button 
					onClick={sendMessage} 
					disabled={!newMessage.trim()}
					size="icon"
					className="h-9 w-9 rounded-xl shrink-0 cursor-pointer shadow-md"
				>
					<Send className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
};

export default Chat;
