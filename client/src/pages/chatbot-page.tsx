import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage, { Message } from "@/components/ui/chat-message";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
        const res = await fetch("/api/chat/history");
        if (!res.ok) {
          throw new Error("Failed to load chat history");
        }
        return res.json();
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
      const res = await apiRequest("POST", "/api/chat/message", { message });
      return await res.json();
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
    <section className="py-8 md:py-12 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            AI Health Assistant Chatbot
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-primary-600 dark:bg-primary-700 text-white flex items-center">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Health AI Assistant</h3>
                <p className="text-xs text-primary-100">Powered by Gemini AI</p>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div id="chat-messages" className="p-4 h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900">
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
            
            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your symptoms or health concern..."
                    className="flex-grow px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button 
                    type="submit"
                    disabled={isTyping || !input.trim()}
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt("What are common symptoms of a migraine headache?")}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Headache symptoms
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt("What should I do for fever and chills?")}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Fever and chills
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt("How do I properly clean and bandage a cut?")}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    First aid for cuts
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt("What are some effective techniques to manage anxiety?")}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Anxiety management
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <i className="fas fa-exclamation-circle mr-1"></i> This AI provides general health information and is not a substitute for professional medical advice.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <i className="fas fa-lock mr-1"></i> Your conversations are private and secure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatbotPage;
