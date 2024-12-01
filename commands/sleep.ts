import { Bot } from 'mineflayer'
import { sleepState, targets } from '../states.js'

export function sleepHandler(bot: Bot, username: string): void {
  targets.state = sleepState?.stateName
}
