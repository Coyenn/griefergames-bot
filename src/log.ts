export default function logWithContext(context: string, message: string): void {
    console.log(`[${new Date().toLocaleTimeString()}] [${context.toUpperCase()}] - ${message}`);
}