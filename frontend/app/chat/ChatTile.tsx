import React from "react";
import { ChatTileProps } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ChatTile: React.FC<ChatTileProps> = ({ username, isSelected, onClick }) => {
	const initial = username ? username.charAt(0).toUpperCase() : "U";

	return (
		<div
			onClick={onClick}
			className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl border select-none transition-all duration-150
				${
					isSelected
						? "bg-primary/10 border-primary/20 text-primary font-medium"
						: "bg-transparent border-transparent hover:bg-muted/65 text-foreground hover:text-foreground"
				}`}
		>
			<Avatar className="h-9 w-9 border border-border">
				<AvatarFallback className="bg-primary/10 text-primary font-semibold uppercase text-xs">
					{initial}
				</AvatarFallback>
			</Avatar>
			
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold truncate leading-none mb-1">{username}</p>
				<p className="text-xs text-muted-foreground truncate leading-none">Click to message</p>
			</div>
		</div>
	);
};

export default ChatTile;
