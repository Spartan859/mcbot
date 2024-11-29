import { BehaviorIdle, StateMachineTargets } from "mineflayer-statemachine";
import { BehaviorTreeFactory } from "./behaviors/behaviorTreeFactory.js";
import { Bot } from "mineflayer";

export let treeFactoryState: BehaviorTreeFactory | null = null
export let idleState: BehaviorIdle | null = null

export function initStates(bot: Bot, targets: StateMachineTargets): void {
    treeFactoryState = new BehaviorTreeFactory(bot, targets)
    idleState = new BehaviorIdle()
}