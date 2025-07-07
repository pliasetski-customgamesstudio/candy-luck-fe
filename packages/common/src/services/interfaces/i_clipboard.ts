interface IClipboard {
  copy(text: string): void;
}

export class Clipboard implements IClipboard {
  public copy(text: string): void {
    const copyToClipboard = (window as any).copyToClipboard;

    if (typeof copyToClipboard === 'function') {
      copyToClipboard(text);
    } else {
      this.copyToClipboard(text);
    }
  }

  private copyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Установите стиль для скрытия элемента за пределами видимой области
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';

    document.body.appendChild(textArea);

    // Выделите текст в текстовом поле
    textArea.select();

    try {
      // Копирование текста в буфер обмена
      document.execCommand('copy');
    } catch (err) {
      console.error('Unable to copy to clipboard', err);
    }

    // Удалите временный элемент
    document.body.removeChild(textArea);
  }
}
