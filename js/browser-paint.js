window.onload = function () {
    "use strict"

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    function EditState(brushSize, startPoint, color) {
        this.brushSize = brushSize;
        this.points = [startPoint];
        this.color = color;

        this.addPoint = function (point) {
            this.points.push(point);
        }
    }

    // global state
    var previousEdits = new Array();
    var futureEdits = new Array();
    var brushSize = 5;
    var mouseDown = false;

    var canvas = document.getElementById("main");
    var context = canvas.getContext("2d");
    var colorPicker = document.getElementById("color-picker");
    var brushSizePicker = document.getElementById("brushsize");
    var undoButton = document.getElementById("undo");
    var redoButton = document.getElementById("redo");
    context.lineJoin = "round";

    function drawPoint(point) {
        context.lineTo(point.x, point.y);
        context.stroke();
    } 

    function drawEdit(edit) {
        context.strokeStyle = edit.color;
        context.lineWidth = edit.brushSize;
        context.beginPath();
        context.moveTo(edit.points[0].x, edit.points[0].y);
        for (var i = 0; i < edit.points.length; ++i) {
            drawPoint(edit.points[i]);
        }
        context.closePath();
    };


    function redraw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        previousEdits.forEach(function (thing) {
            console.log(thing);
        });
        previousEdits.forEach(drawEdit);
    };

    function undo() {
        if (previousEdits.length > 0) {
            futureEdits.push(previousEdits.pop());
            redraw();
            redoButton.disabled = false;
            if (previousEdits.length === 0) {
                undoButton.disabled = true;
            }
        }
    }
    
    function redo() {
        if (futureEdits.length > 0) {
            previousEdits.push(futureEdits.pop());
            redraw();
            undo.disabled = false;
            if (futureEdits.length === 0) {
                redoButton.disabled = true;
            }
        }
    }

    function endPaint() {
        mouseDown = false;
        context.closePath();
    }

    canvas.addEventListener("mousedown", function (e) {
        mouseDown = true;
        var point = new Point(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
        var color = colorPicker.value
        var newEdit = new EditState(brushSize, point, color);
        context.strokeStyle = color;
        context.lineWidth = brushSizePicker.value;
        context.beginPath();
        // Gotta start from somewhere, so we start "imperceptibly" slightly off
        context.moveTo(point.x - 1, point.y); 
        drawPoint(point);
        previousEdits.push(newEdit);
        undoButton.disabled = false;
    })

    canvas.addEventListener("mouseup", function (event) {
        endPaint();
    });

    canvas.addEventListener("mousemove", function (event) {
        if (!mouseDown) { return; }

        var lastEdit = previousEdits[previousEdits.length - 1];
        var lastPoint = lastEdit.points[lastEdit.points.length - 1];
        var point = new Point(event.pageX - this.offsetLeft, event.pageY - this.offsetTop);
        lastEdit.addPoint(point);
        
        context.moveTo(lastPoint.x, lastPoint.y);
        drawPoint(point);
    });

    canvas.addEventListener("mouseleave", function (event) {
        endPaint();
    });

    undoButton.addEventListener("click", undo);

    redoButton.addEventListener("click", redo);

};