type Coords = {
    latitude: number;
    longitude: number;
};

type Options = {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
};

const DEFAULT_OPTIONS: Options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000,
};

export function getGeolocation(options?: Options): Promise<Coords> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            error => {
                reject(error);
            },
            {
                ...DEFAULT_OPTIONS,
                ...options,
            },
        );
    });
}
