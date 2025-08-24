// Simple QR code generation using an API service
export const generateQRCodeURL = (text: string, size: number = 128): string => {
  // Using QR Server API as a fallback for QR code generation
  const encodedText = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;
};

// Alternative: Generate QR code data URL (would require a QR library)
export const generateQRCodeDataURL = async (text: string): Promise<string> => {
  try {
    // For now, return the API URL as fallback
    return generateQRCodeURL(text);
  } catch (error) {
    console.error('QR code generation failed:', error);
    return generateQRCodeURL(text);
  }
};
