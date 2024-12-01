import { Bot } from 'mineflayer'
import consola from 'consola'
import pathfinder from 'mineflayer-pathfinder'
import { targets } from '../states.js'

export function comeHandler(bot: Bot, username: string): void {
  const player = bot.players[username]
  if (player === undefined) {
    return
  }

  if (player.entity === undefined) {
    bot.chat(`I can't see you, ${username}`)
    return
  }

  targets.player = player
  targets.state = 'come'
}
