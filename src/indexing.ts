import { Chest } from "mineflayer";
import { Vec3 } from "vec3";
import GrieferGamesBot from "./bot";
import logWithContext from "./log";
import sleep from "./sleep";
import { Block } from "prismarine-block";
import { Item } from "prismarine-item";

export interface ChestIndexChest {
    chest: Chest;
    block: Block;
    slots: Item[];
}

export default function indexChests(grieferGamesBot: GrieferGamesBot): Promise<void> {
    return new Promise((resolve, reject) => {
        const bot = grieferGamesBot.bot;
        const chestIndex: ChestIndexChest[] = []
        let blockLocations: Vec3[];

        sleep(1000).then(() => {
            blockLocations = bot.findBlocks({ matching: [54, 146], maxDistance: 6, count: 1000 });

            if (blockLocations.length === 0) {
                logWithContext('bot', 'No chests found');

                resolve();
                return;
            }

            logWithContext('bot', 'Indexing ' + blockLocations.length + ' chests will take ' + (blockLocations.length * 2) + ' seconds');
            blockLocations.forEach((blockLocation, index) => {
                const block = bot.blockAt(blockLocation);

                if (block) {
                    setTimeout(() => {
                        let slots: Item[] = [];

                        bot.openChest(block).then((chest: Chest) => {
                            chest.slots.forEach((slot) => {
                                if (slot && slot.count > 0 && slot.slot <= 27) {
                                    slots.push(slot);
                                }
                            });

                            chestIndex.push({
                                chest: chest,
                                block: block,
                                slots: slots
                            });

                            if (index + 1 === blockLocations.length) {
                                grieferGamesBot.setChestIndex = chestIndex;

                                resolve();
                            }
                        });
                    }, index * 2000);
                }
            });
        });
    });
}