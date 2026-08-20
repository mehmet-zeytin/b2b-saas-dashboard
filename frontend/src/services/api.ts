const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "VITE_API_URL is niet ingesteld in het bestand frontend/.env."
  );
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `API-fout: ${response.status} ${response.statusText}`;

    try {
      const errorData = await response.json();

      message =
        errorData.message ||
        errorData.error ||
        message;
    } catch {
      // Gebruik het standaard foutbericht als het antwoord geen JSON bevat.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}