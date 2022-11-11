import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Shape } from '../../models/Shape';
import Button from '../Button/Button';
import styles from './Settings.module.css';

type Props = {
    shapes: Shape[],
    onClick: (shape: Shape) => void
}

export default function Settings({shapes, onClick}: Props) {
    return (
        <div className={styles.settingsBox}>
            <h3 style={{ margin: 0 }}>Instellingen</h3>
            <div className={styles.shapePicker}>
                {
                    shapes.map(option => {
                        return <Button key={option.id} price={option.price} active={option.selected} disabled={false} text={option.name} onClick={() => onClick(option)} width="100px" height='100px' icon={option.icon} iconColor={option.iconColor}></Button>
                    })
                }
            </div>
        </div>
    )
}