const eraseAlpha=0.5;
const trailSize=25;
const PI2=Math.PI*2;
const pulseChance=0.06;
const maxPulsesPerSpawn=1;
const maxPulses=10;
const minVertexRadius=1;
const vertexRadiusVariation=1;
let dpi=window.devicePixelRatio;
let lastBliped=[];
function drawCircle(ctx,x,y,r){
  ctx.beginPath();
  ctx.arc(x*dpi,y*dpi,r*dpi,0,PI2);
  ctx.closePath();
}
function fillCircle(ctx,x,y,r){
  drawCircle(ctx,x,y,r);
  ctx.fill();
}
function strokeCircle(ctx,x,y,r){
  drawCircle(ctx,x,y,r);
  ctx.stroke();
}
function Color(r,g,b){
  this.r=r;
  this.g=g;
  this.b=b;
}
Color.prototype={
  r:0,
  g:0,
  b:0,
  interpolate(color,p){
    let dr=color.r-this.r;
    let dg=color.g-this.g;
    let db=color.b-this.b;
    return new Color(
      this.r+(dr*p),
      this.g+(dg*p),
      this.b+(db*p)
    );
  },
  toString(){
    return `rgb(${Math.round(this.r)},${Math.round(this.g)},${Math.round(this.b)})`;
  },
}
let color={
  // bg:new Color(34,85,170),
  bg:new Color(71,125,194),
  fg:new Color(128,198,255),
}
let getColor=v=>color.bg.interpolate(color.fg,v).toString();
let repeat=(times,callback)=>{
  for(let i=0;i<times;i++){
    callback(i);
  }
}
let last=arr=>arr[arr.length-1];

document.addEventListener('DOMContentLoaded',event=>{
  let canvas=document.querySelector('canvas');
  let ctx=canvas.getContext('2d');
  let bounds=canvas.getBoundingClientRect();
  let width=bounds.width*dpi;
  let height=bounds.height*dpi;
  canvas.setAttribute('width',width);
  canvas.setAttribute('height',height);
  canvas.style.width=(width/dpi)+'px';
  canvas.style.height=(height/dpi)+'px';
  make(ctx,width,height);
})
function createGrid(width,height,spacing=60,variation=5){
  let particles=[];

  // spacing*=dpi;
  // width*=dpi;
  // height*=dpi;
  variation*=dpi;
  let cols=Math.ceil(width/spacing)+1;
  let rows=Math.ceil(height/spacing)+1;
  let numParticles=cols*rows;
  particles=Array.from(Array(numParticles)).map((item,i)=>{
    let col=i%cols;
    let row=Math.floor(i/cols);
    let dest={
      x:(spacing*col)+(row%2==0?spacing/2:0),
      y:row*spacing,
    };
    dest.x+=variation*Math.random();
    dest.y+=variation*Math.random();
    return dest;
  });

  let voronoi = new Voronoi();
  let margin=20;
  let bbox = {xl:-margin, xr: width+margin, yt:-margin, yb: height+margin};
  let diagram=voronoi.compute(particles,bbox);

  return diagram;
}
function getNeighbors(diagram,vertex,exclude=null){
  let edges=diagram.edges.filter(edge=>
    (edge.va==vertex || edge.vb==vertex) &&
    (edge.va!=exclude && edge.vb!=exclude)
  );
  return edges
    .reduce((arr,cur)=>arr.concat(cur.va,cur.vb),[])
    .filter(v=>v!=vertex)
  ;
}
function initDiagram(diagram){
  diagram.pulses=[];
  diagram.pulse=function(origin,dest){
    let p=new Pulse(origin,dest);
    p.speed=0.03+(Math.random()*0.04);
    if(diagram.pulses.length<maxPulses){
      origin.lightUp();
      diagram.pulses.push(p);
      return p;
    }else return null;
  }
  initVertices(diagram);
  initEdges(diagram);
  let sortedVertices=diagram.vertices.slice().sort((a,b)=>a.y>b.y?1:-1);
  diagram.outerVertices=sortedVertices.slice(5,20).concat(sortedVertices.slice(sortedVertices.length-20,sortedVertices.length-5));
  window.diagram=diagram;
}
function initEdges(diagram){
  diagram.edges.forEach(edge=>{
    edge.color=0;
    edge.lightUp=function(){
      edge.color=0.2;
    }
    edge.update=function(){
      if(edge.color>0){
        edge.color-=0.001;
        if(edge.color<0) edge.color=0;
      }
    }
  });
}
function initVertices(diagram){
  let maxClockSpeed=0.001;
  let maxClockIntensity=0*0.1;
  diagram.vertices.forEach(vertex=>{
    let depth=Math.random();
    vertex.diagram=diagram;
    vertex.clockSpeed=-maxClockSpeed+Math.random()*(maxClockSpeed*2);
    vertex.clock=Math.random()*PI2;
    vertex.originX=vertex.x;
    vertex.originY=vertex.y;
    vertex.clockIntensity=0+(maxClockIntensity*Math.pow(depth,3));
    vertex.depth=depth;
    vertex.radius=minVertexRadius+(depth*vertexRadiusVariation);
    vertex.color=0;
    vertex.colorFadeSpeed=0.01;
    vertex.blips=[];
    vertex.blipSpeed=0.04;
    vertex.blipRadius=(vertex.radius*3.5)+(Math.random()*vertex.radius*1);
    vertex.forceStrength=4;
    vertex.forces=[];
    vertex.neighbors=getNeighbors(diagram,vertex);
    vertex.getRandomNeighbor=function(exclude=null){
      let neighbors=this.neighbors.filter(neighbor=>neighbor!=exclude);
      if(neighbors.length==0) return null;
      let neighbor=neighbors[Math.round(Math.random()*(neighbors.length-1))];
      return neighbor;
    }
    vertex.lightUp=function(){
      this.color=1;
    };
    vertex.blip=function(){
      this.blips.push(1);
    }
    vertex.applyForces=function(){
      let result={x:0,y:0};
      for(let i=vertex.forces.length-1;i>=0;i--){
        let force=vertex.forces[i];
        let p=Math.pow(force.power,3);
        result.x+=force.cosAngle*p*force.strength;
        result.y+=force.sinAngle*p*force.strength;
        force.update();
        if(force.dead){
          vertex.forces.splice(i,1);
        }
      }
      return result;
    }
    vertex.update=function(){
      // this.clock+=this.clockSpeed;
      if(this.color>0){
        this.color-=this.colorFadeSpeed;
        if(this.color<0) this.color=0;
      }
      this.blips=this.blips.map(blip=>blip-=this.blipSpeed).filter(blip=>blip>0);
    }
  });
}
function Force(angle,strength){
  this.angle=angle;
  this.power=1;
  this.strength=strength;
  this.cosAngle=Math.cos(angle);
  this.sinAngle=Math.sin(angle);
}
Force.prototype={
  angle:0,
  power:0,
  dead:false,
  cosAngle:0,
  sinAngle:0,
  update(){
    this.power-=0.03;
    if(this.power<=0)
      this.dead=true;
  },
}
function Pulse(origin,dest){
  this.origin=origin;
  this.dest=dest;
  this.lastPos=[];
}
Pulse.prototype={
  origin:null,
  dest:null,
  v:0,
  speed:0.03+(Math.random()*0.05),
  angle:0,
  dying:false,
  dyingCounter:trailSize,
  dead:false,
  lastPos:null,
  sparkRandom:0.2,
  update(delta=1){
    if(this.dying){
      this.dyingCounter--;
      if(this.dyingCounter<=0) this.dead=true;
      return;
    }
    if(this.v>=1){
      this.dying=true;
      let edge=this.origin.diagram.edges.find(edge=>
        (edge.va==this.origin && edge.vb==this.dest) ||
        (edge.vb==this.origin && edge.va==this.dest)
      )
      edge.lightUp();
      // this.sparkRandom=2;
      let p=this;
      let newPulses=Math.round(Math.random()*2.45);
      let failedPulses=0;
      let lastTargets=[];
      if(newPulses>0){
        repeat(newPulses,i=>{
          let neighbor=this.dest.getRandomNeighbor(this.origin);
          if(neighbor==null){
            failedPulses++;
            return;
          }
          if(lastTargets.indexOf(neighbor)>-1){
            failedPulses++;
            return;
          }
          let newPulse=this.dest.diagram.pulse(this.dest,neighbor);
          if(newPulse==null){
            failedPulses++;
            return;
          }
          lastTargets.push(neighbor);
          newPulse.speed=this.speed;
          newPulse.lastPos=this.lastPos.slice(this.lastPos.length-4)
        });
      }
      let forceStrength=1+(Math.random()*1)
      if(newPulses==0 || failedPulses>=newPulses){
        this.dest.blip();
        lastBliped=[this.dest].concat(lastBliped.slice(0,20));
        this.dest.lightUp();
        forceStrength=7.5+(this.dest.depth*6);
      }
      let dx=this.dest.x-this.origin.x;
      let dy=this.dest.y-this.origin.y;
      let angle=Math.atan2(dy,dx);
      this.dest.forces.push(new Force(angle,forceStrength));
    }
    this.v+=this.speed*delta;
    if(this.v>1) this.v=1;
  },
  getPos(){
    let pos={x:0,y:0};
    if(this.dying){
      pos=this.lastPos[this.lastPos.length-1];
    }else{
      let dx=this.dest.x-this.origin.x;
      let dy=this.dest.y-this.origin.y;
      let dist=Math.sqrt((dx*dx)+(dy*dy));
      let angle=Math.atan2(dy,dx);
      this.angle=angle;
      pos={
        x:this.origin.x+(Math.cos(angle)*(dist*this.v)),
        y:this.origin.y+(Math.sin(angle)*(dist*this.v)),
      };
      let sparkRandom=this.sparkRandom;
      pos.x+=-(sparkRandom/2)+(Math.random()*sparkRandom);
      pos.y+=-(sparkRandom/2)+(Math.random()*sparkRandom);
    }
    this.lastPos=this.lastPos.slice(this.lastPos.length-trailSize).concat(pos);
    return pos;
  },
};
function drawDiagram(diagram,ctx,width,height,delta){
  if(Math.random()<pulseChance){
    repeat(Math.random()*maxPulsesPerSpawn,i=>{
      // let edge=diagram.edges[Math.round(Math.random()*(diagram.edges.length-1))];
      // let dest=edge.vb;
      // let origin=edge.va;
      let origin=diagram.outerVertices[Math.round(Math.random()*(diagram.outerVertices.length-1))];
      let dest=origin.getRandomNeighbor();
      if(lastBliped.length>0 && (dest==null || Math.random()<0.1)){
        origin=lastBliped[Math.round(Math.random()*(lastBliped.length-1))];
        dest=origin.getRandomNeighbor();
        if(dest==null) return;
      }else if(dest==null) return;
      let newPulse=diagram.pulse(origin,dest);
      if(newPulse!=null){
        let dx=dest.x-origin.x;
        let dy=dest.y-origin.y;
        let angle=Math.atan2(dy,dx);
        angle+=Math.PI;
        // origin.blip();
        // origin.forces.push(new Force(angle,10));
      }
    });
  }
  ctx.fillStyle=getColor(0);
  ctx.globalAlpha=eraseAlpha;
  ctx.fillRect(0,0,width,height);
  ctx.globalAlpha=1;

  ctx.fillStyle=getColor(0.2);
  ctx.strokeStyle=getColor(0.15);
  // ctx.lineJoin="round";
  ctx.lineCap="round";
  diagram.edges.forEach(edge=>{
    if(edge.color<=0) return;
    ctx.beginPath();
    ctx.moveTo(edge.va.x*dpi,edge.va.y*dpi);
    ctx.lineTo(edge.vb.x*dpi,edge.vb.y*dpi);
    ctx.strokeStyle=getColor(edge.color);
    ctx.globalAlpha=1;
    ctx.lineWidth=1*dpi;
    ctx.stroke();
    // ctx.globalAlpha=0.1;
    // ctx.lineWidth=3*dpi;
    // ctx.stroke();
    edge.update();
  });
  diagram.pulses.forEach(pulse=>{
    let pos=pulse.getPos();
    pulse.update(delta);
    ctx.beginPath();
    ctx.moveTo(pulse.lastPos[0].x*dpi,pulse.lastPos[0].y*dpi);
    pulse.lastPos.slice(1).forEach(p=>{
      ctx.lineTo(p.x*dpi,p.y*dpi);
    });
    ctx.strokeStyle=getColor(1);
    ctx.globalAlpha=0.7;
    ctx.lineWidth=1*dpi;
    ctx.stroke();
    // let origin=pulse.origin;
    // fillCircle(ctx,origin.x,origin.y,origin.radius*((1+(1-pulse.v))*1));
    if(pulse.lastPos.length>=2 && !pulse.dying){
      ctx.lineWidth=5*dpi;
      ctx.globalAlpha=0.7;
      ctx.beginPath();
      ctx.moveTo(pulse.lastPos[pulse.lastPos.length-2].x*dpi,pulse.lastPos[pulse.lastPos.length-2].y*dpi);
      ctx.lineTo(pulse.lastPos[pulse.lastPos.length-1].x*dpi,pulse.lastPos[pulse.lastPos.length-1].y*dpi);
      ctx.strokeStyle=getColor(1);
      ctx.stroke();
    }
  });
  diagram.vertices.forEach(vertex=>{
    let forces=vertex.applyForces();
    // vertex.x=vertex.originX+(Math.cos(vertex.clock)*vertex.clockIntensity)+forces.x;
    // vertex.y=vertex.originY+(Math.sin(vertex.clock)*vertex.clockIntensity)+forces.y;
    vertex.x=vertex.originX+forces.x;
    vertex.y=vertex.originY+forces.y;
    if(vertex.color>0){
      let depth=vertex.depth;
      let minColor=0.1+(depth*depth*0.2);
      minColor=0;
      let color=getColor(minColor+(Math.min(1,vertex.color)*(1-minColor)));
      ctx.fillStyle=color;
      ctx.globalAlpha=1-((1-depth)*0.35);
      fillCircle(ctx,vertex.x,vertex.y,vertex.radius);
      // ctx.lineWidth=6*(1-(depth*depth))*dpi;
      // ctx.strokeStyle=color;
      // ctx.globalAlpha=Math.max(0,0.25-vertex.color*0.2);
      // strokeCircle(ctx,vertex.x,vertex.y,vertex.radius)
    }
    vertex.blips.forEach(blip=>{
      let iblip=1-blip;
      let blipRadius=vertex.radius+(vertex.blipRadius*(Math.pow(iblip,1/2)));
      let blipAlpha=blip*1;
      ctx.globalAlpha=blipAlpha;
      ctx.lineWidth=1*dpi;
      ctx.strokeStyle=getColor(1);
      strokeCircle(ctx,vertex.x,vertex.y,blipRadius);
    });
    vertex.update();
  });
  diagram.pulses=diagram.pulses.filter(pulse=>!pulse.dead);

}
function make(ctx,width,height){
  let diagram=createGrid(width/dpi,height/dpi,80,0);
  // let diagramBg=createGrid(width,height,40,0);

  initDiagram(diagram);
  // initVertices(diagramBg);
  let last=0;
  let fps=60;
  let maxDelta=1.5;

  ;(function draw(now){
    // drawDiagram(diagramBg,ctx,width,height);
    // ctx.fillStyle=getColor(0);
    // ctx.globalAlpha=0.8;
    // ctx.fillRect(0,0,width,height);
    let delta=(now-last)/(fps/1000);
    if(delta>maxDelta) delta=maxDelta;
    drawDiagram(diagram,ctx,width,height,delta);
    requestAnimationFrame(draw);
  }());
};
