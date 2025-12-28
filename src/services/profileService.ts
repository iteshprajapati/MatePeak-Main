import { supabase } from "@/integrations/supabase/client";

export interface StudentProfile {
  id: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  headline?: string;
  type: string;
}

export interface UpdateProfileData {
  full_name?: string;
  bio?: string;
  headline?: string;
  avatar_url?: string;
}

/**
 * Fetch student profile
 */
export async function fetchStudentProfile(
  userId: string
): Promise<StudentProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("❌ Error fetching profile:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchStudentProfile:", error);
    return null;
  }
}

/**
 * Update student profile
 */
export async function updateStudentProfile(
  userId: string,
  updates: UpdateProfileData
): Promise<{ success: boolean; data?: StudentProfile; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    if (user.id !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Validate inputs
    if (updates.full_name && updates.full_name.trim().length < 2) {
      return {
        success: false,
        error: "Name must be at least 2 characters",
      };
    }

    if (updates.bio && updates.bio.length > 500) {
      return {
        success: false,
        error: "Bio cannot exceed 500 characters",
      };
    }

    if (updates.headline && updates.headline.length > 100) {
      return {
        success: false,
        error: "Headline cannot exceed 100 characters",
      };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("❌ Error updating profile:", error);
      return {
        success: false,
        error: error.message || "Failed to update profile",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error in updateStudentProfile:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File size must be less than 5MB",
      };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Only JPEG, PNG, and WebP images are allowed",
      };
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error("❌ Error uploading avatar:", error);
      return {
        success: false,
        error: error.message || "Failed to upload image",
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    // Update profile with new avatar URL
    const updateResult = await updateStudentProfile(userId, {
      avatar_url: publicUrl,
    });

    if (!updateResult.success) {
      return {
        success: false,
        error: "Failed to update profile with new avatar",
      };
    }

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error: any) {
    console.error("Error in uploadAvatar:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}
