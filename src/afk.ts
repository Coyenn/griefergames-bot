import GrieferGamesBot from "./bot"

export default function afk(grieferGamesBot: GrieferGamesBot) {
    let rotated = false

    function rotate() {
        grieferGamesBot.bot.look(rotated ? 0 : Math.PI, 0);

        rotated = !rotated;
    }

    setInterval(rotate, 30000)
}