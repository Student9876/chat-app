import { useQuery } from "@tanstack/react-query";
import { MessageType } from "@/types";

export const useMessages = (chatId: string) => {
	const BACKEND_URL = process.env.BACKEND_URL;
	return useQuery<MessageType[]>({
		queryKey: ["messages", chatId],
		queryFn: async () => {
			if (!chatId) return [];
			const response = await fetch(`${BACKEND_URL}/api/messages/${chatId}`);
			if (!response.ok) throw new Error("Failed to fetch messages");
			return response.json();
		},
		enabled: !!chatId,
	});
};
