import { Sprite as SpriteInstance } from './canvas/sprites'
import { attacks } from './canvas/utils'

export type Draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, frameCount?: ReturnType<typeof requestAnimationFrame>) => void

export type Position = {
    x: number;
    y: number;
}

export type Velocity = {
    x: number;
    y: number;
}

export type AttackBox = {
    position: Position;
    width: number;
    height: number;
    offset: AttackBoxOffset;
}

export type AttackBoxInit = {
    width: number;
    height: number;
    offset: AttackBoxOffset;
}

export type AttackBoxOffset = {
    x: number;
    y: number;
}

export type Offset = {
    x: number;
    y: number;
}

export type Sprite = {
    imageSrc: string;
    framesMax: number;
    image?: HTMLImageElement;
}

export type Sprites = {
    up: Sprite;
    left: Sprite;
    right: Sprite;
    down: Sprite;
}

export enum KeyboardKeys {
    Right = 'd',
    Left = 'a',
    Up = 'w',
    ArrowRight = 'ArrowRight',
    ArrowLeft = 'ArrowLeft',
    ArrowUp = 'ArrowUp',
    ArrowDown = 'ArrowDown',
    Space = ' ',
}

export type Battle = {
    initiated: boolean
}

export type Attack = {
    name: AttackNames
    damage: number
    type: AttackTypes
    sprite?: SpriteInstance
}

export enum AttackNames {
    Tackle = 'Tackle',
    Fireball = 'Fireball'
}

export enum AttackTypes {
    Normal = 'Normal',
    Fire = 'Fire'
}

export enum MonstersName {
    Emby = 'Emby',
    Draggle = 'Draggle',
}
