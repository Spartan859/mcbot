import { StateBehavior, StateMachineTargets } from "mineflayer-statemachine";
import { Bot } from "mineflayer";
import consola from "consola";
import { distance, sleep } from "../utils/utils.js";
import { Vec3 } from "vec3";
import { loadCoordinates } from "../commands/tree.js";
import { treeEndTransition } from "../transitions.js";
import pathfinder from "mineflayer-pathfinder";
import { MyTargets } from "../states.js";

export class BehaviorTreeFactory implements StateBehavior {
    readonly bot: Bot
    readonly targets: MyTargets

    stateName: string = 'treeFactory'
    active: boolean = false
    plantTreeActive: boolean = false

    treePlacingInterval: NodeJS.Timeout | null = null
    errCnt: Map<string, number> = new Map()

    constructor(bot: Bot, targets: MyTargets) {
        this.bot = bot
        this.targets = targets
    }

    checkHand = async (bot: Bot, name: string): Promise<void> => {
        const nowHand = bot.inventory.slots[bot.getEquipmentDestSlot('hand')]
        if (nowHand && nowHand.name !== name || !nowHand) {
            // await bot.unequip('hand')
            let flag = false
            for (const item of bot.inventory.slots) {
                if (item == null) continue
                if (item.name === name) {
                    await bot.equip(item, 'hand')
                    flag = true
                }
                if (item.name !== 'bone_meal' && item.name !== 'cherry_sapling') {
                    await bot.tossStack(item)
                }
            }
            if (!flag) {
                let errCntNow = this.errCnt.get(name)
                if (!errCntNow) {
                    errCntNow = 0
                }
                ++errCntNow;
                this.errCnt.set(name, errCntNow)
                consola.log('errCntNow:', errCntNow)

                if (errCntNow > 50) {
                    consola.error(`No ${name} in inventory, stopping tree factory.`)
                    bot.chat(`No ${name} in inventory, stopping tree factory.`)
                    await this.end()
                    return
                }
                return
            }
        }
    }

    plantTree = async (bot: Bot, coords: any): Promise<void> => {
        if (this.targets.state !== this.stateName) {
            await this.end();
            return
        }
        if (distance(coords.stand, bot.entity.position) > 1
            || bot.pathfinder.isMoving() || bot.pathfinder.isMining()
            || bot.pathfinder.isBuilding()) {
            consola.debug('Bot is moving to stand position.')
            if (this.plantTreeActive) {
                setTimeout(() => {
                    this.plantTree(bot, coords)
                }, 200)
            }
            return
        }
        consola.info('Placing tree.')
        const leverBlock = bot.blockAt(coords.lever)
        // consola.log(leverBlock)
        if (leverBlock && leverBlock.getProperties().powered == true) {
            await bot.activateBlock(leverBlock)
        }
        const treeBlock = bot.blockAt(new Vec3(coords.tree.x, coords.tree.y + 1, coords.tree.z))
        // consola.log(treeBlock)
        const dirtBlock = bot.blockAt(coords.tree)
        if (dirtBlock) {
            if (treeBlock && treeBlock.type === 0) {
                await this.checkHand(bot, 'cherry_sapling')
                await bot.placeBlock(dirtBlock, new Vec3(0, 1, 0))
            } else if (treeBlock && treeBlock.type !== 0) {
                await this.checkHand(bot, 'bone_meal')
                await bot.activateBlock(treeBlock)
            }
        } else {
            consola.warn('No dirt block to place tree.')
            bot.chat('No dirt block to place tree.')
            await this.end()
        }
        if (this.plantTreeActive) {
            setTimeout(() => {
                this.plantTree(bot, coords)
            }, 200)
        }
    }

    async onStateEntered() {
        this.targets.state = this.stateName
        this.errCnt.set('cherry_sapling', 0)
        this.errCnt.set('bone_meal', 0)
        const coords = loadCoordinates()
        if (!coords.stand) {
            consola.warn('No stand position set.')
            this.bot.chat('No stand position set.')
            await this.end()
            return
        }
        if (!coords.lever) {
            consola.warn('No lever position set.')
            this.bot.chat('No lever position set.')
            await this.end()
            return
        }
        if (!coords.tree) {
            consola.warn('No tree position set.')
            this.bot.chat('No tree position set.')
            await this.end()
            return
        }
        consola.info(`Bot moving to tree stand position: ${coords.stand.x}, 
            ${coords.stand.y}, ${coords.stand.z}`)
        this.bot.chat(`Bot moving to tree stand position: ${coords.stand.x}, 
            ${coords.stand.y}, ${coords.stand.z}`)
        this.bot.pathfinder.setGoal(new pathfinder.goals.GoalNear(
            coords.stand.x, coords.stand.y, coords.stand.z, 0.1), true)
        this.plantTreeActive = true
        this.plantTree(this.bot, coords)
    }

    async end(): Promise<void> {
        this.plantTreeActive = false
        const coords = loadCoordinates()
        this.bot.pathfinder.stop()
        if (this.treePlacingInterval) {
            clearInterval(this.treePlacingInterval)
            this.treePlacingInterval = null
        }
        if (!coords.lever) {
            consola.warn('No lever position set.')
            return
        }
        const leverBlock = this.bot.blockAt(coords.lever)
        // consola.log(leverBlock)
        if (leverBlock && leverBlock.getProperties().powered == false) {
            await this.bot.activateBlock(leverBlock)
        }
        this.bot.pathfinder.setGoal(null)
        consola.info('Tree factory stopped.')
        this.bot.chat('Tree factory stopped.')
        treeEndTransition?.trigger()
    }

    onStateExited(): void {
        consola.info('BehaviorTreeFactory: onStateExited')
        this.bot.chat('BehaviorTreeFactory: onStateExited')
        if (this.targets.state == this.stateName) {
            this.targets.state = undefined
        }
    }
}