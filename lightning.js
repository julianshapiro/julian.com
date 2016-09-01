(function(){
  const defaults={
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
	}
  function attachLightning(options={}){
    options=Object.assign({},defaults,options);

    if(options.element==null){
      console.error('Lightning: Please select an element, by the "element" option. You can pass either a selector or a DOM Node');
      return;
    }

    if((typeof options.element)=='string')
      options.element=document.querySelector(options.element)

    options.startingPos+=options.paddingTop;

    options.element
      .addEventListener(options.event,function(event){
        let dpi=window.devicePixelRatio*2;
        let canvas=document.createElement('canvas');
        let ctx=canvas.getContext('2d');

        const getScroll=()=>(window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);

        let originalSize={
          width:400,
          height:400,
        }
        let canvasSize={
          width:options.width,
          height:options.height+options.paddingTop+options.paddingBottom,
        }
        canvas.style.width=canvasSize.width+'px';
        canvas.style.height=canvasSize.height+'px';
        canvas.setAttribute('width',canvasSize.width*dpi);
        canvas.setAttribute('height',canvasSize.height*dpi);
        let bounds=event.currentTarget.getBoundingClientRect();
        canvas.style.position='absolute';
        canvas.style.left=((bounds.left+(bounds.width/2))-(canvasSize.width/2))+'px';
        canvas.style.top=((bounds.top+(bounds.height/2))-(canvasSize.height/2)-options.paddingTop+getScroll())+'px';
        canvas.style.pointerEvents='none';
        document.body.appendChild(canvas);


        const toPairs=(arr)=>
          arr.reduce((arr,cur,i,all)=>
            i%2==1?arr.concat([[all[i-1],cur]]):arr
          ,[]);

        const resizePoints=(points)=>
          points.map(pair=>[
            (pair[0]/originalSize.width)*options.width,
            (pair[1]/originalSize.height)*options.height,
          ]);

        const formatPoints=(points)=>
          resizePoints(toPairs(points));

        let lightning=formatPoints([
          200,20,
          65,220,
          175,220,
          125,375,
          300,160,
          170,160
        ]);

        let fill1=formatPoints([
          200,-50,
          200,20,
          65,220,
          175,220,
          125,375,
        ]);
        let fill2=formatPoints([
          200,-50,
          200,20,
          170,160,
          300,160,
          125,375,
        ]);

        const interpolate=(arr1,arr2,p)=>
          Array.from(Array(arr1.length))
            .map((cur,i)=>[
              arr1[i][0]+((arr2[i][0]-arr1[i][0])*p),
              arr1[i][1]+((arr2[i][1]-arr1[i][1])*p),
            ]);

        const step=(arr1,arr2,steps)=>
          Array.from(Array(steps))
            .map((cur,i)=>interpolate(arr1,arr2,i/steps))

        let fills=step(fill1,fill2,options.steps);
        if(options.steps==1)
          fills=[interpolate(fill1,fill2,0.5)];
        let fillsVariations=Array.from(Array(options.steps)).
          map(cur=>Math.random()*options.stepVariation);

        let middle=formatPoints([
          209,0,
          121,187,
          242,189,
          127,375,
        ]);
        let middleControls=formatPoints([
          179,42,
          95,144,
          135,210,
          228,165,
          272,233,
          162,332,
        ]);

        function clip(){
          ctx.save();
          drawPath(lightning);
          ctx.closePath();
          ctx.clip();
        }
        function drawPath(points){
          ctx.beginPath();
          ctx.moveTo(points[0][0]*dpi,points[0][1]*dpi);
          points.slice(1)
            .forEach(point=>{
              ctx.lineTo(point[0]*dpi,point[1]*dpi);
            });
        }
        function drawCurvedPath(points,controls){
          controls=toPairs(controls);
          ctx.beginPath();
          ctx.moveTo(points[0][0]*dpi,points[0][1]*dpi);
          points.slice(1)
            .forEach((point,i)=>{
              ctx.bezierCurveTo(
                controls[i][0][0]*dpi,controls[i][0][1]*dpi,
                controls[i][1][0]*dpi,controls[i][1][1]*dpi,
                point[0]*dpi,point[1]*dpi
              );
            });
        };

        function makeLayer(color,delay){
          let pos=options.startingPos;
          let stretch=options.startingStretch;
          let posSpeed=options.posSpeed;
          let posSpeedDecay=options.posSpeedDecay;
          let stretchSpeed=options.stretchSpeed;
          let stretchSpeedDecay=options.stretchSpeedDecay;
          let drawing=options.drawingStart-delay;
          let padding=options.erasingStart+delay;
          let erasingLimit=options.erasingLimit;
          let drawingSpeed=options.drawingSpeed;
          let erasingSpeed=options.erasingSpeed;
          return function(time){
            ctx.restore();
            ctx.save();
            ctx.scale(1,stretch);
            ctx.translate(0,pos*dpi);
            pos+=posSpeed*time;
            posSpeed*=Math.pow(posSpeedDecay,time);
            stretch+=stretchSpeed*time;
            stretchSpeed*=Math.pow(stretchSpeedDecay,time);
            clip();
            ctx.save();
            ctx.lineWidth=options.lineWidth*dpi;//100*(canvasSize.height/originalSize.height);
            ctx.lineCap='round';
            ctx.strokeStyle=color;
            ctx.fillStyle=color;
            fills.forEach((fill,i)=>{
              // let dash=[
              //   0,
              //   Math.max(0,padding+fillsVariations[i])*dpi,
              //   Math.max(0,drawing+fillsVariations[i])*dpi,
              //   99999
              // ];
              // ctx.setLineDash(dash);
              // drawPath(fill);
              // // drawCurvedPath(middle,middleControls);
              // ctx.stroke();
              ctx.save();
              ctx.rotate(-0.2);
              let start=options.paddingTop+padding;
              ctx.fillRect(0,
                start*dpi,
                canvasSize.width*dpi,
                (-start+drawing)*dpi
              );
              ctx.restore();
            });
            drawing+=drawingSpeed*time;
            padding+=erasingSpeed*time;
            drawingSpeed*=Math.pow(options.drawingSpeedDecay,time);
            erasingSpeed*=Math.pow(options.erasingSpeedDecay,time);
            ctx.restore();
            ctx.restore();
            return padding;
          }
        }

				if(!Array.isArray(options.color)) options.color=[options.color];

        let layers=options.color.map((color,i)=>
          makeLayer(color,i*options.layerDelay)
        );

        let last=Date.now();
        let fps=60;
        ;(function draw(now){
          let delta=now-last;
          last=now;
          let time=delta/(1000/fps);
          if(isNaN(time)) time=1;
          time=Math.min(2,time);
          if(options.fadeSpeed==1)
            ctx.clearRect(0,0,canvasSize.width*dpi,canvasSize.height*dpi);
          else{
            ctx.save();
            ctx.globalAlpha=options.fadeSpeed;
            ctx.globalCompositeOperation='destination-out';
            ctx.fillRect(0,0,canvasSize.width*dpi,canvasSize.height*dpi);
            ctx.restore();
          }

          // let padding=[].concat(layers).reverse().map(layer=>layer())[0];
          let padding=layers.map(layer=>layer(time))[0];

          if(padding>options.erasingLimit) destroy();
          else requestAnimationFrame(draw);
        }());

        function destroy(){
          canvas.remove();
        }
      }
    );
  }
  window.attachLightning=attachLightning;
}());

if (typeof Object.assign != 'function') {
  Object.assign = function(target) {
    'use strict';
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}
// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}
