import mongoose from "mongoose";


export type GroupDocument = mongoose.Document & {
    name: string;
    users: string[];
    meta?: string;
    status: number;

};

const groupSchema = new mongoose.Schema({
    name: String,
    users:  Array,
    metas: String,
    status: { type: Number, default: 0 },
}, { timestamps: true });

export const Group = mongoose.model<GroupDocument>("Group", groupSchema);