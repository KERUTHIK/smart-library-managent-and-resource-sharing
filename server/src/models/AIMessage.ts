import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAISource {
  title: string;
  chapter?: string;
  page?: number;
  snippet?: string;
}

export interface IAIMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: IAISource[];
  createdAt: Date;
  updatedAt: Date;
}

const AIMessageSchema = new Schema<IAIMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "AIConversation", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    sources: [
      {
        title: { type: String, required: true },
        chapter: { type: String },
        page: { type: Number },
        snippet: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const AIMessage = mongoose.model<IAIMessage>("AIMessage", AIMessageSchema);
