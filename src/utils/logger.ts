import chalk from 'chalk'

export interface Logger {
  /** Logs a success message with green checkmark */
  success: (message: string) => void
  /** Logs an error message with red X to stderr */
  error: (message: string) => void
  /** Logs a warning message with yellow warning symbol */
  warning: (message: string) => void
  /** Logs an info message with blue info symbol */
  info: (message: string) => void
  /** Logs a plain message without any prefix */
  plain: (message: string) => void
  /** Logs debug information (only in verbose mode) */
  debug: (message: string) => void
  /** Enable or disable verbose mode */
  setVerbose: (enabled: boolean) => void
  /** Internal verbose state */
  _verbose: boolean
}

/**
 * Logger simple con colores y modo verbose
 */
const logger: Logger = {
  _verbose: false,

  setVerbose(enabled: boolean): void {
    this._verbose = enabled
  },

  success: (message: string) => process.stdout.write(`${chalk.green('✓')} ${message}\n`),
  error: (message: string) => process.stderr.write(`${chalk.red('✗')} ${message}\n`),
  warning: (message: string) => process.stdout.write(`${chalk.yellow('⚠')} ${message}\n`),
  info: (message: string) => process.stdout.write(`${chalk.blue('ℹ')} ${message}\n`),
  plain: (message: string) => process.stdout.write(`${message}\n`),
  debug: function (message: string): void {
    if (this._verbose) {
      process.stdout.write(`${chalk.gray('🔍')} ${message}\n`)
    }
  },
}

export default logger

/**
 * Safely extracts error message from unknown error value.
 * Handles cases where error might not be an Error instance.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error occurred'
}
