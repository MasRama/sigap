import Storage from '@services/Storage';
import Logger from '@services/Logger';

export interface CameraUploadResult {
  url: string;
  path: string;
  size: number;
}

export const saveConfirmationPhoto = async (base64Image: string, teacherUserId: string): Promise<CameraUploadResult> => {
  const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  if (buffer.length === 0) {
    throw new Error('Invalid photo data');
  }

  const stored = await Storage.put(buffer, {
    directory: 'confirmations',
    extension: 'jpg',
    name: `${teacherUserId}-${Date.now()}`,
  });

  Logger.info('Confirmation photo saved', { teacherUserId, path: stored.path, size: stored.size });

  return {
    url: stored.url,
    path: stored.path,
    size: stored.size,
  };
};

export const deleteConfirmationPhoto = async (relativePath: string): Promise<boolean> => {
  if (!relativePath.startsWith('confirmations/')) {
    return false;
  }
  return Storage.delete(relativePath);
};
