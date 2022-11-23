import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { BuildingOption } from "./BuildingOption"
import { BuildingType } from "./enums/BuildingType"
import { Hitbox } from "./Hitbox"
import { Price } from "./Price"

export type BuildingProps = {
    id: string,
    price: Price[],
    icon: IconProp,
    name: string,
    color: string,
    size: {
        width: string,
        height: string
    },
    position: {
        x: number,
        y: number
    },
    level: number,
    type: BuildingType,
    selected: boolean,
    buildingOptions: BuildingOption[];
    hitBox: Hitbox,
    image: string
}