import { getAccount } from './account';
import GrieferGamesBot from './bot'

async function main() {
    const account = getAccount();
    const localGrieferGamesBot = new GrieferGamesBot(account.username, account.auth);

    await localGrieferGamesBot.setup();
    console.log("Bot is ready");
}

main();