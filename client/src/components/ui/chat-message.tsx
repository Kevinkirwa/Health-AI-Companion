import { cn } from "@/lib/utils";

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isTyping = false,
}) => {
  const isUser = message.role === "user";
  
  // Avatar component based on role
  const Avatar = () => {
    if (isUser) {
      return null; // User doesn't have an avatar on their messages
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-2 flex-shrink-0">
        <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
        </svg>
      </div>
    );
  };

  // Content container with conditional styling
  const ContentContainer = ({ children }: { children: React.ReactNode }) => {
    if (isUser) {
      return (
        <div className="bg-primary-500 rounded-lg py-2 px-4 text-white max-w-[80%]">
          {children}
        </div>
      );
    }
    
    if (isTyping) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg py-2 px-4 shadow-sm flex items-center">
          {children}
        </div>
      );
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg py-2 px-4 shadow-sm max-w-[80%]">
        {children}
      </div>
    );
  };

  // Helper function to parse message content with bullet points
  const parseContent = (content: string) => {
    // Check if content contains bullet points
    if (content.includes("\n- ")) {
      const parts = content.split("\n- ");
      const mainText = parts[0];
      const bulletPoints = parts.slice(1);
      
      return (
        <>
          <p className="text-gray-800 dark:text-gray-200">{mainText}</p>
          {bulletPoints.length > 0 && (
            <ul className="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300 space-y-1">
              {bulletPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          )}
        </>
      );
    }
    
    return <p className="text-gray-800 dark:text-gray-200">{content}</p>;
  };

  return (
    <div className={cn("flex mb-4", isUser && "justify-end")}>
      <Avatar />
      <ContentContainer>
        {isTyping ? (
          <span className="typing-indicator text-gray-600 dark:text-gray-400"></span>
        ) : (
          parseContent(message.content)
        )}
      </ContentContainer>
    </div>
  );
};

export default ChatMessage;
