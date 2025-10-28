import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "booking" | "message" | "review";
  title: string;
  description: string;
  created_at: string;
  read: boolean;
}

interface NotificationBellProps {
  mentorId: string;
}

export function NotificationBell({ mentorId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to real-time updates for bookings
    const bookingsChannel = supabase
      .channel('bookings_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `expert_id=eq.${mentorId}`,
        },
        (payload) => {
          addNotification({
            id: payload.new.id,
            type: 'booking',
            title: 'New Booking Request',
            description: `You have a new ${payload.new.session_type} booking request`,
            created_at: payload.new.created_at,
            read: false,
          });
        }
      )
      .subscribe();

    return () => {
      bookingsChannel.unsubscribe();
    };
  }, [mentorId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Fetch recent bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("expert_id", mentorId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      const notifs: Notification[] = [];

      if (bookings) {
        bookings.forEach((booking) => {
          notifs.push({
            id: booking.id,
            type: "booking",
            title: "New Booking Request",
            description: `${booking.session_type} session`,
            created_at: booking.created_at,
            read: false,
          });
        });
      }

      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 10)); // Keep last 10
    setUnreadCount((prev) => prev + 1);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return "📅";
      case "message":
        return "💬";
      case "review":
        return "⭐";
      default:
        return "🔔";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100 rounded-full"
        >
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs border-2 border-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Mark all as read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading notifications...
          </div>
        ) : notifications.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className={`px-4 py-3 cursor-pointer ${
                  !notif.read ? "bg-blue-50" : ""
                }`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="flex gap-3 w-full">
                  <div className="text-2xl">{getNotificationIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notif.title}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {notif.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getTimeAgo(notif.created_at)}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">No notifications</p>
            <p className="text-xs text-gray-500 mt-1">
              You're all caught up!
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
