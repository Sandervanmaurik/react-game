import { Shape } from "../models/Shape";
import { resources } from "./Resources";
import { v4 as uuidv4 } from 'uuid';
import { BuildingType } from "../models/enums/BuildingType";
import { buildingOptions } from "./BuildingOptions";

export const shapes: Shape[] = [
    {
        id: uuidv4(),
        name: "House",
        icon: ['fas', 'house'],
        iconColor: '#373c50',
        image: "house",
        selected: false,
        price: [
            { type: resources.find(x => x.name === "Wood"), amount: 100 },
            { type: resources.find(x => x.name === "Coins"), amount: 50 }
        ],
        type: BuildingType.HOUSE,
        buildingOptions: [],
        size: {width:50, height:50}
    },
    {
        id: uuidv4(),
        name: "Town Center",
        icon: ['fas', 'building-columns'],
        iconColor: '#373c50',
        image: "townCenter",
        selected: false,
        price: [
            { type: resources.find(x => x.name === "Coins"), amount: 50 }
        ],
        type: BuildingType.TOWN_CENTER,
        buildingOptions: [buildingOptions.find(x => x.name === "Train Villager")!],
        size: {width:75, height:75}
    },
    {
        id: uuidv4(),
        name: "Tents",
        icon: ['fas', 'tents'],
        iconColor: '#373c50',
        image: "",
        selected: false,
        price: [
            { type: resources.find(x => x.name === "Coins"), amount: 50 }
        ],
        type: BuildingType.TENTS,
        buildingOptions: [],
        size: {width:50, height:50}
    },

    {
        id: uuidv4(),
        name: "Guard tower",
        icon: ['fas', 'tower-observation'],
        iconColor: '#373c50',
        image: "",
        selected: false,
        price: [
            { type: resources.find(x => x.name === "Gems"), amount: 150 }
        ],
        type: BuildingType.GUARD_TOWER,
        buildingOptions: [],
        size: {width:50, height:50}
    }
]