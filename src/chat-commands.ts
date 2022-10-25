import GrieferGamesBot from "./bot";

export function sendMessageToPlayer(grieferGamesBot: GrieferGamesBot, player: string, message: string): void {
    grieferGamesBot.bot.chat(`/msg ${player} ${message}`);
}

export function sendMoneyToPlayer(grieferGamesBot: GrieferGamesBot, player: string, amount: number): void {
    grieferGamesBot.bot.chat(`/pay ${player} ${amount}`);
}