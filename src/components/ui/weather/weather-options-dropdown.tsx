"use client";

import { IconDots } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TextSwitch } from "@/components/ui/text-switch";
import { TIME_FORMAT_LIST } from "@/lib/constants";
import type { TemperatureSystem, TimeFormat } from "@/lib/types";
import { cn } from "@/lib/utils";

type WeatherOptionsDropdownProps = {
    classNameTrigger?: string;
    contentProps?: Omit<
        React.ComponentProps<typeof DropdownMenuContent>,
        "children"
    >;
    temperatureSystem: TemperatureSystem;
    timeFormat: TimeFormat;
    showTemperature?: boolean;
    showTimeFormat?: boolean;
    onChangeTemperatureSystem: (unit: TemperatureSystem) => void;
    onChangeTimeFormat: (format: TimeFormat) => void;
} & Omit<React.ComponentProps<typeof DropdownMenu>, "children">;

export function WeatherOptionsDropdown({
    classNameTrigger,
    contentProps,
    temperatureSystem,
    timeFormat,
    showTemperature = true,
    showTimeFormat = true,
    onChangeTemperatureSystem,
    onChangeTimeFormat,
    ...props
}: WeatherOptionsDropdownProps) {
    return (
        <DropdownMenu {...props}>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    className={classNameTrigger}
                    {...props}
                >
                    <IconDots className="text-zinc-200" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={cn("min-w-52", contentProps?.className)}
                onCloseAutoFocus={e => e.preventDefault()}
                {...contentProps}
            >
                {showTemperature && (
                    <DropdownMenuItem
                        onClick={() =>
                            onChangeTemperatureSystem(temperatureSystem)
                        }
                    >
                        Temperature Unit
                        <TextSwitch
                            value={temperatureSystem}
                            values={["°C", "°F"]}
                            className="ml-auto"
                        />
                    </DropdownMenuItem>
                )}
                {showTimeFormat && (
                    <DropdownMenuItem
                        onClick={() => onChangeTimeFormat(timeFormat)}
                    >
                        Time Format
                        <TextSwitch
                            value={timeFormat}
                            values={TIME_FORMAT_LIST}
                            className="ml-auto"
                        />
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
