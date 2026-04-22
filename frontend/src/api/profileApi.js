import { supabase } from "../lib/supabase";

function ensureSuccess(result, fallbackMessage) {
  const { data, error } = result;
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
  return data;
}

export async function getProfiles() {
  const result = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  return ensureSuccess(result, "Failed to load profiles");
}

export async function getProfileById(id) {
  const result = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  return ensureSuccess(result, "Failed to load profile");
}

export async function updateProfile(id, payload) {
  const updates = {};
  if (payload.full_name !== undefined) updates.full_name = payload.full_name;
  if (payload.email !== undefined) updates.email = payload.email;
  if (payload.bio !== undefined) updates.bio = payload.bio;
  if (payload.location !== undefined) updates.location = payload.location;
  if (payload.skills_offered !== undefined) updates.skills_offered = payload.skills_offered;
  if (payload.skills_wanted !== undefined) updates.skills_wanted = payload.skills_wanted;
  if (payload.availability !== undefined) updates.availability = payload.availability;

  const result = await supabase.from("profiles").update(updates).eq("id", id).select("*").single();
  return ensureSuccess(result, "Failed to update profile");
}

export async function getSkills() {
  const result = await supabase.from("skills").select("*").eq("is_active", true).order("created_at", { ascending: false });
  return ensureSuccess(result, "Failed to load skills");
}

export async function createSkill(payload) {
  const result = await supabase
    .from("skills")
    .insert({
      user_id: payload.userId,
      title: payload.title,
      category: payload.category,
      level: payload.level,
      description: payload.description || "",
      credits_per_hour: payload.credits_per_hour ?? 1,
      availability: payload.availability || "Flexible",
      tags: payload.tags || [],
      verified: payload.verified ?? false,
      is_active: payload.is_active ?? true,
    })
    .select("*")
    .single();
  return ensureSuccess(result, "Failed to create skill");
}