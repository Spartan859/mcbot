import { Bot } from "mineflayer";
import { StateMachineTargets, StateTransition } from "mineflayer-statemachine";
import { idleState, initStates, treeFactoryState } from "./states.js";
import consola from "consola";

export let treeEndTransition: StateTransition | null = null
export let treeStartTransition: StateTransition | null = null

export function getTransitions(bot: Bot, targets: StateMachineTargets): StateTransition[] {
    const transitions: StateTransition[] = []
    if (!treeFactoryState || !idleState) {
        throw new Error('States not initialized')
    }
    treeEndTransition = new StateTransition({
        parent: treeFactoryState,
        child: idleState,
        onTransition: () => {
            consola.info('Tree factory stopped.')
            bot.chat('Tree factory stopped.')
        }
    })
    transitions.push(treeEndTransition)
    treeStartTransition = new StateTransition({
        parent: idleState,
        child: treeFactoryState,
        onTransition: () => {
            consola.info('Tree factory started.')
            bot.chat('Tree factory started.')
        }
    })
    transitions.push(treeStartTransition)
    return transitions
}