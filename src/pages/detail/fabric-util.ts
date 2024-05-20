import { fabric } from "fabric";

interface Coords {
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

export function initAligningGuidelines(canvas: fabric.Canvas) {
  const ctx = canvas.getSelectionContext();
  const aligningLineOffset = 10;
  const aligningLineMargin = 10;
  const aligningLineWidth = 1;
  const aligningLineColor = "rgb(0,255,0)";
  let viewportTransform: number[] | undefined = undefined;
  let zoom = 1;

  function drawVerticalLine(coords: Coords) {
    if (
      coords.x !== undefined &&
      coords.y1 !== undefined &&
      coords.y2 !== undefined
    ) {
      drawLine(
        coords.x + 0.5,
        coords.y1 > coords.y2 ? coords.y2 : coords.y1,
        coords.x + 0.5,
        coords.y2 > coords.y1 ? coords.y2 : coords.y1
      );
    }
  }

  function drawHorizontalLine(coords: Coords) {
    if (
      coords.x1 !== undefined &&
      coords.x2 !== undefined &&
      coords.y !== undefined
    ) {
      drawLine(
        coords.x1 > coords.x2 ? coords.x2 : coords.x1,
        coords.y + 0.5,
        coords.x2 > coords.x1 ? coords.x2 : coords.x1,
        coords.y + 0.5
      );
    }
  }

  function drawLine(x1: number, y1: number, x2: number, y2: number) {
    if (viewportTransform) {
      ctx.save();
      ctx.lineWidth = aligningLineWidth;
      ctx.strokeStyle = aligningLineColor;
      ctx.beginPath();
      ctx.moveTo(
        x1 * zoom + viewportTransform[4],
        y1 * zoom + viewportTransform[5]
      );
      ctx.lineTo(
        x2 * zoom + viewportTransform[4],
        y2 * zoom + viewportTransform[5]
      );
      ctx.stroke();
      ctx.restore();
    }
  }

  function isInRange(value1: number, value2: number) {
    value1 = Math.round(value1);
    value2 = Math.round(value2);
    for (
      let i = value1 - aligningLineMargin, len = value1 + aligningLineMargin;
      i <= len;
      i++
    ) {
      if (i === value2) {
        return true;
      }
    }
    return false;
  }

  const verticalLines: Coords[] = [];
  const horizontalLines: Coords[] = [];

  canvas.on("mouse:down", function () {
    viewportTransform = canvas.viewportTransform;
    zoom = canvas.getZoom();
  });

  canvas.on("object:moving", function (e) {
    const activeObject = e.target;
    const canvasObjects = canvas.getObjects();
    if (!activeObject || !viewportTransform) {
      return;
    }
    const activeObjectCenter = activeObject.getCenterPoint();
    const activeObjectLeft = activeObjectCenter.x;
    const activeObjectTop = activeObjectCenter.y;
    const activeObjectBoundingRect = activeObject.getBoundingRect();
    const activeObjectHeight =
      activeObjectBoundingRect.height / viewportTransform[3];
    const activeObjectWidth =
      activeObjectBoundingRect.width / viewportTransform[0];
    let horizontalInTheRange = false;
    let verticalInTheRange = false;
    const transform = canvas._currentTransform;

    if (!transform) return;

    // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
    // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move

    for (let i = canvasObjects.length; i--; ) {
      if (canvasObjects[i] === activeObject) continue;

      const objectCenter = canvasObjects[i].getCenterPoint();
      const objectLeft = objectCenter.x;
      const objectTop = objectCenter.y;
      const objectBoundingRect = canvasObjects[i].getBoundingRect();
      const objectHeight = objectBoundingRect.height / viewportTransform[3];
      const objectWidth = objectBoundingRect.width / viewportTransform[0];

      // snap by the horizontal center line
      if (isInRange(objectLeft, activeObjectLeft)) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft,
          y1:
            objectTop < activeObjectTop
              ? objectTop - objectHeight / 2 - aligningLineOffset
              : objectTop + objectHeight / 2 + aligningLineOffset,
          y2:
            activeObjectTop > objectTop
              ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
              : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(objectLeft, activeObjectTop),
          "center",
          "center"
        );
      }

      // snap by the left edge
      if (
        isInRange(
          objectLeft - objectWidth / 2,
          activeObjectLeft - activeObjectWidth / 2
        )
      ) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft - objectWidth / 2,
          y1:
            objectTop < activeObjectTop
              ? objectTop - objectHeight / 2 - aligningLineOffset
              : objectTop + objectHeight / 2 + aligningLineOffset,
          y2:
            activeObjectTop > objectTop
              ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
              : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(
            objectLeft - objectWidth / 2 + activeObjectWidth / 2,
            activeObjectTop
          ),
          "center",
          "center"
        );
      }

      // snap by the right edge
      if (
        isInRange(
          objectLeft + objectWidth / 2,
          activeObjectLeft + activeObjectWidth / 2
        )
      ) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft + objectWidth / 2,
          y1:
            objectTop < activeObjectTop
              ? objectTop - objectHeight / 2 - aligningLineOffset
              : objectTop + objectHeight / 2 + aligningLineOffset,
          y2:
            activeObjectTop > objectTop
              ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
              : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(
            objectLeft + objectWidth / 2 - activeObjectWidth / 2,
            activeObjectTop
          ),
          "center",
          "center"
        );
      }

      // snap by the vertical center line
      if (isInRange(objectTop, activeObjectTop)) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop,
          x1:
            objectLeft < activeObjectLeft
              ? objectLeft - objectWidth / 2 - aligningLineOffset
              : objectLeft + objectWidth / 2 + aligningLineOffset,
          x2:
            activeObjectLeft > objectLeft
              ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
              : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(activeObjectLeft, objectTop),
          "center",
          "center"
        );
      }

      // snap by the top edge
      if (
        isInRange(
          objectTop - objectHeight / 2,
          activeObjectTop - activeObjectHeight / 2
        )
      ) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop - objectHeight / 2,
          x1:
            objectLeft < activeObjectLeft
              ? objectLeft - objectWidth / 2 - aligningLineOffset
              : objectLeft + objectWidth / 2 + aligningLineOffset,
          x2:
            activeObjectLeft > objectLeft
              ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
              : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(
            activeObjectLeft,
            objectTop - objectHeight / 2 + activeObjectHeight / 2
          ),
          "center",
          "center"
        );
      }

      // snap by the bottom edge
      if (
        isInRange(
          objectTop + objectHeight / 2,
          activeObjectTop + activeObjectHeight / 2
        )
      ) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop + objectHeight / 2,
          x1:
            objectLeft < activeObjectLeft
              ? objectLeft - objectWidth / 2 - aligningLineOffset
              : objectLeft + objectWidth / 2 + aligningLineOffset,
          x2:
            activeObjectLeft > objectLeft
              ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
              : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(
            activeObjectLeft,
            objectTop + objectHeight / 2 - activeObjectHeight / 2
          ),
          "center",
          "center"
        );
      }
    }

    if (!horizontalInTheRange) {
      horizontalLines.length = 0;
    }

    if (!verticalInTheRange) {
      verticalLines.length = 0;
    }
  });

  canvas.on("before:render", function () {
    canvas.clearContext(canvas.contextTop);
  });

  canvas.on("after:render", function () {
    for (var i = verticalLines.length; i--; ) {
      drawVerticalLine(verticalLines[i]);
    }
    for (var i = horizontalLines.length; i--; ) {
      drawHorizontalLine(horizontalLines[i]);
    }

    verticalLines.length = horizontalLines.length = 0;
  });

  canvas.on("mouse:up", function () {
    verticalLines.length = horizontalLines.length = 0;
    canvas.renderAll();
  });
}

export function autoFitZoom(canvas: fabric.Canvas) {
  // 居中平移与缩放
  if (canvas.width && canvas.height) {
    canvas.setZoom(1);

    const objects = canvas.getObjects();
    const sizes = objects.map((o) => {
      const rect = o.getBoundingRect(true);
      return [
        rect.left,
        rect.top,
        rect.left + rect.width,
        rect.top + rect.height,
      ];
    });
    const minX = Math.min(...sizes.map((s) => s[0]));
    const minY = Math.min(...sizes.map((s) => s[1]));
    const maxX = Math.max(...sizes.map((s) => s[2]));
    const maxY = Math.max(...sizes.map((s) => s[3]));

    const panX = (maxX - minX - canvas.width) / 2 + minX;
    const panY = (maxY - minY - canvas.height) / 2 + minY;
    canvas.absolutePan({ x: panX, y: panY });

    const zoom =
      0.8 *
      Math.min(canvas.width / (maxX - minX), canvas.height / (maxY - minY));
    const zoomPoint = new fabric.Point(canvas.width / 2, canvas.height / 2);
    canvas.zoomToPoint(zoomPoint, zoom);
  }
}

export function initZoomPan(canvas: fabric.Canvas) {
  // 滚轮缩放
  canvas.on("mouse:wheel", function (opt) {
    var delta = opt.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  // ALT + 左键拖动
  let isDragging = false;
  let lastPosX = 0;
  let lastPosY = 0;
  canvas.on("mouse:down", function (opt) {
    var evt = opt.e;
    if (evt.altKey === true) {
      isDragging = true;
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;
    }
  });
  canvas.on("mouse:move", function (opt) {
    if (isDragging) {
      var e = opt.e;
      var vpt = canvas.viewportTransform;
      if (vpt) {
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        canvas.requestRenderAll();
        lastPosX = e.clientX;
        lastPosY = e.clientY;
      }
    }
  });
  canvas.on("mouse:up", function () {
    if (canvas.viewportTransform) {
      canvas.setViewportTransform(canvas.viewportTransform);
      isDragging = false;
    }
  });

  // fit
  canvas.on("mouse:dblclick", () => {
    autoFitZoom(canvas);
  });
}

export function initAxis(canvas: fabric.Canvas) {
  // 绘制x轴
  const xAxis = new fabric.Line([0, 0, 100, 0], {
    stroke: "red",
    strokeWidth: 4,
    selectable: false,
  });
  canvas.add(xAxis);

  // 绘制y轴
  const yAxis = new fabric.Line([0, 0, 0, -100], {
    stroke: "red",
    strokeWidth: 4,
    selectable: false,
  });
  canvas.add(yAxis);
}
