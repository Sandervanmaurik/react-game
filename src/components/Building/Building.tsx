import { IconProp } from "@fortawesome/fontawesome-svg-core"
import React, { useEffect, useState } from "react";
import { Hitbox } from "../../models/Hitbox";
import { Position } from "../../models/Position";
import { getImageUrl } from "../../utils/MapUtils";
import { getHitBoxCenter } from "../../utils/StatusUtils";
import Icon from "../Icon/Icon";
import styles from './Building.module.css';


type props = {
  id: string;
  size: { width: string, height: string },
  hitBox: Hitbox,
  icon: IconProp,
  color: string,
  selected: boolean,
  onClick: (event: any, buildingId: string) => void,
  onRightClick: (event: any) => void,
  image?: string
}

const Building = React.memo(({ id, size, hitBox, icon, color, onClick, selected, onRightClick, image }: props) => {
  const position: Position = getHitBoxCenter(hitBox);
  const [_image, setImage] = useState('');
  useEffect(() => {
    if (image) {
      setImage(getImageUrl(image!));
    }
  }, []);

  return (
    <div className={styles[(selected) ? `active` : `not-active`] + " " + styles['building']} style={{ width: size.width, height: size.width, left: hitBox.leftTop.x - (hitBox.leftTop.x - position.x), top: hitBox.leftTop.y - (hitBox.leftTop.y - position.y), position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(event) => onClick(event, id)} onContextMenu={onRightClick}>
      {(_image !== '') ? <img src={_image}></img> : <Icon fontSize={size.width} color={color} name={icon}></Icon>}
    </div>
  )

})

export default Building;