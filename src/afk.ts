import { Vec3 } from "vec3";
import GrieferGamesBot from "./bot"
import { getLookAtVec3, getSpots } from "./spots";

export default function afk(grieferGamesBot: GrieferGamesBot) {
    let rotated = false
    const spots = getSpots();

    function rotate() {
        if (rotated) {
            grieferGamesBot.bot.lookAt(getLookAtVec3(spots[0].lookAt, 0.5));
        } else {
            grieferGamesBot.bot.lookAt(getLookAtVec3(spots[0].lookAt));
        }

        rotated = !rotated;
    }

    setInterval(rotate, 3000);
}