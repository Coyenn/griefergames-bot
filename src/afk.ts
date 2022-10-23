import { Vec3 } from "vec3";
import GrieferGamesBot from "./bot"
import { getSpots } from "./spots";

export default function afk(grieferGamesBot: GrieferGamesBot) {
    let rotated = false
    const spots = getSpots();

    function rotate() {
        if (rotated) {
            grieferGamesBot.bot.lookAt(new Vec3(spots[0].orientation[0] as unknown as number + 0.5, spots[0].orientation[1] as unknown as number, spots[0].orientation[2] as unknown as number));
        } else {
            grieferGamesBot.bot.lookAt(new Vec3(spots[0].orientation[0] as unknown as number, spots[0].orientation[1] as unknown as number, spots[0].orientation[2] as unknown as number));
        }

        rotated = !rotated;
    }

    setInterval(rotate, 3000);
}