"use strict";
if (typeof Object.assign != "function") {
    Object.assign = function(target) {
        "use strict";
        if (target == null) {
            throw new TypeError("Cannot convert undefined or null to object")
        }
        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key]
                    }
                }
            }
        }
        return target
    }
}
if (!Array.from) {
    Array.from = function() {
        var toStr = Object.prototype.toString;
        var isCallable = function isCallable(fn) {
            return typeof fn === "function" || toStr.call(fn) === "[object Function]"
        };
        var toInteger = function toInteger(value) {
            var number = Number(value);
            if (isNaN(number)) {
                return 0
            }
            if (number === 0 || !isFinite(number)) {
                return number
            }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number))
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function toLength(value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger)
        };
        return function from(arrayLike) {
            var C = this;
            var items = Object(arrayLike);
            if (arrayLike == null) {
                throw new TypeError("Array.from requires an array-like object - not null or undefined")
            }
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== "undefined") {
                if (!isCallable(mapFn)) {
                    throw new TypeError("Array.from: when provided, the second argument must be a function")
                }
                if (arguments.length > 2) {
                    T = arguments[2]
                }
            }
            var len = toLength(items.length);
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);
            var k = 0;
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === "undefined" ? mapFn(kValue, k) : mapFn.call(T, kValue, k)
                } else {
                    A[k] = kValue
                }
                k += 1
            }
            A.length = len;
            return A
        }
    }()
}(function() {
    var defaults = {
        element: null,
        event: "click",
        width: 105,
        height: 115,
        paddingTop: -2,
        paddingBottom: 30,
        color: ["yellow", "rgb(40, 109, 190)", "rgb(0, 145, 250)"],
        startingPos: -57,
        posSpeed: 9.5,
        posSpeedDecay: 0.8675,
        startingStretch: 1,
        stretchSpeed: -0,
        stretchSpeedDecay: .93,
        drawingStart: 0,
        erasingStart: -1050,
        erasingLimit: 1250,
        drawingSpeed: 32.5,
        drawingSpeedDecay: 0.98,
        erasingSpeed: 27,
        erasingSpeedDecay: 1.0,
        fadeSpeed: .615,
        layerDelay: 135,
        stepVariation: 0,
        steps: 1,
        lineWidth: 60,
        opacity: 0.915
    };

    function attachLightning() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        options = Object.assign({}, defaults, options);
        if (options.element == null) {
            console.error('Lightning: Please select an element, by the "element" option. You can pass either a selector or a DOM Node');
            return
        }
        if (typeof options.element == "string") options.element = document.querySelector(options.element);
        options.startingPos += options.paddingTop;
        options.element.addEventListener(options.event, function(event) {
            var dpi = window.devicePixelRatio;
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var originalSize = {
                width: 400,
                height: 400
            };
            var canvasSize = {
                width: options.width,
                height: options.height + options.paddingTop + options.paddingBottom
            };
            canvas.style.opacity = options.opacity;
            canvas.style.width = canvasSize.width + "px";
            canvas.style.height = canvasSize.height + "px";
            canvas.setAttribute("width", canvasSize.width * dpi);
            canvas.setAttribute("height", canvasSize.height * dpi);
            var bounds = event.currentTarget.getBoundingClientRect();
            canvas.style.position = "absolute";
            canvas.style.left = options.width/16 + bounds.left + bounds.width / 2 - canvasSize.width / 2 + "px";
            canvas.style.top = bounds.top + bounds.height / 2 - canvasSize.height / 2 - options.paddingTop + "px";
            canvas.style.pointerEvents = "none";
            document.body.appendChild(canvas);
            var toPairs = function toPairs(arr) {
                return arr.reduce(function(arr, cur, i, all) {
                    return i % 2 == 1 ? arr.concat([
                        [all[i - 1], cur]
                    ]) : arr
                }, [])
            };
            var resizePoints = function resizePoints(points) {
                return points.map(function(pair) {
                    return [pair[0] / originalSize.width * options.width, pair[1] / originalSize.height * options.height]
                })
            };
            var formatPoints = function formatPoints(points) {
                return resizePoints(toPairs(points))
            };
            var lightning = formatPoints([200, 20, 65, 220, 175, 220, 125, 375, 300, 160, 170, 160]);
            var fill1 = formatPoints([200, -50, 200, 20, 65, 220, 175, 220, 125, 375]);
            var fill2 = formatPoints([200, -50, 200, 20, 170, 160, 300, 160, 125, 375]);
            var interpolate = function interpolate(arr1, arr2, p) {
                return Array.from(Array(arr1.length)).map(function(cur, i) {
                    return [arr1[i][0] + (arr2[i][0] - arr1[i][0]) * p, arr1[i][1] + (arr2[i][1] - arr1[i][1]) * p]
                })
            };
            var step = function step(arr1, arr2, steps) {
                return Array.from(Array(steps)).map(function(cur, i) {
                    return interpolate(arr1, arr2, i / steps)
                })
            };
            var fills = step(fill1, fill2, options.steps);
            if (options.steps == 1) fills = [interpolate(fill1, fill2, .5)];
            var fillsVariations = Array.from(Array(options.steps)).map(function(cur) {
                return Math.random() * options.stepVariation
            });
            var middle = formatPoints([209, 0, 121, 187, 242, 189, 127, 375]);
            var middleControls = formatPoints([179, 42, 95, 144, 135, 210, 228, 165, 272, 233, 162, 332]);

            function clip() {
                ctx.save();
                drawPath(lightning);
                ctx.closePath();
                ctx.clip()
            }

            function drawPath(points) {
                ctx.beginPath();
                ctx.moveTo(points[0][0] * dpi, points[0][1] * dpi);
                points.slice(1).forEach(function(point) {
                    ctx.lineTo(point[0] * dpi, point[1] * dpi)
                })
            }

            function drawCurvedPath(points, controls) {
                controls = toPairs(controls);
                ctx.beginPath();
                ctx.moveTo(points[0][0] * dpi, points[0][1] * dpi);
                points.slice(1).forEach(function(point, i) {
                    ctx.bezierCurveTo(controls[i][0][0] * dpi, controls[i][0][1] * dpi, controls[i][1][0] * dpi, controls[i][1][1] * dpi, point[0] * dpi, point[1] * dpi)
                })
            }

            function makeLayer(color, delay) {
                var pos = options.startingPos;
                var stretch = options.startingStretch;
                var posSpeed = options.posSpeed;
                var posSpeedDecay = options.posSpeedDecay;
                var stretchSpeed = options.stretchSpeed;
                var stretchSpeedDecay = options.stretchSpeedDecay;
                var drawing = options.drawingStart - delay;
                var padding = options.erasingStart + delay;
                var erasingLimit = options.erasingLimit;
                var drawingSpeed = options.drawingSpeed;
                var erasingSpeed = options.erasingSpeed;
                return function(time) {
                    ctx.restore();
                    ctx.save();
                    ctx.scale(1, stretch);
                    ctx.translate(0, pos * dpi);
                    pos += posSpeed * time;
                    posSpeed *= Math.pow(posSpeedDecay, time);
                    stretch += stretchSpeed * time;
                    stretchSpeed *= Math.pow(stretchSpeedDecay, time);
                    clip();
                    ctx.save();
                    ctx.lineWidth = options.lineWidth * dpi;
                    ctx.lineCap = "round";
                    ctx.strokeStyle = color;
                    ctx.fillStyle = color;
                    fills.forEach(function(fill, i) {
                        ctx.save();
                        ctx.rotate(-.2);
                        var start = options.paddingTop + padding;
                        ctx.fillRect(0, start * dpi, canvasSize.width * dpi, (-start + drawing) * dpi);
                        ctx.restore()
                    });
                    drawing += drawingSpeed * time;
                    padding += erasingSpeed * time;
                    drawingSpeed *= Math.pow(options.drawingSpeedDecay, time);
                    erasingSpeed *= Math.pow(options.erasingSpeedDecay, time);
                    ctx.restore();
                    ctx.restore();
                    return padding
                }
            }
            if (!Array.isArray(options.color)) options.color = [options.color];
            var layers = options.color.map(function(color, i) {
                return makeLayer(color, i * options.layerDelay)
            });
            var last = Date.now();
            var fps = 60;
            (function draw(now) {
                var delta = now - last;
                last = now;
                var time = delta / (1e3 / fps);
                if (isNaN(time)) time = 1;
                time = Math.min(2, time);
                if (options.fadeSpeed == 1) ctx.clearRect(0, 0, canvasSize.width * dpi, canvasSize.height * dpi);
                else {
                    ctx.save();
                    ctx.globalAlpha = options.fadeSpeed;
                    ctx.globalCompositeOperation = "destination-out";
                    ctx.fillRect(0, 0, canvasSize.width * dpi, canvasSize.height * dpi);
                    ctx.restore()
                }
                var padding = layers.map(function(layer) {
                    return layer(time)
                })[0];
                if (padding > options.erasingLimit) destroy();
                else requestAnimationFrame(draw)
            })();

            function destroy() {
                canvas.remove()
            }
        })
    }
    window.attachLightning = attachLightning
})();
