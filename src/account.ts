import { readFileSync } from "fs";

export interface Account {
    username: string;
    auth: 'mojang' | 'microsoft' | 'offline';
}

export function getAccount(): Account {
    const accountInfo = readFileSync('./config/account.json', 'utf-8');

    return JSON.parse(accountInfo);
}