
import { Ball, BouncyService, Point } from './ball';
import { Utils } from './utils';


export class Draw {
    readonly STEP; // in ms, how often to refresh ball speed, check if stopped, etc.
    readonly MIN_BALLS_PER_CLICK;
    readonly MAX_BALLS_PER_CLICK;
    readonly canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;
    readonly label: HTMLElement = document.getElementById('info');
    readonly toggleButton: HTMLElement;
    readonly restartButton: HTMLElement;
    raf: number;
    CANVAS_TOP: number;
    CANVAS_LEFT: number;
    start: number = null;
    service: BouncyService;
    BALL_LIMIT: number = 10; // safe default

    constructor(step: number = 100, minBalls: number = 1, maxBalls = 10) {
        this.STEP = step;
        this.MIN_BALLS_PER_CLICK = minBalls;
        this.MAX_BALLS_PER_CLICK = maxBalls;
        this.BALL_LIMIT = (this.canvas.width * this.canvas.height * 0.3 / (10 * Math.PI * 2)) | 0 // limit the canvas to about 30% of area with balls        

        this.label = document.getElementById('info');
        this.toggleButton = document.getElementById('toggle');
        this.restartButton = document.getElementById('restart');
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d');
        let rect = this.canvas.getBoundingClientRect();
        this.CANVAS_TOP = rect.top;
        this.CANVAS_LEFT = rect.left;
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
        let boundaries = new Point(this.ctx.canvas.width, this.ctx.canvas.height)

        window.addEventListener('resize', this.resizeWindow.bind(this));
        this.toggleButton.addEventListener('click', this.toggle.bind(this));
        this.restartButton.addEventListener('click', this.restart.bind(this));
        this.canvas.addEventListener('click', (e) => {
            this.main(new Point(e.clientX - this.CANVAS_LEFT, e.clientY - this.CANVAS_TOP));
        });

        this.service = new BouncyService([], boundaries)
    }

    restart() {
        this.service.running = false
        this.service.items = []
        window.setTimeout(() => { window.cancelAnimationFrame(this.raf) }, 16)
    }

    main(point: Point) {
        if (this.service.items.length > this.BALL_LIMIT) {
            this.label.removeAttribute('hidden');
            window.setTimeout(() => { this.label.setAttribute('hidden', 'true') }, 1500);
            return;
        }

        let numberOfBalls = Utils.randomRange(this.MIN_BALLS_PER_CLICK, this.MAX_BALLS_PER_CLICK, true, true);
        while (numberOfBalls > 0) {
            if (this.service.running) {
                window.cancelAnimationFrame(this.raf);
                this.service.running = false;
            }
            let newBall = new Ball(new Point(point.X, point.Y), this.service.items.length, this.service); // point is passed as a reference, send help.
            numberOfBalls--;
        }

        if (!this.service.running) {
            this.raf = window.requestAnimationFrame((ts) => this.draw(ts));
            this.service.running = true;
        }
    }

    draw(timestamp: number) {
        if (!this.start) this.start = timestamp;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.service.items.forEach((ball: Ball) => {
            ball.move(ball.deltaX, ball.deltaY);
            this.drawBall(ball);
        })
        if (timestamp - this.start > this.STEP) {
            this.start = timestamp;
            this.service.attenuate();
        }
        this.raf = window.requestAnimationFrame((ts) => this.draw(ts));
    }

    drawBall(ball: Ball) {
        let ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(ball.coordinates.X, ball.coordinates.Y, ball.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = ball.color;
        ctx.fill();
    }

    toggle() {
        if (!this.service.running) {
            this.raf = window.requestAnimationFrame((ts) => this.draw(ts));
            this.service.running = true;
            this.toggleButton.textContent = 'pause';
        } else {
            window.cancelAnimationFrame(this.raf);
            this.service.running = false;
            this.toggleButton.textContent = 'resume';
        }
    }

    resizeWindow() {
        let rect = this.canvas.getBoundingClientRect();
        this.CANVAS_TOP = rect.top;
        this.CANVAS_LEFT = rect.left;
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
        this.service.setBoudary(new Point(this.ctx.canvas.width, this.ctx.canvas.height))

        this.service.items.filter((ball) => { return ball.noclip }).forEach((ball: Ball) => {
            ball.coordinates.Y = this.ctx.canvas.height - ball.radius
        });

        this.BALL_LIMIT = ((this.canvas.width * this.canvas.height * 0.3) / (10 * Math.PI * 2)) | 0
    }
}