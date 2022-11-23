import { useCallback, useEffect, useState } from 'react';
import styles from './Game.module.css';
import Settings from '../components/Settings/Settings';
import { Shape } from '../models/Shape';
import { BuildingProps } from '../models/BuildingProps';
import Building from '../components/Building/Building';
import { shapes } from '../config/Shapes';
import { createBuilding } from '../utils/BuildingUtils';
import Resources from '../components/Resources/Resources';
import { Inventory } from '../models/Inventory';
import useInterval from '../hooks/useInterval';
import { ObjectProps } from '../models/ObjectProps';
import MapObject from '../components/MapObject/MapObject';
import { VillagerProps } from '../models/VillagerProps';
import Villager from '../components/Villager/Villager';
import UpgradeMenu from '../components/UpgradeMenu/UpgradeMenu';
import { reduceResourcesFromInventory, canAfford } from '../utils/ResourceUtils';
import { setInitialBuildings, setInitialInventory, setInitialMapObjects } from '../utils/GameUtils';
import { doMoveToLocation } from '../utils/MovementUtils';
import { doWoodcutting } from '../utils/villagerUtils/LumberjackUtils';
import { executeTasks } from '../utils/StatusUtils';
import { InventoryItem } from '../models/InventoryItem';

const Game = (map: any) => {
    const [villagers, setVillagers] = useState<VillagerProps[]>([]);
    const [buildings, setBuildings] = useState<BuildingProps[]>([]);
    const [mapObjects, setMapObjects] = useState<ObjectProps[]>([])
    const [allShapes, setAllShapes] = useState<Shape[]>(shapes);
    const [inventory, setInventory] = useState<Inventory>({ resources: [] });
    const [gameTick, setGameTick] = useState(0);

    useInterval(() => {
        // GAME LOOP
        setGameTick((prev) => prev + 1);
    }, 50);

    var selectedShape = allShapes.find(x => x.selected);
    var selectedBuilding = buildings.find(x => x.selected);
    var selectedVillager = villagers.find(x => x.selected);
    var selectedMapObject = mapObjects.find(x => x.selected);

    useEffect(() => {
        let result = executeTasks(villagers, inventory.resources, mapObjects, buildings);
        if (result.buildings) {
            setBuildings(result.buildings);
        }
        if (result.inventoryItems) {
            setInventory((prev) => { return { ...prev, resources: result.inventoryItems! } });
        }
        if (result.mapObjects) {
            setMapObjects(result.mapObjects);
        }
        if (result.villagers) {
            setVillagers(result.villagers);
        }
    }, [gameTick]);


    useEffect(() => {
        setInventory(setInitialInventory()!);
        setBuildings(setInitialBuildings()!);
        setMapObjects((prev) => setInitialMapObjects(map));
    }, [map]);

    function addBuilding(building?: BuildingProps) {
        console.log(building);
        if (!building) return;
        let shapesCopy = [...shapes];
        setBuildings((previous) => {
            let toReturn = previous.map(building => {
                return {...building, selected: false}
            })
            toReturn.push(building);
            console.log(toReturn);
            return toReturn;
        })
        shapesCopy.forEach(x => x.selected = false);
        setAllShapes(shapesCopy);
    }

    useEffect(() => {
        console.log(buildings);
    }, [buildings])

    const trainVillager = useCallback((villager: VillagerProps) => {
        let villagersCopy = [...villagers];
        villagersCopy.push(villager);
        setVillagers((prev) => villagersCopy);
    }, [villagers])

    const selectShape = useCallback((shape: Shape) => {
        let shapesCopy = [...allShapes];
        let selectedShape = shapesCopy.find(x => x.name == shape.name);
        if (selectedShape) {
            selectedShape.selected = !selectedShape?.selected;
        }
        shapesCopy.filter(x => x.id !== shape.id).forEach(x => x.selected = false);
        setAllShapes((prev) => shapesCopy);
    }, [allShapes]);

    // Deselect other, and select given
    const deselectAllBut = useCallback((event: any, toSelectId: string) => {
        event.stopPropagation();
        setMapObjects((previous) => {
            return previous.map(mapObject => {
                if (mapObject.id === toSelectId) return { ...mapObject, selected: true }
                return { ...mapObject, selected: false }
            })
        });
        setVillagers((previous) => {
            return previous.map(villager => {
                if (villager.id === toSelectId) return { ...villager, selected: true };
                return { ...villager, selected: false };
            })
        });
        setBuildings((previous) => {
            return previous.map(building => {
                if (building.id === toSelectId) return { ...building, selected: true };
                return { ...building, selected: false };
            })
        });
    }, [buildings, villagers, mapObjects])

    // Left click handler
    function handleClick(event: any): any {
        if (!selectedShape || !canAfford(inventory?.resources, selectedShape.price)) {
            let buildingsCopy = [...buildings];
            buildingsCopy.forEach(x => x.selected = false);
            setBuildings((prev) => buildingsCopy);

            let villagersCopy = [...villagers];
            villagersCopy.forEach(x => x.selected = false);
            setVillagers((prev) => villagersCopy);

            let mapObjectsCopy = [...mapObjects];
            mapObjectsCopy.forEach(x => x.selected = false);
            setMapObjects((prev) => mapObjectsCopy);
            return;
        };

        let clientRect = event.currentTarget.getBoundingClientRect();
        let xPos = event.pageX - clientRect.left;
        let yPos = event.pageY - clientRect.top;

        let building: BuildingProps | undefined = createBuilding({ x: xPos, y: yPos }, selectedShape.type);
        if (building) {
            let result = reduceResourcesFromInventory(inventory!, building.price);
            if (result[1]) {
                setInventory((prev) => result[0]);
                addBuilding(building);
            }
        }
    }

    // Right click handler
    const handleRightClick = useCallback((event: any) => {
        event.preventDefault();
        let clientRect = event.currentTarget.getBoundingClientRect();
        let xPos = event.pageX - clientRect.left;
        let yPos = event.pageY - clientRect.top;
        if (selectedVillager) {
            selectedVillager.currentTask = (villagers: VillagerProps[], villagerId: string, inventoryItems: InventoryItem[], buildings: BuildingProps[], mapObjects: ObjectProps[]) => doMoveToLocation(villagers, villagerId, inventoryItems, buildings, mapObjects, { x: xPos, y: yPos })
        }
    }, [selectedVillager, villagers])

    const onTrain = useCallback((entity: any) => {
        let result = reduceResourcesFromInventory(inventory, entity.price);
        if (result[1]) {
            setInventory(result[0]);
            trainVillager(entity);
        }
        return entity;
    }, [inventory, villagers])

    function handleVillagerRightClick() {

    }

    const handleMapObjectRightClick = useCallback((event: any, mapObjectId: string) => {
        event.stopPropagation();
        event.preventDefault();
        if (selectedVillager && selectedVillager.professions.find(x => x.active)?.profession.name === 'Lumberjack') {
            selectedVillager.currentTask = (villagers: VillagerProps[], villagerId: string, inventoryItems: InventoryItem[], buildings: BuildingProps[], mapObjects: ObjectProps[]) => doWoodcutting(villagers, villagerId, inventoryItems, buildings, mapObjects, mapObjectId);
        }
    }, [mapObjects, selectedVillager])

    const handleBuildingRightClick = useCallback((event: any) => {
    }, [selectedBuilding])


    const handleChangeProfessionClick = useCallback((updatedVillager: VillagerProps) => {
        let villagersCopy = [...villagers];
        villagersCopy = villagersCopy.map(vill => {
            if (vill.id === updatedVillager.id) return updatedVillager;
            return vill;
        });
        setVillagers((prev) => villagersCopy);
    }, [selectedVillager])

    return (
        <div className={styles.background}>
            <div className={styles.actionsArea}>
                <div className={styles.actions} onClick={event => event.stopPropagation()}>
                    <Settings onClick={selectShape} shapes={allShapes}></Settings>
                    {(selectedBuilding) ? <UpgradeMenu inStock={undefined} onTrain={onTrain} selectedBuilding={selectedBuilding} selectedVillager={undefined} selectedMapObject={undefined}></UpgradeMenu> : <></>}
                    {(selectedVillager) ? <UpgradeMenu onProfessionChange={handleChangeProfessionClick} inStock={selectedVillager.inventoryItems} onTrain={onTrain} selectedBuilding={undefined} selectedVillager={selectedVillager} selectedMapObject={undefined}></UpgradeMenu> : <></>}
                    {(selectedMapObject) ? <UpgradeMenu inStock={selectedMapObject.inventory} onTrain={onTrain} selectedBuilding={undefined} selectedVillager={undefined} selectedMapObject={selectedMapObject}></UpgradeMenu> : <></>}
                </div>
            </div>
            <div className={styles.gameArea} onClick={handleClick} onContextMenu={handleRightClick}>
                <div className={styles.resourceArea}>
                    {(inventory) ? <Resources inventory={inventory}></Resources> : <></>}
                </div>

                {(buildings) ? buildings?.map((building, index) => {
                    if (building) {
                        return <Building key={building.id} {...building} onClick={deselectAllBut} onRightClick={handleBuildingRightClick}></Building>
                    }
                }) : <></>
                }
                {(mapObjects) ? mapObjects?.map((mapObject, index) => {
                    if (mapObject) {
                        return <MapObject key={mapObject.id} {...mapObject} onClick={deselectAllBut} onRightClick={handleMapObjectRightClick}></MapObject>
                    }
                }) : <></>
                }
                {(villagers) ? villagers?.map((villager, index) => {
                    if (villager) {
                        return <Villager key={villager.id} {...villager} onClick={deselectAllBut}></Villager>
                    }
                }) : <></>
                }
            </div>
        </div>
    );
}
export default Game;