import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useChatManagement = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (
    roomId: string,
    message: string,
    messageType:
      | "text"
      | "voice"
      | "reaction"
      | "image"
      | "system"
      | "emoji" = "text",
    voiceDuration?: number,
  ) => {
    setIsLoading(true);
    try {
      console.log("Sending", messageType, " message:", {
        roomId,
        message,
        messageType,
        voiceDuration,
      });

      // Get current user information
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare the request body
      const requestBody: any = {
        roomId,
        message,
        messageType,
        voiceDuration,
      };

      // If no authenticated user, try to get user info from localStorage
      if (!user) {
        const storedUserId = localStorage.getItem(`room_${roomId}_userid`);
        const storedUsername = localStorage.getItem(`room_${roomId}_username`);
        
        if (storedUserId && storedUsername) {
          requestBody.userId = storedUserId;
          requestBody.username = storedUsername;
        }
      }

      const { data: result, error } = await supabase.functions.invoke(
        "send-chat",
        {
          body: requestBody,
        },
      );

      if (error) {
        console.error("Send message error:", error);
        throw error;
      }

      console.log("Message sent successfully:", result);
      return true;
    } catch (error) {
      console.error("Send message failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
  };
};
