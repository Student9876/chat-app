import { useInfiniteQuery } from "@tanstack/react-query";
import { MessageType } from "@/types";

export const useMessages = (chatId: string) => {
	const BACKEND_URL = process.env.BACKEND_URL;
	return useInfiniteQuery<MessageType[]>({
		queryKey: ["messages", chatId],
		queryFn: async ({ pageParam }) => {
			if (!chatId) return [];
			const url = new URL(`${BACKEND_URL}/api/messages/${chatId}`);
			url.searchParams.append("limit", "20");
			if (pageParam) {
				// Pass the timestamp cursor to fetch messages older than the oldest loaded message
				url.searchParams.append("before", String(pageParam));
			}
			const response = await fetch(url.toString());
			if (!response.ok) throw new Error("Failed to fetch messages");
			return response.json();
		},
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => {
			// Since backend reverses messages to be chronological,
			// the oldest message in the page is at index 0. We use its
			// timestamp as the cursor to fetch the next page of older messages.
			if (!lastPage || lastPage.length < 20) return undefined;
			return String(lastPage[0].timestamp);
		},
		enabled: !!chatId,
	});
};
