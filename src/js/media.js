
/**
 * Media Utility for Client-Side Processing
 * Handles Image Resizing, Format Conversion, and Video Element Controls.
 */

export const ImageTools = {
    /**
     * Resizes an image file and/or changes its format.
     * @param {File} file - The source image file.
     * @param {Object} options - { maxWidth, maxHeight, format (image/jpeg, image/png, image/webp), quality (0-1) }
     * @returns {Promise<Blob>}
     */
    processImage(file, options = {}) {
        return new Promise((resolve, reject) => {
            const defaults = {
                maxWidth: 1920,
                maxHeight: 1080,
                format: 'image/webp',
                quality: 0.8
            };
            const settings = { ...defaults, ...options };

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    // Maintain aspect ratio
                    if (width > settings.maxWidth || height > settings.maxHeight) {
                        const ratio = Math.min(settings.maxWidth / width, settings.maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, settings.format, settings.quality);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    },

    /**
     * Calculates video embed dimensions based on aspect ratio.
     * @param {number} containerWidth 
     * @param {string} aspectRatio - "16:9", "4:3"
     */
    calculateVideoDimensions(containerWidth, aspectRatio = "16:9") {
        const [w, h] = aspectRatio.split(':').map(Number);
        const height = (containerWidth * h) / w;
        return { width: containerWidth, height };
    }
};
