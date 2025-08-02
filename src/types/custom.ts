import { Types } from "mongoose";

export type User = {
  userId: Types.ObjectId;
  email: string;
  role: string;
}
