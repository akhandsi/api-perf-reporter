export function log(message: any, exit: any) {
    console.error(message);
    exit && process.exit(1);
}
