import { BehaviorIdle, StateMachineTargets } from "mineflayer-statemachine";
import { BehaviorTreeFactory } from "./behaviors/behaviorTreeFactory.js";
import { Bot } from "mineflayer";
import { BehaviorCome } from "./behaviors/behaviorCome.js";
import { BehaviorSleep } from "./behaviors/behaviorSleep.js";

export let treeFactoryState: BehaviorTreeFactory | null = null
export let idleState: BehaviorIdle | null = null
export let comeState: BehaviorCome | null = null
export let sleepState: BehaviorSleep | null = null

export interface MyTargets extends StateMachineTargets {
    state?: string,
}
export let targets: MyTargets = {}


export function initStates(bot: Bot, targets: MyTargets): void {
    treeFactoryState = new BehaviorTreeFactory(bot, targets)
    idleState = new BehaviorIdle()
    comeState = new BehaviorCome(bot, targets)
    sleepState = new BehaviorSleep(bot, targets)
}