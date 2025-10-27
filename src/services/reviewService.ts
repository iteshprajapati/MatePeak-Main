import { supabase } from "@/integrations/supabase/client";

export interface SubmitReviewData {
  expert_id: string;
  booking_id: string;
  rating: number;  // 1-5
  comment: string;
}

/**
 * Submit feedback/review for a mentor after a completed session
 */
export async function submitReview(data: SubmitReviewData) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'You must be logged in', data: null };
  }
  
  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    return { success: false, error: 'Rating must be between 1 and 5', data: null };
  }
  
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      ...data,
      user_id: user.id
    })
    .select(`
      *,
      user:profiles(full_name, avatar_url)
    `)
    .single();
  
  if (error) {
    console.error('Error submitting review:', error);
    
    // Handle duplicate review error
    if (error.code === '23505') {
      return { 
        success: false, 
        error: 'You have already submitted a review for this session',
        data: null 
      };
    }
    
    return { success: false, error: error.message, data: null };
  }
  
  return { success: true, message: 'Review submitted successfully', data: review };
}

/**
 * Get all reviews for a mentor with pagination
 */
export async function getMentorReviews(mentorId: string, page = 1, limit = 10) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(full_name, avatar_url)
    `, { count: 'exact' })
    .eq('expert_id', mentorId)
    .order('created_at', { ascending: false })
    .range(from, to);
  
  if (error) {
    console.error('Error fetching reviews:', error);
    return { 
      success: false, 
      error: error.message, 
      data: [],
      pagination: null
    };
  }
  
  return { 
    success: true, 
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
}

/**
 * Update a review (user can only update their own reviews)
 */
export async function updateReview(reviewId: string, data: {
  rating?: number;
  comment?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'You must be logged in', data: null };
  }
  
  // Validate rating if provided
  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    return { success: false, error: 'Rating must be between 1 and 5', data: null };
  }
  
  const { data: review, error } = await supabase
    .from('reviews')
    .update(data)
    .eq('id', reviewId)
    .eq('user_id', user.id) // Ensure user can only update their own review
    .select(`
      *,
      user:profiles(full_name, avatar_url)
    `)
    .single();
  
  if (error) {
    console.error('Error updating review:', error);
    return { success: false, error: error.message, data: null };
  }
  
  return { success: true, message: 'Review updated successfully', data: review };
}

/**
 * Delete a review (user can only delete their own reviews)
 */
export async function deleteReview(reviewId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'You must be logged in' };
  }
  
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id); // Ensure user can only delete their own review
  
  if (error) {
    console.error('Error deleting review:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, message: 'Review deleted successfully' };
}

/**
 * Get average rating for a mentor
 */
export async function getMentorAverageRating(mentorId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('expert_id', mentorId);
  
  if (error) {
    console.error('Error fetching ratings:', error);
    return { success: false, error: error.message, averageRating: 0, totalReviews: 0 };
  }
  
  const totalReviews = data.length;
  const averageRating = totalReviews > 0
    ? data.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : 0;
  
  return { 
    success: true, 
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalReviews 
  };
}
