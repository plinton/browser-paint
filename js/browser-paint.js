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
    var previousEdits = new Array(); // for undo
    var futureEdits = new Array(); // for redo
    var mouseDown = false;

    var canvas = document.getElementById("main");
    var context = canvas.getContext("2d");
    var colorPicker = document.getElementById("color-picker");
    var brushSizePicker = document.getElementById("brushsize");
    var undoButton = document.getElementById("undo");
    var redoButton = document.getElementById("redo");

    // these make reasonably smooth lines, and we do not change them.
    context.lineJoin = "round";
    context.lineCap = "round";

    function drawPoint(point) {
        context.lineTo(point.x, point.y);
    } 

    function drawEdit(edit) {
        context.strokeStyle = edit.color;
        context.lineWidth = edit.brushSize;
        context.beginPath();
        context.moveTo(edit.points[0].x, edit.points[0].y);
        edit.points.forEach(drawPoint);
        context.stroke();
        context.closePath();
    };


    function redraw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
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
    }

    canvas.addEventListener("mousedown", function (e) {
        mouseDown = true;
        var point = new Point(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
        var newEdit = new EditState(brushSizePicker.value, point, colorPicker.value);
        previousEdits.push(newEdit);
        undoButton.disabled = false;
        drawEdit(newEdit);

    })

    canvas.addEventListener("mouseup", function (event) {
        endPaint();
    });

    canvas.addEventListener("mousemove", function (event) {
        if (!mouseDown) { return; }

        var lastEdit = previousEdits[previousEdits.length - 1];
        var point = new Point(event.pageX - this.offsetLeft, event.pageY - this.offsetTop);
        lastEdit.addPoint(point);
        drawEdit(lastEdit);
    });

    canvas.addEventListener("mouseleave", function (event) {
        endPaint();
    });

    undoButton.addEventListener("click", undo);

    redoButton.addEventListener("click", redo);

};