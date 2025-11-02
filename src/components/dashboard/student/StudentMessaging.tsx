import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Search, MoreVertical } from 'lucide-react';

interface StudentMessagingProps {
  studentProfile: any;
}

export default function StudentMessaging({ studentProfile }: StudentMessagingProps) {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      mentorName: 'Dr. Sarah Johnson',
      mentorAvatar: null,
      lastMessage: 'Looking forward to our session tomorrow!',
      timestamp: '2 hours ago',
      unread: 2,
      online: true
    },
    {
      id: 2,
      mentorName: 'Prof. Michael Chen',
      mentorAvatar: null,
      lastMessage: 'I\'ve shared the resources we discussed.',
      timestamp: '1 day ago',
      unread: 0,
      online: false
    },
    {
      id: 3,
      mentorName: 'Emma Williams',
      mentorAvatar: null,
      lastMessage: 'Great progress on your project!',
      timestamp: '3 days ago',
      unread: 0,
      online: true
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const messages = [
    {
      id: 1,
      sender: 'mentor',
      text: 'Hi! Thanks for booking the session. I\'ve reviewed your background.',
      timestamp: '10:30 AM',
      avatar: null
    },
    {
      id: 2,
      sender: 'student',
      text: 'Thank you! I\'m excited to learn more about data structures.',
      timestamp: '10:32 AM',
      avatar: null
    },
    {
      id: 3,
      sender: 'mentor',
      text: 'Perfect! I\'ve prepared some materials. We\'ll cover trees and graphs tomorrow.',
      timestamp: '10:35 AM',
      avatar: null
    },
    {
      id: 4,
      sender: 'student',
      text: 'That sounds great! Should I prepare anything beforehand?',
      timestamp: '10:37 AM',
      avatar: null
    },
    {
      id: 5,
      sender: 'mentor',
      text: 'Just review basic recursion concepts. I\'ll share a link to some prep materials.',
      timestamp: '10:40 AM',
      avatar: null
    },
    {
      id: 6,
      sender: 'mentor',
      text: 'Looking forward to our session tomorrow!',
      timestamp: '2 hours ago',
      avatar: null
    }
  ];

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    // TODO: Implement message sending with Supabase
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.mentorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-12rem)] grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Conversations List */}
      <Card className="md:col-span-1 flex flex-col">
        <CardContent className="p-4 flex flex-col h-full">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id
                      ? 'bg-blue-50 border-2 border-blue-300'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                        {conv.mentorAvatar ? (
                          <img
                            src={conv.mentorAvatar}
                            alt={conv.mentorName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white font-bold">
                            {conv.mentorName.charAt(0)}
                          </div>
                        )}
                      </div>
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {conv.mentorName}
                        </h4>
                        <span className="text-xs text-gray-500 ml-2">
                          {conv.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {conv.unread > 0 && (
                      <div className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0">
                        {conv.unread}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-2 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
                      {selectedConversation.mentorAvatar ? (
                        <img
                          src={selectedConversation.mentorAvatar}
                          alt={selectedConversation.mentorName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white font-bold">
                          {selectedConversation.mentorName.charAt(0)}
                        </div>
                      )}
                    </div>
                    {selectedConversation.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.mentorName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.online ? 'Active now' : 'Offline'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'student' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        message.sender === 'student' ? 'order-2' : 'order-1'
                      }`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.sender === 'student'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <p
                        className={`text-xs text-gray-500 mt-1 ${
                          message.sender === 'student' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="flex-shrink-0">
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send • Messages are secure and encrypted
              </p>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>Select a conversation to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
