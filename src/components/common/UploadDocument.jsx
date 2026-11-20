import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, File, Image as ImageIcon, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadMediaFileToS3 } from '@/Services/caseManagementService';

const UploadDocument = ({
    // ===== REQUIRED PROPS =====
    onUploadComplete, // Callback when upload is successful
    onUploadError, // Callback when upload fails
    onFileRemove, // Callback when file is removed

    // ===== OPTIONAL PROPS =====
    label = 'Upload Document',
    subLabel = 'Supported formats: JPEG, PNG, JPG, WEBP, PDF',
    accept = '.jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf',
    maxSize = 5 * 1024 * 1024, // 5MB default
    maxSizeText = '5MB',
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'],
    required = false,
    disabled = false,
    multiple = false,
    defaultFiles = [],
    className = '',
    dropzoneClassName = '',
    previewClassName = '',
    showPreview = true,
    showFileName = true,
    showFileSize = true,
    showProgress = true,
    autoUpload = true,
    uploadOnSelect = true,
    onFileSelect,
    onUploadProgress,
    customUploadFunction,
    resetOnUpload = false,
    metadata = {},
    maxFiles = 5, // Maximum number of files
}) => {
    const [selectedFiles, setSelectedFiles] = useState(defaultFiles || []);
    const [filePreviews, setFilePreviews] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadedUrls, setUploadedUrls] = useState([]);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Generate previews for selected files
    useEffect(() => {
        selectedFiles.forEach((file) => {
            if (file.type?.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreviews((prev) => {
                        const newPreviews = [...prev];
                        const index = selectedFiles.indexOf(file);
                        newPreviews[index] = reader.result;
                        return newPreviews;
                    });
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreviews((prev) => {
                    const newPreviews = [...prev];
                    const index = selectedFiles.indexOf(file);
                    newPreviews[index] = null;
                    return newPreviews;
                });
            }
        });
    }, [selectedFiles]);

    // Handle file selection (supports multiple)
    const handleFileSelect = (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        // Convert FileList to array
        const fileArray = Array.from(files);

        // Check if multiple is allowed
        if (!multiple && fileArray.length > 1) {
            toast.error('Only one file can be uploaded at a time');
            return;
        }

        // Check max files limit
        if (multiple && selectedFiles.length + fileArray.length > maxFiles) {
            toast.error(`You can upload maximum ${maxFiles} files`);
            return;
        }

        // Validate each file
        const validFiles = [];
        const errors = [];

        fileArray.forEach((file) => {
            // Validate file type
            if (!allowedTypes.includes(file.type)) {
                errors.push(`${file.name}: Unsupported file type`);
                return;
            }

            // Validate file size
            if (file.size > maxSize) {
                errors.push(`${file.name}: File size exceeds ${maxSizeText}`);
                return;
            }

            validFiles.push(file);
        });

        // Show errors if any
        if (errors.length > 0) {
            errors.forEach(error => toast.error(error));
            onUploadError?.(errors.join(', '));
            return;
        }

        // Clear previous errors
        setError(null);

        // Add valid files
        const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
        setSelectedFiles(newFiles);

        // Initialize progress for new files
        const progress = {};
        validFiles.forEach((file) => {
            progress[file.name] = 0;
        });
        setUploadProgress((prev) => ({ ...prev, ...progress }));

        // Reset uploaded states for new files
        if (multiple) {
            // Keep existing uploaded URLs
        } else {
            setUploadedUrls([]);
            setUploadedFiles([]);
        }

        onFileSelect?.(validFiles);

        // Auto upload if enabled
        if (autoUpload || uploadOnSelect) {
            uploadFiles(validFiles);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Upload multiple files to S3
    const uploadFiles = async (files) => {
        if (!files || files.length === 0) {
            // If no files provided, upload all selected files
            files = selectedFiles;
        }

        if (!files || files.length === 0) return;

        try {
            setIsUploading(true);

            // Create FormData
            const formData = new FormData();

            // Append each file with the same field name 'files'
            files.forEach((file) => {
                formData.append('files', file);
            });

            // Append metadata if provided
            Object.keys(metadata).forEach(key => {
                formData.append(key, metadata[key]);
            });

            // Call upload function
            let response;
            if (customUploadFunction) {
                response = await customUploadFunction(formData);
            } else {
                response = await uploadMediaFileToS3(formData);
            }

            // Wait for response
            const result = await response;

            // Handle successful upload
            // Check different possible response structures
            let uploadedUrls = [];
            
            if (result?.data?.data?.uploadedFiles) {
                // Format: { data: { data: { uploadedFiles: [url1, url2] } } }
                uploadedUrls = result.data.data.uploadedFiles;
            } else if (result?.data?.uploadedFiles) {
                // Format: { data: { uploadedFiles: [url1, url2] } }
                uploadedUrls = result.data.uploadedFiles;
            } else if (result?.data?.urls) {
                // Format: { data: { urls: [url1, url2] } }
                uploadedUrls = result.data.urls;
            } else if (result?.data?.url) {
                // Format: { data: { url: url } }
                uploadedUrls = [result.data.url];
            } else if (Array.isArray(result?.data)) {
                // Format: { data: [url1, url2] }
                uploadedUrls = result.data;
            } else if (result?.urls) {
                // Format: { urls: [url1, url2] }
                uploadedUrls = result.urls;
            } else if (result?.url) {
                // Format: { url: url }
                uploadedUrls = [result.url];
            } else if (Array.isArray(result)) {
                // Format: [url1, url2]
                uploadedUrls = result;
            }

            // If still no URLs, try to extract from response
            if (uploadedUrls.length === 0) {
                // Check if response has a single URL
                const possibleUrl = result?.url || result?.data?.url || result?.fileUrl || result?.data?.fileUrl;
                if (possibleUrl) {
                    uploadedUrls = [possibleUrl];
                } else {
                    throw new Error('Upload failed: No URLs returned');
                }
            }

            // Update progress to 100% for all uploaded files
            const updatedProgress = {};
            files.forEach((file) => {
                updatedProgress[file.name] = 100;
            });
            setUploadProgress((prev) => ({ ...prev, ...updatedProgress }));
            onUploadProgress?.(100);

            // Mark files as uploaded
            setUploadedFiles((prev) => [...prev, ...files]);
            setUploadedUrls((prev) => [...prev, ...uploadedUrls]);

            // Store uploaded URLs in state for each file
            const uploadedMap = {};
            files.forEach((file, index) => {
                if (uploadedUrls[index]) {
                    uploadedMap[file.name] = uploadedUrls[index];
                }
            });

            toast.success(`${files.length} file(s) uploaded successfully!`);
            
            // Call callback with all URLs and files
            onUploadComplete?.(uploadedUrls, files, result);

            if (resetOnUpload) {
                setTimeout(() => {
                    handleRemoveAllFiles();
                }, 3000);
            }

        } catch (error) {
            console.error('Upload error:', error);
            const errorMsg = error?.response?.data?.message || 
                            error?.message || 
                            'Failed to upload files. Please try again.';
            setError(errorMsg);
            toast.error(errorMsg);
            onUploadError?.(errorMsg);
        } finally {
            setIsUploading(false);
        }
    };

    // Remove a single file
    const handleRemoveFile = (index) => {
        const newFiles = [...selectedFiles];
        const removedFile = newFiles[index];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);

        // Remove preview
        setFilePreviews((prev) => {
            const newPreviews = [...prev];
            newPreviews.splice(index, 1);
            return newPreviews;
        });

        // Remove progress
        if (removedFile) {
            setUploadProgress((prev) => {
                const newProgress = { ...prev };
                delete newProgress[removedFile.name];
                return newProgress;
            });
        }

        // Remove from uploaded lists
        setUploadedFiles((prev) => prev.filter(f => f !== removedFile));
        setUploadedUrls((prev) => prev.filter((_, i) => i !== index));

        onFileRemove?.(removedFile, index);
    };

    // Remove all files
    const handleRemoveAllFiles = () => {
        setSelectedFiles([]);
        setFilePreviews([]);
        setUploadProgress({});
        setUploadedFiles([]);
        setUploadedUrls([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onFileRemove?.('all');
    };

    // Manual upload trigger
    const handleManualUpload = () => {
        if (selectedFiles.length > 0) {
            uploadFiles(selectedFiles);
        }
    };

    // Trigger file input click
    const handleDropzoneClick = () => {
        if (!disabled && !isUploading) {
            fileInputRef.current?.click();
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled || isUploading) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const event = { target: { files: files } };
            handleFileSelect(event);
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Get file icon based on type
    const getFileIcon = (file) => {
        if (!file) return <File className="h-8 w-8 text-slate-500" />;
        if (file.type?.startsWith('image/')) {
            return <ImageIcon className="h-8 w-8 text-blue-500" />;
        }
        if (file.type === 'application/pdf') {
            return <FileText className="h-8 w-8 text-red-500" />;
        }
        return <File className="h-8 w-8 text-slate-500" />;
    };

    // Check if file is uploaded
    const isFileUploaded = (file) => {
        return uploadedFiles.includes(file);
    };

    // Get uploaded URL for a file
    const getFileUploadedUrl = (file) => {
        const index = uploadedFiles.indexOf(file);
        return uploadedUrls[index] || null;
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                    {multiple && (
                        <span className="text-xs font-normal text-slate-400 ml-2">
                            (Max {maxFiles} files)
                        </span>
                    )}
                </label>
            )}

            {/* Dropzone / Upload Area */}
            <div
                onClick={handleDropzoneClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`
                    flex flex-col items-center justify-center w-full 
                    border-2 border-dashed rounded-xl 
                    transition-all duration-200
                    ${disabled || isUploading 
                        ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60' 
                        : 'border-slate-300 hover:border-violet-500 hover:bg-violet-50 cursor-pointer'
                    }
                    ${error ? 'border-red-300 bg-red-50' : ''}
                    ${dropzoneClassName}
                `}
                style={{ minHeight: '120px' }}
            >
                <Upload className={`h-8 w-8 mb-2 ${error ? 'text-red-400' : 'text-slate-400'}`} />
                <p className="text-sm text-slate-600 text-center">
                    {disabled ? 'Upload disabled' : 'Click to upload or drag and drop'}
                </p>
                {subLabel && (
                    <p className="text-xs text-slate-400 mt-1 text-center">
                        {subLabel}
                    </p>
                )}
                {multiple && (
                    <p className="text-xs text-slate-400 mt-1 text-center">
                        You can select multiple files
                    </p>
                )}
                {error && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                    </p>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={disabled || isUploading}
                    multiple={multiple}
                />
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-3">
                    {selectedFiles.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            className={`border border-slate-200 rounded-xl p-4 bg-slate-50 ${previewClassName}`}
                        >
                            <div className="flex items-start gap-4">
                                {/* File Preview */}
                                {showPreview && (
                                    <div className="flex-shrink-0">
                                        {filePreviews[index] ? (
                                            <img
                                                src={filePreviews[index]}
                                                alt={`Preview ${index}`}
                                                className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 flex items-center justify-center bg-slate-200 rounded-lg">
                                                {getFileIcon(file)}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                    {showFileName && (
                                        <p className="text-sm font-medium text-slate-700 truncate">
                                            {file.name}
                                        </p>
                                    )}
                                    {showFileSize && (
                                        <p className="text-xs text-slate-400">
                                            {formatFileSize(file.size)}
                                        </p>
                                    )}

                                    {/* Upload Progress */}
                                    {showProgress && isUploading && uploadProgress[file.name] !== undefined && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                                <span>Uploading...</span>
                                                <span>{uploadProgress[file.name]}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress[file.name]}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Upload Status */}
                                    {isFileUploaded(file) && (
                                        <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Uploaded successfully</span>
                                            {getFileUploadedUrl(file) && (
                                                <a
                                                    href={getFileUploadedUrl(file)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-violet-600 hover:text-violet-700 underline ml-2"
                                                >
                                                    View
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFile(index)}
                                    className="p-1 rounded-full hover:bg-slate-200 transition-colors flex-shrink-0"
                                    disabled={isUploading}
                                    title="Remove file"
                                >
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Upload All Button (if autoUpload is false) */}
                    {!autoUpload && !isUploading && selectedFiles.length > 0 && (
                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                type="button"
                                onClick={handleRemoveAllFiles}
                                className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Remove All
                            </button>
                            <button
                                type="button"
                                onClick={handleManualUpload}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
                            >
                                Upload All Files
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UploadDocument;