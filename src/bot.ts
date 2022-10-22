import mineflayer from 'mineflayer';
import { pathfinder } from 'mineflayer-pathfinder'
import { mineflayer as mineflayerViewer } from 'prismarine-viewer';
import { goToTradingSpot, navigateToCb7, navigateToPortalRoom } from './navigation';

class GrieferGamesBot {
    private mineflayerBot: mineflayer.Bot;

    get bot() {
        return this.mineflayerBot;
    }

    public navigateToTradingSpot(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('Navigating to designated location');
            navigateToPortalRoom(this).then(() => {
                navigateToCb7(this).then(() => {
                    goToTradingSpot(this).then(() => {
                        resolve();
                    });
                });
            });
        });
    }

    public setupPlugins(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('Starting viewer on port 3000');
            mineflayerViewer(this.mineflayerBot, { port: 3000, firstPerson: true });

            console.log('Loading pathfinder plugin');
            this.mineflayerBot.loadPlugin(pathfinder);

            resolve();
        });
    }

    public setup(): Promise<void> {
        return new Promise((resolve) => {
            this.bot.once('spawn', () => {
                this.setupPlugins().then(() => {
                    this.navigateToTradingSpot().then(() => {
                        resolve();
                    });
                });
            })
        });
    }

    public constructor(username: string = 'Player', auth: 'mojang' | 'microsoft' | 'offline' = 'offline') {
        console.info(`Connecting to Griefergames as ${username}`);
        this.mineflayerBot = mineflayer.createBot({
            host: 'griefergames.net',
            port: 25565,
            username: username,
            version: '1.8.9',
            auth: auth
        });

        this.mineflayerBot.once("login", () => {
            console.info(`Logged in as ${this.mineflayerBot.username}`);
        });

        this.mineflayerBot.on('kicked', (reason: string) => {
            console.log('Kicked for', reason);
        });

        this.mineflayerBot.on('error', (errorMsg) => {
            console.log(errorMsg);
        })
    }
}

export default GrieferGamesBot;