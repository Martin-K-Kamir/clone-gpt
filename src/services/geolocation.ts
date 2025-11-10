import { getGeolocation } from "@/lib/utils";

export async function getCityFromCoords({
    lat,
    lng,
}: {
    lat: number;
    lng: number;
}): Promise<string | null> {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
    );

    if (!response.ok) {
        throw new Error("Failed to reverse geocode position");
    }

    const data = await response.json();

    return (
        data.address.city || data.address.town || data.address.village || null
    );
}

export async function getCityFromIP(): Promise<string | null> {
    const response = await fetch("https://ipapi.co/json/");

    if (!response.ok) {
        throw new Error("Failed to get city from IP");
    }

    const data = await response.json();
    return data.city || null;
}

export async function getCurrentCity(): Promise<string | null> {
    const cityFromIP = await getCityFromIP();

    if (cityFromIP) {
        return cityFromIP;
    }

    const coords = await getGeolocation();
    const city = await getCityFromCoords({
        lat: coords.latitude,
        lng: coords.longitude,
    });

    return city;
}
