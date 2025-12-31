export async function getCityFromIP(): Promise<string | null> {
    const response = await fetch("https://ipapi.co/json/");

    if (!response.ok) {
        throw new Error("Failed to get city from IP");
    }

    const data = await response.json();
    return data.city || null;
}
