import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAIConversation extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  bookContextId?: Types.ObjectId;
  bookContextTitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIConversationSchema = new Schema<IAIConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    bookContextId: { type: Schema.Types.ObjectId, ref: "Book" },
    bookContextTitle: { type: String },
  },
  { timestamps: true }
);

export const AIConversation = mongoose.model<IAIConversation>("AIConversation", AIConversationSchema);
