var speed = 4;
var torque = 5;
var lifeSpan = 200;
var width = 30;

var prey = new Path.Circle(view.center, width / 2);
prey.fillColor = 'blue';
prey.fillColor.saturation = 0.2;


var tail = createTail();
// spine.selected = true;

var parts = createParts();

var target = view.center;

var head = new Path.Circle(view.bounds.leftCenter, width / 2);
head.fillColor = 'red';
head.fillColor.saturation = 0.4;
head.fillColor.brightness = 0.7;
head.velocity = new Point();
head.velocity.length = speed;

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
        // prey.eaten = true;
        prey.reset();
    }
    
    head.position += head.velocity;
    head.rotation = head.velocity.angle;
    
    tail.add(head.position);
    tail.lastSegment.direction = head.velocity.angle;
    tail.removeSegment(0);
    
    update();
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
    this.eaten = false;
    this.lifeSpan = lifeSpan;
    this.position = Point.random() * view.size;
}

prey.onMouseDown = function () {
    this.opacity = 0.3;
    this.caught = true;
    target = this.position;
}

prey.reset();


function update () {
    parts.children.forEach(function(part, offset) {
        part.segments = [];
        for (var i = 0; i < 11; i++) {
            var index = i + offset * 10 - 1;
            if (index < 0) {
                part.add(tail.segments[0]);
                continue;
            }
            var segment = tail.segments[index];
            
            var w = width / 2;
            var delta = new Point();
            delta.length = w;
            delta.angle = segment.direction + 90;
            var top = segment.point + delta;
            var bottom = segment.point - delta;
            
            part.add(top);
            part.insert(0, bottom);
            
        }
        
        part.closed = true;
    })
}

function createTail() {
    var tail = new Path();
    for (var i = 0; i < 100; i++) {
        tail.add(view.bounds.leftCenter);
    }
    return tail;
}

function createParts() {
    var parts = new Group();
    for (var i = 0; i < 10; i++) {
        var part = new Path();
        part.fillColor = 'red';
        part.fillColor.saturation = 0.4;
        part.fillColor.brightness = ((i % 2 == 0) ? 1 : 0.7) + (10-i)/100;
        parts.addChild(part);
    }
    
    return parts;
}
