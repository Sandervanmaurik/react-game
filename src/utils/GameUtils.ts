import { resources } from '../config/Resources';
import { shapes } from '../config/Shapes';
import { BuildingProps } from '../models/BuildingProps';
import { BuildingType } from '../models/enums/BuildingType';
import { Inventory } from '../models/Inventory';
import { ObjectProps } from '../models/ObjectProps';
import { v4 as uuidv4 } from 'uuid';
import { createBuilding } from './BuildingUtils';
import { Hitbox } from '../models/Hitbox';

export function setInitialInventory() {
	let wood = resources.find((x) => x.name === 'Wood');
	let coins = resources.find((x) => x.name === 'Coins');
	let gems = resources.find((x) => x.name === 'Gems');
	if (!wood || !coins || !gems) return;
	let inventoryInit: Inventory = {
		resources: [
			{
				resource: coins,
				amount: 0,
			},
			{
				resource: wood,
				amount: 100,
			},
			{
				resource: gems,
				amount: 0,
			},
		],
	};
	return inventoryInit;
}

export function setInitialBuildings() {
	let townCenter = shapes.find((x) => x.type === BuildingType.TOWN_CENTER);
	if (townCenter) {
		let initialBuildings: BuildingProps[] = [
			createBuilding({ x: 500, y: 300 }, BuildingType.TOWN_CENTER)!,
		];
		if (initialBuildings) {
			return initialBuildings;
		}
	}
	return [];
}

export function setInitialMapObjects(map: any): ObjectProps[] {
    let wood = resources.find((x) => x.name === 'Wood');
	let coins = resources.find((x) => x.name === 'Coins');
	let gems = resources.find((x) => x.name === 'Gems');
	let initialMapObjects: ObjectProps[] = map.map.map((mapObject: any) => {
		let hitBox: Hitbox = {
			leftTop: {
				x: mapObject.position.x - mapObject.size / 2,
				y: mapObject.position.y - mapObject.size / 2,
			},
			rightBottom: {
				x: mapObject.position.x + mapObject.size / 2,
				y: mapObject.position.y + mapObject.size / 2,
			},
		};
		return {
			id: uuidv4(),
			name: mapObject.name,
			position: mapObject.position,
			selected: false,
			hitBox: hitBox,
            inventory: [
                {
                    amount: 20,
                    resource: wood
                }
            ]
		};
	});
	return initialMapObjects;
}