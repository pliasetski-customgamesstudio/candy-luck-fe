type MeasureText = (text: string) => number;

export abstract class MultiLineFont {
  splitText(measureText: MeasureText, text: string, maxWidth: number): string[] {
    const lines: string[] = text.split('\r\n');
    const res: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const words: string[] = lines[i].split(' ');

      let line = '';
      const wordsLengthMinusOne = words.length - 1;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + (n < wordsLengthMinusOne ? ' ' : '');
        const width = measureText(testLine);

        if (maxWidth > 0 && width > maxWidth && n > 0) {
          res.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }

      if (line.endsWith(' ')) {
        line = line.substring(0, line.length - 1);
      }

      res.push(line);
    }

    return res;
  }
}
