import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import BuySection from "../../components/BuySection/BuySection";
import EntityWrapper from "../../components/EntityWrapper/EntityWrapper";
import PlacementOverlay from "../../components/PlacementOverlay/PlacementOverlay";
import Resources from "../../components/Resources/Resources";
import UpgradeMenu from "../../components/UpgradeMenu/UpgradeMenu";
import Villager from "../../components/Villager/Villager";
import { shapes } from "../../config/Shapes";
import { useBuildings } from "../../hooks/useBuildings";
import useInterval from "../../hooks/useInterval";
import { useInventory } from "../../hooks/useInventory";
import { useMapObjects } from "../../hooks/useMapObjects";
import { useVillagers } from "../../hooks/useVillagers";
import { BuildingOption } from "../../models/BuildingOption";
import { BuildingProps } from "../../models/BuildingProps";
import { EntityElementType } from "../../models/EntityElementType";
import { InventoryItem } from "../../models/InventoryItem";
import { ObjectProps } from "../../models/ObjectProps";
import { PlacementOverlayConfig } from "../../models/PlacementOverlayConfig";
import { Position } from "../../models/Position";
import { Shape } from "../../models/Shape";
import { Size } from "../../models/Size";
import { VillagerProfession } from "../../models/VillagerProfession";
import { VillagerProps } from "../../models/VillagerProps";
import { Availability } from "../../models/enums/Availability";
import { Status } from "../../models/enums/Status";
import { createBuilding } from "../../utils/BuildingUtils";
import { doMoveToLocation } from "../../utils/MovementUtils";
import { reduceResourcesFromInventory } from "../../utils/ResourceUtils";
import { executeTasks } from "../../utils/StatusUtils";
import { doGatheringTask } from "../../utils/villagerUtils/VillagerTaskUtils";
import styles from "./Game.module.css";
type props = {
  initialMapObjects: ObjectProps[];
};

const Game = ({ initialMapObjects }: props) => {
  const { buildings, addBuilding, setBuildings, selectBuilding, deselectAllBuildings } = useBuildings();
  const { mapObjects, createMapObjects, setMapObjects, selectMapObject, deselectAllMapObjects } = useMapObjects();
  const { villagers, setVillagers } = useVillagers();
  const { inventory, setInventory } = useInventory();

  const [allShapes, setAllShapes] = useState<Shape[]>(shapes.filter((x) => x.availability === Availability.GAME_LEVEL1));
  const [gameTick, setGameTick] = useState(0);
  const [placementOverlayConfig, setPlacementOverlayConfig] = useState<PlacementOverlayConfig | undefined>();
  const [gameSpeed, setGameSpeed] = useState(1);
  const settingsAreaWidth = "240px";

  useInterval(() => {
    // GAME LOOP
    setGameTick((prev) => prev + 1);
  }, 50 / gameSpeed);

  var selectedShape = allShapes.find((shape) => shape.selected);
  var selectedBuilding = buildings.find((building) => building.selected);
  var selectedVillager = villagers.find((villager) => villager.selected);
  var selectedMapObject = mapObjects.find((mapObject) => mapObject.selected);

  useEffect(() => {
    let result = executeTasks(villagers, inventory.resources, mapObjects, []);
    if (result.buildings) {
      setBuildings(result.buildings);
    }
    if (result.inventoryItems) {
      setInventory({ ...inventory, resources: result.inventoryItems! });
    }
    if (result.mapObjects) {
      setMapObjects(result.mapObjects);
      // setMapObjects(result.mapObjects);
    }
    if (result.villagers) {
      setVillagers(result.villagers);
    }
  }, [gameTick]);

  useEffect(() => {
    createMapObjects(initialMapObjects);
  }, []);

  const trainVillager = useCallback((villager: VillagerProps) => {
    const updatedVillagers = [...villagers].concat([villager]);
    setVillagers(updatedVillagers);
  }, []);

  const selectShape = useCallback((shapeId: string) => {
    setAllShapes((prev) => {
      return prev.map((x) => {
        if (x.id === shapeId) {
          return { ...x, selected: !x.selected ? true : false };
        }
        return { ...x, selected: false };
      });
    });
  }, []);

  useEffect(() => {
    let _selectedShape = allShapes.find((x) => x.selected);
    if (!_selectedShape) {
      setPlacementOverlayConfig((prev) => {
        return { ...prev, show: false };
      });
    } else {
      setPlacementOverlayConfig((prev) => {
        return { ...prev, show: true, fullscreen: true, selectedShape: _selectedShape };
      });
    }
  }, [allShapes]);

  const deselectAllBut = (event: any, toSelectId: string) => {
    // event.stopPropagation();
    // const newMapObjects = mapObjects.map((mapObject) => {
    //   if (mapObject.component.props.id === toSelectId) return { ...mapObject, selected: true };
    //   return { ...mapObject, selected: false };
    // });
    // setMapObjects(newMapObjects);
    // const newVillagers = villagers.map((villager) => {
    //   if (villager.id === toSelectId) return { ...villager, selected: true };
    //   return { ...villager, selected: false };
    // });
    // setVillagers(newVillagers);
    // const newBuildings = buildings.map((building) => {
    //   if (building.component.props.id === toSelectId) return { ...building, selected: true };
    //   return { ...building, selected: false };
    // });
    // setBuildings(newBuildings);
    // setAllShapes((prev) => {
    //   return prev.map((x) => {
    //     return { ...x, selected: false };
    //   });
    // });
  };

  // Left click handler
  function handleClick(event: any): any {
    // if (!selectedShape || !canAfford(inventory?.resources, selectedShape.price)) {
    // const newBuildings = buildings.map((x) => {
    //   return { ...x, selected: false };
    // });
    // setBuildings(newBuildings);
    // deselectAll();
    console.log("handling click in game");
    deselectAllBuildings();
    deselectAllMapObjects();
    const newVillagers = villagers.map((villager) => {
      return { ...villager, selected: false };
    });
    setVillagers(newVillagers);
    // const newMapObjects = mapObjects.map((mapObject) => {
    //   return { ...mapObject, selected: false };
    // });
    // setMapObjects(newMapObjects);
    setAllShapes((prev) => {
      return prev.map((x) => {
        return { ...x, selected: false };
      });
    });
    setPlacementOverlayConfig(undefined);
    return;
    // }
  }

  // Right click handler
  const handleRightClick = useCallback(
    (event: any) => {
      event.preventDefault();
      let clientRect = event.currentTarget.getBoundingClientRect();
      let xPos = event.pageX - clientRect.left;
      let yPos = event.pageY - clientRect.top;
      if (selectedVillager) {
        selectedVillager.currentTask = (
          villagers: VillagerProps[],
          villagerId: string,
          inventoryItems: InventoryItem[],
          buildings: EntityElementType[],
          mapObjects: EntityElementType[]
        ) => doMoveToLocation(villagers, villagerId, inventoryItems, buildings, mapObjects, { x: xPos, y: yPos });
      }
    },
    [selectedVillager]
  );

  const onTrain = useCallback(
    (entity: any) => {
      let result = reduceResourcesFromInventory(inventory, entity.price);
      if (result[1]) {
        setInventory(result[0]);
        trainVillager(entity);
      }
      return entity;
    },
    [inventory, trainVillager]
  );

  // function handleVillagerRightClick() {}

  // const handleMapObjectRightClick = useCallback(
  //   (event: any, mapObjectId: string) => {
  //     event.stopPropagation();
  //     event.preventDefault();
  //     let targetObject = mapObjects.find((x) => x.component.props.id === mapObjectId);
  //     if (
  //       selectedVillager &&
  //       targetObject?.component.props.name === "tree" &&
  //       selectedVillager.professions.find((x) => x.active)?.profession.name === "Lumberjack"
  //     ) {
  //       selectedVillager.currentTask = (
  //         villagers: VillagerProps[],
  //         villagerId: string,
  //         inventoryItems: InventoryItem[],
  //         buildings: EntityElementType[],
  //         mapObjects: EntityElementType[]
  //       ) => doGatheringTask(villagers, villagerId, inventoryItems, buildings, mapObjects, false, "tree", mapObjectId);
  //     }
  //     if (
  //       selectedVillager &&
  //       targetObject?.component.props.name === "rock" &&
  //       selectedVillager.professions.find((x) => x.active)?.profession.name === "Miner"
  //     ) {
  //       selectedVillager.currentTask = (
  //         villagers: VillagerProps[],
  //         villagerId: string,
  //         inventoryItems: InventoryItem[],
  //         buildings: EntityElementType[],
  //         mapObjects: EntityElementType[]
  //       ) => doGatheringTask(villagers, villagerId, inventoryItems, buildings, mapObjects, false, "stone", mapObjectId);
  //     }
  //   },
  //   [mapObjects, selectedVillager]
  // );

  const handleBuildingRightClick = useCallback(
    (event: any, buildingId: string) => {
      event.stopPropagation();
      event.preventDefault();
      let clickedBuilding = buildings.find((x) => x.component.props.id === buildingId);
      if (
        selectedVillager &&
        clickedBuilding?.component.props.name === "Farm field" &&
        selectedVillager.professions.find((x) => x.active)?.profession.name === "Farmer"
      ) {
        selectedVillager.currentTask = (
          villagers: VillagerProps[],
          villagerId: string,
          inventoryItems: InventoryItem[],
          buildings: EntityElementType[],
          mapObjects: EntityElementType[]
        ) => doGatheringTask(villagers, villagerId, inventoryItems, buildings, mapObjects, true, "Farm field", buildingId);
      }
    },
    [buildings, selectedVillager]
  );

  const handleChangeProfessionClick = useCallback((newVillagerProfessions: VillagerProfession[], villagerId: string) => {
    const newVillagers = villagers.map((vill) => {
      if (vill.id === villagerId) {
        vill = { ...vill, professions: newVillagerProfessions };
      }
      return vill;
    });
    setVillagers(newVillagers);
  }, []);

  const handleOpenOverlay = (buildingOption: BuildingOption, centerPosition: Position) => {
    let toPlaceShape = shapes.find((x) => x.id === buildingOption.shapeId);
    if (!toPlaceShape) return;
    let overlayConfig: PlacementOverlayConfig = {
      circle: true,
      fullscreen: false,
      show: true,
      size: getIncreasedSizeByRange(toPlaceShape.size, buildingOption.placementRange),
      centerPosition: centerPosition,
      selectedShape: toPlaceShape,
    };
    setPlacementOverlayConfig(overlayConfig);
  };

  function getIncreasedSizeByRange(size: Size, range?: number): Size {
    let toReturn = { ...size };
    toReturn.width += (range ? range : 0) * 2;
    toReturn.height += (range ? range : 0) * 2;
    return toReturn;
  }

  const handlePlaceBuilding = (event: any) => {
    let clientRect = event.target.parentElement.getBoundingClientRect();
    let xPos = event.pageX - clientRect.left;
    let yPos = event.pageY - clientRect.top;
    if (!placementOverlayConfig || !placementOverlayConfig.selectedShape) return;
    let building: BuildingProps | undefined = createBuilding({ x: xPos, y: yPos }, placementOverlayConfig?.selectedShape.type);
    if (building) {
      let result = reduceResourcesFromInventory(inventory!, building.price);
      if (result[1]) {
        setInventory(result[0]);
        addBuilding(building, { x: xPos, y: yPos });
      }
    }
  };

  const deselectAll = () => {
    deselectAllBuildings();
    deselectAllMapObjects();
  };

  const handleSelectMapObject = useCallback((e: SyntheticEvent, mapObjectId: string) => {
    console.log("handling select mapobject click");
    deselectAll();
    selectMapObject(mapObjectId);
    e.stopPropagation();
  }, []);

  const handleSelectBuilding = useCallback((e: SyntheticEvent, buildingId: string) => {
    deselectAll();
    selectBuilding(buildingId);
    e.stopPropagation();
  }, []);

  // const handleMapObjectClick = () => {
  //   console.log("TEST");
  // }

  return (
    <div className={styles.background}>
      <div className={styles.actionsArea}>
        <div className={styles.actions}>
          <BuySection onClick={selectShape} shapes={allShapes} width={settingsAreaWidth}></BuySection>
          {selectedBuilding ? (
            <UpgradeMenu
              inStock={selectedBuilding.component.props.inventory}
              onTrain={onTrain}
              onPlaceBuilding={handleOpenOverlay}
              buildingOptions={selectedBuilding.component.props.buildingOptions}
              status={Status.NONE}
              children={{}}
              name={selectedBuilding.component.props.name}
              objectId={selectedBuilding.component.props.id}
              objectHitbox={selectedBuilding.component.props.hitBox}
              height={"50%"}
            ></UpgradeMenu>
          ) : (
            <></>
          )}
          {selectedVillager ? (
            <UpgradeMenu
              onProfessionChange={handleChangeProfessionClick}
              villagerProfessions={selectedVillager.professions}
              inStock={selectedVillager.inventoryItems}
              buildingOptions={selectedVillager.buildingOptions}
              status={Status.NONE}
              height={"50%"}
              children={{}}
              name={selectedVillager.name}
              objectId={selectedVillager.id}
              objectHitbox={selectedVillager.hitBox}
            ></UpgradeMenu>
          ) : (
            <></>
          )}
          {selectedMapObject ? (
            <UpgradeMenu
              inStock={selectedMapObject.component.props.inventory}
              buildingOptions={selectedMapObject.component.props.buildingOptions}
              status={Status.NONE}
              height={"50%"}
              children={{}}
              name={selectedMapObject.component.props.name}
              objectId={selectedMapObject.component.props.id}
              objectHitbox={selectedMapObject.component.props.hitBox}
            ></UpgradeMenu>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div
        className={styles.gameArea}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        style={{ width: document.documentElement.clientHeight - 50, height: document.documentElement.clientHeight - 50 }}
      >
        {placementOverlayConfig?.show && (
          <PlacementOverlay
            onClick={handlePlaceBuilding}
            fullscreen={placementOverlayConfig?.fullscreen}
            circle={placementOverlayConfig.circle}
            size={placementOverlayConfig.size}
            centerPosition={placementOverlayConfig.centerPosition}
          />
        )}
        <div className={styles.resourceArea}>{inventory ? <Resources></Resources> : <></>}</div>

        {buildings ? (
          buildings.map((building) => {
            return (
              <EntityWrapper
                entityId={building.component.props.id}
                onClick={handleSelectBuilding}
                hitBox={building.component.props.hitBox}
                size={building.component.props.size}
                selected={building.selected}
              >
                {building.component}
              </EntityWrapper>
            );
          })
        ) : (
          <></>
        )}
        {mapObjects ? (
          mapObjects?.map((mapObject) => {
            return (
              <EntityWrapper
                key={mapObject.component.props.id}
                entityId={mapObject.component.props.id}
                onClick={handleSelectMapObject}
                hitBox={mapObject.component.props.hitBox}
                size={mapObject.component.props.size}
                selected={mapObject.selected}
              >
                {mapObject.component}
              </EntityWrapper>
            );
          })
        ) : (
          <></>
        )}
        {villagers ? (
          villagers?.map((villager, index) => {
            // <EntityWrapper
            // key={villager.id}
            //   onClick={(e) => {
            //     return selectVillager(e, villager.component.props.id);
            //   }}
            //   hitBox={mapObject.component.props.hitBox}
            //   size={mapObject.component.props.size}
            //   selected={mapObject.selected}
            // >
            //   {mapObject.component}
            // </EntityWrapper>;
            return villager ? <Villager key={villager.id} {...villager} onClick={deselectAllBut}></Villager> : <></>;
          })
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
export default Game;