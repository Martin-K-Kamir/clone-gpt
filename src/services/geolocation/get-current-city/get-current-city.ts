import { getGeolocation } from "@/lib/utils";

import { getCityFromCoords } from "@/services/geolocation/get-city-from-coords";
import { getCityFromIP } from "@/services/geolocation/get-city-from-ip";

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
