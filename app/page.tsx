"use client";
import React, {useEffect, useState} from "react";
import Chat from "./chat/Chat";
import ChatTile from "./chat/ChatTile";
import {useRouter} from "next/navigation";
import {useAuth} from "./context/AuthContext";

const MainPage: React.FC = () => {
	const [selectedChat, setSelectedChat] = useState<string | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [contacts, setContacts] = useState<any[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState<any | null>(null);
	const router = useRouter();
	const {logout} = useAuth();

	// Authentication check
	useEffect(() => {
		const checkAuthentication = async () => {
			const token = localStorage.getItem("token");
			if (!token) {
				setIsLoggedIn(false);
				router.push("/login");
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

	// Fetch contacts and update on login or new chat
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
			console.log("Fetched contacts", data.chats);
			setContacts(data.chats);
		} catch (error) {
			console.error("Failed to fetch contacts:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchCurrentUser();
	}, []);

	const fetchCurrentUser = async () => {
		const token = localStorage.getItem("token");
		try {
			const response = await fetch("http://localhost:5000/api/users/currentUser", {
				headers: {Authorization: `Bearer ${token}`},
			});
			const data = await response.json();
			console.log("Current user:", data);
			setUser(data);
		} catch (error) {
			console.error("Failed to fetch current user:", error);
		}
	};

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
			console.log("Search results:", data.results);
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
			if (data.chatId) {
				setSelectedChat(data.chatId);
				fetchContacts(); // Refresh contacts
			}
		} catch (error) {
			console.error("Failed to initiate chat:", error);
		}
	};
	const getOtherUserName = (chat: any) => {
		console.log(chat, user.user);
		const otherUser = chat.title[user.user.id];
		return otherUser ? otherUser : "Unknown User";
	};

	if (!isLoggedIn) return null;

	return (
		<div className="flex flex-col md:flex-row h-[90vh] bg-gray-100">
			{/* Sidebar */}
			<div className="md:w-1/3 w-full bg-white shadow-lg p-4">
				{/* Search Section */}
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

				{/* Contacts and Search Results */}
				<div className="overflow-y-auto h-[calc(90vh-100px)]">
					{isLoading ? (
						<div key="loading" className="text-center text-gray-500">
							Loading...
						</div>
					) : searchResults.length > 0 ? (
						searchResults.map((user) => (
							<ChatTile
								key={user._id} // Added prefix to ensure uniqueness
								username={user.email}
								onClick={() => initiateChat(user._id)}
							/>
						))
					) : contacts && contacts.length > 0 ? (
						contacts.map((contact) => (
							<ChatTile
								key={contact._id} // Fallback if chatId is not available
								username={getOtherUserName(contact)} // Fallback if username is not available
								onClick={() => setSelectedChat(contact._id)}
							/>
						))
					) : (
						<div key="no-contacts" className="text-center text-gray-500">
							No contacts yet. Search to start a conversation.
						</div>
					)}
				</div>
			</div>

			{/* Chat Area */}
			<div className="h-full md:w-2/3 w-full bg-gray-50 p-4">
				{selectedChat ? (
					<Chat chatId={selectedChat} />
				) : (
					<div className="flex items-center justify-center h-full text-gray-500">Select a chat to start messaging</div>
				)}
			</div>
		</div>
	);
};

export default MainPage;
