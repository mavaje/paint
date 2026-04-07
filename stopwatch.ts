
export const stopwatch = {
    start_time: 0,
    lap_time: 0,

    start(message: string = 'Start!') {
        this.start_time = this.lap_time = Date.now();
        console.log(message);
    },

    lap(message: string) {
        const now = Date.now();
        console.log(`${this.format_time(now - this.lap_time)} (${this.format_time(now - this.start_time)}) - ${message}`);
        this.lap_time = now;
    },

    format_time(timestamp: number) {
        const m = (Math.floor(timestamp / 60000) % 60).toString().padStart(2, '0');
        const s = (Math.floor(timestamp / 1000) % 60).toString().padStart(2, '0');
        const ss = timestamp % 1000;
        return `${m}:${s}.${ss}`;
    }
}
