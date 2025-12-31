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
