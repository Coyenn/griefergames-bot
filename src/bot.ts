import { readFileSync } from 'fs';
import mineflayer from 'mineflayer';
import { pathfinder } from 'mineflayer-pathfinder'
import afk from './afk';
import { sendMessageToPlayer, sendMoneyToPlayer } from './chat-commands';
import indexChests, { ChestIndexChest } from './indexing';
import logWithContext from './log';
import { navigateToTradingSpot, navigateToCb7, navigateToPortalRoom } from './navigation';
import { getLookAtVec3, getSpots, Spot } from './spots';
import GrieferGamesViewer from './viewer';

class GrieferGamesBot {
    private mineflayerBot: mineflayer.Bot;
    private viewer: null | GrieferGamesViewer = null;
    private chestIndex: ChestIndexChest[] = [];
    private canTrade: boolean = false;
    private spots: Spot[] = getSpots();

    get bot(): mineflayer.Bot {
        return this.mineflayerBot;
    }

    set setChestIndex(chestIndex: ChestIndexChest[]) {
        this.chestIndex = chestIndex;
    }

    get getChestIndex(): ChestIndexChest[] {
        return this.chestIndex;
    }

    get getCanTrade(): boolean {
        return this.canTrade;
    }

    set setCanTrade(canTrade: boolean) {
        this.canTrade = canTrade;
    }

    public provideItem(player: string, itemType: number, amount: number): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                let gottenAmount = 0; // Amount of items gotten from chests in case we need to access more than one chest

                // Check if there are chests in the chest index that have the item
                const chestsWithItem = this.chestIndex.filter((chest) => {
                    return chest.slots.filter((slot) => {
                        return slot.type === itemType;
                    }).length > 0;
                });

                // Return an error if there are no chests with the item
                if (chestsWithItem.length === 0) {
                    throw new Error(`No chests with ${itemType} found`);
                }

                // If the total amount of items in the chests is less than the amount we need, return an error
                if (chestsWithItem.map((chest) => {
                    return chest.slots.filter((slot) => {
                        return slot.type === itemType;
                    }).reduce((total, slot) => {
                        return total + slot.count;
                    }, 0);
                }).reduce((total, amount) => {
                    return total + amount;
                }, 0) < amount) {
                    throw new Error(`Not enough ${itemType} in chests`);
                }

                // Loop through the chests with the item
                chestsWithItem.map((chest) => {
                    // Loop through the slots in the chest
                    chest.slots.map((slot) => {
                        // If the slot has the item and we haven't gotten enough yet, take the item
                        if (slot.type === itemType && gottenAmount < amount) {
                            // If the amount in the slot is less than the amount we need, take all of it
                            if (slot.count <= amount - gottenAmount) {
                                this.bot.openChest(chest.block).then((chest) => {
                                    chest.withdraw(slot.slot, null, amount - gottenAmount);
                                    gottenAmount += slot.count;
                                });
                            } else {
                                // If the amount in the slot is more than the amount we need, take the amount we need
                                this.bot.openChest(chest.block).then((chest) => {
                                    chest.withdraw(slot.slot, null, amount - gottenAmount);
                                    gottenAmount += amount - gottenAmount;
                                });
                            }
                        }
                    });
                });

                // Look at spots[0].lookAt and throw the item
                this.bot.lookAt(getLookAtVec3(this.spots[0].lookAt)).then(() => {
                    this.bot.toss(itemType, null, amount).then(() => {
                        sendMessageToPlayer(this, player, 'Hier ist dein Item');
                        resolve();
                    })
                });
            }
            catch (e: any) {
                logWithContext('bot', e);
                sendMessageToPlayer(this, player, 'Es gab einen Fehler beim Verarbeiten deiner Anfrage.');
                sendMoneyToPlayer(this, player, amount);
                sendMessageToPlayer(this, player, 'Dein Geld wurde zurückgezahlt.');
                reject(e);
            }
        });
    }

    public navigateToTradingSpot(spot: Spot): Promise<void> {
        return new Promise((resolve, reject) => {
            logWithContext('bot', 'Navigating to designated location');
            navigateToPortalRoom(this).then(() => {
                navigateToCb7(this).then(() => {
                    navigateToTradingSpot(this, spot).then(() => {
                        resolve();
                    });
                });
            });
        });
    }

    public setupViewer(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.viewer = new GrieferGamesViewer(this);

            resolve();
        });
    }

    public setupPlugins(): Promise<void> {
        return new Promise((resolve, reject) => {
            logWithContext('bot', 'Loading pathfinder plugin');

            this.bot.loadPlugin(pathfinder);
            this.setupViewer().then(() => {
                resolve();
            })
        });
    }

    public setup(): Promise<void> {
        return new Promise((resolve) => {
            this.bot.once('spawn', () => {
                this.setupPlugins().then(() => {

                    resolve();
                });
            })
        });
    }

    public indexChests(): Promise<void> {
        logWithContext('bot', 'Indexing items');

        return new Promise((resolve, reject) => {
            indexChests(this).then(() => {
                const itemsToLog: string[][] = []

                this.chestIndex.map((chest) => {
                    chest.slots.map((slot) => {
                        itemsToLog.push([slot.name, slot.count.toString()]);
                    });
                });

                logWithContext('bot', "Items in chests:");
                console.table(itemsToLog);

                resolve();
            });
        });
    }

    public startAntiAfk(): void {
        logWithContext('bot', 'Starting anti-afk');
        afk(this);
    }

    public constructor(username: string = 'Player', auth: 'mojang' | 'microsoft' | 'offline' = 'offline') {
        const serverData = JSON.parse(readFileSync('./config/server.json', 'utf8'));

        logWithContext('bot', `Connecting as ${username}`);
        this.mineflayerBot = mineflayer.createBot({
            host: serverData.domain,
            port: serverData.port,
            username: username,
            version: serverData.version,
            auth: auth
        });

        this.bot.once("login", () => {
            logWithContext('bot', `Logged in as ${this.bot.username}`);
        });

        this.bot.on('chat', (username: string, message: string) => {
            if (username === this.bot.username) {
                return;
            }

            logWithContext('chat', message);
        });

        this.bot.on('kicked', (reason: string) => {
            logWithContext('bot', 'Kicked for ' + reason);
        });

        this.bot.on('error', (errorMsg) => {
            logWithContext('bot', errorMsg.message);
        })
    }
}

export default GrieferGamesBot;