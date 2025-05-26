import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage, { Message } from "@/components/ui/chat-message";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, Mic, Paperclip, Smile } from "lucide-react";

const ChatbotPage = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load previous chat messages
  const { data: chatHistory, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/chat/history"],
    queryFn: async () => {
      try {
        const res = await apiRequest<Message[]>("/api/chat/history", {
          method: "GET"
        });
        return res;
      } catch (error) {
        console.error("Error loading chat history:", error);
        return [];
      }
    }
  });

  // Set initial system message when component mounts
  useEffect(() => {
    if (!isLoading && chatHistory) {
      if (chatHistory.length === 0) {
        setMessages([
          {
            id: nanoid(),
            role: "assistant",
            content: "Hello! I'm your AI Health Assistant. I can help you analyze symptoms, provide first-aid guidance, or offer mental health support. How can I assist you today?",
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        setMessages(chatHistory);
      }
    }
  }, [chatHistory, isLoading]);

  // Automatically scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Send message to API
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest<{ message: string }>("/chat/message", {
        method: "POST",
        body: JSON.stringify({ message })
      });
    },
    onSuccess: (response) => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: nanoid(),
        role: "assistant",
        content: response.message,
        timestamp: new Date().toISOString()
      }]);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
      console.error("Error in chat:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Send to backend
    sendMessageMutation.mutate(input);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <section className="h-screen flex flex-col bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Chat Header */}
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Health AI Assistant</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
            </div>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {isTyping && (
                <ChatMessage 
                  message={{
                    id: "typing",
                    role: "assistant",
                    content: "",
                    timestamp: new Date().toISOString()
                  }}
                  isTyping={true}
                />
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickPrompt("I'm feeling unwell. Can you help me identify my symptoms?")}
              className="whitespace-nowrap"
            >
              Symptom Check
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickPrompt("What are some basic first aid tips?")}
              className="whitespace-nowrap"
            >
              First Aid Tips
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickPrompt("I'm feeling anxious. Can you help?")}
              className="whitespace-nowrap"
            >
              Mental Health
            </Button>
          </div>
        </div>
        
        {/* Chat Input */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Smile className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button 
              type="submit"
              disabled={isTyping || !input.trim()}
              size="icon"
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ChatbotPage;
