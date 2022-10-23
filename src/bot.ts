import { readFileSync } from 'fs';
import mineflayer from 'mineflayer';
import { pathfinder } from 'mineflayer-pathfinder'
import afk from './afk';
import indexChests, { ChestIndexChest } from './indexing';
import logWithContext from './log';
import { navigateToTradingSpot, navigateToCb7, navigateToPortalRoom } from './navigation';
import { Spot } from './spots';
import GrieferGamesViewer from './viewer';

class GrieferGamesBot {
    private mineflayerBot: mineflayer.Bot;
    private viewer: null | GrieferGamesViewer = null;
    private chestIndex: ChestIndexChest[] = [];

    get bot() {
        return this.mineflayerBot;
    }

    set setChestIndex(chestIndex: ChestIndexChest[]) {
        this.chestIndex = chestIndex;
    }

    get getChestIndex(): ChestIndexChest[] {
        return this.chestIndex;
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
            this.mineflayerBot.loadPlugin(pathfinder);

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
                        itemsToLog.push([slot.item, slot.amount.toString()]);
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

        this.mineflayerBot.once("login", () => {
            logWithContext('bot', `Logged in as ${this.mineflayerBot.username}`);
        });

        this.mineflayerBot.on('chat', (username: string, message: string) => {
            if (username === this.mineflayerBot.username) {
                return;
            }

            logWithContext('chat', message);
        });

        this.mineflayerBot.on('kicked', (reason: string) => {
            logWithContext('bot', 'Kicked for ' + reason);
        });

        this.mineflayerBot.on('error', (errorMsg) => {
            logWithContext('bot', errorMsg.message);
        })
    }
}

export default GrieferGamesBot;