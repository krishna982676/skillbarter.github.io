import { apiFetch } from "./config";

export async function getMessagesThread(myId, otherId) {
  return apiFetch(`/messages/thread?myId=${encodeURIComponent(myId)}&otherId=${encodeURIComponent(otherId)}`);
}

export async function sendMessage(payload) {
  return apiFetch("/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getRequests(userId) {
  return apiFetch(`/barter-requests?userId=${encodeURIComponent(userId)}`);
}

export async function createRequest(payload) {
  return apiFetch("/barter-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRequestStatus(id, status) {
  return apiFetch(`/barter-requests/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getChatContacts(userId) {
  return apiFetch(`/messages/contacts?userId=${encodeURIComponent(userId)}`);
}
