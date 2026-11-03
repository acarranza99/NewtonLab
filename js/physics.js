
class PhysicsObject {

    constructor(mass = 10, friction = 0.4) {
        this.mass = mass;
        this.friction = friction;
        this.position = 0;
        this.velocity = 0;
        this.acceleration = 0;
        this.appliedForce = 0;
        this.netForce = 0;
    }

    applyForce(force) {
        this.appliedForce = force;
    }

    update(dt) {

        dt = Math.max(0, Math.min(dt, 0.033));

        const normal = this.mass * 9.81;
        const maxStatic = this.friction * normal;
        const kinetic = this.friction * normal;

        let frictionForce = 0;

        if (Math.abs(this.velocity) < 0.001) {

            if (Math.abs(this.appliedForce) <= maxStatic) {
                this.velocity = 0;
                this.acceleration = 0;
                this.netForce = 0;
                return this.getState();
            }

            frictionForce =
                -Math.sign(this.appliedForce) * kinetic;

        } else {

            frictionForce =
                -Math.sign(this.velocity) * kinetic;
        }

        this.netForce = this.appliedForce + frictionForce;
        this.acceleration = this.netForce / this.mass;

        const oldVelocity = this.velocity;

        this.velocity += this.acceleration * dt;

        // Evitar que la fricción invierta la dirección
        // del movimiento cuando el objeto se está deteniendo.
        if (
            this.appliedForce === 0 &&
            oldVelocity !== 0 &&
            Math.sign(this.velocity) !== Math.sign(oldVelocity)
        ) {
            this.velocity = 0;
            this.acceleration = 0;
            this.netForce = 0;
        }

        this.position +=
            ((oldVelocity + this.velocity) / 2) * dt;

        return this.getState();
    }

    getState() {
        return {
            position: this.position,
            velocity: this.velocity,
            acceleration: this.acceleration,
            netForce: this.netForce
        };
    }

    clearForce() {
        this.appliedForce = 0;
    }

    setMass(value) {
        if (value <= 0) return;
        this.mass = value;
    }

    setFriction(value) {
        this.friction = Math.max(0, value);
    }

    reset() {
        this.position = 0;
        this.velocity = 0;
        this.acceleration = 0;
        this.appliedForce = 0;
        this.netForce = 0;
    }
}
