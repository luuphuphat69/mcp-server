export async function makeCurrentWeatherRequest<T>(url: string): Promise<T | null> {
  const headers = {
    "User-Agent": "weather-app/1.0",
    Accept: "*/*",
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}
