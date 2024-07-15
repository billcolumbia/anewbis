import chalk from 'chalk'
const { log } = console

export const now = () =>
  new Date().toLocaleTimeString().replace(/\s*(AM|PM)/, '')

export const logger = {
  change(filename) {
    log(
      chalk.dim(now()),
      chalk.cyan(`[change]`),
      chalk.blue(filename),
      chalk.dim('Reloading or injecting!')
    )
  },

  connected() {
    log(chalk.dim(now()), chalk.cyan(`[⚭]`), chalk.dim('Connected to client!'))
  },

  disconnected() {
    log(chalk.dim(now()), chalk.cyan(`[%]`), chalk.dim('Client disconnected!'))
  },

  messaged(message) {
    log(
      chalk.dim(now()),
      chalk.cyan(`[message from client]`),
      chalk.dim(message)
    )
  },
}
