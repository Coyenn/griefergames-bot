import { readFileSync } from "fs";

export interface Spot {
    command: string;
    orientation: string[];
    lookAt: string[];
}

export function getSpots(): Spot[] {
    const spotsInfo = readFileSync('./config/spots.json', 'utf-8');

    return JSON.parse(spotsInfo);
}