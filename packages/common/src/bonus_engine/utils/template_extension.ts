import { TemplateConfiguration } from '../configuration/elements/template_configuration';

export class TemplateExtension {
  static readonly startListChar: string = '[';
  static readonly endListChar: string = ']';
  static readonly itemsSeparator: string = ',';

  static resolve(templateConfiguration: TemplateConfiguration): string[] {
    const result: string[] = [];
    for (let i = 0; i < templateConfiguration.count; i++) {
      result.push(
        ...templateConfiguration.format
          .split(new RegExp('(\\[|\\]|,)'))
          .filter((s) => s !== '')
          .map((s) => s.trim().replace('{0}', `${i}`))
      );
    }
    return result;
  }
}
