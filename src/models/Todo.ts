import mongoose from "mongoose";


export type TodoDocument = mongoose.Document & {
    title: string;
    desc?: string;
    labels: string[];
    dueDate: Date;
    status: number;
    priority?: number;
    groupId: string;


};

const todoSchema = new mongoose.Schema({
    title: String,
    desc: String,
    labels: Array,
    dueDate: Date,
    status: { type: Number, default: 0 },
    priority:{ type: Number, default: 1 },
    groupId: String,
    }, { timestamps: true });

export const Todo = mongoose.model<TodoDocument>("Todo", todoSchema);