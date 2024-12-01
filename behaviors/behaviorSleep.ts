import { Bot } from "mineflayer";
import { StateBehavior } from "mineflayer-statemachine";
import { MyTargets } from "../states.js";
import consola from "consola";
import { sleepEndTransition } from "../transitions.js";
import pathfinder from "mineflayer-pathfinder";
import { distance, sleep } from "../utils/utils.js";

export class BehaviorSleep implements StateBehavior {
    readonly bot: Bot
    readonly targets: MyTargets

    stateName: string = 'sleep'
    active: boolean = false


    constructor(bot: Bot, targets: MyTargets) {
        this.bot = bot
        this.targets = targets
    }

    async loop() {
        if (distance(this.bot.entity.position, this.targets.position) > 2
            || this.bot.pathfinder.isMoving() || this.bot.pathfinder.isMining()
            || this.bot.pathfinder.isBuilding() || this.bot.isSleeping) {
            return
        }
        if (!this.targets.position) {
            throw Error('BehaviorSleep.loop: position is undefined')
        }
        const bed = this.bot.blockAt(this.targets.position)
        if (!bed) {
            this.bot.chat('No bed found')
            consola.error('No bed found')
            sleepEndTransition?.trigger()
            return
        }
        //use the bed to sleep
        await this.bot.sleep(bed).catch((err) => {
            this.bot.chat(`Error while sleeping: ${err}`)
            consola.error(`Error while sleeping: ${err}`)
            sleepEndTransition?.trigger()
        })
        // sleepEndTransition?.trigger()
    }

    async startLoop() {
        if (this.targets.state !== this.stateName) {
            sleepEndTransition?.trigger()
            return
        }
        await this.loop()
        setTimeout(() => {
            this.startLoop()
        }, 200);
    }

    onStateEntered() {
        this.targets.state = this.stateName
        this.bot.chat('BehaviorSleep: onStateEntered')
        consola.info('BehaviorSleep: onStateEntered')
        // find nearest bed
        const bed = this.bot.findBlock({
            matching: (bed) => {
                if (!bed.name.includes('bed')) {
                    return false
                }

                let path = this.bot.pathfinder.getPathTo(
                    new pathfinder.Movements(this.bot),
                    new pathfinder.goals.GoalNear(
                        bed.position.x, bed.position.y, bed.position.z, 1)
                )
                consola.log(bed.name, path.status)
                return path.status === 'success'
            },
            maxDistance: 64,
            useExtraInfo: true
        })
        if (!bed) {
            this.bot.chat('No bed found')
            consola.error('No bed found')
            sleepEndTransition?.trigger()
            return
        }
        this.bot.chat(`Found bed at ${bed.position.x}, ${bed.position.y}, ${bed.position.z}`)
        consola.info(`Found bed at ${bed.position.x}, ${bed.position.y}, ${bed.position.z}`)
        this.bot.pathfinder.setGoal(
            new pathfinder.goals.GoalNear(bed.position.x, bed.position.y, bed.position.z, 1),
            true
        )
        this.targets.position = bed.position
        this.startLoop()
    }
    async onStateExited() {
        this.targets.position = undefined
        if (this.targets.state === this.stateName) {
            this.targets.state = undefined
        }
        await this.bot.wake().catch((err) => {
            // this.bot.chat(`Error while waking up: ${err}`)
            consola.error(`Error while waking up: ${err}`)
        })
        await sleep(1000)
        this.bot.chat('BehaviorSleep: onStateExited')
        consola.info('BehaviorSleep: onStateExited')
    }
}