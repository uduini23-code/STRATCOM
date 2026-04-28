export const compressImage = (file: File, maxSizeMB: number = 0.5, maxWidthOrHeight: number = 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = Math.round(maxWidthOrHeight);
          } else {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = Math.round(maxWidthOrHeight);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Reduce quality until size is under limit
        const getBase64Size = (base64String: string) => {
          const padding = base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0;
          return (base64String.length * (3 / 4)) - padding;
        };

        while (getBase64Size(dataUrl) > maxSizeMB * 1024 * 1024 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
