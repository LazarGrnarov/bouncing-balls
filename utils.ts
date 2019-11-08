export class Utils {
    
    static hypot(a: number, b: number): number {
        return Math.sqrt(a * a + b * b)
    }
    
    static generateSign(): number {
        return Math.random() > 0.5 ? 1 : -1;
    }

    static randomRange(min: number, max: number, asInt: boolean = false, onlyPositive: boolean = false): number {
        let random = Math.random() * (max - min) + min;
        if (asInt) random = random | 0;
        return random * (onlyPositive ? 1 : this.generateSign()); // | 0 converts to to int, random sign
    }

    static randomChoice(list) {
        return list[Math.floor(Math.random() * list.length)];
    }
}