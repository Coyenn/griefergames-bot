import { getAccount } from './account';
import { getSpots } from './spots';
import GrieferGamesBot from './bot'

async function main() {
    const account = getAccount();
    const spots = getSpots();
    const localGrieferGamesBot = new GrieferGamesBot(account.username, account.auth);

    await localGrieferGamesBot.setup();
    //await localGrieferGamesBot.navigateToTradingSpot(spots[0]);
    await localGrieferGamesBot.indexChests();

    localGrieferGamesBot.getChestIndex.forEach((chest) => {
        chest.slots.forEach((slot) => {
            console.log(slot.item);
        });
    });
    console.log("Bot is ready");
}

main();