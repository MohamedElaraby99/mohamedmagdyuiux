import React, { useEffect, useState } from 'react';
import { FaTimes, FaSearchPlus, FaSearchMinus, FaDownload, FaImage } from 'react-icons/fa';
import { generateFileUrl } from '../utils/fileUtils';

const ImageViewer = ({
    imageUrl,
    title = "Image",
    isOpen,
    onClose
}) => {
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    // Reset state when opening new image
    useEffect(() => {
        if (isOpen) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen, imageUrl]);

    // Handle zooming
    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.25, 0.5));
    };

    // Handle keyboard events
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === '+' || e.key === '=') {
                handleZoomIn();
            } else if (e.key === '-') {
                handleZoomOut();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyPress);
            return () => document.removeEventListener('keydown', handleKeyPress);
        }
    }, [isOpen]);

    // Mouse drag handling for zoomed images
    const handleMouseDown = (e) => {
        if (scale > 1) {
            setIsDragging(true);
            setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - startPos.x,
                y: e.clientY - startPos.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (!isOpen) return null;

    // Generate full URL if it's a relative path
    const fullImageUrl = generateFileUrl(imageUrl);

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 sm:p-6 transition-opacity duration-300 hover:opacity-100">
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <FaImage className="text-xl" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold truncate max-w-[200px] sm:max-w-md">{title}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Zoom Controls */}
                        <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
                            <button
                                onClick={handleZoomOut}
                                className="p-2 hover:bg-white/20 rounded-md transition-colors"
                                title="Zoom Out"
                            >
                                <FaSearchMinus />
                            </button>
                            <span className="text-sm min-w-[3ch] text-center">{Math.round(scale * 100)}%</span>
                            <button
                                onClick={handleZoomIn}
                                className="p-2 hover:bg-white/20 rounded-md transition-colors"
                                title="Zoom In"
                            >
                                <FaSearchPlus />
                            </button>
                        </div>

                        {/* Download Button */}
                        <a
                            href={fullImageUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                            title="Download Image"
                        >
                            <FaDownload />
                        </a>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-red-500/80 bg-white/10 hover:bg-red-600 rounded-lg transition-all duration-200 backdrop-blur-sm"
                            title="Close"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div
                className="flex-1 overflow-hidden flex items-center justify-center p-4 cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img
                    src={fullImageUrl}
                    alt={title}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                        maxHeight: '85vh',
                        maxWidth: '100vw'
                    }}
                    className="object-contain select-none shadow-2xl drop-shadow-2xl"
                    draggable={false}
                />
            </div>

            {/* Footer / Instructions */}
            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                <p className="text-white/50 text-sm bg-black/40 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
                    استخدم عجلة الماوس للتقريب • اسحب للتحريك
                </p>
            </div>
        </div>
    );
};

export default ImageViewer;
