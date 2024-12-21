import mongoose, { Schema, Document } from "mongoose";

interface IChat extends Document {
    participants: mongoose.Types.ObjectId[];
    type: "private" | "group";
    createdAt: Date;
}

const chatSchema = new Schema<IChat>({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    type: { type: String, enum: ["private", "group"], required: true },
    createdAt: { type: Date, default: Date.now },
});

const Chat = mongoose.model<IChat>("Chat", chatSchema);
export default Chat;
