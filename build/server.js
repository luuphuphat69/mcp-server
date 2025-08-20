import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { makeCurrentWeatherRequest } from "./api_request/openweather.js";
const OPENWEATHER_API_BASE = "https://api.openweathermap.org";
// Create server instance
const server = new McpServer({
    name: "weather",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
// Register weather tool
server.tool("getWeather", {
    city: z.string().describe("The city name (e.g., London, New York)"),
    apiKey: z.string().describe("The OpenWeather API key (provided by the client)"),
}, async ({ city, apiKey }) => {
    const url = `${OPENWEATHER_API_BASE}/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const data = await makeCurrentWeatherRequest(url);
    if (!data) {
        return {
            content: [
                { type: "text", text: `❌ Failed to fetch weather for ${city}` },
            ],
            isError: true,
        };
    }
    const description = data.weather[0].description;
    const temperature = data.main.temp;
    return {
        content: [
            {
                type: "text",
                text: `🌤️ Weather in ${city}: ${description}, ${temperature}°C`,
            },
        ],
    };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Weather MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
