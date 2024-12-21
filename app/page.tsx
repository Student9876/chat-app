"use client";
import React, {useEffect, useState} from "react";
import Chat from "./chat/Chat";
import ChatTile from "./chat/ChatTile";
import {useRouter} from "next/navigation";

const MainPage: React.FC = () => {
	const [selectedChat, setSelectedChat] = useState<string | null>(null);
	const [isMobile, setIsMobile] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [contacts, setContacts] = useState<any[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	// Check window size for responsiveness
	useEffect(() => {
		const checkWindowSize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkWindowSize();
		window.addEventListener("resize", checkWindowSize);
		return () => window.removeEventListener("resize", checkWindowSize);
	}, []);

	// Check user authentication
	useEffect(() => {
		const checkAuthentication = () => {
			const token = localStorage.getItem("token");
			if (!token) {
				setIsLoggedIn(false);
				router.push("/login");
			} else {
				setIsLoggedIn(true);
			}
		};

		checkAuthentication();
	}, [router]);

	// Fetch contacts from API
	const fetchContacts = async () => {
		setIsLoading(true);
		const token = localStorage.getItem("token");
		console.log(token);
		try {
			const response = await fetch("http://localhost:5000/api/chats", {
				headers: {Authorization: `Bearer ${token}`},
			});
			const data = await response.json();
			setContacts(data.contacts || []);
		} catch (error) {
			console.error("Failed to fetch contacts:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Search for users
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

	// Initiate a new chat
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
				fetchContacts();
			}
		} catch (error) {
			console.error("Failed to initiate chat:", error);
		}
	};

	// Initial fetch
	useEffect(() => {
		if (isLoggedIn) {
			fetchContacts();
		}
	}, [isLoggedIn]);

	if (!isLoggedIn) return null;

	return (
		<div className="flex flex-col md:flex-row h-screen">
			{/* Sidebar */}
			<div className={`md:w-1/3 w-full ${isMobile ? "hidden" : ""} bg-gray-50 p-4`}>
				{/* Search Input */}
				<div className="mb-4">
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && searchUsers()}
						className="w-full p-3 border border-gray-300 rounded-lg"
						placeholder="Search by email"
					/>
				</div>

				{/* Chat Tiles */}
				<div>
					{isLoading ? (
						<div className="text-center text-gray-500">Loading...</div>
					) : searchResults.length > 0 ? (
						searchResults.map((user) => <ChatTile key={user.id} username={user.email} onClick={() => initiateChat(user.id)} />)
					) : (
						contacts.map((contact) => <ChatTile key={contact.chatId} username={contact.username} onClick={() => setSelectedChat(contact.chatId)} />)
					)}
				</div>
			</div>

			{/* Chat Area */}
			<div className={`md:w-2/3 w-full ${selectedChat ? "" : "hidden"} bg-gray-100 p-4`}>
				{selectedChat ? <Chat chatId={selectedChat} /> : <div>Select a user to start chatting</div>}
			</div>

			{/* Mobile View */}
			{isMobile && selectedChat && (
				<div className="fixed top-0 left-0 right-0 bg-white shadow-lg p-4 z-50">
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-semibold">Chat with {selectedChat}</h2>
						<button className="p-2 bg-blue-600 text-white rounded-lg">Voice Call</button>
					</div>
					<div className="mt-3">
						<input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Type a message..." />
						<button className="mt-2 w-full p-3 bg-blue-600 text-white rounded-lg">Send</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default MainPage;
