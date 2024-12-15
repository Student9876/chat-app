"use client";
import React, {useEffect, useState} from "react";
import Chat from "./chat/Chat";
import ChatTile from "./chat/ChatTile";
import {useRouter} from "next/navigation";

const MainPage: React.FC = () => {
	const [selectedChat, setSelectedChat] = useState<string | null>(null);
	const [isMobile, setIsMobile] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const router = useRouter();

	// Adjust layout based on window size
	const checkWindowSize = () => {
		setIsMobile(window.innerWidth < 768);
	};

	// Check if the user is logged in
	const checkAuthentication = () => {
		const token = localStorage.getItem("token");
		if (!token) {
			setIsLoggedIn(false);
			router.push("/login"); // Redirect to login page if not authenticated
		} else {
			setIsLoggedIn(true);
		}
	};

	useEffect(() => {
		checkWindowSize();
		window.addEventListener("resize", checkWindowSize);
		checkAuthentication(); // Check authentication on page load

		return () => window.removeEventListener("resize", checkWindowSize);
	}, []);

	if (!isLoggedIn) return null; // Optionally, show a loading spinner while checking login status

	return (
		<div className="flex flex-col md:flex-row h-screen">
			{/* Sidebar - Left (PC) */}
			<div className={`md:w-1/3 w-full ${isMobile ? "hidden" : ""} bg-gray-50 p-4`}>
				<div className="mb-4">
					<input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Search" />
				</div>
				<div>
					<ChatTile username="User 1" onClick={() => setSelectedChat("User 1")} />
					<ChatTile username="User 2" onClick={() => setSelectedChat("User 2")} />
					<ChatTile username="User 3" onClick={() => setSelectedChat("User 3")} />
				</div>
			</div>

			{/* Chat Area */}
			<div className={`md:w-2/3 w-full ${selectedChat ? "" : "hidden"} bg-gray-100 p-4`}>
				{selectedChat ? <Chat /> : <div>Select a user to start chatting</div>}
			</div>

			{/* Mobile View Transition Window */}
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
