var SPEED = 7;

function Snake() {

    var baseColor = new Color({hue: 125, saturation: 0.5, brightness: 0.6});
    var speed = SPEED;
    var partsTotal = 11;
    var partSize = Math.round(10 * (5 / speed));
    var pointsTotal = partSize * partsTotal;
    var torque = speed * 0.75;
    var width = 30;
    var startPoint = view.bounds.leftCenter - [width, 0];

    this.spine = createSpine();
    this.tail = createTail();
    this.body = createBody();
    this.head = createHead();
    this.target = view.center;
    this.swallowPointIndex = -1;

    this.eat = function () {
        this.swallowPointIndex = pointsTotal - 1;
        var vec = this.head.velocity.clone();
        vec.length = speed * 10;
        this.target = this.head.position + vec;
    };

    this.update = function (frame) {
        var delta = this.target - this.head.position;
        if (delta.length > speed) {
            this.steer(delta, frame);
            this.swallowPointIndex -= 0.5;
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
        this.head.shape.radius = width / 2 + calcWidth(pointsTotal - 1, this.swallowPointIndex);
    };

    this.updateTail = function () {
        this.tail.position = this.spine.firstSegment.point;
    };

    this.updateSpine = function () {
        this.spine.add(this.head.position);
        this.spine.lastSegment.direction = this.head.velocity.angle;
        this.spine.removeSegment(0);
    };

    this.updateBody = function () {
        var spine = this.spine;
        var swallowIndex = this.swallowPointIndex;
        this.body.children.forEach(function (part, offset) {
            part.segments = [];
            for (var i = 0; i < partSize + 1; i++) {
                var index = i + offset * partSize - 1;
                if (index < 0) {
                    part.add(spine.segments[0]);
                    continue;
                }
                var segment = spine.segments[index];

                var delta = new Point();
                delta.length = width / 2 + calcWidth(index, swallowIndex);
                delta.angle = segment.direction + 90;
                var top = segment.point + delta;
                var bottom = segment.point - delta;

                part.add(top);
                part.insert(0, bottom);

            }

            part.closed = true;
        })
    };

    function calcWidth (index, swallowIndex) {
        var l = (5/SPEED) * 10;
        var p = (Math.abs(swallowIndex - index) < l) ? (l - Math.abs(swallowIndex - index)) / l : 0;
        p *= Math.PI / 2;
        return Math.sin(p) * l * 3 * (index / pointsTotal) * (SPEED/5);
    }

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

        head.shape = new Shape.Circle(startPoint, width / 2);
        head.shape.fillColor = baseColor;
        head.addChild(head.shape);

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
        var tail = new Shape.Circle(startPoint, width / 2);
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


prey.onFrame = function () {
    if (!this.caught) {
        this.life--;
    }

    if (this.life < 0) {
        this.reset();
    }
};

prey.catch = function () {
    this.aliveSkin.visible = false;
    this.deadSkin.visible = true;
    this.scaling = 1.2;
    this.caught = true;
    snake.target = this.position;
};

prey.release = function () {
    this.aliveSkin.visible = true;
    this.deadSkin.visible = false;
    this.scaling = 0.9;
    this.caught = false;
};

prey.reset = function () {
    this.release();
    this.life = this.lifeSpan;

    // Random origin:
    var axis = Math.round(Math.random());
    var edge = Math.round(Math.random());
    var perc = Math.random();

    if (axis == 0) {
        this.position.x = edge * view.bounds.width;
        this.position.y = perc * view.bounds.height;
    }
    else {
        this.position.x = perc * view.bounds.width;
        this.position.y = edge * view.bounds.height;
    }

    var dest = new Point();
    if (axis == 0) {
        dest.x = view.bounds.width / 2;
        dest.y = (1-Math.round(perc)) * view.bounds.height;
    }
    else {
        dest.x = (1-Math.round(perc)) * view.bounds.width;
        dest.y = view.bounds.height / 2;
    }

    this.rotation = (dest - this.position).angle - 180;
};

prey.onMouseDown = function () {
    this.catch();
};

prey.onMouseUp = function () {
    this.release();
};

prey.move = function (frame) {
    if (frame % 2 == 0) {
        this.rotation += Math.random() * 6 - 3;
        var v = new Point();
        v.angle = this.rotation - 180;
        v.length = 6 * (SPEED / 5);
        this.position += v;
    }
};


var querySpeed = parseInt(window.location.search.substr(1));
if (!isNaN(querySpeed)) {
    SPEED = querySpeed;
}


var snake = new Snake();
prey.reset();


function onMouseDown(event) {
    snake.target = event.point;
}

function onMouseDrag(event) {
    snake.target = event.point;
}

function onMouseUp () {
    prey.release();
}

function onFrame(event) {
    snake.update(event.count);
    if ((prey.position - snake.head.position).length < 40) {
        prey.reset();
        snake.eat();
    }
    else if (!prey.caught) {
        prey.move(event.count);
    }
}



