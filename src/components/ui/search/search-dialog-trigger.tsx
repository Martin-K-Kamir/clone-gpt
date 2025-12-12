import { DialogTrigger } from "@/components/ui/dialog";

export function SearchDialogTrigger({
    ...props
}: React.ComponentProps<typeof DialogTrigger>) {
    return <DialogTrigger data-slot="search-dialog-trigger" {...props} />;
}
