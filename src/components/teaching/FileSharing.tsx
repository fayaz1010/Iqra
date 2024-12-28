'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ArrowUpTrayIcon,
  FolderIcon,
  XMarkIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useTeachingStore } from '@/lib/store/useTeachingStore';

interface FileSharingProps {
  sessionId: string;
  isTeacher: boolean;
}

interface FileUploadState {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = {
  document: ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  video: ['.mp4', '.webm', '.ogg'],
  audio: ['.mp3', '.wav', '.ogg'],
};

export default function FileSharing({ sessionId, isTeacher }: FileSharingProps) {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { shareResource } = useTeachingStore();

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <PhotoIcon className="w-6 h-6" />;
    if (type.includes('video')) return <VideoCameraIcon className="w-6 h-6" />;
    if (type.includes('audio')) return <MusicalNoteIcon className="w-6 h-6" />;
    return <DocumentIcon className="w-6 h-6" />;
  };

  const getFileTypeFromExtension = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    if (!ext) return 'unknown';

    if (ALLOWED_FILE_TYPES.document.some((t) => t.includes(ext))) return 'document';
    if (ALLOWED_FILE_TYPES.image.some((t) => t.includes(ext))) return 'image';
    if (ALLOWED_FILE_TYPES.video.some((t) => t.includes(ext))) return 'video';
    if (ALLOWED_FILE_TYPES.audio.some((t) => t.includes(ext))) return 'audio';
    return 'unknown';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 50MB limit');
    }

    const fileType = getFileTypeFromExtension(file.name);
    if (fileType === 'unknown') {
      throw new Error('File type not supported');
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    const uploadId = `upload_${Date.now()}`;
    try {
      validateFile(file);

      setUploads((prev) => [
        ...prev,
        {
          id: uploadId,
          file,
          progress: 0,
          status: 'uploading',
        },
      ]);

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === uploadId
              ? { ...upload, progress: i }
              : upload
          )
        );
      }

      // Share the resource
      shareResource(sessionId, {
        type: getFileTypeFromExtension(file.name),
        title: file.name,
        url: URL.createObjectURL(file),
        sharedBy: 'currentUser', // Replace with actual user ID
      });

      setUploads((prev) =>
        prev.map((upload) =>
          upload.id === uploadId
            ? { ...upload, status: 'success' }
            : upload
        )
      );
    } catch (error) {
      setUploads((prev) =>
        prev.map((upload) =>
          upload.id === uploadId
            ? {
                ...upload,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : upload
        )
      );
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const { files } = e.dataTransfer;
    if (!files || !isTeacher) return;

    Array.from(files).forEach(uploadFile);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files || !isTeacher) return;

    Array.from(files).forEach(uploadFile);
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Shared Files</h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Folders */}
        <div className="w-48 border-r p-4 space-y-2">
          {['Documents', 'Images', 'Videos', 'Audio'].map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`w-full px-3 py-2 rounded-lg flex items-center space-x-2 ${
                selectedFolder === folder
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'hover:bg-gray-100'
              }`}
            >
              <FolderIcon className="w-5 h-5" />
              <span>{folder}</span>
            </button>
          ))}
        </div>

        {/* Files */}
        <div className="flex-1 p-4">
          {/* Upload Area */}
          {isTeacher && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`mb-4 border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300'
              }`}
            >
              <ArrowUpTrayIcon className="w-12 h-12 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Drag and drop files here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  browse
                </button>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Maximum file size: 50MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Uploads */}
          <AnimatePresence>
            {uploads.map((upload) => (
              <motion.div
                key={upload.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mb-4 p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getFileIcon(upload.file.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{upload.file.name}</span>
                      <button
                        onClick={() => removeUpload(upload.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {formatFileSize(upload.file.size)}
                      </span>
                      <span
                        className={
                          upload.status === 'success'
                            ? 'text-green-600'
                            : upload.status === 'error'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }
                      >
                        {upload.status === 'uploading'
                          ? `${upload.progress}%`
                          : upload.status === 'success'
                          ? 'Uploaded'
                          : upload.error}
                      </span>
                    </div>
                    {upload.status === 'uploading' && (
                      <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Shared Files */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Add shared files here */}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {uploads.length} files uploading
          </span>
          <div className="space-x-2">
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
              Select All
            </button>
            <button className="px-3 py-1 text-sm text-red-600 hover:text-red-700">
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
