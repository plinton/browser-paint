window.onload = function () {
    "use strict"

    // a point on the canvas
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    // a paint stroke, represented by the brushsize, color and the points moved.
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

    // DOM elements
    var canvas = document.getElementById("main");
    var context = canvas.getContext("2d");
    var colorPicker = document.getElementById("color-picker");
    var brushSizePicker = document.getElementById("brushsize");
    var undoButton = document.getElementById("undo");
    var redoButton = document.getElementById("redo");
    var uploadButton = document.getElementById("file-upload");
    var downloadButton = document.getElementById("file-download");

    // these make reasonably smooth lines along with the single stroke setup
    context.lineJoin = "round";
    context.lineCap = "round";

    whiteOutBackground(); // this is done first so the paint goes on top
    downloadButton.href = canvas.toDataURL(); // have the link be clickable

    // White out the background so that it is white in the saved image
    function whiteOutBackground() {
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    // convenience function for drawing a point
    function drawPoint(point) {
        context.lineTo(point.x, point.y);
    }

    // draw a complete edit as a single stroke
    function drawEdit(edit) {
        context.strokeStyle = edit.color;
        context.lineWidth = edit.brushSize;
        context.beginPath();
        context.moveTo(edit.points[0].x, edit.points[0].y);
        edit.points.forEach(drawPoint);
        context.stroke();
        context.closePath();
    };


    // redraw all of the previous edits
    function redraw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        whiteOutBackground();
        previousEdits.forEach(drawEdit);
    };

    // undo an edit
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

    // redo a previously undone action
    function redo() {
        if (futureEdits.length > 0) {
            previousEdits.push(futureEdits.pop());
            redraw();
            undo.disabled = false;
            // if we are at the beginning, disable undo
            if (futureEdits.length === 0) {
                redoButton.disabled = true;
            }
        }
    }

    // convience method for ending a stroke
    function endPaint() {
        mouseDown = false;
        // disable redo, so we can't redo after drawing
        futureEdits = new Array(); 
        redoButton.disabled = true;
    }

    // start making an edit
    canvas.addEventListener("mousedown", function (e) {
        mouseDown = true;
        var point = new Point(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
        var newEdit = new EditState(brushSizePicker.value, point, colorPicker.value);
        previousEdits.push(newEdit);
        undoButton.disabled = false;
        drawEdit(newEdit);

    })

    // finish the edit
    canvas.addEventListener("mouseup", function (event) {
        endPaint();
    });

    // finish the edit
    canvas.addEventListener("mouseleave", function (event) {
        endPaint();
    });

    // continue drawing the edit
    canvas.addEventListener("mousemove", function (event) {
        if (!mouseDown) { return; }

        var lastEdit = previousEdits[previousEdits.length - 1];
        var point = new Point(event.pageX - this.offsetLeft, event.pageY - this.offsetTop);
        lastEdit.addPoint(point);
        drawEdit(lastEdit);
    });

    // set undo
    undoButton.addEventListener("click", undo);

    // set redo
    redoButton.addEventListener("click", redo);

    // upload the image into the canvas
    uploadButton.addEventListener("change", function handleImage(e) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        var reader = new FileReader();
        reader.onload = function (event) {
            var img = new Image();
            img.onload = function () {
                context.drawImage(img, 0, 0);
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
    });

    // download the image as a file
    downloadButton.addEventListener("click", function (event) {
        downloadButton.href = canvas.toDataURL();
        downloadButton.download = "browse-paint.png";
    });
}