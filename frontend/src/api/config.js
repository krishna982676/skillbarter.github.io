export const API = import.meta.env.VITE_API_BASE_URL || "https://slillbarter-backend.onrender.com/api";

export async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`API ${path} failed with ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`API request error for ${path}:`, error);
    throw error;
  }
}
