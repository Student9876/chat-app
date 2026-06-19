import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageType } from "@/types";

interface SendMessagePayload {
	chatId: string;
	senderId: string;
	content: string;
	type: string;
}

export const useSendMessage = () => {
	const queryClient = useQueryClient();
	const BACKEND_URL = process.env.BACKEND_URL;

	return useMutation<
		MessageType, // response type
		Error, // error type
		{ payload: SendMessagePayload; tempId: string }, // variables type
		{ previousMessages: MessageType[] | undefined; tempId: string } // context type
	>({
		mutationFn: async ({ payload }) => {
			const token = localStorage.getItem("token");
			const response = await fetch(`${BACKEND_URL}/api/messages/send`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});
			if (!response.ok) throw new Error("Failed to send message");
			return response.json();
		},
		// Optimistic update
		onMutate: async ({ payload, tempId }) => {
			// Cancel any outgoing refetches so they don't overwrite our optimistic update
			await queryClient.cancelQueries({ queryKey: ["messages", payload.chatId] });

			// Snapshot the previous value
			const previousMessages = queryClient.getQueryData<MessageType[]>(["messages", payload.chatId]);

			// Optimistically update to the new value
			const optimisticMsg: MessageType = {
				_id: tempId,
				chatId: payload.chatId,
				senderId: payload.senderId,
				content: payload.content,
				type: payload.type as MessageType["type"],
				timestamp: new Date(),
			};

			queryClient.setQueryData<MessageType[]>(
				["messages", payload.chatId],
				(old) => [...(old || []), optimisticMsg]
			);

			// Return a context object with the snapshotted value
			return { previousMessages, tempId };
		},
		// If the mutation fails, use the context returned from onMutate to roll back
		onError: (err, variables, context) => {
			if (context?.previousMessages) {
				queryClient.setQueryData(
					["messages", variables.payload.chatId],
					context.previousMessages
				);
			}
		},
		// Always refetch or update after success or error
		onSuccess: (data, variables, context) => {
			// Replace optimistic message with the real one in query cache
			queryClient.setQueryData<MessageType[]>(
				["messages", variables.payload.chatId],
				(old) => (old || []).map((m) => m._id === context?.tempId ? data : m)
			);
		},
	});
};
