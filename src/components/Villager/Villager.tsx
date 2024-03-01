import { useCallback, useEffect, useState } from "react";
import { useVillagers } from "../../hooks/useVillagers";
import { Hitbox } from "../../models/Hitbox";
import { VillagerProfession } from "../../models/VillagerProfession";
import { useGame } from "../../providers/GameProvider";
import Icon from "../Icon/Icon";
import styles from "./Villager.module.css";

export type VillagerComponentProps = {
  id: string;
  name: string;
  hitBox: Hitbox;
  size: { width: number; height: number };
  selected: boolean;
  professions: VillagerProfession[];
};

const Villager = ({ id, name, size, professions }: VillagerComponentProps) => {
  const [activeProfession, setActiveProfession] = useState<VillagerProfession>();
  const { villagers, selectVillager } = useGame();

  useEffect(() => {
    setActiveProfession((prev) => {
      return professions.find((x) => x.active);
    });
  }, []);

  const handleSelect = useCallback((event: any) => {
    console.log(event);
    console.log(id);
    console.log(selectVillager);
    if (!selectVillager) return;
    selectVillager(id);
  }, []);

  return (
    <div onClick={handleSelect} className={styles.villager}>
      <Icon height={size.height - 10 + "px"} fontSize="1em" imageName={activeProfession?.profession.characterImageName}></Icon>
    </div>
  );
};
export default Villager;
