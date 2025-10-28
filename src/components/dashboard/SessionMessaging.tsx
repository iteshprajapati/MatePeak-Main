import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Send,
  Loader2,
  Search,
  Clock,
  FileText,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_type: "mentor" | "student";
  message_text: string;
  created_at: string;
}

interface Conversation {
  booking_id: string;
  student_name: string;
  student_email: string;
  session_date: string;
  session_time: string;
  status: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

interface MessagingProps {
  mentorProfile: any;
}

const SessionMessaging = ({ mentorProfile }: MessagingProps) => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageTemplate, setMessageTemplate] = useState("");

  const templates = [
    {
      label: "Session Confirmation",
      value: "Hi! I'm looking forward to our session. Please let me know if you have any questions beforehand.",
    },
    {
      label: "Pre-Session Reminder",
      value: "Just a reminder about our upcoming session. Please make sure you have a stable internet connection and any materials you'd like to discuss ready.",
    },
    {
      label: "Post-Session Follow-up",
      value: "Thank you for our session today! Feel free to reach out if you have any follow-up questions within the next 7 days.",
    },
    {
      label: "Reschedule Request",
      value: "I need to reschedule our session. Could you please suggest some alternative times that work for you?",
    },
  ];

  useEffect(() => {
    fetchConversations();
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel("session_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_messages",
          filter: `booking_id=eq.${selectedBooking}`,
        },
        (payload) => {
          if (selectedBooking) {
            setMessages((prev) => [...prev, payload.new as Message]);
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mentorProfile, selectedBooking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);

      // Fetch confirmed bookings only
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("expert_id", mentorProfile.id)
        .in("status", ["confirmed", "completed"])
        .order("scheduled_date", { ascending: false });

      if (error) throw error;

      // For each booking, fetch the last message
      const conversationsData = await Promise.all(
        (bookings || []).map(async (booking) => {
          const { data: lastMessage } = await supabase
            .from("session_messages")
            .select("*")
            .eq("booking_id", booking.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Count unread messages (messages from student that mentor hasn't read)
          const { count } = await supabase
            .from("session_messages")
            .select("*", { count: "exact", head: true })
            .eq("booking_id", booking.id)
            .eq("sender_type", "student")
            .eq("read_by_mentor", false);

          return {
            booking_id: booking.id,
            student_name: booking.student_name,
            student_email: booking.student_email,
            session_date: booking.scheduled_date,
            session_time: booking.scheduled_time,
            status: booking.status,
            last_message: lastMessage?.message_text,
            last_message_time: lastMessage?.created_at,
            unread_count: count || 0,
          };
        })
      );

      setConversations(conversationsData);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (bookingId: string) => {
    try {
      setLoadingMessages(true);

      const { data, error } = await supabase
        .from("session_messages")
        .select("*")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from("session_messages")
        .update({ read_by_mentor: true })
        .eq("booking_id", bookingId)
        .eq("sender_type", "student");

      setTimeout(scrollToBottom, 100);
      fetchConversations(); // Refresh unread counts
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedBooking) return;

    try {
      setSending(true);

      const { error } = await supabase.from("session_messages").insert([
        {
          booking_id: selectedBooking,
          sender_id: mentorProfile.id,
          sender_type: "mentor",
          message_text: messageText.trim(),
        },
      ]);

      if (error) throw error;

      setMessageText("");
      fetchMessages(selectedBooking);
      fetchConversations();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setMessageText(template);
    setMessageTemplate("");
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.student_name.toLowerCase().includes(query) ||
      conv.student_email.toLowerCase().includes(query)
    );
  });

  const selectedConversation = conversations.find(
    (c) => c.booking_id === selectedBooking
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Session Messages</h1>
        <p className="text-gray-600 mt-1">
          Communicate with students about their sessions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="border-gray-200 lg:col-span-1">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 border-b border-gray-200">
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.booking_id}
                    onClick={() => {
                      setSelectedBooking(conv.booking_id);
                      fetchMessages(conv.booking_id);
                    }}
                    className={`w-full p-4 text-left border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      selectedBooking === conv.booking_id ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {conv.student_name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(conv.session_date).toLocaleDateString()} at{" "}
                          {conv.session_time}
                        </p>
                      </div>
                      {conv.unread_count > 0 && (
                        <Badge className="bg-red-500 text-white border-0">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="text-sm text-gray-600 truncate">
                        {conv.last_message}
                      </p>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">
                    No conversations yet. They'll appear here after students book sessions.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="border-gray-200 lg:col-span-2">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.student_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Session on{" "}
                      {new Date(
                        selectedConversation.session_date
                      ).toLocaleDateString()}{" "}
                      at {selectedConversation.session_time}
                    </p>
                  </div>
                  <Badge
                    className={
                      selectedConversation.status === "confirmed"
                        ? "bg-green-100 text-green-800 border-0"
                        : "bg-blue-100 text-blue-800 border-0"
                    }
                  >
                    {selectedConversation.status}
                  </Badge>
                </div>
              </div>

              {/* Messages */}
              <CardContent className="p-4">
                <div className="h-[400px] overflow-y-auto mb-4 space-y-4">
                  {loadingMessages ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-3/4" />
                    ))
                  ) : messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_type === "mentor"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_type === "mentor"
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.message_text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender_type === "mentor"
                                ? "text-gray-300"
                                : "text-gray-500"
                            }`}
                          >
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Templates */}
                <div className="mb-4">
                  <Select
                    value={messageTemplate}
                    onValueChange={handleTemplateSelect}
                  >
                    <SelectTrigger className="w-full border-gray-300">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Use a template...</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.label} value={template.value}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sending}
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-900">
                Select a conversation
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Choose a student from the list to start messaging
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SessionMessaging;
