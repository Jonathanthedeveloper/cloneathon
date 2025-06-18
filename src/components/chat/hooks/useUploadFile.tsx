import { useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useChatStore } from '@/stores/chat';

export function useUploadFile() {
    const generateUploadUrl = useMutation(api.functions.storage.generateUploadUrl);
    const deleteFile = useMutation(api.functions.storage.deleteById);
    const { attachments, setAttachments } = useChatStore();

    const validateFile = useCallback((file: File) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'text/csv',
            'application/json', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'
        ];

        if (file.size > maxSize) {
            return { valid: false, error: 'File size must be less than 10MB' };
        }

        const isValidType = allowedTypes.some(type => file.type.includes(type)) || 
                           file.name.match(/\.(txt|pdf|doc|docx|json|csv|jpg|jpeg|png|gif|webp|mp4|webm|mp3|wav)$/i);
        
        if (!isValidType) {
            return { valid: false, error: 'File type not supported' };
        }

        return { valid: true };
    }, []);

    const uploadFile = useCallback(async (file: File, fileId: string) => {
        try {
            // Generate upload URL
            const uploadUrl = await generateUploadUrl();
            
            // Upload file to Convex storage
            const result = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            if (!result.ok) {
                throw new Error('Upload failed');
            }

            const response = await result.json();
            const storageId = response.storageId as Id<"_storage">;

            // Update file state in store
            setAttachments(prev => 
                prev.map(f => 
                    f.id === fileId 
                        ? { ...f, uploading: false, storageId }
                        : f
                )
            );

            return storageId;
        } catch (error) {
            setAttachments(prev => 
                prev.map(f => 
                    f.id === fileId 
                        ? { ...f, uploading: false, error: 'Upload failed' }
                        : f
                )
            );
            throw error;
        }
    }, [generateUploadUrl, setAttachments]);

    const handleFileSelect = useCallback((files: FileList) => {
        const fileArray = Array.from(files);
        
        fileArray.forEach(file => {
            const validation = validateFile(file);
            const fileId = Math.random().toString(36).substring(2, 11);
            
            if (!validation.valid) {
                setAttachments(prev => [...prev, {
                    id: fileId,
                    file,
                    uploading: false,
                    error: validation.error
                }]);
                return;
            }

            // Add file to state immediately
            setAttachments(prev => [...prev, {
                id: fileId,
                file,
                uploading: true
            }]);

            // Start upload asynchronously (non-blocking)
            uploadFile(file, fileId).catch(error => {
                console.error('Upload failed:', error);
                // Error handling is already done in uploadFile
            });
        });
    }, [uploadFile, validateFile, setAttachments]);

    const removeFile = useCallback(async (fileId: string) => {
        const fileToRemove = attachments.find(f => f.id === fileId);
        
        // If file was uploaded, delete from storage
        if (fileToRemove?.storageId) {
            try {
                await deleteFile({ storageId: fileToRemove.storageId });
            } catch (error) {
                console.error('Failed to delete file from storage:', error);
            }
        }
        
        setAttachments(prev => prev.filter(f => f.id !== fileId));
    }, [attachments, deleteFile, setAttachments]);

    const clearAttachments = useCallback(() => {
        setAttachments([]);
    }, [setAttachments]);

    const hasUploadingFiles = attachments.some(f => f.uploading);
    const uploadedFiles = attachments.filter(f => f.storageId && !f.uploading && !f.error);

    return {
        attachments,
        handleFileSelect,
        removeFile,
        clearAttachments,
        hasUploadingFiles,
        uploadedFiles,
        validateFile
    };
}