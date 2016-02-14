var speed = 5;
var torque = 5;
var lifeSpan = 200;

var prey = new Path.Circle(view.center, 20);
prey.fillColor = 'red';


var head = new Path.Circle(view.bounds.leftCenter, 5);
head.transformContent = false;
head.velocity = new Point();
head.velocity.length = speed;

var tail = new Path([view.bounds.leftCenter]);
tail.maxLength = 50;
tail.strokeColor = 'black';
tail.strokeWidth = 20;
tail.strokeCap = 'round';

var target = view.center;

function onFrame(event) {
    
    if (!prey.caught) {
        prey.lifeSpan--;
    }

    if (prey.lifeSpan < 0) {
        prey.reset();
    }
    
    var delta = target - head.position;
    if (delta.length > speed) {
        var a = delta.getDirectedAngle(head.velocity);
        if (a < 0 - torque) {
            head.velocity.angle += torque;
        } 
        else if (a > 0 + torque) {
            head.velocity.angle -= torque;
        }
        else {
            head.velocity.angle = delta.angle;
        }
    }
    else {
        target = Point.random() * view.size;
    }
    
    if ((prey.position - head.position).length < 20) {
        prey.reset();
    }
    
    head.position += head.velocity;
    head.rotation = head.velocity.angle;
    
    tail.add(head.position);
    
    if (tail.segments.length > tail.maxLength) {
        tail.segments.splice(0, tail.segments.length - tail.maxLength)
    }
}

function onMouseDown(event) {
    target = event.point;
}

function onMouseDrag(event) {
    target = event.point;
}

prey.reset = function () {
    this.opacity = 1;
    this.caught = false;
    this.lifeSpan = lifeSpan;
    this.position = Point.random() * view.size;
}

prey.onMouseDown = function () {
    this.opacity = 0.3;
    this.caught = true;
    target = this.position;
}

prey.reset();

