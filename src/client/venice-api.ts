const API_KEY = process.env.VENICE_API_KEY;
const BASE_URL = "https://api.venice.ai/api/v1";

if (!API_KEY) {
  console.error("Error: VENICE_API_KEY environment variable is required");
  process.exit(1);
}

export async function veniceAPI(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  return fetch(url, { ...options, headers });
}

export function getAPIKey(): string {
  return API_KEY!;
}

export function getBaseURL(): string {
  return BASE_URL;
}
