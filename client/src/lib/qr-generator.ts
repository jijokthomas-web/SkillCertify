// Simple QR code generation using an API service
export const generateQRCodeURL = (text: string, size: number = 128): string => {
  // Using QR Server API as a fallback for QR code generation
  const encodedText = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;
};

// Generate QR code for downloading
export const downloadQRCode = async (text: string, filename: string = 'qr-code'): Promise<void> => {
  try {
    const qrCodeURL = generateQRCodeURL(text, 300); // Larger size for download
    
    // Fetch the QR code image
    const response = await fetch(qrCodeURL);
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('QR code download failed:', error);
    throw new Error('Failed to download QR code');
  }
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
