import { Types } from "mongoose";
import { EventEmitter } from "events";

// Interfaces 

export interface MessageMetadata {
    fileName?: string; // Optional, used for files
    audioUrl?: string; // Optional, used for voice messages
    imageUrl?: string; // Optional, used for images
}

export interface MessageType {
    _id: string;
    chatId: string;
    senderId: string;
    content: string;
    type: "text" | "image" | "audio" | "file"; // Add more as needed
    timestamp: Date;
    metadata?: MessageMetadata; // Optional
}

export interface UserType {
    id: string;
    username: string;
    email: string;
}

export interface TitleType {
    userName: string;
    userId: string;
}

export interface ChatType {
    _id: Types.ObjectId; // Mongoose ObjectId
    title: Record<string, TitleType>; // Can be either an object or string
    participants: Types.ObjectId[]; // Array of User IDs
    type: "private" | "group"; // Enum for chat type
    lastUpdated: Date; // Timestamp for last updated time
    messages: Types.ObjectId[]; // Array of Message IDs
    createdAt?: Date; // Automatically added by Mongoose timestamps
    updatedAt?: Date; // Automatically added by Mongoose timestamps
}

export interface AuthContextProps {
    user: UserType | null;
    login: (token: string, user: UserType) => void;
    logout: () => void;
}

export interface ChatTileProps {
    username: string;
    onClick: () => void;
}


// Define the MegaFile interface
export interface MegaFile {
    link: (callback: (err: Error | null, link: string) => void) => void;
}

// Define the MegaUploadStream interface
export interface MegaUploadStream extends EventEmitter {
    on(event: "complete", listener: (file: MegaFile) => void): this;
    on(event: "error", listener: (err: Error) => void): this;
}
