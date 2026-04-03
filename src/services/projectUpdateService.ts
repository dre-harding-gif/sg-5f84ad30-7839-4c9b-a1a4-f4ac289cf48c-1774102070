import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ProjectUpdate = Database["public"]["Tables"]["project_updates"]["Row"];
type ProjectUpdateInsert = Database["public"]["Tables"]["project_updates"]["Insert"];
type ProjectPhoto = Database["public"]["Tables"]["project_photos"]["Row"];
type ProjectPhotoInsert = Database["public"]["Tables"]["project_photos"]["Insert"];

export const projectUpdateService = {
  // Get all updates for a specific job (customer view)
  async getJobUpdates(jobId: string) {
    const { data, error } = await supabase
      .from("project_updates")
      .select(`
        *,
        profiles!project_updates_created_by_fkey(
          id,
          full_name,
          role
        )
      `)
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });

    console.log("Get job updates:", { data, error });
    if (error) console.error("Error fetching job updates:", error);
    return { data: data || [], error };
  },

  // Create a new project update (staff only)
  async createUpdate(update: ProjectUpdateInsert) {
    const { data, error } = await supabase
      .from("project_updates")
      .insert(update)
      .select()
      .single();

    console.log("Create project update:", { data, error });
    if (error) console.error("Error creating project update:", error);
    return { data, error };
  },

  // Update an existing project update
  async updateUpdate(id: string, update: Partial<ProjectUpdateInsert>) {
    const { data, error } = await supabase
      .from("project_updates")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    console.log("Update project update:", { data, error });
    if (error) console.error("Error updating project update:", error);
    return { data, error };
  },

  // Delete a project update
  async deleteUpdate(id: string) {
    const { error } = await supabase
      .from("project_updates")
      .delete()
      .eq("id", id);

    console.log("Delete project update:", { error });
    if (error) console.error("Error deleting project update:", error);
    return { error };
  },

  // Get all photos for a specific job
  async getJobPhotos(jobId: string) {
    const { data, error } = await supabase
      .from("project_photos")
      .select(`
        *,
        profiles!project_photos_uploaded_by_fkey(
          id,
          full_name,
          role
        )
      `)
      .eq("job_id", jobId)
      .order("uploaded_at", { ascending: false });

    console.log("Get job photos:", { data, error });
    if (error) console.error("Error fetching job photos:", error);
    return { data: data || [], error };
  },

  // Upload a project photo
  async uploadPhoto(photo: ProjectPhotoInsert) {
    const { data, error } = await supabase
      .from("project_photos")
      .insert(photo)
      .select()
      .single();

    console.log("Upload project photo:", { data, error });
    if (error) console.error("Error uploading project photo:", error);
    return { data, error };
  },

  // Delete a project photo
  async deletePhoto(id: string) {
    const { error } = await supabase
      .from("project_photos")
      .delete()
      .eq("id", id);

    console.log("Delete project photo:", { error });
    if (error) console.error("Error deleting project photo:", error);
    return { error };
  },

  // Get photo categories for a job
  async getPhotoCategories(jobId: string) {
    const { data, error } = await supabase
      .from("project_photos")
      .select("category")
      .eq("job_id", jobId);

    if (error) {
      console.error("Error fetching photo categories:", error);
      return { data: [], error };
    }

    const categories = Array.from(new Set(data?.map(p => p.category).filter(Boolean)));
    return { data: categories, error: null };
  }
};