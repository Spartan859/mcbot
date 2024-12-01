import { Bot } from "mineflayer";
import { StateMachineTargets, StateTransition } from "mineflayer-statemachine";
import { comeState, idleState, initStates, MyTargets, sleepState, treeFactoryState } from "./states.js";
import consola from "consola";

export let treeEndTransition: StateTransition | null = null
export let treeStartTransition: StateTransition | null = null
export let comeStartTransition: StateTransition | null = null
export let comeEndTransition: StateTransition | null = null
export let sleepStartTransition: StateTransition | null = null
export let sleepEndTransition: StateTransition | null = null

export function getTransitions(bot: Bot, targets: MyTargets): StateTransition[] {
    const transitions: StateTransition[] = []
    if (!treeFactoryState || !idleState || !comeState || !sleepState) {
        throw new Error('States not initialized')
    }
    treeEndTransition = new StateTransition({
        parent: treeFactoryState,
        child: idleState,
    })
    transitions.push(treeEndTransition)
    treeStartTransition = new StateTransition({
        parent: idleState,
        child: treeFactoryState,
        shouldTransition: () => {
            return targets.state === treeFactoryState?.stateName
        }
    })
    transitions.push(treeStartTransition)
    comeStartTransition = new StateTransition({
        parent: idleState,
        child: comeState,
        shouldTransition: () => {
            return targets.state === 'come'
        }
    })
    transitions.push(comeStartTransition)
    comeEndTransition = new StateTransition({
        parent: comeState,
        child: idleState,
    })
    transitions.push(comeEndTransition)
    sleepStartTransition = new StateTransition({
        parent: idleState,
        child: sleepState,
        shouldTransition: () => {
            return targets.state === 'sleep'
        }
    })
    transitions.push(sleepStartTransition)
    sleepEndTransition = new StateTransition({
        parent: sleepState,
        child: idleState,
    })
    transitions.push(sleepEndTransition)
    return transitions
}