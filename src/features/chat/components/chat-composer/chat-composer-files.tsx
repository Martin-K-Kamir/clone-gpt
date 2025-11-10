"use client";

import { AnimatePresence, motion } from "framer-motion";

import { FilesPreview } from "@/components/ui/files-preview";

import { useChatFilesContext } from "@/features/chat/providers/chat-provider";

import { cn } from "@/lib/utils";

import { useElementDimensions } from "@/hooks";

export function ChatComposerFiles({ className }: { className?: string }) {
    const { selectedFiles, isUploadingFiles, handleFileRemove } =
        useChatFilesContext();
    const { updateDimensions, removeDimensions } = useElementDimensions({
        name: "chat-composer-files",
        updateOnResize: true,
        heightCorrection: -28, // this correction is because of the pb-10 in the files preview
    });

    const hasPreviewFiles = selectedFiles && selectedFiles.length > 0;

    return (
        <>
            <AnimatePresence>
                {hasPreviewFiles && (
                    <motion.div
                        ref={updateDimensions}
                        initial={{ y: "0%" }}
                        animate={{ y: "calc(-100% + 28px)" }}
                        exit={{ y: "0%" }}
                        transition={{
                            duration: 0.3,
                            ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="absolute top-0 w-full"
                    >
                        <FilesPreview
                            className={cn(
                                "rounded-t-3xl border border-zinc-700 bg-zinc-900 p-3 pb-10",
                                className,
                            )}
                            previewFiles={selectedFiles}
                            isLoading={isUploadingFiles}
                            onFileRemove={handleFileRemove}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            {/* This is a hack to remove the dimensions even before the animation is finished */}
            {!hasPreviewFiles && (
                <div
                    ref={el => void (!el && removeDimensions())}
                    className="sr-only"
                />
            )}
        </>
    );
}
