import { Shape } from "../models/Shape";
import { resources } from "./Resources";
import { v4 as uuidv4 } from "uuid";
import { BuildingType } from "../models/enums/BuildingType";
import { buildingOptions } from "./BuildingOptions";
import { Availability } from "../models/enums/Availability";

export const shapes: Shape[] = [
  {
    id: uuidv4(),
    name: "House",
    icon: ["fas", "house"],
    iconColor: "#373c50",
    image: "house",
    selected: false,
    price: [
      { type: resources.find((x) => x.name === "Wood"), amount: 100 },
      { type: resources.find((x) => x.name === "Coins"), amount: 50 },
    ],
    type: BuildingType.HOUSE,
    buildingOptions: [],
    size: { width: 50, height: 50 },
    availability: Availability.GAME_LEVEL1,
  },
  {
    id: uuidv4(),
    name: "Town Center",
    icon: ["fas", "building-columns"],
    iconColor: "#373c50",
    image: "townCenter",
    selected: false,
    price: [{ type: resources.find((x) => x.name === "Coins"), amount: 50 }],
    type: BuildingType.TOWN_CENTER,
    buildingOptions: [buildingOptions.find((x) => x.name === "Train Villager")!],
    size: { width: 75, height: 75 },
    availability: Availability.GAME_LEVEL1,
  },
  {
    id: uuidv4(),
    name: "Storage",
    icon: ["fas", "tents"],
    iconColor: "#373c50",
    image: "",
    selected: false,
    price: [{ type: resources.find((x) => x.name === "Coins"), amount: 50 }],
    type: BuildingType.TENTS,
    buildingOptions: [],
    size: { width: 50, height: 50 },
    availability: Availability.GAME_LEVEL1,
  },
  {
    id: uuidv4(),
    name: "Mill",
    icon: ["fas", "wheat-awn"],
    iconColor: "#373c50",
    image: "mill",
    selected: false,
    price: [{ type: resources.find((x) => x.name === "Wood"), amount: 50 }],
    type: BuildingType.MILL,
    buildingOptions: [buildingOptions.find((x) => x.name === "Place field")!],
    size: { width: 50, height: 50 },
    availability: Availability.GAME_LEVEL1,
  },
  {
    id: uuidv4(),
    name: "Guard tower",
    icon: ["fas", "tower-observation"],
    iconColor: "#373c50",
    image: "",
    selected: false,
    price: [{ type: resources.find((x) => x.name === "Gems"), amount: 150 }],
    type: BuildingType.GUARD_TOWER,
    buildingOptions: [],
    size: { width: 50, height: 50 },
    availability: Availability.GAME_LEVEL2,
  },
  {
    id: "farm-field",
    name: "Farm field",
    image: "field",
    selected: false,
    price: [{ type: resources.find((x) => x.name === "Wood"), amount: 25 }],
    type: BuildingType.FARMING_FIELD,
    buildingOptions: [],
    size: { width: 35, height: 35 },
    availability: Availability.GAME_LEVEL2,
  },
];
