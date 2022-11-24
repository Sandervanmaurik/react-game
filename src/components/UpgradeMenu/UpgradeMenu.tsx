import { useCallback, useEffect, useState } from "react";
import { buildStyles, CircularProgressbarWithChildren } from "react-circular-progressbar";
import { BuildingOption } from "../../models/BuildingOption";
import { BuildingProps } from "../../models/BuildingProps";
import { BuildingOptionType } from "../../models/enums/BuildingOptionType";
import { Status } from "../../models/enums/Status";
import { InventoryItem } from "../../models/InventoryItem";
import { ObjectProps } from "../../models/ObjectProps";
import { Position } from "../../models/Position";
import { VillagerProfession } from "../../models/VillagerProfession";
import { VillagerProps } from "../../models/VillagerProps";
import { getHitBoxCenter } from "../../utils/HitboxUtils";
import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import ProfessionPicker from "../ProfessionPicker/ProfessionPicker";
import ResourceItem from "../Resources/ResourceItem/ResourceItem";
import styles from "./UpgradeMenu.module.css";

type Props = {
  selectedBuilding: BuildingProps | undefined;
  selectedVillager: VillagerProps | undefined;
  selectedMapObject: ObjectProps | undefined;
  onTrain: (villager: VillagerProps) => VillagerProps;
  onPlaceBuilding?: (buildingOption: BuildingOption, centerPosition: Position) => void;
  inStock?: InventoryItem[];
  onProfessionChange?: (selectedVillager: VillagerProps) => void;
};

const UpgradeMenu = ({ selectedBuilding, selectedVillager, selectedMapObject, onTrain, inStock, onProfessionChange, onPlaceBuilding }: Props) => {
  const [buildingOptions, setBuildingOptions] = useState<BuildingOption[]>([]);
  const [position, setPosition] = useState<Position>({ x: 500, y: 500 });
  const [jobSelectionOpen, setJobSelectionOpen] = useState(false);
  const [toPlaceBuildingPosition, setToPlaceBuildingPosition] = useState();

  const activeProfession = selectedVillager?.professions.find((x) => x.active);

  useEffect(() => {
    if (selectedBuilding) {
      setBuildingOptions(selectedBuilding.buildingOptions);
      setPosition(getHitBoxCenter(selectedBuilding.hitBox));
    }
    if (selectedVillager) {
      setBuildingOptions(selectedVillager.buildingOptions);
      setPosition(getHitBoxCenter(selectedVillager.hitBox));
    }
    if (selectedMapObject) {
      setBuildingOptions(selectedMapObject.buildingOptions);
      setPosition(getHitBoxCenter(selectedMapObject.hitBox));
    }
  }, [selectedBuilding, selectedMapObject, selectedVillager]);

  const executeBuildingOption = useCallback(
    (buildingOption: BuildingOption) => {
      if (buildingOption.type === BuildingOptionType.TRAIN) {
        let entity = buildingOption.toExecute(position);
        onTrain(entity);
      }
      if (buildingOption.type === BuildingOptionType.BUILD) {
        console.log(selectedBuilding?.hitBox);
        console.log(getHitBoxCenter(selectedBuilding!.hitBox));
        if (onPlaceBuilding && selectedBuilding) onPlaceBuilding(buildingOption, getHitBoxCenter(selectedBuilding.hitBox));
      }
      if (buildingOption.type === BuildingOptionType.UPGRADE) {
      }
    },
    [onTrain, position]
  );

  const handleChangeProfession = useCallback(
    (villagerProfession: VillagerProfession) => {
      if (!onProfessionChange || !selectedVillager) return;
      let selectedVillagerCopy = {
        ...selectedVillager,
        currentTask: undefined,
        status: Status.IDLE,
        professions: selectedVillager.professions.map((x) => {
          if (x.profession.id === villagerProfession.profession.id) {
            return { ...x, active: true };
          }
          return { ...x, active: false };
        }),
      };
      setJobSelectionOpen(false);
      onProfessionChange(selectedVillagerCopy);
    },
    [onProfessionChange, selectedVillager]
  );

  if (selectedBuilding) {
    return (
      <div className={styles.upgradeMenu}>
        <div className={styles.titleSection}>
          <span className={styles.name}>{selectedBuilding.name}</span>
          <div className={styles.levelSection}>
            <span>{selectedBuilding.level}</span>
          </div>
        </div>
        <div className={styles.buildingOptionsSection} style={{ height: "calc(100% - 80px)" }}>
          {buildingOptions.map((x) => {
            return (
              <Button
                imageHeight={"35px"}
                imageName={x.imageName!}
                key={x.id}
                icon={x.icon}
                active={false}
                disabled={false}
                price={x.price}
                iconColor={"#ffffff"}
                height="100px"
                width="100px"
                onClick={() => executeBuildingOption(x)}
                text={x.name}
              ></Button>
            );
          })}
        </div>
      </div>
    );
  }

  if (selectedVillager) {
    return (
      <div className={styles.upgradeMenu}>
        <div className={`${styles.titleSection} ${jobSelectionOpen && styles.noTopRightBorderRadius}`}>
          <div className={styles.titlePart}>
            <span>{selectedVillager.name}</span>
            <span style={{ fontSize: "1em" }}>{Status[selectedVillager.status]}</span>
          </div>

          <div className={`${styles.levelSection}`} onClick={() => setJobSelectionOpen((prev) => !prev)}>
            {activeProfession?.profession.name !== "None" ? (
              <CircularProgressbarWithChildren
                className={`${styles.spinner} ${activeProfession?.currentLevel.nextLevel === "" && styles.maxLevel}`}
                value={activeProfession?.currentExperience!}
                maxValue={activeProfession?.currentLevel.experienceNeededForNextLevel}
                styles={buildStyles({ pathColor: "#515b80", trailColor: "#e0e0e0" })}
              >
                <Icon fontSize={"1em"} imageName={activeProfession?.profession.image} height={"25px"}></Icon>
                <span>{`Level ${activeProfession?.currentLevel.level}`}</span>
              </CircularProgressbarWithChildren>
            ) : (
              <Icon fontSize={"1em"} imageName={activeProfession?.profession.image} height={"50px"}></Icon>
            )}
          </div>
        </div>
        <div className={styles.buildingOptionsSection}></div>
        <div className={styles.inventorySection}>
          {inStock ? (
            inStock.map((x, index) => {
              return (
                <ResourceItem
                  key={index}
                  resource={x.resource}
                  amount={Math.round(x.amount)}
                  iconSize="1em"
                  textSize="1em"
                  textColor="#ffffff"
                  height={15}
                ></ResourceItem>
              );
            })
          ) : (
            <></>
          )}
        </div>
        <ProfessionPicker
          villagerProfessions={selectedVillager.professions}
          open={jobSelectionOpen}
          onClick={handleChangeProfession}
        ></ProfessionPicker>
      </div>
    );
  }

  if (selectedMapObject) {
    return (
      <div className={styles.upgradeMenu}>
        <div className={styles.titleSection}>
          <span className={styles.name}>{selectedMapObject.name}</span>
          <div className={styles.levelSection}></div>
        </div>
        <div className={styles.buildingOptionsSection}></div>
        <div className={styles.inventorySection}>
          {inStock ? (
            inStock.map((x) => {
              return (
                <ResourceItem
                  resource={x.resource}
                  amount={Math.round(x.amount)}
                  iconSize="1em"
                  textSize="1em"
                  textColor="#ffffff"
                  height={15}
                ></ResourceItem>
              );
            })
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  }
  return <></>;
};

export default UpgradeMenu;
