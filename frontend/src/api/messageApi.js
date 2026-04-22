import { supabase } from "../lib/supabase";

function ensureSuccess(result, fallbackMessage) {
  const { data, error } = result;
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
  return data;
}

async function fetchProfilesByIds(ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean).map(String))];
  if (!uniqueIds.length) return new Map();

  const result = await supabase.from("profiles").select("*").in("id", uniqueIds);
  const profiles = ensureSuccess(result, "Failed to load profiles");
  return new Map((profiles || []).map((profile) => [String(profile.id), profile]));
}

export async function getMessagesThread(myId, otherId) {
  const [outbound, inbound, profilesById] = await Promise.all([
    supabase.from("messages").select("*").eq("from_id", myId).eq("to_id", otherId).order("created_at", { ascending: true }),
    supabase.from("messages").select("*").eq("from_id", otherId).eq("to_id", myId).order("created_at", { ascending: true }),
    fetchProfilesByIds([myId, otherId]),
  ]);

  const outboundMessages = ensureSuccess(outbound, "Failed to load messages");
  const inboundMessages = ensureSuccess(inbound, "Failed to load messages");

  return [...outboundMessages, ...inboundMessages]
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
    .map((message) => ({
      ...message,
      from_user: profilesById.get(String(message.from_id)) || null,
      to_user: profilesById.get(String(message.to_id)) || null,
    }));
}

export async function sendMessage(payload) {
  const result = await supabase
    .from("messages")
    .insert({
      from_id: payload.fromId,
      to_id: payload.toId,
      text: payload.text,
    })
    .select("*")
    .single();
  return ensureSuccess(result, "Failed to send message");
}

export async function getRequests(userId) {
  const [sent, received] = await Promise.all([
    supabase.from("barter_requests").select("*").eq("from_user_id", userId).order("created_at", { ascending: false }),
    supabase.from("barter_requests").select("*").eq("to_user_id", userId).order("created_at", { ascending: false }),
  ]);

  const requests = [...ensureSuccess(sent, "Failed to load requests"), ...ensureSuccess(received, "Failed to load requests")];
  const profilesById = await fetchProfilesByIds(requests.flatMap((request) => [request.from_user_id, request.to_user_id]));

  return requests
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .map((request) => ({
      ...request,
      from_user: profilesById.get(String(request.from_user_id)) || null,
      to_user: profilesById.get(String(request.to_user_id)) || null,
    }));
}

export async function createRequest(payload) {
  const result = await supabase
    .from("barter_requests")
    .insert({
      from_user_id: payload.fromUserId,
      to_user_id: payload.toUserId,
      skill_offered: payload.skillOffered,
      skill_wanted: payload.skillWanted,
      message: payload.message || "",
      sessions_per_week: payload.sessionsPerWeek ?? 1,
      credits: payload.credits ?? 2,
    })
    .select("*")
    .single();
  return ensureSuccess(result, "Failed to create request");
}

export async function updateRequestStatus(id, status) {
  const result = await supabase.from("barter_requests").update({ status }).eq("id", id).select("*").single();
  return ensureSuccess(result, "Failed to update request status");
}

export async function getChatContacts(userId) {
  const [sent, received] = await Promise.all([
    supabase.from("messages").select("*").eq("from_id", userId).order("created_at", { ascending: false }),
    supabase.from("messages").select("*").eq("to_id", userId).order("created_at", { ascending: false }),
  ]);

  const messages = [...ensureSuccess(sent, "Failed to load chat contacts"), ...ensureSuccess(received, "Failed to load chat contacts")]
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

  const contactIds = [...new Set(messages.map((message) => (String(message.from_id) === String(userId) ? message.to_id : message.from_id)))];
  const profilesById = await fetchProfilesByIds(contactIds);

  const latestByContact = new Map();
  for (const message of messages) {
    const contactId = String(message.from_id) === String(userId) ? String(message.to_id) : String(message.from_id);
    if (!latestByContact.has(contactId)) {
      latestByContact.set(contactId, message);
    }
  }

  return contactIds
    .map((contactId) => {
      const profile = profilesById.get(String(contactId));
      if (!profile) return null;
      const lastMessage = latestByContact.get(String(contactId));
      return {
        ...profile,
        lastMessage: lastMessage?.text || "",
        lastActivity: lastMessage?.created_at || "",
      };
    })
    .filter(Boolean);
}
