
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MentorProfile } from '@/components/MentorCard';
import { toast } from 'sonner';

export function useAISearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchMentors = async (query: string): Promise<MentorProfile[]> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Sending search query to AI:", query);
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { query }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }
      
      if (!data || !data.mentors) {
        console.error("Unexpected response format:", data);
        throw new Error("Received invalid data format from search");
      }
      
      console.log("Search results:", data.mentors);
      return data.mentors;
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search mentors. Please try again.');
      toast.error('Search failed. Please try again or use standard filters.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { searchMentors, isLoading, error };
}
