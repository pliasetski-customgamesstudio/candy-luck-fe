import { ResourceCache } from './279_ResourceCache';
import { ResourcePackage } from './88_ResourcePackage';
import { ResponseError } from './25_ResponseError';
import JSZip from 'jszip';

export class ZipResourceCache extends ResourceCache {
  async loadPackage(url: string): Promise<ResourcePackage> {
    this.dispatchBeforeLoad(url);

    try {
      const response = await fetch(url);
      const data = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(data);
      const file = Object.values(zip.files)[0];

      if (!file) {
        throw new Error(`${url} there is no file in zip`);
      }

      const xml = await file.async('string');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');
      if (xmlDoc.firstChild) {
        return await this._loadPackage(xmlDoc.firstChild as Element);
      } else {
        throw new ResponseError(
          url,
          response.status,
          response.statusText,
          response.text.toString()
        );
      }
    } catch (error) {
      if (error instanceof Event && error.target instanceof XMLHttpRequest) {
        throw new ResponseError(
          url,
          error.target.status,
          error.target.statusText,
          error.target.responseText
        );
      }
      throw error;
    }
  }
}
