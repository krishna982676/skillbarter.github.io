import { apiFetch } from "./config";

export async function getProfiles() {
  return apiFetch("/profiles");
}

export async function getProfileById(id) {
  return apiFetch(`/profiles/${encodeURIComponent(id)}`);
}

export async function updateProfile(id, payload) {
  const body = {
    fullName: payload.full_name,
    email: payload.email,
    location: payload.location,
    skillsOffered: payload.skills_offered,
    skillsWanted: payload.skills_wanted,
  };
  return apiFetch(`/profiles/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function getSkills() {
  return apiFetch("/skills");
}

export async function createSkill(payload) {
  return apiFetch("/skills", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}