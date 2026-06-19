"use client";
import React, {useEffect, useState, useCallback} from "react";
import Chat from "./chat/Chat";
import ChatTile from "./chat/ChatTile";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useAuth} from "./context/AuthContext";
import {useChats} from "./hooks/useChats";
import {UserType, ChatType} from "@/types";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {MessageSquare, Search, LogIn, UserPlus, Sparkles, MessageCircle} from "lucide-react";

const BACKEND_URL = process.env.BACKEND_URL;

const MainPage: React.FC = () => {
	const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<UserType[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState<UserType | null>(null);
	const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
	const router = useRouter();
	const {logout} = useAuth();

	const { data: contacts, isLoading: isChatsLoading, refetch: refetchContacts } = useChats(isLoggedIn);

	// Authentication check
	useEffect(() => {
		const checkAuthentication = async () => {
			const token = localStorage.getItem("token");
			if (!token) {
				setIsLoggedIn(false);
				return;
			}
			try {
				const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
					headers: {Authorization: `Bearer ${token}`},
				});
				if (response.ok) {
					setIsLoggedIn(true);
				} else {
					throw new Error("Token verification failed");
				}
			} catch {
				setIsLoggedIn(false);
				logout();
				router.push("/login");
			}
		};
		checkAuthentication();
	}, [logout, router]);

	const fetchCurrentUser = useCallback(async () => {
		const token = localStorage.getItem("token");
		try {
			const response = await fetch(`${BACKEND_URL}/api/users/currentUser`, {
				headers: {Authorization: `Bearer ${token}`},
			});
			const data = await response.json();
			setUser(data.user);
		} catch (error) {
			console.error("Failed to fetch current user:", error);
		}
	}, []);

	useEffect(() => {
		if (isLoggedIn) fetchCurrentUser();
	}, [isLoggedIn, fetchCurrentUser]);

	const searchUsers = async () => {
		if (!searchQuery.trim()) return;
		setIsLoading(true);
		const token = localStorage.getItem("token");
		try {
			const response = await fetch(`${BACKEND_URL}/api/users/search?query=${searchQuery}`, {
				headers: {Authorization: `Bearer ${token}`},
			});
			const data = await response.json();
			setSearchResults(data.results || []);
		} catch (error) {
			console.error("Failed to search users:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Clear search results when query is empty
	useEffect(() => {
		if (!searchQuery.trim()) {
			setSearchResults([]);
		}
	}, [searchQuery]);

	const initiateChat = async (userId: string) => {
		const token = localStorage.getItem("token");
		try {
			const response = await fetch(`${BACKEND_URL}/api/chats/initiate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({userId}),
			});
			const data = await response.json();
			if (data && data.chat) {
				setSelectedChat(data.chat);
				setIsMobileChatOpen(true);
				setSearchQuery("");
				setSearchResults([]);
				refetchContacts();
			}
		} catch (error) {
			console.error("Failed to initiate chat:", error);
		}
	};

	const helper = (chat: ChatType) => {
		if (!user) return {userName: "unknown", userId: "unknown"};
		return chat.title[user?.id] || {userName: "unknown", userId: "unknown"};
	};

	const handleChatSelect = (chat: ChatType) => {
		setSelectedChat(chat);
		setIsMobileChatOpen(true);
	};

	// Guest Landing Page
	if (!isLoggedIn) {
		return (
			<div className="relative min-h-[92vh] flex items-center justify-center bg-background px-6 overflow-hidden">
				<div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

				<div className="max-w-2xl text-center z-10 space-y-6">
					<div className="inline-flex p-4 bg-muted/65 border border-border rounded-2xl shadow-inner">
						<MessageCircle className="w-12 h-12 text-primary" />
					</div>
					<h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
						Real-Time Chats, <br />
						<span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Re-imagined for Simplicity</span>
					</h1>
					<p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
						Experience ultra-fast message deliveries, secure connections, and clean layouts. Connect with friends and teams today!
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
						<Button asChild size="lg" className="w-full sm:w-auto shadow-md">
							<Link href="/login" className="flex items-center gap-2">
								<LogIn className="w-4 h-4" />
								<span>Sign In</span>
							</Link>
						</Button>
						<Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
							<Link href="/register" className="flex items-center gap-2">
								<UserPlus className="w-4 h-4" />
								<span>Create Account</span>
							</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col md:flex-row flex-1 min-h-0 bg-background relative overflow-hidden text-foreground">
			{/* Sidebar Contacts Area */}
			<div
				className={`md:w-1/3 lg:w-80 w-full border-r border-border bg-card flex flex-col transition-transform transform-gpu duration-300 ease-in-out absolute md:relative inset-0 z-30
			  ${isMobileChatOpen ? "-translate-x-full md:translate-x-0" : "translate-x-0"}`}>
				
				{/* Search Panel */}
				<div className="p-4 border-b border-border">
					<div className="relative">
						<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
							<Search className="w-4 h-4" />
						</span>
						<Input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && searchUsers()}
							className="pl-9 pr-12 w-full"
							placeholder="Search user email or username..."
						/>
						{searchQuery && (
							<button
								onClick={searchUsers}
								className="absolute right-2 top-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground py-1 px-2.5 rounded-md transition-colors font-semibold"
							>
								Go
							</button>
						)}
					</div>
				</div>

				{/* Contacts Feed Scroll */}
				<ScrollArea className="flex-1">
					<div className="space-y-1 px-3 py-2">
						{isChatsLoading || isLoading ? (
							<div className="space-y-2 p-2">
								{[...Array(4)].map((_, i) => (
									<div key={i} className="flex items-center gap-3 p-3 bg-muted/20 border border-border/50 rounded-lg animate-pulse">
										<div className="w-9 h-9 bg-muted rounded-full" />
										<div className="flex-1 space-y-1.5">
											<div className="h-3.5 bg-muted rounded w-2/3" />
											<div className="h-3 bg-muted rounded w-1/2" />
										</div>
									</div>
								))}
							</div>
						) : searchResults.length > 0 ? (
							<div className="space-y-1">
								<p className="px-3 text-xs font-semibold text-primary uppercase tracking-wider mb-2">Search Results</p>
								{searchResults.map((user) => (
									<ChatTile
										key={user.id}
										username={user.username || user.email}
										onClick={() => initiateChat(user.id)}
									/>
								))}
							</div>
						) : contacts && contacts.length > 0 ? (
							<div className="space-y-1">
								<p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Chats</p>
								{contacts.map((contact) => (
									<ChatTile
										key={String(contact._id)}
										username={helper(contact).userName}
										isSelected={selectedChat?._id === contact._id}
										onClick={() => handleChatSelect(contact)}
									/>
								))}
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground text-sm space-y-2">
								<Sparkles className="w-5 h-5 mx-auto text-muted-foreground/60 animate-pulse" />
								<p>No active conversations.</p>
								<p className="text-xs">Search for users above to begin messaging.</p>
							</div>
						)}
					</div>
				</ScrollArea>
			</div>

			{/* Chat Viewport Area */}
			<div
				className={`h-full flex-1 bg-muted/10 transition-transform transform-gpu duration-300 ease-in-out absolute md:relative inset-0 z-20
			  ${isMobileChatOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
				{selectedChat && user ? (
					<Chat
						chatId={String(selectedChat._id)}
						currentUser={helper(selectedChat)}
						onBack={() => setIsMobileChatOpen(false)}
						isMobile={isMobileChatOpen}
					/>
				) : (
					<div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground space-y-4">
						<div className="p-4 bg-card border border-border rounded-full shadow-md text-primary">
							<MessageSquare className="w-8 h-8" />
						</div>
						<div className="space-y-1">
							<h3 className="font-semibold text-foreground text-lg">No active conversation</h3>
							<p className="text-sm text-muted-foreground max-w-xs">Select a contact from the sidebar or search for users to begin a conversation.</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default MainPage;
