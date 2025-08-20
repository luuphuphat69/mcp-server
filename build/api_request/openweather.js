export async function makeCurrentWeatherRequest(url) {
    const headers = {
        "User-Agent": "weather-app/1.0",
        Accept: "*/*",
    };
    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json());
    }
    catch (error) {
        console.error("Error making NWS request:", error);
        return null;
    }
}
