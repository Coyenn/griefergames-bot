import { getAccount } from './account';
import { getSpots } from './spots';
import GrieferGamesBot from './bot'
import logWithContext from './log';

async function main() {
    logWithContext('program', "Starting Bot");

    const account = getAccount();
    const spots = getSpots();
    const localGrieferGamesBot = new GrieferGamesBot(account.username, account.auth);

    await localGrieferGamesBot.setup();
    //await localGrieferGamesBot.navigateToTradingSpot(spots[0]);
    await localGrieferGamesBot.indexChests();
    await localGrieferGamesBot.startAntiAfk();

    logWithContext('program', "Bot is ready");
}

main();