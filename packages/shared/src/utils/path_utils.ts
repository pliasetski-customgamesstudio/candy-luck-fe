export class PathUtils {
  static getExtension(path: string): string {
    return path.split('.').pop() || '';
  }

  static getFileName(path: string): string {
    return path.split(/[\\/]/).pop() || '';
  }

  static getFileNameWithoutExtension(path: string): string {
    const fileName = PathUtils.getFileName(path);
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex >= 0) {
      return fileName.substring(0, dotIndex);
    }
    return fileName;
  }
}
