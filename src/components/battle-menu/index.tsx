import { memo, MouseEvent } from 'react'
import { Attack } from '../../types'
import styles from './styles.module.scss'

export const BattleMenu = memo(({ attacks, onAttack }: Props) => {
    return (
        <div className={styles.wrapper} onClick={onAttack}>
            {attacks.map(({ name }) => <button id={name} key={name}>{name}</button>)}
        </div>
    )
})

export type Props = {
    attacks: Attack[]
    onAttack: (e: MouseEvent<HTMLDivElement>) => void
}