"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Send, User, ChevronLeft, ShoppingBag, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatWindowProps {
  conversationId: string;
  currentUser: any;
  convoData: any;
}

export default function ChatWindow({ conversationId, currentUser, convoData }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const otherPerson = convoData.buyer.id === currentUser.id ? convoData.seller : convoData.buyer;
  const listing = convoData.listing;

  useEffect(() => {
    let isMounted = true;

    // 1. Initial fetch
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (data && isMounted) setMessages(data);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Fetch messages error:", err.message);
        }
      }
    };

    fetchMessages();

    // 2. Real-time subscription
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        if (isMounted) {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden text-left">
      {/* Chat Header */}
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <Link href="/messages" className="p-2 hover:bg-slate-50 rounded-xl lg:hidden text-slate-400">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand overflow-hidden border-2 border-white shadow-sm">
            {otherPerson.avatar_url ? (
              <img src={otherPerson.avatar_url} alt={otherPerson.full_name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="font-black text-black leading-none mb-1">{otherPerson.full_name || 'User'}</h2>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>

        {/* Listing Context Mini Card */}
        {listing && (
          <Link 
            href={`/listings/${listing.id}`}
            className="hidden md:flex items-center space-x-3 bg-slate-50 p-2 pr-4 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-100/50"
          >
            <div className="w-10 h-10 bg-white rounded-xl overflow-hidden shadow-sm">
              {listing.images?.[0] ? (
                <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  <ShoppingBag className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
            <div className="max-w-[150px]">
              <p className="text-[10px] font-black text-brand uppercase tracking-wider truncate">{listing.category}</p>
              <h3 className="text-xs font-bold text-black truncate leading-none">{listing.title}</h3>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-300" />
          </Link>
        )}
      </div>

      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="grow overflow-y-auto p-8 space-y-6 bg-slate-50/30 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-brand/20 shadow-sm border border-slate-50">
              <Send className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-black">Start the conversation</p>
              <p className="text-sm text-slate-400 font-medium">Say hello to {otherPerson.full_name?.split(' ')[0]}!</p>
            </div>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser.id;
          return (
            <div 
              key={msg.id} 
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] rounded-[28px] px-6 py-4 shadow-sm ${
                isMe 
                  ? 'bg-brand text-white rounded-br-lg' 
                  : 'bg-white text-slate-700 rounded-bl-lg border border-slate-100'
              }`}>
                <p className="text-sm md:text-base font-medium leading-relaxed">{msg.content}</p>
                <span className={`text-[10px] font-black uppercase tracking-wider mt-2 block ${isMe ? 'text-white/60' : 'text-slate-300'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Input */}
      <div className="p-6 bg-white border-t border-slate-50">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full pl-6 pr-16 py-4 bg-slate-50 rounded-[20px] border-none focus:ring-2 focus:ring-brand text-black font-medium"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="absolute right-2 p-3 bg-brand text-white rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/10 disabled:opacity-50 disabled:shadow-none"
          >
            <Send className={`w-5 h-5 ${sending ? 'animate-pulse' : ''}`} />
          </button>
        </form>
      </div>
    </div>
  );
}
