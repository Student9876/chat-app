"use client";
import React, {useEffect, useState} from "react";
import Chat from "./chat/Chat";
import ChatTile from "./chat/ChatTile";
import {useRouter} from "next/navigation";
import {useAuth} from "./context/AuthContext";
import {UserType, ChatType} from "@/types";

const MainPage: React.FC = () => {
	const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [contacts, setContacts] = useState<ChatType[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<UserType[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState<UserType | null>(null);
	const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
	const router = useRouter();
	const {logout} = useAuth();

	// Authentication check
	useEffect(() => {
		const checkAuthentication = async () => {
			const token = localStorage.getItem("token");
			if (!token) {
				setIsLoggedIn(false);
				return;
			}
			try {
				const response = await fetch("http://localhost:5000/api/auth/verify", {
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

	useEffect(() => {
		if (isLoggedIn) fetchContacts();
	}, [isLoggedIn]);

	const fetchContacts = async () => {
		setIsLoading(true);
		const token = localStorage.getItem("token");
		try {
			const response = await fetch("http://localhost:5000/api/chats", {
				headers: {Authorization: `Bearer ${token}`},
			});
			const data = await response.json();
			setContacts(data.chats);
		} catch (error) {
			console.error("Failed to fetch contacts:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchCurrentUser = async () => {
		const token = localStorage.getItem("token");
		try {
			const response = await fetch("http://localhost:5000/api/users/currentUser", {
				headers: {Authorization: `Bearer ${token}`},
			});
			const data = await response.json();
			setUser(data.user);
		} catch (error) {
			console.error("Failed to fetch current user:", error);
		}
	};

	useEffect(() => {
		if (isLoggedIn) fetchCurrentUser();
	}, [isLoggedIn]);

	const searchUsers = async () => {
		if (!searchQuery.trim()) return;
		setIsLoading(true);
		const token = localStorage.getItem("token");
		try {
			const response = await fetch(`http://localhost:5000/api/users/search?query=${searchQuery}`, {
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

	const initiateChat = async (userId: string) => {
		const token = localStorage.getItem("token");
		try {
			const response = await fetch("http://localhost:5000/api/chats/initiate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({userId}),
			});
			const data = await response.json();
			if (data) {
				setSelectedChat(data.chat);
				setIsMobileChatOpen(true);
				fetchContacts();
			}
		} catch (error) {
			console.error("Failed to initiate chat:", error);
		}
	};

	const helper = (chat: ChatType) => {
		if (!user) return {userName: "unknown", userId: "unknown"};
		return chat.title[user?.id];
	};

	const handleChatSelect = (chat: ChatType) => {
		setSelectedChat(chat);
		setIsMobileChatOpen(true);
	};

	if (!isLoggedIn) {
		return (
			<div className="relative h-screen bg-gray-100">
				<div
					className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-500"
					style={{
						clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 40%)",
					}}
				/>
				<div className="absolute inset-0 flex flex-col items-center text-white">
					<h1 className="text-3xl md:text-4xl mt-[50%] md:mt-[20%] font-bold mb-4">Welcome to ChatApp</h1>
					<p className="mb-6 text-lg text-center px-4 sm:px-0">
						Connect with friends and colleagues in real-time. Join us now to experience seamless communication!
					</p>
					<button
						onClick={() => router.push("/register")}
						className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition duration-300">
						Sign Up
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col md:flex-row h-[92vh] bg-gray-100 relative overflow-hidden">
			{/* Sidebar */}
			<div
				className={`md:w-1/3 w-full bg-white shadow-lg p-4 transition-transform duration-300 ease-in-out absolute md:relative inset-0
			  ${isMobileChatOpen ? "-translate-x-full md:translate-x-0" : "translate-x-0"}`}>
				<div className="mb-4">
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && searchUsers()}
						className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
						placeholder="Search by email or username"
					/>
				</div>

				<div className="overflow-y-auto h-[calc(90vh-100px)]">
					{isLoading ? (
						<div className="text-center text-gray-500">Loading...</div>
					) : searchResults.length > 0 ? (
						searchResults.map((user) => <ChatTile key={user.id} username={user.email} onClick={() => initiateChat(user.id)} />)
					) : contacts && contacts.length > 0 ? (
						contacts.map((contact) => (
							<ChatTile key={String(contact._id)} username={helper(contact).userName} onClick={() => handleChatSelect(contact)} />
						))
					) : (
						<div className="text-center text-gray-500">No contacts yet. Search to start a conversation.</div>
					)}
				</div>
			</div>

			{/* Chat Area */}
			<div
				className={`h-full md:w-2/3 w-full bg-gray-50 transition-transform duration-300 ease-in-out absolute md:relative inset-0
			  ${isMobileChatOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
				{selectedChat && user ? (
					<Chat
						chatId={String(selectedChat._id)}
						currentUser={helper(selectedChat)}
						onBack={() => setIsMobileChatOpen(false)}
						isMobile={isMobileChatOpen}
					/>
				) : (
					<div className="flex items-center justify-center h-full text-gray-500">Select a chat to start messaging</div>
				)}
			</div>
		</div>
	);
};

export default MainPage;
