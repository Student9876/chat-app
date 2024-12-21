import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["text", "image", "file", "voice"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: {
        fileName: String,  // For files
        audioUrl: String,  // For voice messages
        imageUrl: String,  // For images
    },
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
