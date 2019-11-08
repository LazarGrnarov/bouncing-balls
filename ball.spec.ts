import { Ball, Point, BouncyService } from './ball';
import { expect } from 'chai';

describe('Ball', () => {
    let boudary = new Point(100, 100)
    let service: BouncyService;
    beforeEach(() => {
        service = new BouncyService([], boudary)
    })
    it('should create a ball object with 1, 1 coords', () => {
        let b = new Ball(new Point(10, 20), 1, service, 1, 2)
        expect(b.coordinates.X).to.eql(10);
        expect(b.coordinates.Y).to.eql(20);
    })

    it('should move by deltaX, deltaY', () => {

        let b = new Ball(new Point(10, 20), 99, service, 1, 2, 1)
        b.move()
        expect(b.coordinates.X).to.eql(11);
        expect(b.coordinates.Y).to.eql(22);
    })

    it('should not move', () => {
        let b1 = new Ball(new Point(10, 20), 99, service, 1, 2, 1)
        let b2 = new Ball(new Point(15, 25), 99, service, 1, 2, 1)
        let c1 = {...b1.coordinates}
        let c2 = {...b2.coordinates}
        b2.move()
        b2.move()
        expect([c1.X, c1.Y]).to.eql([b1.coordinates.X, b1.coordinates.Y])
        expect([c2.X, c2.Y]).to.not.eql([b1.coordinates.X, b1.coordinates.Y])
    })

    it('should move by deltaX, deltaY negative', () => {
        
                let b = new Ball(new Point(10, 20), 99, service, -1, -2, 1)
                b.move()
                expect(b.coordinates.X).to.eql(9);
                expect(b.coordinates.Y).to.eql(18);
            })

    it('should reverse direction deltaX', () => {
        service.setBoudary(boudary)
        let deltaX = 10
        let b = new Ball(new Point(98, 20), 1, service, deltaX, 2, 1)
        b.move()
        expect(b.deltaX).to.eql(-1 * deltaX)
    })

    it('should reverse direction deltaY', () => {
        let deltaY = 10
        let b = new Ball(new Point(10, 98), 1, service, 1, deltaY, 1)
        b.move()
        expect(b.deltaY).to.eql(-1 * deltaY)
    })

    it('unset boundaries, should not reverse direction', () => {
        service.setBoudary(undefined)
        let deltaX = 20
        let deltaY = 10
        let b = new Ball(new Point(98, 98), 1, service, deltaX, deltaY, 1)
        b.move()
        expect(b.deltaX).to.eql(deltaX)
        expect(b.deltaY).to.eql(deltaY)
    })

    it('should calculate collision', () => {
        let ball = new Ball(new Point(10, 20), 1, service, 1, 2, 10)
        let other = new Ball(new Point(12, 22), 1, service, 1, 2, 15)
        let distant = new Ball(new Point(23, 33), 1, service, 1, 2, 2)
        expect(ball.isCollision(other)).to.eql(true)
        expect(ball.isCollision(distant)).to.eql(false)
    })

    it('should cleanup', () => {
        let ball = new Ball(new Point(10, 20), 1, service, 0.01, 0, 10)
        ball.cleanup()
        expect(ball.noclip).to.eql(true)
    })
})

describe('Service', () => {
    let service: BouncyService;
    beforeEach(() => {
        let boudary = new Point(100, 100)
        service = new BouncyService([], boudary)
        let rad = 3
        Array.from(Array(5).keys()).map((num) => {
            return new Ball(new Point(num / 2 + rad, num / 2 + rad), num, service, 2, 2, rad, "blue", 10)
        })
    })

    it('should add items to the service', () => {
        expect(service.items.length).to.eql(5)
    })

    it('items should have unique ids', () => {
        expect(new Set(service.items.map((item) => item.id)).size).to.eql(service.items.length)
    })

    it('should attenuate', () => {
        let items = service.items.map(obj => ({ ...obj })); //deep copy
        service.attenuate();
        items.forEach((item, index) => {
            expect([service.items[index].deltaX, service.items[index].deltaY]).to.not.eql([item.deltaX, item.deltaY])
        })
    })

    it('should find no collison possible items', () => {
        expect(service.findCollisonPossibleSet().length).to.eql(0)
    })

    it('should find 2 collison possible items', () => {
        service.items[0].immunity = -1
        service.items[1].immunity = -1
        expect(service.findCollisonPossibleSet().length).to.eql(2)
    })

    it('should find 2 collison items for item', () => {
        service.items[0].immunity = -1
        service.items[1].immunity = -1
        service.items[2].immunity = -1
        expect(service.findAllCollisionItemsForItem(service.items[1]).length).to.eql(2)
    })

    it('should handle collision', () => {
        let b = new Ball(new Point(2, 2), service.items.length, service, 5)
        let count = service.items.length
        service.handleCollision(b, 1)
        expect(count).to.eql(service.items.length)
    })
})
