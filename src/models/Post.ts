import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  title: string;
  content: string;
  bannerImage: string;
  author: string;
  createdAt: Date;
}

const PostSchema: Schema<IPost> = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    content: { type: String, required: true, trim: true },
    bannerImage: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true, maxlength: 50 },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPost>("Post", PostSchema);
