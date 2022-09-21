import { Sprite, Attack, Props as SpriteProps } from './sprite'
import gsap from 'gsap'
// import { Attack as AttackType } from '../../types'
import { AttackNames, Attack as AttackType } from '../../types'

export class Monster extends Sprite {
    health: number
    isEnemy: boolean
    name: string
    attacks: AttackType[]
    constructor({ health = 100, attacks, isEnemy = false, name, ...spriteProps }: Props) {
        super(spriteProps)
        this.health = health
        this.isEnemy = isEnemy
        this.name = name
        this.attacks = attacks
    }
    attack = ({ attack, recipient, renderSprites }: Attack) => {
        switch(attack.name) {
            case AttackNames.Fireball:
                if (attack.sprite) {
                    renderSprites.push(attack.sprite)
                    const fireballSpeed = 1 
                    gsap.to(attack.sprite, {
                        rotation: 5,
                        duration: fireballSpeed,
                    })
                    
                    gsap.to(attack.sprite.position, {
                        x: recipient.position.x,
                        y: recipient.position.y,
                        duration: fireballSpeed,
                        onComplete: () => {
                            recipient.damage(attack.damage)
                            renderSprites.pop()
                        }
                    })
                }
            break
            case AttackNames.Tackle:
                const tl = gsap.timeline()

                tl
                    .to(this.position, { x: this.position.x - 20 })
                    .to(this.position,
                        {
                            x: this.position.x + 40,
                            duration: 0.1,
                            onComplete: () => {
                                recipient.damage(attack.damage)
                            }
                        }
                    )
                    .to(this.position, { x: this.position.x - 20 })
            break
        }
    }
}

type Props = SpriteProps & {
    health?: number
    isEnemy?: boolean
    name: string
    attacks: AttackType[]
}