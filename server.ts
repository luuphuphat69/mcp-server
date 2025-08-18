import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const NWS_API_BASE = "https://api.openweathermap.org";
const USER_AGENT = "weather-app/1.0";

// Create server instance
const server = new McpServer({
  name: "weather",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register weather tools
server.tool(
  "get_alerts",
  "Get weather alerts for a state",
  {
    state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
  },
  async ({ state }) => {
    const stateCode = state.toUpperCase();
    const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
    const alertsData = await makeNWSRequest<AlertsResponse>(alertsUrl);

    if (!alertsData) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve alerts data",
          },
        ],
      };
    }

    const features = alertsData.features || [];
    if (features.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No active alerts for ${stateCode}`,
          },
        ],
      };
    }

    const formattedAlerts = features.map(formatAlert);
    const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;

    return {
      content: [
        {
          type: "text",
          text: alertsText,
        },
      ],
    };
  },
);

server.tool(
  "getWeather",
  {
    description: "Get current weather for a given city",
    inputSchema: z.object({
      city: z.string().describe("The city name (e.g., London, New York)"),
    }),
    outputSchema: z.object({
      description: z.string(),
      temperature: z.number(),
    }),
  },
  async ({ city }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `${NWS_API_BASE}/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;

    type WeatherResponse = {
      weather: { description: string }[];
      main: { temp: number };
    };

    const data = await makeCurrentWeatherRequest<WeatherResponse>(url);
    if (!data) {
      throw new Error("Failed to fetch weather data");
    }

    return {
      description: data.weather[0].description,
      temperature: data.main.temp,
    };
  }
);