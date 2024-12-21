import mongoose, { Schema, Document } from 'mongoose';

interface IChat extends Document {
    participants: string[];
    type: string; // This might be the missing required field
    lastUpdated: Date;
}

const ChatSchema: Schema = new Schema(
    {
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
        type: { type: String, required: true }, // This field is causing the error
        lastUpdated: { type: Date, required: true, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model<IChat>("Chat", ChatSchema);
