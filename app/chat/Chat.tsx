// app/chat/Chat.tsx

import React, {useState} from "react";

const Chat: React.FC = () => {
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<string[]>([]);

	const sendMessage = () => {
		if (message.trim()) {
			setMessages([...messages, message]);
			setMessage("");
		}
	};

	return (
		<div className="flex flex-col h-full p-4 bg-white shadow-lg rounded-lg">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-semibold">Chat with User</h2>
				<button className="p-2 bg-blue-600 text-white rounded-lg">Voice Call</button>
			</div>
			<div className="flex-1 overflow-y-auto space-y-4 mb-4">
				{messages.map((msg, idx) => (
					<div key={idx} className="p-2 bg-gray-100 rounded-lg">
						<p>{msg}</p>
					</div>
				))}
			</div>
			<div className="flex items-center space-x-3">
				<input
					type="text"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className="w-full p-3 border border-gray-300 rounded-lg"
					placeholder="Type a message..."
				/>
				<button onClick={sendMessage} className="p-3 bg-blue-600 text-white rounded-lg">
					Send
				</button>
			</div>
		</div>
	);
};

export default Chat;
