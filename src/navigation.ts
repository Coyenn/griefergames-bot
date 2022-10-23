import { goals } from "mineflayer-pathfinder";
import GrieferGamesBot from "./bot";
import Vec3 from "vec3";
import sleep from "./sleep";
import { Spot } from "./spots";

export function navigateTo(grieferGamesBot: GrieferGamesBot, goal: goals.Goal): Promise<void> {
    return new Promise((resolve, reject) => {
        grieferGamesBot.bot.pathfinder.goto(goal);
        grieferGamesBot.bot.on("goal_reached", () => {
            resolve();
        })
    });
}

export function navigateToPortalRoom(grieferGamesBot: GrieferGamesBot): Promise<void> {
    return new Promise((resolve, reject) => {
        navigateTo(grieferGamesBot, new goals.GoalBlock(16.5, 71, -171)).then(() => {
            const nearestEntity = grieferGamesBot.bot.nearestEntity();

            grieferGamesBot.bot.lookAt(Vec3("0", "0", "0")).then(() => {
                if (nearestEntity) {
                    grieferGamesBot.bot.activateEntity(nearestEntity);

                    sleep(5000).then(() => resolve())
                }
            });

        });
    });
}

export function navigateToCb7(grieferGamesBot: GrieferGamesBot): Promise<void> {
    return new Promise((resolve, reject) => {
        sleep(10000).then(() => {
            navigateTo(grieferGamesBot, new goals.GoalBlock(308, 67, 268))

            sleep(10000).then(() => {
                navigateTo(grieferGamesBot, new goals.GoalBlock(grieferGamesBot.bot.entity.position.x, grieferGamesBot.bot.entity.position.y, grieferGamesBot.bot.entity.position.z));
                resolve();
            })
        })
    });
}

export function navigateToTradingSpot(grieferGamesBot: GrieferGamesBot, spot: Spot): Promise<void> {
    return new Promise((resolve, reject) => {
        grieferGamesBot.bot.chat(spot.command);
        grieferGamesBot.bot.lookAt(Vec3(spot.orientation[0], spot.orientation[1], spot.orientation[2])).then(() => {
            resolve();
        });
    });
}