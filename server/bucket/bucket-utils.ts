export const createDateFolderPath = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const getFileExtensionByMimeType = (mimeType: string): string => {
  return mimeType.split('/')[1];
};

export const getFileNameFromUrl = (url: string): string => {
  return url.split('/').pop() || '';
};
