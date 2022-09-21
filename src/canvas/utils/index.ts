import { AttackNames, AttackTypes, MonstersName } from '../../types'
import draggleImage from '../images/draggleSprite.png'
import embyImage from '../images/embySprite.png'

export const attacks = {
    [AttackNames.Tackle]: {
        name: AttackNames.Tackle,
        damage: 10,
        type: AttackTypes.Normal
    },
    [AttackNames.Fireball]: {
        name: AttackNames.Fireball,
        damage: 25,
        type: AttackTypes.Fire,
    }
}

export const monsters = {
    [MonstersName.Draggle]: {
        position: { x: 800, y: 100 },
        imageSrc: draggleImage,
        framesMax: 4,
        animate: true,
        framesHold: 20,
        attacks: [attacks[AttackNames.Tackle]],
        name: MonstersName.Draggle,
    },
    [MonstersName.Emby]: {
        position: { x: 280, y: 325 },
        imageSrc: embyImage,
        framesMax: 4,
        animate: true,
        framesHold: 20,
        attacks: [attacks[AttackNames.Tackle], attacks[AttackNames.Fireball]],
        name: MonstersName.Emby,
    }
}

