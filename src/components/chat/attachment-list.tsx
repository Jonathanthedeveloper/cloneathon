"use client";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
    X,
    FileText,
    File,
    ImageIcon,
    Video,
    Music,
    Archive,
    Code,
    Loader2,
    AlertCircle
} from "lucide-react";
import Image from "next/image";
import { useUploadFile } from "./hooks/useUploadFile";

export function AttachmentList() {
    const { attachments, removeFile } = useUploadFile(); const getFileIcon = (file: File) => {
        const type = file.type.toLowerCase();
        const name = file.name.toLowerCase();

        if (type.startsWith('image/')) return ImageIcon;
        if (type.startsWith('video/')) return Video;
        if (type.startsWith('audio/')) return Music;
        if (type.includes('pdf') || name.endsWith('.pdf')) return FileText;
        if (type.includes('document') || name.endsWith('.doc') || name.endsWith('.docx')) return FileText;
        if (type.includes('text') || name.endsWith('.txt')) return FileText;
        if (type.includes('json') || name.endsWith('.json')) return Code;
        if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return Archive;
        return File;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    if (attachments.length === 0) {
        return null;
    } return (
        <div className="mb-3">
            <div className="grid grid-cols-3 gap-2">
                {attachments.map((attachment) => {
                    let FileIcon = getFileIcon(attachment.file);

                    let typeLabel = attachment.file.type.split('/')[1]?.toUpperCase() || 'FILE';

                    if(typeLabel.length > 10) {
                        typeLabel = attachment.file.name.split('.').pop()?.toUpperCase() || 'FILE';
                    }


                    if (attachment.error) {
                        FileIcon = AlertCircle;
                    } else if (attachment.uploading) {
                        FileIcon = Loader2;
                    }

                    const isImage = attachment.file.type.startsWith('image/');

                    return (
                        <div
                            key={attachment.id}
                            className={cn(
                                "group relative flex items-center gap-2 p-2 rounded-lg border transition-all duration-200",
                                "bg-background/80 backdrop-blur-sm hover:bg-muted/50",
                                "border-border/60 animate-in fade-in-0 slide-in-from-bottom-2",
                                attachment.error && "border-red-200 bg-red-50/80 dark:border-red-800 dark:bg-red-950/40",
                                attachment.uploading && "border-blue-200 bg-blue-50/80 dark:border-blue-800 dark:bg-blue-950/40 shadow-md",
                                !attachment.uploading && !attachment.error && attachment.storageId && "border-green-200 bg-green-50/80 dark:border-green-800 dark:bg-green-950/40"
                            )}
                        >
                            {/* Remove button - positioned absolutely */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-1 right-1 w-6 h-6 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeFile(attachment.id)}
                            >
                                <X className="w-3 h-3" />
                                <span className="sr-only">Remove file</span>
                            </Button>

                            {/* File Icon */}
                            <div className="flex-shrink-0">
                                {isImage ? (
                                    <div className="w-8 h-8 rounded overflow-hidden border border-border/50">
                                        <Image
                                            src={URL.createObjectURL(attachment.file)}
                                            alt=""
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover"
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded border border-border/50 bg-muted/30 flex items-center justify-center">
                                        <FileIcon className={cn("w-4 h-4 text-muted-foreground", attachment.error && "text-red-500", attachment.uploading && "text-blue-500 animate-spin")} />
                                    </div>
                                )}
                            </div>

                            {/* File Name */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate leading-tight max-w-full" title={attachment.file.name}>
                                    {/* {attachment.file.name.length > 20 
                                        ? `${attachment.file.name.substring(0, 17)}...` 
                                        : attachment.file.name
                                    } */}
                                    {attachment.file.name}
                                </p>

                                {/* Error message if present */}
                                {attachment.error && (
                                    <p className="text-xs text-red-600 mt-1 break-words">
                                        {attachment.error}
                                    </p>
                                )}

                                {/* File type badge */}
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground truncate" title={formatFileSize(attachment.file.size)}>
                                        {formatFileSize(attachment.file.size)}
                                    </span>
                                    <span className="inline-block mt-1 px-1 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded">
                                        {typeLabel}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
