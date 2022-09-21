import { createRef, PureComponent, MouseEvent } from 'react'
import memoizeOne from 'memoize-one'
import throttle from 'lodash/throttle'

import { Canvas } from './canvas'
import { AttackNames, Battle, Attack } from './types'
import { config } from './config'
import { Boundary, Sprite, Monster } from './canvas/sprites'
import { keysStore } from './store/keys'
import { KeyboardKeys } from './types'
import { collisions, battleZonesData, charactersMapData } from './canvas/data/town'
import { BattleTransition, BattleTransitionRef } from './components/battle-transition'
import { BattleMenu } from './components/battle-menu'
import { attacks, monsters } from './canvas/utils'

import playerDownImage from './canvas/images/playerDown.png'
import playerUp from './canvas/images/playerUp.png'
import playerLeft from './canvas/images/playerLeft.png'
import playerRight from './canvas/images/playerRight.png'
import battleBackgroundImage from './canvas/images/battleBackground.png'
import villagerImage from './canvas/images/villager/Idle.png'
import oldManImage from './canvas/images/oldMan/Idle.png'


import foregroundImage from './canvas/images/foreground.png'
import backgroundImage from './canvas/images/town.png'

import fireballImage from './canvas/images/fireball.png'

const { mapHeight, mapWidth } = config

const offset = { x: 735, y: 620 }

const speed = 6

const initialBackground = { position: { x: 0, y: 0 }, imageSrc: backgroundImage, offset: { x: offset.x, y: offset.y } }
const initialBattleBackground = { position: { x: 0, y: 0 }, imageSrc: battleBackgroundImage }

const initialPlayer = {
  position: { x: mapWidth / 2 - 192 / 4 / 2 , y: mapHeight / 2 - 68 / 2 },
  imageSrc: playerDownImage,
  framesMax: 4,
  sprites: {
    up: {
      imageSrc: playerUp,
      framesMax: 4,
    },
    down: {
      imageSrc: playerDownImage,
      framesMax: 4,
    },
    left: {
      imageSrc: playerLeft,
      framesMax: 4,
    },
    right: {
      imageSrc: playerRight,
      framesMax: 4,
    }
  },
  animate: true,
}

const background = new Sprite(initialBackground)
const battleBackground = new Sprite(initialBattleBackground)

const player = new Sprite(initialPlayer)
const foreground = new Sprite({...initialBackground, imageSrc: foregroundImage })

const draggle = new Monster(monsters.Draggle)
const emby = new Monster(monsters.Emby)

let lastKey: KeyboardKeys

const collisionsMap = []
for (let i = 0, len = collisions.length; i < len; i+= 70) {
  collisionsMap.push(collisions.slice(i, 70 + i))
}

const battleZonesMap = []
for (let i = 0, len = battleZonesData.length; i < len; i+= 70) {
  battleZonesMap.push(battleZonesData.slice(i, 70 + i))
}

const charactersMap = []
for (let i = 0; i < charactersMapData.length; i += 70) {
  charactersMap.push(charactersMapData.slice(i, 70 + i))
}

const characters: Sprite[] = []
const boundaries: Boundary[] = []

charactersMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    // 1026 === villager
    if (symbol === 1026) {
      characters.push(
        new Sprite({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          },
          imageSrc: villagerImage,
          framesHold: 60,
          framesMax: 4,
          scale: 3,
          animate: true
        })
      )
    }
    // 1031 === oldMan
    else if (symbol === 1031) {
      characters.push(
        new Sprite({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          },
          imageSrc: oldManImage,
          framesHold: 60,
          framesMax: 4,
          scale: 3,
        })
      )
    }

    if (symbol !== 0) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
    }
  })
})

const battleZones: Boundary[] = []

battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025) {
      battleZones.push(new Boundary({
        position: {
          x: j * Boundary.width - offset.x,
          y: i * Boundary.height - offset.y,
        }
      }))
    }
  })
})

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025) {
      boundaries.push(new Boundary({
        position: {
          x: j * Boundary.width - offset.x,
          y: i * Boundary.height - offset.y,
        }
      }))
    }
  })
})

// const movables = [background, ...boundaries, ...battleZones]

const movables = [
  background,
  ...boundaries,
  // foreground,
  ...battleZones,
  ...characters
]
const renderables = [
  background,
  ...boundaries,
  ...battleZones,
  ...characters,
  player,
  foreground
]

export default class App extends PureComponent<Props, State> {

  battle: Battle = { initiated: false }
  battleTransition = createRef<BattleTransitionRef>()

  canvas = createRef<HTMLCanvasElement>()
  ctx: CanvasRenderingContext2D | null = null
  animationFrameId: ReturnType<typeof requestAnimationFrame> = 0
  battleMenuAttacks: Attack[]
  renderSprites: Sprite[] = [emby, draggle]

  constructor(props: Props) {
    super(props)
    this.battleMenuAttacks = emby.attacks
  }

  componentDidMount() {
    if (this.canvas.current) {
      this.ctx = this.canvas.current.getContext('2d')
    }
    this.animate()
    // this.animateBattle()

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.animationFrameId)
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('keyup', onKeyUp)
  }
  
  animate = () => {
    this.animationFrameId = window.requestAnimationFrame(this.animate)

    this.draw()
  }

  animateBattle = () => {
    this.animationFrameId = window.requestAnimationFrame(this.animateBattle)

    this.drawBattle()
  }

  getOverlappingAreaMemoize = memoizeOne((zoneX: number, zoneY: number, zoneW: number, zoneH: number) => {
    return (
      (Math.min(
        player.position.x + player.width,
        zoneX + zoneW
      ) -
        Math.max(player.position.x, zoneX)) *
      (Math.min(
        player.position.y + player.height,
        zoneY + zoneH
      ) -
        Math.max(player.position.y, zoneY))
    )
  })

  isInBattleZone = throttle(() => {
    for (let i = 0, len = battleZones.length; i < len; i++) {
      const battleZone = battleZones[i]
      if (rectangularCollisions(player, battleZone) && Math.random() < 0.1 &&
        this.getOverlappingAreaMemoize(battleZone.position.x, battleZone.position.y, battleZone.width, battleZone.height) > (player.width * player.height) / 2
      ) {
        window.cancelAnimationFrame(this.animationFrameId)
        this.battle.initiated = true
        this.battleTransition.current?.start()
        break
      }
    }
  }, 100)

  move = () => {
    let moving = true
    player.animate = false
    if (this.battle.initiated) return

    if (keysStore[KeyboardKeys.ArrowUp].pressed && lastKey === KeyboardKeys.ArrowUp) {
      player.animate = true
      player.switchSprites('up')
        for (let i = 0, len = boundaries.length; i < len; i++) {
          const boundary = boundaries[i]
          if (rectangularCollisions(player, { ...boundary, position: { x: boundary.position.x, y: boundary.position.y + speed } })) {
            moving = false
            break
          }
        }
        if (moving) {
          movables.forEach((movable) => {
            movable.position.y += speed
          })
        }
    } else if (keysStore[KeyboardKeys.ArrowRight].pressed && lastKey === KeyboardKeys.ArrowRight) {
      player.animate = true
      player.switchSprites('right')
      for (let i = 0, len = boundaries.length; i < len; i++) {
        const boundary = boundaries[i]
        if (rectangularCollisions(player, { ...boundary, position: { x: boundary.position.x - speed, y: boundary.position.y } })) {
          moving = false
          break
        }
      }
      if (moving) {
        movables.forEach((movable) => {
          movable.position.x -= speed
        })
      }
    } else if (keysStore[KeyboardKeys.ArrowLeft].pressed && lastKey === KeyboardKeys.ArrowLeft) {
      player.animate = true
      player.switchSprites('left')
      for (let i = 0, len = boundaries.length; i < len; i++) {
        const boundary = boundaries[i]
        if (rectangularCollisions(player, { ...boundary, position: { x: boundary.position.x + speed, y: boundary.position.y } })) {
          moving = false
          break
        }
      }
      if (moving) {
        movables.forEach((movable) => {
          movable.position.x += speed
        })
      }
    } else if (keysStore[KeyboardKeys.ArrowDown].pressed && lastKey === KeyboardKeys.ArrowDown) {
      player.animate = true
      player.switchSprites('down')
      for (let i = 0, len = boundaries.length; i < len; i++) {
        const boundary = boundaries[i]
        if (rectangularCollisions(player, { ...boundary, position: { x: boundary.position.x, y: boundary.position.y - speed } })) {
          moving = false
          break
        }
      }
      if (moving) {
        movables.forEach((movable) => {
          movable.position.y -= speed
        })
      }
    }
    if (moving) {
      this.isInBattleZone()
    }
  }

  drawBattle = () => {
    const { ctx, canvas } = this
    battleBackground.draw(ctx!, canvas.current!)
    // draggle.update(ctx!, canvas.current!)
    // emby.update(ctx!, canvas.current!)
    this.renderSprites.forEach((sprite) => {
      sprite.update(ctx!, canvas.current!)
    })
  }

  draw = () => {
    const { ctx, canvas } = this
    // console.log(this.animationFrameId)
    // background.draw(ctx!, canvas.current!)
    // player.update(ctx!, canvas.current!)
    // foreground.draw(ctx!, canvas.current!)
    renderables.forEach((renderable) => {
      renderable.update(ctx!, canvas.current!)
    })
    this.move()
    // ctx!.fillStyle = 'red'
        
    // ctx!.fillRect(500, 500, Boundary.width, Boundary.height)
    // boundaries.forEach(b => {
    //   b.draw(ctx!, canvas.current!)
    // })
    // this.draw()
  }

  onCompletedBattleTransition = () => {
    this.animateBattle()
  }

  onFireballAttack = () => {
    emby.attack({
      attack: {
        ...attacks[AttackNames.Fireball],
        sprite: new Sprite({
          position: { x: emby.position.x, y: emby.position.y },
          imageSrc: fireballImage,
          framesMax: 4,
          framesHold: 10,
          animate: true,
          rotation: 1,
        })
      },
      recipient: draggle,
      renderSprites: this.renderSprites,
    })
  }

  onTackle = () => {
    emby.attack({
      attack: attacks[AttackNames.Tackle],
      recipient: draggle,
      renderSprites: this.renderSprites,
    })
  }

  handleAttack = ({ target }: MouseEvent<HTMLDivElement>) => {
    const attackName = (target as HTMLDivElement).id as AttackNames
    if (!attackName) return

    switch (attackName) {
      case AttackNames.Fireball:
        return this.onFireballAttack()
      case AttackNames.Tackle:
        return this.onTackle()
      default:
        return
    }
  }

  render () {
    return (
      <div className="main-wrapper">
        <BattleTransition onCompleted={this.onCompletedBattleTransition} ref={this.battleTransition} />
        <Canvas width={mapWidth} height={mapHeight} ref={this.canvas}/>
        <BattleMenu attacks={this.battleMenuAttacks} onAttack={this.handleAttack} />
      </div> 
    )
  }

}

type Props = {}
type State = {

}

function rectangularCollisions (rect1: Sprite, rect2: Boundary) {
  return (
    rect1.position.x + rect1.width >= rect2.position.x &&
    rect1.position.x <= rect2.position.x + rect2.width &&
    rect1.position.y <= rect2.position.y + rect2.height &&
    rect1.position.y + rect1.height >= rect2.position.y
  )
}

const onKeyDown = ({ key, repeat }: KeyboardEvent) => {
  if (repeat) return
  switch (key) {
    case KeyboardKeys.ArrowRight:
      keysStore[KeyboardKeys.ArrowRight].pressed = true
      lastKey = KeyboardKeys.ArrowRight
      break
    case KeyboardKeys.ArrowLeft:
      keysStore[KeyboardKeys.ArrowLeft].pressed = true
      lastKey = KeyboardKeys.ArrowLeft
      break
    case KeyboardKeys.ArrowUp:
      keysStore[KeyboardKeys.ArrowUp].pressed = true
      lastKey = KeyboardKeys.ArrowUp
      break
    case KeyboardKeys.ArrowDown:
      keysStore[KeyboardKeys.ArrowDown].pressed = true
      lastKey = KeyboardKeys.ArrowDown
      break
  }
}
const onKeyUp = ({ key }: KeyboardEvent) => {

  switch (key) {
    case KeyboardKeys.ArrowRight:
      keysStore[KeyboardKeys.ArrowRight].pressed = false
    break
    case KeyboardKeys.ArrowLeft:
      keysStore[KeyboardKeys.ArrowLeft].pressed = false
    break
    case KeyboardKeys.ArrowDown:
      keysStore[KeyboardKeys.ArrowDown].pressed = false
    break
    case KeyboardKeys.ArrowUp:
      keysStore[KeyboardKeys.ArrowUp].pressed = false
    break
  }
}
