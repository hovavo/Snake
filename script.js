function Snake() {

    var baseColor = new Color({hue: 0, saturation: 0.7, brightness: 0.8});
    var speed = 6;
    var partsTotal = 11;
    var partSize = 8;
    var torque = 5;
    var width = 30;
    var startPoint = view.bounds.leftCenter - [30, 0];

    this.spine = createSpine();
    this.tail = createTail();
    this.body = createBody();
    this.head = createHead();

    this.target = view.center;


    this.update = function (frame) {
        var delta = this.target - this.head.position;
        if (delta.length > speed) {
           this.steer(delta, frame);
        }
        else {
            this.target = Point.random() * view.size;
        }

        this.updateHead();
        this.updateSpine();
        this.updateBody();
        this.updateTail();
    };

    this.steer = function (delta, frame) {
        var a = delta.getDirectedAngle(this.head.velocityClean);
        if (a < 0 - torque) {
            this.head.velocityClean.angle += torque;
        }
        else if (a > 0 + torque) {
            this.head.velocityClean.angle -= torque;
        }
        else {
            this.head.velocityClean.angle = delta.angle;
        }

        // Sine wave movement:
        this.head.velocity.angle = this.head.velocityClean.angle + Math.sin(frame * 0.06) * 5;
    };

    this.updateHead = function () {
        this.head.position += this.head.velocity;
        this.head.rotation = this.head.velocity.angle;
    };

    this.updateTail = function () {
        this.tail.position = this.spine.firstSegment.point;
    };

    this.updateSpine = function (){
        this.spine.add(this.head.position);
        this.spine.lastSegment.direction = this.head.velocity.angle;
        this.spine.removeSegment(0);
    };

    this.updateBody = function () {
        var spine = this.spine;
        this.body.children.forEach(function(part, offset) {
            part.segments = [];
            for (var i = 0; i < partSize + 1; i++) {
                var index = i + offset * partSize - 1;
                if (index < 0) {
                    part.add(spine.segments[0]);
                    continue;
                }
                var segment = spine.segments[index];

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
    };


    function createSpine() {
        var tail = new Path();
        for (var i = 0; i < partsTotal * partSize; i++) {
            tail.add(startPoint);
        }
        return tail;
    }

    function createBody() {
        var body = new Group();
        for (var i = 0; i < partsTotal; i++) {
            var part = new Path();
            part.fillColor = baseColor;
            part.fillColor.brightness -= (i % 2) * 0.2;
            body.addChild(part);
        }

        return body;
    }

    function createHead() {

        var head = new Group();
        head.velocityClean = new Point();
        head.velocityClean.length = speed;
        head.velocity = new Point();
        head.velocity.length = speed;

        head.transformContent = false;

        var shape = new Shape.Circle(startPoint, width / 2);
        shape.fillColor = baseColor;
        head.addChild(shape);

        var eye1 = new Shape.Circle(startPoint, width / 8);
        eye1.fillColor = 'white';
        eye1.opacity = 0.4;

        var eye2 = eye1.clone();

        eye1.position.y += width / 4;
        eye2.position.y -= width / 4;

        head.addChild(eye1);
        head.addChild(eye2);


        return head;
    }

    function createTail() {
        var tail = new Path.Circle(startPoint, width / 2);
        tail.fillColor = baseColor;
        return tail;
    }
}



var prey = project.importSVG(document.querySelector('#Pig'));
prey.aliveSkin = prey.getItem({name: 'Alive'});
prey.deadSkin = prey.getItem({name: 'Dead'});
prey.transformContent = false;
prey.lifeSpan = 200;
prey.scaling = 0.8;


prey.onFrame = function() {
    if (!this.caught) {
        this.life--;
    }

    if (this.life < 0) {
        this.reset();
    }
};

prey.reset = function () {
    this.aliveSkin.visible = true;
    this.deadSkin.visible = false;
    this.caught = false;
    this.eaten = false;
    this.life = this.lifeSpan;
    this.position = Point.random() * view.size;
    this.rotation = Math.random() * 360;
};

prey.onMouseDown = function () {
    this.aliveSkin.visible = false;
    this.deadSkin.visible = true;
    this.caught = true;
    snake.target = this.position;
};


var snake = new Snake();
prey.reset();


function onMouseDown(event) {
    snake.target = event.point;
}

function onMouseDrag(event) {
    snake.target = event.point;
}

function onFrame(event) {
    snake.update(event.count);
    if ((prey.position - snake.head.position).length < 20) {
        // prey.eaten = true;
        prey.reset();
    }
}




