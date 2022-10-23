# GrieferGames bot

This is a bot for the GrieferGames Minecraft server.

## Developing

- pnpm install
- pnpm dev

For a local development server, you can use the `docker-compose.yml` file.
Make sure to comment `await localGrieferGamesBot.navigateToTradingSpot(spots[0]);` in `src/main.ts`.

## Building

- pnpm build

All binaries will be in the `dist/bin` folder.
