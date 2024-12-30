import mongoose, { Schema, Document } from "mongoose";

interface IChat extends Document {
    title: Record<string, string>; // Can be either an object or string
    participants: string[]; // Array of User IDs
    type: string; // E.g., 'private', 'group'
    lastUpdated: Date; // Last activity timestamp
    messages: string[]; // Array of Message IDs
}

const ChatSchema: Schema = new Schema(
    {
        title: { type: Object, required: true },
        participants: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        ],
        type: { type: String, required: true, enum: ["private", "group"] }, // Enum for controlled values
        lastUpdated: { type: Date, required: true, default: Date.now },
        messages: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: [] },
        ],
    },
    { timestamps: true }
);

export default mongoose.model<IChat>("Chat", ChatSchema);
