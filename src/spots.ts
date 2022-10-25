import { readFileSync } from "fs";
import { Vec3 } from "vec3";

export interface Spot {
    command: string;
    orientation: string[];
    lookAt: string[];
}

export function getSpots(): Spot[] {
    const spotsInfo = readFileSync('./config/spots.json', 'utf-8');

    return JSON.parse(spotsInfo);
}

export function getLookAtVec3(lookAt: string[], addToY?: number): Vec3 {
    if (addToY) {
        return new Vec3(+lookAt[0], +lookAt[1] + addToY, +lookAt[2]);
    } else {
        return new Vec3(+lookAt[0], +lookAt[1], +lookAt[2]);
    }
}

export function getOrientationVec3(orientation: string[]): Vec3 {
    return new Vec3(+orientation[0], +orientation[1], +orientation[2]);
}