import consola from 'consola'
import 'dotenv/config'
import mineflayer from 'mineflayer'
import pathfinder from 'mineflayer-pathfinder'
import { comeHandler } from './commands/come.js'
import { gotoxzHandler } from './commands/gotoxz.js'
import { treeHandler } from './commands/tree.js'
import { StateTransition, BotStateMachine, EntityFilters, BehaviorFollowEntity, NestedStateMachine } from 'mineflayer-statemachine'
import { idleState, initStates, targets } from './states.js'
import { getTransitions } from './transitions.js'
import { sleepHandler } from './commands/sleep.js'

interface Env {
  MC_HOST: string
  MC_USERNAME: string
  MC_AUTH: 'mojang' | 'microsoft' | 'offline'
  LOG_LEVEL: string
}

async function main(): Promise<void> {
  const env: Env = process.env as any
  consola.level = Number(env.LOG_LEVEL)

  const bot = mineflayer.createBot({
    host: env.MC_HOST,
    username: env.MC_USERNAME,
    auth: env.MC_AUTH
  })

  bot.loadPlugin(pathfinder.pathfinder)

  bot.once('spawn', () => {
    const movement = new pathfinder.Movements(bot)
    movement.canDig = false
    movement.allow1by1towers = true
    movement.allowFreeMotion = true
    bot.pathfinder.setMovements(movement)
    initStates(bot, targets)
    if (!idleState) {
      throw new Error('States not initialized')
    }
    const rootLayer = new NestedStateMachine(getTransitions(bot, targets), idleState)
    new BotStateMachine(bot, rootLayer)
  })

  bot.on('whisper', async (username: string, message: string) => {
    if (message === 'come') {
      comeHandler(bot, username)
    }

    if (message.startsWith('gotoxz')) {
      await gotoxzHandler(bot, message)
    }

    if (message.startsWith('tree')) {
      treeHandler(bot, message)
    }

    if (message.startsWith('sleep')) {
      sleepHandler(bot, message)
    }
  })
}

main().catch(consola.error)
