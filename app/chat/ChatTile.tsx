import React from "react";

interface ChatTileProps {
	username: string;
	onClick: () => void;
}

const ChatTile: React.FC<ChatTileProps> = ({username, onClick}) => {
	return (
		<div onClick={onClick} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 rounded-lg">
			<div className="flex items-center">
				<div className="w-10 h-10 bg-blue-500 rounded-full text-white flex items-center justify-center">{username[0].toUpperCase()}</div>
				<span className="ml-3">{username}</span>
			</div>
		</div>
	);
};

export default ChatTile;
