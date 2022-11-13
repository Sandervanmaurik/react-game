import React, { useEffect, useState } from 'react';
import { BuildingOption } from '../../models/BuildingOption';
import { BuildingProps } from '../../models/BuildingProps';
import { VillagerProps } from '../../models/VillagerProps';
import { trainVillager } from '../../utils/BuildingOptionsUtil';
import { getBuildingOptions } from '../../utils/BuildingUtils';
import { getImageUrl } from '../../utils/MapUtils';
import Button from '../Button/Button';
import styles from './UpgradeMenu.module.css';

type Props = {
    selectedBuilding: BuildingProps,
    onAddVillager: (villager: VillagerProps) => void
}

export default function UpgradeMenu({ selectedBuilding, onAddVillager }: Props) {

    const [buildingOptions, setBuildingOptions] = useState<BuildingOption[]>([]);


    useEffect(() => {    
        // get building options for building.
        let x = getBuildingOptions(selectedBuilding);
        setBuildingOptions(x);
        console.log(x);
    }, []);

    function trainVillager(villager: VillagerProps){
        onAddVillager(villager);
    }
    

    return (
        <div className={styles.upgradeMenu}>
            <div className={styles.titleSection}>
                <span className={styles.name}>{selectedBuilding.name}</span>
                <div className={styles.levelSection}>
                    <span>{selectedBuilding.level}</span>
                </div>
            </div>
            <div className={styles.buildingOptionsSection}>
                {buildingOptions.map(x => {
                    return <Button icon={x.icon} active={false} disabled={false} height='75px' width='75px' onClick={() => trainVillager(x.toExecute(selectedBuilding.position))} text={x.name}></Button>
                })}
            </div>
        </div>
    )
}