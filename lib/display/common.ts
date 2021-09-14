import * as chalk from 'chalk';

export function leftPad(text: string, padding = 4): string {
  return padding <= 0 ? text : ' '.repeat(padding) + text;
}

export function getColorBySeverity(severity: string): chalk.Chalk {
  switch (severity) {
    case 'low':
      return chalk.blueBright;
    case 'medium':
      return chalk.yellowBright;

    case 'high':
      return chalk.redBright;

    default:
      return chalk.whiteBright;
  }
}
