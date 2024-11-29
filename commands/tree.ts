import { Bot } from 'mineflayer'
import fs from 'fs'
import path from 'path'
import consola from 'consola'
import pathfinder from 'mineflayer-pathfinder'
import { distance, ROOT_DIR, sleep } from '../utils/utils.js'
import { Vec3 } from 'vec3'
import { StateTransition, BehaviorIdle, StateMachineTargets } from 'mineflayer-statemachine'
import { idleState, treeFactoryState } from '../states.js'
import { treeEndTransition, treeStartTransition } from '../transitions.js'

interface Coordinates {
    stand: Vec3 | null
    lever: Vec3 | null
    tree: Vec3 | null
}

const COORDS_FILE_PATH = path.join(ROOT_DIR, 'configs', 'tree_coords.json')
// if the file or directory does not exist, create it
if (!fs.existsSync(path.dirname(COORDS_FILE_PATH))) {
    fs.mkdirSync(path.dirname(COORDS_FILE_PATH), { recursive: true })
}

// Load coordinates from file
export function loadCoordinates(): Coordinates {
    if (fs.existsSync(COORDS_FILE_PATH)) {
        const data = fs.readFileSync(COORDS_FILE_PATH, 'utf8')
        const coords = JSON.parse(data) as Coordinates
        // Ensure to convert any raw x, y, z objects into Vec3
        if (coords.stand) coords.stand = new Vec3(coords.stand.x, coords.stand.y, coords.stand.z)
        if (coords.lever) coords.lever = new Vec3(coords.lever.x, coords.lever.y, coords.lever.z)
        if (coords.tree) coords.tree = new Vec3(coords.tree.x, coords.tree.y, coords.tree.z)
        return coords
    }
    return { stand: null, lever: null, tree: null }
}

// Save coordinates to file
export function saveCoordinates(coords: Coordinates): void {
    // Convert Vec3 back to plain objects before saving
    const saveData = {
        stand: coords.stand ? { x: coords.stand.x, y: coords.stand.y, z: coords.stand.z } : null,
        lever: coords.lever ? { x: coords.lever.x, y: coords.lever.y, z: coords.lever.z } : null,
        tree: coords.tree ? { x: coords.tree.x, y: coords.tree.y, z: coords.tree.z } : null
    }
    fs.writeFileSync(COORDS_FILE_PATH, JSON.stringify(saveData, null, 2), 'utf8')
}

// Command handler for "tree setstand"
export function handleSetStand(bot: Bot, x: number, y: number, z: number): void {
    const coords = loadCoordinates()
    coords.stand = new Vec3(x, y, z)
    saveCoordinates(coords)
    consola.info(`Stand position set to: ${x}, ${y}, ${z}`)
    bot.chat(`Stand position set to: ${x}, ${y}, ${z}`)
}

// Command handler for "tree setlever"
export function handleSetLever(bot: Bot, x: number, y: number, z: number): void {
    const coords = loadCoordinates()
    coords.lever = new Vec3(x, y, z)
    saveCoordinates(coords)
    consola.info(`Lever position set to: ${x}, ${y}, ${z}`)
    bot.chat(`Lever position set to: ${x}, ${y}, ${z}`)
}

export function handleSetTree(bot: Bot, x: number, y: number, z: number): void {
    const coords = loadCoordinates()
    coords.tree = new Vec3(x, y, z)
    saveCoordinates(coords)
    consola.info(`Tree position set to: ${x}, ${y}, ${z}`)
    bot.chat(`Tree position set to: ${x}, ${y}, ${z}`)
}

// Command handler for "tree start"
export async function handleStart(bot: Bot): Promise<void> {
    treeStartTransition?.trigger()
}

// Command handler for "tree stop"
export async function handleStop(bot: Bot): Promise<void> {
    treeEndTransition?.trigger()
}

export function treeHandler(bot: Bot, message: string): void {
    const split = message.split(' ')
    split.shift()

    if (split[0] == 'setstand' && split.length === 4) {
        const x = Number(split[1])
        const y = Number(split[2])
        const z = Number(split[3])
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
            handleSetStand(bot, x, y, z)
        }
    }

    else if (split[0] == 'setlever' && split.length === 4) {
        const x = Number(split[1])
        const y = Number(split[2])
        const z = Number(split[3])
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
            handleSetLever(bot, x, y, z)
        }
    }

    else if (split[0] == 'settree' && split.length === 4) {
        const x = Number(split[1])
        const y = Number(split[2])
        const z = Number(split[3])
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
            handleSetTree(bot, x, y, z)
        }
    }

    else if (split[0] === 'start') {
        handleStart(bot)
    }

    else if (split[0] === 'stop') {
        handleStop(bot)
    }

    else {
        consola.warn(`Unknown tree command: ${message}`)
    }
}
