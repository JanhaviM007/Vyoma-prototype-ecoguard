"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { MessageSquare, Send } from "lucide-react";
import { addCommentAction, getCommentsAction } from "@/app/actions/comment-actions";
import { Badge } from "./ui/badge";

export default function CommentSection({ reportId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            const data = await getCommentsAction(reportId);
            setComments(data);
        };
        fetchComments();
    }, [reportId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            await addCommentAction(reportId, newComment);
            setNewComment("");
            const updated = await getCommentsAction(reportId);
            setComments(updated);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] border shadow-xl p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <MessageSquare className="text-blue-500" />
                    Community Discussion
                </h3>
                <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px]">
                    {comments.length} Comments
                </Badge>
            </div>

            {/* New Comment Input */}
            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share an update or safety tip..."
                    className="w-full bg-slate-50 border-none rounded-3xl p-6 text-sm font-bold min-h-[120px] focus:ring-2 focus:ring-blue-100 transition-all resize-none placeholder:text-slate-400"
                />
                <Button
                    disabled={isSubmitting}
                    className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 py-2 shadow-lg shadow-blue-100"
                >
                    {isSubmitting ? "POSTING..." : <><Send size={16} className="mr-2" /> SEND</>}
                </Button>
            </form>

            {/* Comment List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 group">
                        <Avatar className="w-10 h-10 border-2 border-white shadow-md">
                            <AvatarFallback className="bg-slate-100 text-[10px] font-black uppercase text-slate-500">
                                {comment.author.email.substring(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-slate-900">
                                    {comment.author.email.split('@')[0]}
                                </span>
                                {comment.author.role === "AUTHORITY" && (
                                    <Badge className="bg-slate-900 text-white border-none text-[8px] px-2 py-0">VERIFIED OFFICIAL</Badge>
                                )}
                                <span className="text-[10px] font-bold text-slate-300 uppercase">
                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-transparent group-hover:border-slate-100 transition-all leading-relaxed">
                                {comment.content}
                            </p>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-sm font-bold text-slate-400 italic">No comments yet. Start the conversation!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
