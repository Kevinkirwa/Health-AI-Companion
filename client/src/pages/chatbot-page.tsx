import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage, { Message } from "@/components/ui/chat-message";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, Mic, Paperclip, Smile, Brain, Heart, Sparkles, FileUp, MoreVertical, Stethoscope, User, RefreshCw, XCircle, PanelTop, BellRing, MessageSquare, HelpCircle, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [newFeatures, setNewFeatures] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  // Mock function for voice recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Voice Recording",
        description: "Listening to your voice input...",
        variant: "default",
      });
      // Simulate stopping after 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        toast({
          title: "Voice Recording Completed",
          description: "Processing your voice input...",
          variant: "default",
        });
      }, 3000);
    }
  };
  
  // Chat categories for organization
  const chatCategories = [
    { id: 'recent', name: 'Recent Chats', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'symptom', name: 'Symptom Analysis', icon: <Stethoscope className="h-4 w-4" /> },
    { id: 'mental', name: 'Mental Health', icon: <Brain className="h-4 w-4" /> },
    { id: 'emergency', name: 'Emergency Care', icon: <BellRing className="h-4 w-4" /> },
  ];
  
  // Mock previous conversations
  const previousConversations = [
    { id: '1', title: 'Headache Analysis', date: '2 hours ago', category: 'symptom' },
    { id: '2', title: 'Anxiety Management', date: 'Yesterday', category: 'mental' },
    { id: '3', title: 'Allergic Reaction', date: '3 days ago', category: 'emergency' },
  ];

  return (
    <section className="h-screen flex flex-col bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900/20">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Health AI Assistant</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-4">Get personalized health guidance and support</p>
      </div>
      <div className="flex-1 flex h-full w-full max-w-7xl mx-auto px-4">
        {/* Sidebar - Chat History */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div 
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-lg z-10"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-primary-500" />
                  Health AI Assistant
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setShowSidebar(false)}
                >
                  <XCircle className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                </Button>
              </div>
              
              <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button 
                  className={`flex-1 py-3 font-medium text-sm ${activeTab === 'chat' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('chat')}
                >
                  New Chat
                </button>
                <button 
                  className={`flex-1 py-3 font-medium text-sm ${activeTab === 'history' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('history')}
                >
                  History
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3">
                {activeTab === 'chat' ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start a new conversation</p>
                    <div className="space-y-2">
                      {chatCategories.map(category => (
                        <button 
                          key={category.id}
                          className="w-full p-3 flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          onClick={() => setShowSidebar(false)}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                            {category.icon}
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{category.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your previous conversations</p>
                    <div className="space-y-2">
                      {previousConversations.map(convo => (
                        <button 
                          key={convo.id}
                          className="w-full p-3 flex items-start space-x-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          onClick={() => setShowSidebar(false)}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                            {chatCategories.find(c => c.id === convo.category)?.icon || <MessageSquare className="h-4 w-4" />}
                          </div>
                          <div className="text-left">
                            <p className="text-gray-700 dark:text-gray-300 font-medium">{convo.title}</p>
                            <p className="text-xs text-gray-500">{convo.date}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <Button variant="outline" className="w-full" onClick={() => {}}>  
                  <User className="mr-2 h-4 w-4" />
                  <span>My Health Profile</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Left Side Panel - Health Resources */}
        <div className="hidden lg:block w-64 bg-white dark:bg-gray-900 rounded-lg shadow-md mr-4 overflow-hidden">
          <div className="p-4 bg-primary-100 dark:bg-primary-900/30 border-b border-primary-200 dark:border-primary-800">
            <h3 className="font-semibold text-primary-900 dark:text-primary-100">Health Resources</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Emergency Numbers</h4>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-3">
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">Emergency: 911</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">For immediate medical assistance</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Quick Links</h4>
              <div className="space-y-1">
                <a href="/hospitals" className="text-sm text-primary-600 dark:text-primary-400 hover:underline block">Find Nearby Hospitals</a>
                <a href="/appointments" className="text-sm text-primary-600 dark:text-primary-400 hover:underline block">My Appointments</a>
                <a href="/health-records" className="text-sm text-primary-600 dark:text-primary-400 hover:underline block">Health Records</a>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Health Tips</h4>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">Remember to stay hydrated and get at least 7-8 hours of sleep.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full relative">
          {/* Floating Action Button for New Features */}
          {newFeatures && (
            <div className="absolute top-4 right-4 z-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg px-4 py-2 flex items-center space-x-2"
                  onClick={() => setNewFeatures(false)}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>New AI Features</span>
                </Button>
              </motion.div>
            </div>
          )}
          
          {/* Chat Header */}
          <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setShowSidebar(true)}
                >
                  <PanelTop className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </Button>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-600 dark:to-primary-800 flex items-center justify-center shadow-md">
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                      Health AI Assistant
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Online</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Advanced Medical AI - Powered by latest models</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => {
                    toast({
                      title: "Chat Refreshed",
                      description: "Starting a new conversation",
                      variant: "default",
                    });
                    setMessages([{
                      id: nanoid(),
                      role: "assistant",
                      content: "Hello! I'm your AI Health Assistant. I can help you analyze symptoms, provide first-aid guidance, or offer mental health support. How can I assist you today?",
                      timestamp: new Date().toISOString()
                    }]);
                  }}
                >
                  <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Chat Messages */}
          <motion.div 
            className="flex-1 overflow-y-auto py-6 px-4 md:px-8 space-y-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-900 dark:to-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700 opacity-25"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin"></div>
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your conversation...</p>
                </div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ChatMessage message={message} />
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChatMessage 
                      message={{
                        id: "typing",
                        role: "assistant",
                        content: "",
                        timestamp: new Date().toISOString()
                      }}
                      isTyping={true}
                    />
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </AnimatePresence>
            )}
          </motion.div>
          
          {/* AI Suggestions Section */}
          <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested health topics:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt("I'm feeling unwell with fever and headache. Can you help identify my symptoms?")}
                className="rounded-full bg-primary-50 hover:bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900/20 dark:hover:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800 transition-all"
              >
                <Stethoscope className="h-3.5 w-3.5 mr-1" />
                Symptom Check
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt("What are some basic first aid tips for burns?")}
                className="rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 transition-all"
              >
                <Heart className="h-3.5 w-3.5 mr-1" />
                First Aid Tips
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt("I'm feeling anxious and overwhelmed. Can you suggest some coping strategies?")}
                className="rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800 transition-all"
              >
                <Brain className="h-3.5 w-3.5 mr-1" />
                Mental Health
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt("Can you help me understand my recent blood test results?")}
                className="rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 transition-all"
              >
                <FileUp className="h-3.5 w-3.5 mr-1" />
                Medical Tests
              </Button>
            </div>
          </div>
          
          {/* Chat Input */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full"
                onClick={() => {
                  toast({
                    title: "File Upload",
                    description: "File upload feature coming soon",
                    variant: "default",
                  });
                }}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              
              <div className="relative flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your health concerns..."
                  className="pr-10 border-gray-300 dark:border-gray-700 rounded-full pl-4 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                />
                {input.length > 0 && (
                  <button 
                    type="button" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setInput("")}
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <Button
                type="button"
                variant={isRecording ? "default" : "ghost"}
                size="icon"
                className={`${isRecording ? "bg-red-500 hover:bg-red-600 text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"} rounded-full`}
                onClick={toggleRecording}
              >
                <Mic className="h-5 w-5" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full"
                onClick={() => {
                  toast({
                    title: "Emoji Selector",
                    description: "Emoji selector coming soon",
                    variant: "default",
                  });
                }}
              >
                <Smile className="h-5 w-5" />
              </Button>
              
              <Button 
                type="submit" 
                size="icon" 
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full shadow-md hover:shadow-lg transition-all"
                disabled={!input.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
              Health AI Companion provides general information, not medical advice. Always consult a healthcare professional.
            </div>
          </div>
        </div>
        
        {/* Right Side Panel - Health Tips & Information */}
        <div className="hidden lg:block w-64 bg-white dark:bg-gray-900 rounded-lg shadow-md ml-4 overflow-hidden">
          <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 border-b border-indigo-200 dark:border-indigo-800">
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Health Guide</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Mental Health</h4>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-md p-3">
                <p className="text-sm text-purple-800 dark:text-purple-300">Feeling stressed? Try deep breathing exercises or meditation for 5 minutes.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Diet & Nutrition</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc pl-4 space-y-1">
                <li>Eat plenty of fruits and vegetables</li>
                <li>Stay hydrated with water</li>
                <li>Limit processed foods</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Upcoming Features</h4>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <span className="font-medium">Coming soon:</span> Medication reminders, symptom tracker, and personalized health insights.
                </p>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">App Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Users</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">50K+</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Doctors</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">1.2K+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatbotPage;
