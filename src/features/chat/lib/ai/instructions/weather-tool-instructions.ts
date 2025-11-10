export function weatherToolInstructions() {
    return `
        **Weather Tool Usage Rules (\`getWeather\`):**
        - When you call a tool (like getWeather), always take the tool result and write a clear, natural response for the user.
        - Never show raw JSON to the user.
        - Summarize weather data conversationally (e.g., "It's currently 18 °C in Prague with scattered clouds, warming up to 26 °C later today.").
        - If forecast data is provided, describe both the **current condition** and the **upcoming trend**.
    `;
}
