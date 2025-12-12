import Image from "next/image";

import { WEATHER_ICONS_MAP } from "@/lib/constants";
import type { WeatherIconCode } from "@/lib/types";

type WeatherImageProps = {
    iconCode: WeatherIconCode;
    alt: string;
    src?: string;
} & Omit<React.ComponentProps<typeof Image>, "src">;

export function WeatherImage({
    iconCode,
    alt,
    src = `/icons/weather/${WEATHER_ICONS_MAP[iconCode]}.png`,
    ...props
}: WeatherImageProps) {
    return (
        <Image
            src={src}
            width={22}
            alt={alt}
            height={22}
            unoptimized
            {...props}
        />
    );
}
