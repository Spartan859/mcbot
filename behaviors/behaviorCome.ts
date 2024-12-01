import consola from "consola"
import { assert } from "console"
import { Bot } from "mineflayer"
import pathfinder from "mineflayer-pathfinder"
import { StateBehavior, StateMachineTargets } from "mineflayer-statemachine"
import { MyTargets } from "../states.js"
import { comeEndTransition } from "../transitions.js"
import { sleep } from "../utils/utils.js"

export class BehaviorCome implements StateBehavior {
    readonly bot: Bot
    readonly targets: MyTargets

    stateName: string = 'come'
    active: boolean = false

    constructor(bot: Bot, targets: MyTargets) {
        this.bot = bot
        this.targets = targets
    }

    onStateEntered(): void {
        this.targets.state = this.stateName
        consola.info('BehaviorCome: onStateEntered')
        this.bot.chat('BehaviorCome: onStateEntered')
        let player = this.targets.player
        let username = player?.username
        consola.info(`coming to ${username} at ${player?.entity.position.x}, 
            ${player?.entity.position.y}, ${player?.entity.position.z}`)
        this.bot.chat(`coming to ${username} at ${player?.entity.position.x},
            ${player?.entity.position.y}, ${player?.entity.position.z}`)
        const position = player?.entity.position
        if (!position) {
            throw new Error('BehaviorCome: Player position is undefined')
        }
        this.bot.pathfinder.setGoal(
            new pathfinder.goals.GoalNear(
                position.x, position.y, position.z, 0.5),
            true
        )
        comeEndTransition?.trigger()
    }

    onStateExited(): void {
        consola.info('BehaviorCome: onStateExited')
        this.bot.chat('BehaviorCome: onStateExited')
        if (this.targets.state == this.stateName) {
            this.targets.state = undefined
        }
        this.targets.player = undefined
    }
}