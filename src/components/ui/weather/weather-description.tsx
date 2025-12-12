import type { UIWeatherItem } from "@/lib/types";
import { cn, toTitleCase } from "@/lib/utils";

type WeatherDescriptionProps = {
    item: UIWeatherItem;
} & Omit<React.ComponentProps<"div">, "children">;

export function WeatherDescription({
    item,
    className,
    ...props
}: WeatherDescriptionProps) {
    const description = toTitleCase(item.description);

    return (
        <div className={cn("ml-auto text-gray-300", className)} {...props}>
            {description}
        </div>
    );
}
