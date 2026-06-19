import { useQuery } from "@tanstack/react-query";
import { ChatType } from "@/types";

export const useChats = (isLoggedIn: boolean) => {
	const BACKEND_URL = process.env.BACKEND_URL;
	return useQuery<ChatType[]>({
		queryKey: ["chats"],
		queryFn: async () => {
			const token = localStorage.getItem("token");
			if (!token) throw new Error("No token available");
			const response = await fetch(`${BACKEND_URL}/api/chats`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) throw new Error("Failed to fetch chats");
			const data = await response.json();
			return data.chats || [];
		},
		enabled: isLoggedIn,
	});
};
