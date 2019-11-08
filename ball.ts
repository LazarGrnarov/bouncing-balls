import { Utils } from './utils';

const colors = ['blue', 'green', 'red', 'yellow', 'rgba(231, 84, 128, 1)'] // 'pink'


export class Point {
    X: number;
    Y: number;
    constructor(XX: number, YY: number) {
        this.X = XX;
        this.Y = YY;
    }

    distance(other: Point): number {
        let dx = this.X - other.X;
        let dy = this.Y - other.Y;
        return Utils.hypot(dx, dy);
    }
}

interface MovableShape {
    id: any
    coordinates: Point;
    deltaX: number;
    deltaY: number;

    move(deltaX: number, deltaY: number, counter?: number)
}

interface CollisionAwareShape extends MovableShape {
    immunity: number;
    noclip: boolean;

    isCollision(other: CollisionAwareShape): boolean
}

export class Ball implements CollisionAwareShape {
    readonly handler: MoveService<CollisionAwareShape>;
    readonly id: number;
    coordinates: Point;
    deltaX: number;
    deltaY: number;
    radius: number;
    color: string;
    noclip: boolean = false;
    immunity: number; // time in number of steps. Used to allow clipping to let balls spread on creation
    constructor(
        coords: Point,
        id: number,
        handler: MoveService<CollisionAwareShape>,
        deltaX?: number,
        deltaY?: number,
        radius?: number,
        color?: string,
        immunity?: number) {
        this.coordinates = coords;
        this.deltaX = deltaX !== undefined ? deltaX : Utils.randomRange(5, 10)
        this.deltaY = deltaY !== undefined ? deltaY : Utils.randomRange(1, 3);
        this.radius = radius !== undefined ? radius : Utils.randomRange(5, 15, true, true);
        this.color = color !== undefined ? color : Utils.randomChoice(colors);
        this.handler = handler;
        this.handler.items.push(this)
        this.id = id;
        this.immunity = immunity !== undefined ? immunity : 10;
    }

    isCollision(other: Ball): boolean {
        return this.coordinates.distance(other.coordinates) < this.radius + other.radius
    }

    move(moveX?: number, moveY?: number, currentCounter: number = 0): Ball {
        let deltaX = moveX !== undefined ? moveX : this.deltaX;
        let deltaY = moveY !== undefined ? moveY : this.deltaY;
        let boundary = this.handler.boundary
        if (currentCounter > 20) return this; // don't try to calculate more collisions from a single movement
        if (this.deltaY == 0) deltaY = 0; // don't uproot still balls
        if (boundary !== undefined) {
            // Vertical movement
            if ((this.coordinates.Y + this.radius + deltaY > boundary.Y && deltaY > 0) || (this.coordinates.Y - this.radius - deltaY < 0 && deltaY < 0)) {
                // hit the floor, reverse direction
                this.deltaY = -this.deltaY;
                if (Math.abs(this.deltaY) < 0.5 && this.coordinates.Y + this.radius + deltaY > boundary.Y) {
                    // set the ball to the 'floor' since it would keep bouncing due to our 'gravity'
                    this.coordinates.Y = boundary.Y - this.radius
                    this.deltaY = 0
                }
            }

            // Horizontal movement
            if ((this.coordinates.X + this.radius + deltaX > boundary.X && deltaX > 0) || (this.coordinates.X - this.radius - Math.abs(deltaX) < 0 && deltaX < 0)) {
                // hit the wall, reverse direction
                this.deltaX = -this.deltaX;
            }

            this.coordinates.X += deltaX;
            this.coordinates.Y += deltaY;

            // keep the balls inside
            this.coordinates.X = Math.max(Math.min(this.coordinates.X, boundary.X - this.radius), this.radius)
            this.coordinates.Y = Math.max(Math.min(this.coordinates.Y, boundary.Y - this.radius), this.radius)

            this.cleanup();

            this.handler.handleCollision(this, currentCounter + 1);
            return this;
        } else {
            // don't need to wory about out of bounds, just move the ball
            this.coordinates.X += deltaX;
            this.coordinates.Y += deltaY;
        }
    }

    cleanup() {
        if (Math.abs(this.deltaX) < 0.1) this.deltaX = 0; // patience is a virtue
        if (this.deltaX == 0 && this.deltaY == 0) {
            this.noclip = true;
            this.color = 'rgba(255, 127, 80, 0.3)' // a shade of orange with transparency to indicate noclip
        }
    }
}

interface MoveService<T extends MovableShape> {
    items: T[]
    handleCollision?: (item: T, counter: number) => void
    running: boolean
    boundary?: Point
}

export class BouncyService implements MoveService<CollisionAwareShape> {
    items: CollisionAwareShape[] = [];
    running: boolean = false;
    boundary?: Point
    constructor(items: CollisionAwareShape[], boundary?: Point) {
        this.items = items;
        if (boundary) this.boundary = boundary
    }

    setBoudary(boundary?: Point) {
        this.boundary = boundary;
    }

    findCollisonPossibleSet(): CollisionAwareShape[] {
        return this.items.filter((other: CollisionAwareShape) => {
            return other.immunity <= 0 && !other.noclip
        })
    }

    findAllCollisionItemsForItem(item: CollisionAwareShape): CollisionAwareShape[] {
        return this.findCollisonPossibleSet().filter((other: CollisionAwareShape) => {
            return (other.id != item.id) ? item.isCollision(other) : false;
        })
    }

    handleCollision(ball: CollisionAwareShape, counter: number) {
        let hit = false;
        this.findAllCollisionItemsForItem(ball).forEach((other) => {
            hit = true;
            other.move(ball.deltaX, ball.deltaY, counter)
        });
        if (hit) {
            ball.deltaX = -ball.deltaX;
            ball.deltaY = -ball.deltaY;
        }
    }

    attenuate() {
        this.items.filter((moveable: MovableShape | CollisionAwareShape) => { return moveable.deltaY != 0 || moveable.deltaX != 0 })
            .forEach((moveable: MovableShape | CollisionAwareShape) => {
                if ((moveable as CollisionAwareShape).immunity) {
                    if( (moveable as CollisionAwareShape).immunity > 0) (moveable as CollisionAwareShape).immunity -= 1
                }
                moveable.deltaY *= 0.99;
                if (moveable.deltaY != 0) {
                    moveable.deltaY += 0.25; // 'gravity'
                }
                moveable.deltaX *= (moveable.deltaY != 0) ? 0.99 : 0.5; // slow down horizontal movement more if the ball isn't bouncing
            })
    }
}
