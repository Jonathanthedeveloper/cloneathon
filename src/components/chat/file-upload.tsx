"use client";

import { useRef } from 'react';
import { Button } from '../ui/button';
import { PaperclipIcon } from 'lucide-react';
import { useUploadFile } from './hooks/useUploadFile';

export function FileUpload() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { attachments, handleFileSelect } = useUploadFile();

    return (
        <>
            <Button 
                type="button" 
                size="icon" 
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="relative"
            >
                <PaperclipIcon className="w-4 h-4" />
                {attachments.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {attachments.length}
                    </span>
                )}
            </Button>
            
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.doc,.docx,.json,.csv,.mp4,.webm,.mp3,.wav"
                onChange={(e) => {
                    if (e.target.files) {
                        handleFileSelect(e.target.files);
                        e.target.value = '';
                    }
                }}
                className="hidden"
            />
        </>
    );
}