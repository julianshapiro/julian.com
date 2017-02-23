/*!
Copyright (C) 2010-2013 Raymond Hill: https://github.com/gorhill/Javascript-Voronoi
MIT License: See https://github.com/gorhill/Javascript-Voronoi/LICENSE.md
*/
;
function Voronoi(){this.vertices=null;this.edges=null;this.cells=null;this.toRecycle=null;this.beachsectionJunkyard=[];this.circleEventJunkyard=[];
this.vertexJunkyard=[];this.edgeJunkyard=[];this.cellJunkyard=[]}Voronoi.prototype.reset=function(){if(!this.beachline){this.beachline=new this.RBTree()
}if(this.beachline.root){var a=this.beachline.getFirst(this.beachline.root);while(a){this.beachsectionJunkyard.push(a);a=a.rbNext
}}this.beachline.root=null;if(!this.circleEvents){this.circleEvents=new this.RBTree()}this.circleEvents.root=this.firstCircleEvent=null;
this.vertices=[];this.edges=[];this.cells=[]};Voronoi.prototype.sqrt=Math.sqrt;Voronoi.prototype.abs=Math.abs;Voronoi.prototype.EpsilonThing=Voronoi.EpsilonThing=1e-9;
Voronoi.prototype.invEpsilonThing=Voronoi.invEpsilonThing=1/Voronoi.EpsilonThing;Voronoi.prototype.equalWithEpsilon=function(d,c){return this.abs(d-c)<1e-9
};Voronoi.prototype.greaterThanWithEpsilon=function(d,c){return d-c>1e-9};Voronoi.prototype.greaterThanOrEqualWithEpsilon=function(d,c){return c-d<1e-9
};Voronoi.prototype.lessThanWithEpsilon=function(d,c){return c-d>1e-9};Voronoi.prototype.lessThanOrEqualWithEpsilon=function(d,c){return d-c<1e-9
};Voronoi.prototype.RBTree=function(){this.root=null};Voronoi.prototype.RBTree.prototype.rbInsertSuccessor=function(e,a){var d;
if(e){a.rbPrevious=e;a.rbNext=e.rbNext;if(e.rbNext){e.rbNext.rbPrevious=a}e.rbNext=a;if(e.rbRight){e=e.rbRight;while(e.rbLeft){e=e.rbLeft
}e.rbLeft=a}else{e.rbRight=a}d=e}else{if(this.root){e=this.getFirst(this.root);a.rbPrevious=null;a.rbNext=e;e.rbPrevious=a;
e.rbLeft=a;d=e}else{a.rbPrevious=a.rbNext=null;this.root=a;d=null}}a.rbLeft=a.rbRight=null;a.rbParent=d;a.rbRed=true;var c,b;
e=a;while(d&&d.rbRed){c=d.rbParent;if(d===c.rbLeft){b=c.rbRight;if(b&&b.rbRed){d.rbRed=b.rbRed=false;c.rbRed=true;e=c}else{if(e===d.rbRight){this.rbRotateLeft(d);
e=d;d=e.rbParent}d.rbRed=false;c.rbRed=true;this.rbRotateRight(c)}}else{b=c.rbLeft;if(b&&b.rbRed){d.rbRed=b.rbRed=false;c.rbRed=true;
e=c}else{if(e===d.rbLeft){this.rbRotateRight(d);e=d;d=e.rbParent}d.rbRed=false;c.rbRed=true;this.rbRotateLeft(c)}}d=e.rbParent
}this.root.rbRed=false};Voronoi.prototype.RBTree.prototype.rbRemoveNode=function(f){if(f.rbNext){f.rbNext.rbPrevious=f.rbPrevious
}if(f.rbPrevious){f.rbPrevious.rbNext=f.rbNext}f.rbNext=f.rbPrevious=null;var e=f.rbParent,g=f.rbLeft,b=f.rbRight,d;if(!g){d=b
}else{if(!b){d=g}else{d=this.getFirst(b)}}if(e){if(e.rbLeft===f){e.rbLeft=d}else{e.rbRight=d}}else{this.root=d}var a;if(g&&b){a=d.rbRed;
d.rbRed=f.rbRed;d.rbLeft=g;g.rbParent=d;if(d!==b){e=d.rbParent;d.rbParent=f.rbParent;f=d.rbRight;e.rbLeft=f;d.rbRight=b;b.rbParent=d
}else{d.rbParent=e;e=d;f=d.rbRight}}else{a=f.rbRed;f=d}if(f){f.rbParent=e}if(a){return}if(f&&f.rbRed){f.rbRed=false;return
}var c;do{if(f===this.root){break}if(f===e.rbLeft){c=e.rbRight;if(c.rbRed){c.rbRed=false;e.rbRed=true;this.rbRotateLeft(e);
c=e.rbRight}if((c.rbLeft&&c.rbLeft.rbRed)||(c.rbRight&&c.rbRight.rbRed)){if(!c.rbRight||!c.rbRight.rbRed){c.rbLeft.rbRed=false;
c.rbRed=true;this.rbRotateRight(c);c=e.rbRight}c.rbRed=e.rbRed;e.rbRed=c.rbRight.rbRed=false;this.rbRotateLeft(e);f=this.root;
break}}else{c=e.rbLeft;if(c.rbRed){c.rbRed=false;e.rbRed=true;this.rbRotateRight(e);c=e.rbLeft}if((c.rbLeft&&c.rbLeft.rbRed)||(c.rbRight&&c.rbRight.rbRed)){if(!c.rbLeft||!c.rbLeft.rbRed){c.rbRight.rbRed=false;
c.rbRed=true;this.rbRotateLeft(c);c=e.rbLeft}c.rbRed=e.rbRed;e.rbRed=c.rbLeft.rbRed=false;this.rbRotateRight(e);f=this.root;
break}}c.rbRed=true;f=e;e=e.rbParent}while(!f.rbRed);if(f){f.rbRed=false}};Voronoi.prototype.RBTree.prototype.rbRotateLeft=function(b){var d=b,c=b.rbRight,a=d.rbParent;
if(a){if(a.rbLeft===d){a.rbLeft=c}else{a.rbRight=c}}else{this.root=c}c.rbParent=a;d.rbParent=c;d.rbRight=c.rbLeft;if(d.rbRight){d.rbRight.rbParent=d
}c.rbLeft=d};Voronoi.prototype.RBTree.prototype.rbRotateRight=function(b){var d=b,c=b.rbLeft,a=d.rbParent;if(a){if(a.rbLeft===d){a.rbLeft=c
}else{a.rbRight=c}}else{this.root=c}c.rbParent=a;d.rbParent=c;d.rbLeft=c.rbRight;if(d.rbLeft){d.rbLeft.rbParent=d}c.rbRight=d
};Voronoi.prototype.RBTree.prototype.getFirst=function(a){while(a.rbLeft){a=a.rbLeft}return a};Voronoi.prototype.RBTree.prototype.getLast=function(a){while(a.rbRight){a=a.rbRight
}return a};Voronoi.prototype.Diagram=function(a){this.site=a};Voronoi.prototype.Cell=function(a){this.site=a;this.halfedges=[];
this.closeMe=false};Voronoi.prototype.Cell.prototype.init=function(a){this.site=a;this.halfedges=[];this.closeMe=false;return this
};Voronoi.prototype.createCell=function(b){var a=this.cellJunkyard.pop();if(a){return a.init(b)}return new this.Cell(b)};
Voronoi.prototype.Cell.prototype.prepareHalfedges=function(){var a=this.halfedges,b=a.length,c;while(b--){c=a[b].edge;if(!c.vb||!c.va){a.splice(b,1)
}}a.sort(function(e,d){return d.angle-e.angle});return a.length};Voronoi.prototype.Cell.prototype.getNeighborIds=function(){var a=[],b=this.halfedges.length,c;
while(b--){c=this.halfedges[b].edge;if(c.lSite!==null&&c.lSite.voronoiId!=this.site.voronoiId){a.push(c.lSite.voronoiId)}else{if(c.rSite!==null&&c.rSite.voronoiId!=this.site.voronoiId){a.push(c.rSite.voronoiId)
}}}return a};Voronoi.prototype.Cell.prototype.getBbox=function(){var i=this.halfedges,d=i.length,a=Infinity,g=Infinity,c=-Infinity,b=-Infinity,h,f,e;
while(d--){h=i[d].getStartpoint();f=h.x;e=h.y;if(f<a){a=f}if(e<g){g=e}if(f>c){c=f}if(e>b){b=e}}return{x:a,y:g,width:c-a,height:b-g}
};Voronoi.prototype.Cell.prototype.pointIntersection=function(a,h){var b=this.halfedges,c=b.length,f,g,e,d;while(c--){f=b[c];
g=f.getStartpoint();e=f.getEndpoint();d=(h-g.y)*(e.x-g.x)-(a-g.x)*(e.y-g.y);if(!d){return 0}if(d>0){return -1}}return 1};
Voronoi.prototype.Vertex=function(a,b){this.x=a;this.y=b};Voronoi.prototype.Edge=function(b,a){this.lSite=b;this.rSite=a;
this.va=this.vb=null};Voronoi.prototype.Halfedge=function(d,e,a){this.site=e;this.edge=d;if(a){this.angle=Math.atan2(a.y-e.y,a.x-e.x)
}else{var c=d.va,b=d.vb;this.angle=d.lSite===e?Math.atan2(b.x-c.x,c.y-b.y):Math.atan2(c.x-b.x,b.y-c.y)}};Voronoi.prototype.createHalfedge=function(b,c,a){return new this.Halfedge(b,c,a)
};Voronoi.prototype.Halfedge.prototype.getStartpoint=function(){return this.edge.lSite===this.site?this.edge.va:this.edge.vb
};Voronoi.prototype.Halfedge.prototype.getEndpoint=function(){return this.edge.lSite===this.site?this.edge.vb:this.edge.va
};Voronoi.prototype.createVertex=function(a,c){var b=this.vertexJunkyard.pop();if(!b){b=new this.Vertex(a,c)}else{b.x=a;b.y=c
}this.vertices.push(b);return b};Voronoi.prototype.createEdge=function(e,a,d,b){var c=this.edgeJunkyard.pop();if(!c){c=new this.Edge(e,a)
}else{c.lSite=e;c.rSite=a;c.va=c.vb=null}this.edges.push(c);if(d){this.setEdgeStartpoint(c,e,a,d)}if(b){this.setEdgeEndpoint(c,e,a,b)
}this.cells[e.voronoiId].halfedges.push(this.createHalfedge(c,e,a));this.cells[a.voronoiId].halfedges.push(this.createHalfedge(c,a,e));
return c};Voronoi.prototype.createBorderEdge=function(d,c,a){var b=this.edgeJunkyard.pop();if(!b){b=new this.Edge(d,null)
}else{b.lSite=d;b.rSite=null}b.va=c;b.vb=a;this.edges.push(b);return b};Voronoi.prototype.setEdgeStartpoint=function(b,d,a,c){if(!b.va&&!b.vb){b.va=c;
b.lSite=d;b.rSite=a}else{if(b.lSite===a){b.vb=c}else{b.va=c}}};Voronoi.prototype.setEdgeEndpoint=function(b,d,a,c){this.setEdgeStartpoint(b,a,d,c)
};Voronoi.prototype.Beachsection=function(){};Voronoi.prototype.createBeachsection=function(a){var b=this.beachsectionJunkyard.pop();
if(!b){b=new this.Beachsection()}b.site=a;return b};Voronoi.prototype.leftBreakPoint=function(e,f){var a=e.site,m=a.x,l=a.y,k=l-f;
if(!k){return m}var n=e.rbPrevious;if(!n){return -Infinity}a=n.site;var h=a.x,g=a.y,d=g-f;if(!d){return h}var c=h-m,j=1/k-1/d,i=c/d;
if(j){return(-i+this.sqrt(i*i-2*j*(c*c/(-2*d)-g+d/2+l-k/2)))/j+m}return(m+h)/2};Voronoi.prototype.rightBreakPoint=function(b,c){var d=b.rbNext;
if(d){return this.leftBreakPoint(d,c)}var a=b.site;return a.y===c?a.x:Infinity};Voronoi.prototype.detachBeachsection=function(a){this.detachCircleEvent(a);
this.beachline.rbRemoveNode(a);this.beachsectionJunkyard.push(a)};Voronoi.prototype.removeBeachsection=function(b){var a=b.circleEvent,j=a.x,h=a.ycenter,e=this.createVertex(j,h),f=b.rbPrevious,d=b.rbNext,l=[b],g=Math.abs;
this.detachBeachsection(b);var m=f;while(m.circleEvent&&g(j-m.circleEvent.x)<1e-9&&g(h-m.circleEvent.ycenter)<1e-9){f=m.rbPrevious;
l.unshift(m);this.detachBeachsection(m);m=f}l.unshift(m);this.detachCircleEvent(m);var c=d;while(c.circleEvent&&g(j-c.circleEvent.x)<1e-9&&g(h-c.circleEvent.ycenter)<1e-9){d=c.rbNext;
l.push(c);this.detachBeachsection(c);c=d}l.push(c);this.detachCircleEvent(c);var k=l.length,i;for(i=1;i<k;i++){c=l[i];m=l[i-1];
this.setEdgeStartpoint(c.edge,m.site,c.site,e)}m=l[0];c=l[k-1];c.edge=this.createEdge(m.site,c.site,undefined,e);this.attachCircleEvent(m);
this.attachCircleEvent(c)};Voronoi.prototype.addBeachsection=function(l){var j=l.x,n=l.y;var p,m,v,q,o=this.beachline.root;
while(o){v=this.leftBreakPoint(o,n)-j;if(v>1e-9){o=o.rbLeft}else{q=j-this.rightBreakPoint(o,n);if(q>1e-9){if(!o.rbRight){p=o;
break}o=o.rbRight}else{if(v>-1e-9){p=o.rbPrevious;m=o}else{if(q>-1e-9){p=o;m=o.rbNext}else{p=m=o}}break}}}var e=this.createBeachsection(l);
this.beachline.rbInsertSuccessor(p,e);if(!p&&!m){return}if(p===m){this.detachCircleEvent(p);m=this.createBeachsection(p.site);
this.beachline.rbInsertSuccessor(e,m);e.edge=m.edge=this.createEdge(p.site,e.site);this.attachCircleEvent(p);this.attachCircleEvent(m);
return}if(p&&!m){e.edge=this.createEdge(p.site,e.site);return}if(p!==m){this.detachCircleEvent(p);this.detachCircleEvent(m);
var h=p.site,k=h.x,i=h.y,t=l.x-k,r=l.y-i,a=m.site,c=a.x-k,b=a.y-i,u=2*(t*b-r*c),g=t*t+r*r,f=c*c+b*b,s=this.createVertex((b*g-r*f)/u+k,(t*f-c*g)/u+i);
this.setEdgeStartpoint(m.edge,h,a,s);e.edge=this.createEdge(h,l,undefined,s);m.edge=this.createEdge(l,a,undefined,s);this.attachCircleEvent(p);
this.attachCircleEvent(m);return}};Voronoi.prototype.CircleEvent=function(){this.arc=null;this.rbLeft=null;this.rbNext=null;
this.rbParent=null;this.rbPrevious=null;this.rbRed=false;this.rbRight=null;this.site=null;this.x=this.y=this.ycenter=0};Voronoi.prototype.attachCircleEvent=function(i){var r=i.rbPrevious,o=i.rbNext;
if(!r||!o){return}var k=r.site,u=i.site,c=o.site;if(k===c){return}var t=u.x,s=u.y,n=k.x-t,l=k.y-s,f=c.x-t,e=c.y-s;var v=2*(n*e-l*f);
if(v>=-2e-12){return}var h=n*n+l*l,g=f*f+e*e,m=(e*h-l*g)/v,j=(n*g-f*h)/v,b=j+s;var q=this.circleEventJunkyard.pop();if(!q){q=new this.CircleEvent()
}q.arc=i;q.site=u;q.x=m+t;q.y=b+this.sqrt(m*m+j*j);q.ycenter=b;i.circleEvent=q;var a=null,p=this.circleEvents.root;while(p){if(q.y<p.y||(q.y===p.y&&q.x<=p.x)){if(p.rbLeft){p=p.rbLeft
}else{a=p.rbPrevious;break}}else{if(p.rbRight){p=p.rbRight}else{a=p;break}}}this.circleEvents.rbInsertSuccessor(a,q);if(!a){this.firstCircleEvent=q
}};Voronoi.prototype.detachCircleEvent=function(b){var a=b.circleEvent;if(a){if(!a.rbPrevious){this.firstCircleEvent=a.rbNext
}this.circleEvents.rbRemoveNode(a);this.circleEventJunkyard.push(a);b.circleEvent=null}};Voronoi.prototype.connectEdge=function(l,a){var b=l.vb;
if(!!b){return true}var c=l.va,p=a.xl,n=a.xr,r=a.yt,d=a.yb,o=l.lSite,e=l.rSite,i=o.x,h=o.y,k=e.x,j=e.y,g=(i+k)/2,f=(h+j)/2,m,q;
this.cells[o.voronoiId].closeMe=true;this.cells[e.voronoiId].closeMe=true;if(j!==h){m=(i-k)/(j-h);q=f-m*g}if(m===undefined){if(g<p||g>=n){return false
}if(i>k){if(!c||c.y<r){c=this.createVertex(g,r)}else{if(c.y>=d){return false}}b=this.createVertex(g,d)}else{if(!c||c.y>d){c=this.createVertex(g,d)
}else{if(c.y<r){return false}}b=this.createVertex(g,r)}}else{if(m<-1||m>1){if(i>k){if(!c||c.y<r){c=this.createVertex((r-q)/m,r)
}else{if(c.y>=d){return false}}b=this.createVertex((d-q)/m,d)}else{if(!c||c.y>d){c=this.createVertex((d-q)/m,d)}else{if(c.y<r){return false
}}b=this.createVertex((r-q)/m,r)}}else{if(h<j){if(!c||c.x<p){c=this.createVertex(p,m*p+q)}else{if(c.x>=n){return false}}b=this.createVertex(n,m*n+q)
}else{if(!c||c.x>n){c=this.createVertex(n,m*n+q)}else{if(c.x<p){return false}}b=this.createVertex(p,m*p+q)}}}l.va=c;l.vb=b;
return true};Voronoi.prototype.clipEdge=function(d,i){var b=d.va.x,l=d.va.y,h=d.vb.x,g=d.vb.y,f=0,e=1,k=h-b,j=g-l;var c=b-i.xl;
if(k===0&&c<0){return false}var a=-c/k;if(k<0){if(a<f){return false}if(a<e){e=a}}else{if(k>0){if(a>e){return false}if(a>f){f=a
}}}c=i.xr-b;if(k===0&&c<0){return false}a=c/k;if(k<0){if(a>e){return false}if(a>f){f=a}}else{if(k>0){if(a<f){return false
}if(a<e){e=a}}}c=l-i.yt;if(j===0&&c<0){return false}a=-c/j;if(j<0){if(a<f){return false}if(a<e){e=a}}else{if(j>0){if(a>e){return false
}if(a>f){f=a}}}c=i.yb-l;if(j===0&&c<0){return false}a=c/j;if(j<0){if(a>e){return false}if(a>f){f=a}}else{if(j>0){if(a<f){return false
}if(a<e){e=a}}}if(f>0){d.va=this.createVertex(b+f*k,l+f*j)}if(e<1){d.vb=this.createVertex(b+e*k,l+e*j)}if(f>0||e<1){this.cells[d.lSite.voronoiId].closeMe=true;
this.cells[d.rSite.voronoiId].closeMe=true}return true};Voronoi.prototype.clipEdges=function(e){var a=this.edges,d=a.length,c,b=Math.abs;
while(d--){c=a[d];if(!this.connectEdge(c,e)||!this.clipEdge(c,e)||(b(c.va.x-c.vb.x)<1e-9&&b(c.va.y-c.vb.y)<1e-9)){c.va=c.vb=null;
a.splice(d,1)}}};Voronoi.prototype.closeCells=function(p){var g=p.xl,d=p.xr,m=p.yt,j=p.yb,q=this.cells,a=q.length,n,e,o,c,b,l,k,i,f,h=Math.abs;
while(a--){n=q[a];if(!n.prepareHalfedges()){continue}if(!n.closeMe){continue}o=n.halfedges;c=o.length;e=0;while(e<c){l=o[e].getEndpoint();
i=o[(e+1)%c].getStartpoint();if(h(l.x-i.x)>=1e-9||h(l.y-i.y)>=1e-9){switch(true){case this.equalWithEpsilon(l.x,g)&&this.lessThanWithEpsilon(l.y,j):f=this.equalWithEpsilon(i.x,g);
k=this.createVertex(g,f?i.y:j);b=this.createBorderEdge(n.site,l,k);e++;o.splice(e,0,this.createHalfedge(b,n.site,null));c++;
if(f){break}l=k;case this.equalWithEpsilon(l.y,j)&&this.lessThanWithEpsilon(l.x,d):f=this.equalWithEpsilon(i.y,j);k=this.createVertex(f?i.x:d,j);
b=this.createBorderEdge(n.site,l,k);e++;o.splice(e,0,this.createHalfedge(b,n.site,null));c++;if(f){break}l=k;case this.equalWithEpsilon(l.x,d)&&this.greaterThanWithEpsilon(l.y,m):f=this.equalWithEpsilon(i.x,d);
k=this.createVertex(d,f?i.y:m);b=this.createBorderEdge(n.site,l,k);e++;o.splice(e,0,this.createHalfedge(b,n.site,null));c++;
if(f){break}l=k;case this.equalWithEpsilon(l.y,m)&&this.greaterThanWithEpsilon(l.x,g):f=this.equalWithEpsilon(i.y,m);k=this.createVertex(f?i.x:g,m);
b=this.createBorderEdge(n.site,l,k);e++;o.splice(e,0,this.createHalfedge(b,n.site,null));c++;if(f){break}l=k;f=this.equalWithEpsilon(i.x,g);
k=this.createVertex(g,f?i.y:j);b=this.createBorderEdge(n.site,l,k);e++;o.splice(e,0,this.createHalfedge(b,n.site,null));c++;
if(f){break}l=k;f=this.equalWithEpsilon(i.y,j);k=this.createVertex(f?i.x:d,j);b=this.createBorderEdge(n.site,l,k);e++;o.splice(e,0,this.createHalfedge(b,n.site,null));
c++;if(f){break}l=k;f=this.equalWithEpsilon(i.x,d);k=this.createVertex(d,f?i.y:m);b=this.createBorderEdge(n.site,l,k);e++;
o.splice(e,0,this.createHalfedge(b,n.site,null));c++;if(f){break}default:throw"Voronoi.closeCells() > this makes no sense!"
}}e++}n.closeMe=false}};Voronoi.prototype.quantizeSites=function(c){var b=this.EpsilonThing,d=c.length,a;while(d--){a=c[d];a.x=Math.floor(a.x/b)*b;
a.y=Math.floor(a.y/b)*b}};Voronoi.prototype.recycle=function(a){if(a){if(a instanceof this.Diagram){this.toRecycle=a}else{throw"Voronoi.recycleDiagram() > Need a Diagram object."
}}};Voronoi.prototype.compute=function(i,j){var d=new Date();this.reset();if(this.toRecycle){this.vertexJunkyard=this.vertexJunkyard.concat(this.toRecycle.vertices);
this.edgeJunkyard=this.edgeJunkyard.concat(this.toRecycle.edges);this.cellJunkyard=this.cellJunkyard.concat(this.toRecycle.cells);
this.toRecycle=null}var h=i.slice(0);h.sort(function(n,m){var o=m.y-n.y;if(o){return o}return m.x-n.x});var b=h.pop(),l=0,f,e,k=this.cells,a;
for(;;){a=this.firstCircleEvent;if(b&&(!a||b.y<a.y||(b.y===a.y&&b.x<a.x))){if(b.x!==f||b.y!==e){k[l]=this.createCell(b);b.voronoiId=l++;
this.addBeachsection(b);e=b.y;f=b.x}b=h.pop()}else{if(a){this.removeBeachsection(a.arc)}else{break}}}this.clipEdges(j);this.closeCells(j);
var c=new Date();var g=new this.Diagram();g.cells=this.cells;g.edges=this.edges;g.vertices=this.vertices;g.execTime=c.getTime()-d.getTime();
this.reset();return g};

var Delaunay;!function(){"use strict";function b(a){var f,g,h,i,j,k,b=Number.POSITIVE_INFINITY,c=Number.POSITIVE_INFINITY,d=Number.NEGATIVE_INFINITY,e=Number.NEGATIVE_INFINITY;for(f=a.length;f--;)a[f][0]<b&&(b=a[f][0]),a[f][0]>d&&(d=a[f][0]),a[f][1]<c&&(c=a[f][1]),a[f][1]>e&&(e=a[f][1]);return g=d-b,h=e-c,i=Math.max(g,h),j=b+.5*g,k=c+.5*h,[[j-20*i,k-i],[j,k+20*i],[j+20*i,k-i]]}function c(b,c,d,e){var n,o,p,q,r,s,t,u,v,w,f=b[c][0],g=b[c][1],h=b[d][0],i=b[d][1],j=b[e][0],k=b[e][1],l=Math.abs(g-i),m=Math.abs(i-k);if(l<a&&m<a)throw new Error("Eek! Coincident points!");return l<a?(q=-((j-h)/(k-i)),s=(h+j)/2,u=(i+k)/2,n=(h+f)/2,o=q*(n-s)+u):m<a?(p=-((h-f)/(i-g)),r=(f+h)/2,t=(g+i)/2,n=(j+h)/2,o=p*(n-r)+t):(p=-((h-f)/(i-g)),q=-((j-h)/(k-i)),r=(f+h)/2,s=(h+j)/2,t=(g+i)/2,u=(i+k)/2,n=(p*r-q*s+u-t)/(p-q),o=l>m?p*(n-r)+t:q*(n-s)+u),v=h-n,w=i-o,{i:c,j:d,k:e,x:n,y:o,r:v*v+w*w}}function d(a){var b,c,d,e,f,g;for(c=a.length;c;)for(e=a[--c],d=a[--c],b=c;b;)if(g=a[--b],f=a[--b],d===f&&e===g||d===g&&e===f){a.splice(c,2),a.splice(b,2);break}}var a=1/1048576;Delaunay={triangulate:function(e,f){var h,i,j,k,l,m,n,o,p,q,r,s,g=e.length;if(g<3)return[];if(e=e.slice(0),f)for(h=g;h--;)e[h]=e[h][f];for(j=new Array(g),h=g;h--;)j[h]=h;for(j.sort(function(a,b){return e[b][0]-e[a][0]}),k=b(e),e.push(k[0],k[1],k[2]),l=[c(e,g+0,g+1,g+2)],m=[],n=[],h=j.length;h--;n.length=0){for(s=j[h],i=l.length;i--;)o=e[s][0]-l[i].x,o>0&&o*o>l[i].r?(m.push(l[i]),l.splice(i,1)):(p=e[s][1]-l[i].y,o*o+p*p-l[i].r>a||(n.push(l[i].i,l[i].j,l[i].j,l[i].k,l[i].k,l[i].i),l.splice(i,1)));for(d(n),i=n.length;i;)r=n[--i],q=n[--i],l.push(c(e,q,r,s))}for(h=l.length;h--;)m.push(l[h]);for(l.length=0,h=m.length;h--;)m[h].i<g&&m[h].j<g&&m[h].k<g&&l.push(m[h].i,m[h].j,m[h].k);return l},contains:function(a,b){if(b[0]<a[0][0]&&b[0]<a[1][0]&&b[0]<a[2][0]||b[0]>a[0][0]&&b[0]>a[1][0]&&b[0]>a[2][0]||b[1]<a[0][1]&&b[1]<a[1][1]&&b[1]<a[2][1]||b[1]>a[0][1]&&b[1]>a[1][1]&&b[1]>a[2][1])return null;var c=a[1][0]-a[0][0],d=a[2][0]-a[0][0],e=a[1][1]-a[0][1],f=a[2][1]-a[0][1],g=c*f-d*e;if(0===g)return null;var h=(f*(b[0]-a[0][0])-d*(b[1]-a[0][1]))/g,i=(c*(b[1]-a[0][1])-e*(b[0]-a[0][0]))/g;return h<0||i<0||h+i>1?null:[h,i]}},"undefined"!=typeof module&&(module.exports=Delaunay)}();

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Particles=f()}})(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({1:[function(require,module,exports){require("../../modules/es6.string.iterator");require("../../modules/es6.array.from");module.exports=require("../../modules/_core").Array.from},{"../../modules/_core":8,"../../modules/es6.array.from":55,"../../modules/es6.string.iterator":57}],2:[function(require,module,exports){require("../../modules/es6.object.assign");module.exports=require("../../modules/_core").Object.assign},{"../../modules/_core":8,"../../modules/es6.object.assign":56}],3:[function(require,module,exports){module.exports=function(it){if(typeof it!="function")throw TypeError(it+" is not a function!");return it}},{}],4:[function(require,module,exports){var isObject=require("./_is-object");module.exports=function(it){if(!isObject(it))throw TypeError(it+" is not an object!");return it}},{"./_is-object":24}],5:[function(require,module,exports){var toIObject=require("./_to-iobject"),toLength=require("./_to-length"),toIndex=require("./_to-index");module.exports=function(IS_INCLUDES){return function($this,el,fromIndex){var O=toIObject($this),length=toLength(O.length),index=toIndex(fromIndex,length),value;if(IS_INCLUDES&&el!=el)while(length>index){value=O[index++];if(value!=value)return true}else for(;length>index;index++)if(IS_INCLUDES||index in O){if(O[index]===el)return IS_INCLUDES||index||0}return!IS_INCLUDES&&-1}}},{"./_to-index":46,"./_to-iobject":48,"./_to-length":49}],6:[function(require,module,exports){var cof=require("./_cof"),TAG=require("./_wks")("toStringTag"),ARG=cof(function(){return arguments}())=="Arguments";var tryGet=function(it,key){try{return it[key]}catch(e){}};module.exports=function(it){var O,T,B;return it===undefined?"Undefined":it===null?"Null":typeof(T=tryGet(O=Object(it),TAG))=="string"?T:ARG?cof(O):(B=cof(O))=="Object"&&typeof O.callee=="function"?"Arguments":B}},{"./_cof":7,"./_wks":53}],7:[function(require,module,exports){var toString={}.toString;module.exports=function(it){return toString.call(it).slice(8,-1)}},{}],8:[function(require,module,exports){var core=module.exports={version:"2.4.0"};if(typeof __e=="number")__e=core},{}],9:[function(require,module,exports){"use strict";var $defineProperty=require("./_object-dp"),createDesc=require("./_property-desc");module.exports=function(object,index,value){if(index in object)$defineProperty.f(object,index,createDesc(0,value));else object[index]=value}},{"./_object-dp":33,"./_property-desc":40}],10:[function(require,module,exports){var aFunction=require("./_a-function");module.exports=function(fn,that,length){aFunction(fn);if(that===undefined)return fn;switch(length){case 1:return function(a){return fn.call(that,a)};case 2:return function(a,b){return fn.call(that,a,b)};case 3:return function(a,b,c){return fn.call(that,a,b,c)}}return function(){return fn.apply(that,arguments)}}},{"./_a-function":3}],11:[function(require,module,exports){module.exports=function(it){if(it==undefined)throw TypeError("Can't call method on  "+it);return it}},{}],12:[function(require,module,exports){module.exports=!require("./_fails")(function(){return Object.defineProperty({},"a",{get:function(){return 7}}).a!=7})},{"./_fails":16}],13:[function(require,module,exports){var isObject=require("./_is-object"),document=require("./_global").document,is=isObject(document)&&isObject(document.createElement);module.exports=function(it){return is?document.createElement(it):{}}},{"./_global":17,"./_is-object":24}],14:[function(require,module,exports){module.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},{}],15:[function(require,module,exports){var global=require("./_global"),core=require("./_core"),hide=require("./_hide"),redefine=require("./_redefine"),ctx=require("./_ctx"),PROTOTYPE="prototype";var $export=function(type,name,source){var IS_FORCED=type&$export.F,IS_GLOBAL=type&$export.G,IS_STATIC=type&$export.S,IS_PROTO=type&$export.P,IS_BIND=type&$export.B,target=IS_GLOBAL?global:IS_STATIC?global[name]||(global[name]={}):(global[name]||{})[PROTOTYPE],exports=IS_GLOBAL?core:core[name]||(core[name]={}),expProto=exports[PROTOTYPE]||(exports[PROTOTYPE]={}),key,own,out,exp;if(IS_GLOBAL)source=name;for(key in source){own=!IS_FORCED&&target&&target[key]!==undefined;out=(own?target:source)[key];exp=IS_BIND&&own?ctx(out,global):IS_PROTO&&typeof out=="function"?ctx(Function.call,out):out;if(target)redefine(target,key,out,type&$export.U);if(exports[key]!=out)hide(exports,key,exp);if(IS_PROTO&&expProto[key]!=out)expProto[key]=out}};global.core=core;$export.F=1;$export.G=2;$export.S=4;$export.P=8;$export.B=16;$export.W=32;$export.U=64;$export.R=128;module.exports=$export},{"./_core":8,"./_ctx":10,"./_global":17,"./_hide":19,"./_redefine":41}],16:[function(require,module,exports){module.exports=function(exec){try{return!!exec()}catch(e){return true}}},{}],17:[function(require,module,exports){var global=module.exports=typeof window!="undefined"&&window.Math==Math?window:typeof self!="undefined"&&self.Math==Math?self:Function("return this")();if(typeof __g=="number")__g=global},{}],18:[function(require,module,exports){var hasOwnProperty={}.hasOwnProperty;module.exports=function(it,key){return hasOwnProperty.call(it,key)}},{}],19:[function(require,module,exports){var dP=require("./_object-dp"),createDesc=require("./_property-desc");module.exports=require("./_descriptors")?function(object,key,value){return dP.f(object,key,createDesc(1,value))}:function(object,key,value){object[key]=value;return object}},{"./_descriptors":12,"./_object-dp":33,"./_property-desc":40}],20:[function(require,module,exports){module.exports=require("./_global").document&&document.documentElement},{"./_global":17}],21:[function(require,module,exports){module.exports=!require("./_descriptors")&&!require("./_fails")(function(){return Object.defineProperty(require("./_dom-create")("div"),"a",{get:function(){return 7}}).a!=7})},{"./_descriptors":12,"./_dom-create":13,"./_fails":16}],22:[function(require,module,exports){var cof=require("./_cof");module.exports=Object("z").propertyIsEnumerable(0)?Object:function(it){return cof(it)=="String"?it.split(""):Object(it)}},{"./_cof":7}],23:[function(require,module,exports){var Iterators=require("./_iterators"),ITERATOR=require("./_wks")("iterator"),ArrayProto=Array.prototype;module.exports=function(it){return it!==undefined&&(Iterators.Array===it||ArrayProto[ITERATOR]===it)}},{"./_iterators":29,"./_wks":53}],24:[function(require,module,exports){module.exports=function(it){return typeof it==="object"?it!==null:typeof it==="function"}},{}],25:[function(require,module,exports){var anObject=require("./_an-object");module.exports=function(iterator,fn,value,entries){try{return entries?fn(anObject(value)[0],value[1]):fn(value)}catch(e){var ret=iterator["return"];if(ret!==undefined)anObject(ret.call(iterator));throw e}}},{"./_an-object":4}],26:[function(require,module,exports){"use strict";var create=require("./_object-create"),descriptor=require("./_property-desc"),setToStringTag=require("./_set-to-string-tag"),IteratorPrototype={};require("./_hide")(IteratorPrototype,require("./_wks")("iterator"),function(){return this});module.exports=function(Constructor,NAME,next){Constructor.prototype=create(IteratorPrototype,{next:descriptor(1,next)});setToStringTag(Constructor,NAME+" Iterator")}},{"./_hide":19,"./_object-create":32,"./_property-desc":40,"./_set-to-string-tag":42,"./_wks":53}],27:[function(require,module,exports){"use strict";var LIBRARY=require("./_library"),$export=require("./_export"),redefine=require("./_redefine"),hide=require("./_hide"),has=require("./_has"),Iterators=require("./_iterators"),$iterCreate=require("./_iter-create"),setToStringTag=require("./_set-to-string-tag"),getPrototypeOf=require("./_object-gpo"),ITERATOR=require("./_wks")("iterator"),BUGGY=!([].keys&&"next"in[].keys()),FF_ITERATOR="@@iterator",KEYS="keys",VALUES="values";var returnThis=function(){return this};module.exports=function(Base,NAME,Constructor,next,DEFAULT,IS_SET,FORCED){$iterCreate(Constructor,NAME,next);var getMethod=function(kind){if(!BUGGY&&kind in proto)return proto[kind];switch(kind){case KEYS:return function keys(){return new Constructor(this,kind)};case VALUES:return function values(){return new Constructor(this,kind)}}return function entries(){return new Constructor(this,kind)}};var TAG=NAME+" Iterator",DEF_VALUES=DEFAULT==VALUES,VALUES_BUG=false,proto=Base.prototype,$native=proto[ITERATOR]||proto[FF_ITERATOR]||DEFAULT&&proto[DEFAULT],$default=$native||getMethod(DEFAULT),$entries=DEFAULT?!DEF_VALUES?$default:getMethod("entries"):undefined,$anyNative=NAME=="Array"?proto.entries||$native:$native,methods,key,IteratorPrototype;if($anyNative){IteratorPrototype=getPrototypeOf($anyNative.call(new Base));if(IteratorPrototype!==Object.prototype){setToStringTag(IteratorPrototype,TAG,true);if(!LIBRARY&&!has(IteratorPrototype,ITERATOR))hide(IteratorPrototype,ITERATOR,returnThis)}}if(DEF_VALUES&&$native&&$native.name!==VALUES){VALUES_BUG=true;$default=function values(){return $native.call(this)}}if((!LIBRARY||FORCED)&&(BUGGY||VALUES_BUG||!proto[ITERATOR])){hide(proto,ITERATOR,$default)}Iterators[NAME]=$default;Iterators[TAG]=returnThis;if(DEFAULT){methods={values:DEF_VALUES?$default:getMethod(VALUES),keys:IS_SET?$default:getMethod(KEYS),entries:$entries};if(FORCED)for(key in methods){if(!(key in proto))redefine(proto,key,methods[key])}else $export($export.P+$export.F*(BUGGY||VALUES_BUG),NAME,methods)}return methods}},{"./_export":15,"./_has":18,"./_hide":19,"./_iter-create":26,"./_iterators":29,"./_library":30,"./_object-gpo":36,"./_redefine":41,"./_set-to-string-tag":42,"./_wks":53}],28:[function(require,module,exports){var ITERATOR=require("./_wks")("iterator"),SAFE_CLOSING=false;try{var riter=[7][ITERATOR]();riter["return"]=function(){SAFE_CLOSING=true};Array.from(riter,function(){throw 2})}catch(e){}module.exports=function(exec,skipClosing){if(!skipClosing&&!SAFE_CLOSING)return false;var safe=false;try{var arr=[7],iter=arr[ITERATOR]();iter.next=function(){return{done:safe=true}};arr[ITERATOR]=function(){return iter};exec(arr)}catch(e){}return safe}},{"./_wks":53}],29:[function(require,module,exports){module.exports={}},{}],30:[function(require,module,exports){module.exports=false},{}],31:[function(require,module,exports){"use strict";var getKeys=require("./_object-keys"),gOPS=require("./_object-gops"),pIE=require("./_object-pie"),toObject=require("./_to-object"),IObject=require("./_iobject"),$assign=Object.assign;module.exports=!$assign||require("./_fails")(function(){var A={},B={},S=Symbol(),K="abcdefghijklmnopqrst";A[S]=7;K.split("").forEach(function(k){B[k]=k});return $assign({},A)[S]!=7||Object.keys($assign({},B)).join("")!=K})?function assign(target,source){var T=toObject(target),aLen=arguments.length,index=1,getSymbols=gOPS.f,isEnum=pIE.f;while(aLen>index){var S=IObject(arguments[index++]),keys=getSymbols?getKeys(S).concat(getSymbols(S)):getKeys(S),length=keys.length,j=0,key;while(length>j)if(isEnum.call(S,key=keys[j++]))T[key]=S[key]}return T}:$assign},{"./_fails":16,"./_iobject":22,"./_object-gops":35,"./_object-keys":38,"./_object-pie":39,"./_to-object":50}],32:[function(require,module,exports){var anObject=require("./_an-object"),dPs=require("./_object-dps"),enumBugKeys=require("./_enum-bug-keys"),IE_PROTO=require("./_shared-key")("IE_PROTO"),Empty=function(){},PROTOTYPE="prototype";var createDict=function(){var iframe=require("./_dom-create")("iframe"),i=enumBugKeys.length,lt="<",gt=">",iframeDocument;iframe.style.display="none";require("./_html").appendChild(iframe);iframe.src="javascript:";iframeDocument=iframe.contentWindow.document;iframeDocument.open();iframeDocument.write(lt+"script"+gt+"document.F=Object"+lt+"/script"+gt);iframeDocument.close();createDict=iframeDocument.F;while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];return createDict()};module.exports=Object.create||function create(O,Properties){var result;if(O!==null){Empty[PROTOTYPE]=anObject(O);result=new Empty;Empty[PROTOTYPE]=null;result[IE_PROTO]=O}else result=createDict();return Properties===undefined?result:dPs(result,Properties)}},{"./_an-object":4,"./_dom-create":13,"./_enum-bug-keys":14,"./_html":20,"./_object-dps":34,"./_shared-key":43}],33:[function(require,module,exports){var anObject=require("./_an-object"),IE8_DOM_DEFINE=require("./_ie8-dom-define"),toPrimitive=require("./_to-primitive"),dP=Object.defineProperty;exports.f=require("./_descriptors")?Object.defineProperty:function defineProperty(O,P,Attributes){anObject(O);P=toPrimitive(P,true);anObject(Attributes);if(IE8_DOM_DEFINE)try{return dP(O,P,Attributes)}catch(e){}if("get"in Attributes||"set"in Attributes)throw TypeError("Accessors not supported!");if("value"in Attributes)O[P]=Attributes.value;return O}},{"./_an-object":4,"./_descriptors":12,"./_ie8-dom-define":21,"./_to-primitive":51}],34:[function(require,module,exports){var dP=require("./_object-dp"),anObject=require("./_an-object"),getKeys=require("./_object-keys");module.exports=require("./_descriptors")?Object.defineProperties:function defineProperties(O,Properties){anObject(O);var keys=getKeys(Properties),length=keys.length,i=0,P;while(length>i)dP.f(O,P=keys[i++],Properties[P]);return O}},{"./_an-object":4,"./_descriptors":12,"./_object-dp":33,"./_object-keys":38}],35:[function(require,module,exports){exports.f=Object.getOwnPropertySymbols},{}],36:[function(require,module,exports){var has=require("./_has"),toObject=require("./_to-object"),IE_PROTO=require("./_shared-key")("IE_PROTO"),ObjectProto=Object.prototype;module.exports=Object.getPrototypeOf||function(O){O=toObject(O);if(has(O,IE_PROTO))return O[IE_PROTO];if(typeof O.constructor=="function"&&O instanceof O.constructor){return O.constructor.prototype}return O instanceof Object?ObjectProto:null}},{"./_has":18,"./_shared-key":43,"./_to-object":50}],37:[function(require,module,exports){var has=require("./_has"),toIObject=require("./_to-iobject"),arrayIndexOf=require("./_array-includes")(false),IE_PROTO=require("./_shared-key")("IE_PROTO");module.exports=function(object,names){var O=toIObject(object),i=0,result=[],key;for(key in O)if(key!=IE_PROTO)has(O,key)&&result.push(key);while(names.length>i)if(has(O,key=names[i++])){~arrayIndexOf(result,key)||result.push(key)}return result}},{"./_array-includes":5,"./_has":18,"./_shared-key":43,"./_to-iobject":48}],38:[function(require,module,exports){var $keys=require("./_object-keys-internal"),enumBugKeys=require("./_enum-bug-keys");module.exports=Object.keys||function keys(O){return $keys(O,enumBugKeys)}},{"./_enum-bug-keys":14,"./_object-keys-internal":37}],39:[function(require,module,exports){exports.f={}.propertyIsEnumerable},{}],40:[function(require,module,exports){module.exports=function(bitmap,value){return{enumerable:!(bitmap&1),configurable:!(bitmap&2),writable:!(bitmap&4),value:value}}},{}],41:[function(require,module,exports){var global=require("./_global"),hide=require("./_hide"),has=require("./_has"),SRC=require("./_uid")("src"),TO_STRING="toString",$toString=Function[TO_STRING],TPL=(""+$toString).split(TO_STRING);require("./_core").inspectSource=function(it){return $toString.call(it)};(module.exports=function(O,key,val,safe){var isFunction=typeof val=="function";if(isFunction)has(val,"name")||hide(val,"name",key);if(O[key]===val)return;if(isFunction)has(val,SRC)||hide(val,SRC,O[key]?""+O[key]:TPL.join(String(key)));if(O===global){O[key]=val}else{if(!safe){delete O[key];hide(O,key,val)}else{if(O[key])O[key]=val;else hide(O,key,val)}}})(Function.prototype,TO_STRING,function toString(){return typeof this=="function"&&this[SRC]||$toString.call(this)})},{"./_core":8,"./_global":17,"./_has":18,"./_hide":19,"./_uid":52}],42:[function(require,module,exports){var def=require("./_object-dp").f,has=require("./_has"),TAG=require("./_wks")("toStringTag");module.exports=function(it,tag,stat){if(it&&!has(it=stat?it:it.prototype,TAG))def(it,TAG,{configurable:true,value:tag})}},{"./_has":18,"./_object-dp":33,"./_wks":53}],43:[function(require,module,exports){var shared=require("./_shared")("keys"),uid=require("./_uid");module.exports=function(key){return shared[key]||(shared[key]=uid(key))}},{"./_shared":44,"./_uid":52}],44:[function(require,module,exports){var global=require("./_global"),SHARED="__core-js_shared__",store=global[SHARED]||(global[SHARED]={});module.exports=function(key){return store[key]||(store[key]={})}},{"./_global":17}],45:[function(require,module,exports){var toInteger=require("./_to-integer"),defined=require("./_defined");module.exports=function(TO_STRING){return function(that,pos){var s=String(defined(that)),i=toInteger(pos),l=s.length,a,b;if(i<0||i>=l)return TO_STRING?"":undefined;a=s.charCodeAt(i);return a<55296||a>56319||i+1===l||(b=s.charCodeAt(i+1))<56320||b>57343?TO_STRING?s.charAt(i):a:TO_STRING?s.slice(i,i+2):(a-55296<<10)+(b-56320)+65536}}},{"./_defined":11,"./_to-integer":47}],46:[function(require,module,exports){var toInteger=require("./_to-integer"),max=Math.max,min=Math.min;module.exports=function(index,length){index=toInteger(index);return index<0?max(index+length,0):min(index,length)}},{"./_to-integer":47}],47:[function(require,module,exports){var ceil=Math.ceil,floor=Math.floor;module.exports=function(it){return isNaN(it=+it)?0:(it>0?floor:ceil)(it)}},{}],48:[function(require,module,exports){var IObject=require("./_iobject"),defined=require("./_defined");module.exports=function(it){return IObject(defined(it))}},{"./_defined":11,"./_iobject":22}],49:[function(require,module,exports){var toInteger=require("./_to-integer"),min=Math.min;module.exports=function(it){return it>0?min(toInteger(it),9007199254740991):0}},{"./_to-integer":47}],50:[function(require,module,exports){var defined=require("./_defined");module.exports=function(it){return Object(defined(it))}},{"./_defined":11}],51:[function(require,module,exports){var isObject=require("./_is-object");module.exports=function(it,S){if(!isObject(it))return it;var fn,val;if(S&&typeof(fn=it.toString)=="function"&&!isObject(val=fn.call(it)))return val;if(typeof(fn=it.valueOf)=="function"&&!isObject(val=fn.call(it)))return val;if(!S&&typeof(fn=it.toString)=="function"&&!isObject(val=fn.call(it)))return val;throw TypeError("Can't convert object to primitive value")}},{"./_is-object":24}],52:[function(require,module,exports){var id=0,px=Math.random();module.exports=function(key){return"Symbol(".concat(key===undefined?"":key,")_",(++id+px).toString(36))}},{}],53:[function(require,module,exports){var store=require("./_shared")("wks"),uid=require("./_uid"),Symbol=require("./_global").Symbol,USE_SYMBOL=typeof Symbol=="function";var $exports=module.exports=function(name){return store[name]||(store[name]=USE_SYMBOL&&Symbol[name]||(USE_SYMBOL?Symbol:uid)("Symbol."+name))};$exports.store=store},{"./_global":17,"./_shared":44,"./_uid":52}],54:[function(require,module,exports){var classof=require("./_classof"),ITERATOR=require("./_wks")("iterator"),Iterators=require("./_iterators");module.exports=require("./_core").getIteratorMethod=function(it){if(it!=undefined)return it[ITERATOR]||it["@@iterator"]||Iterators[classof(it)]}},{"./_classof":6,"./_core":8,"./_iterators":29,"./_wks":53}],55:[function(require,module,exports){"use strict";var ctx=require("./_ctx"),$export=require("./_export"),toObject=require("./_to-object"),call=require("./_iter-call"),isArrayIter=require("./_is-array-iter"),toLength=require("./_to-length"),createProperty=require("./_create-property"),getIterFn=require("./core.get-iterator-method");$export($export.S+$export.F*!require("./_iter-detect")(function(iter){Array.from(iter)}),"Array",{from:function from(arrayLike){var O=toObject(arrayLike),C=typeof this=="function"?this:Array,aLen=arguments.length,mapfn=aLen>1?arguments[1]:undefined,mapping=mapfn!==undefined,index=0,iterFn=getIterFn(O),length,result,step,iterator;if(mapping)mapfn=ctx(mapfn,aLen>2?arguments[2]:undefined,2);if(iterFn!=undefined&&!(C==Array&&isArrayIter(iterFn))){for(iterator=iterFn.call(O),result=new C;!(step=iterator.next()).done;index++){createProperty(result,index,mapping?call(iterator,mapfn,[step.value,index],true):step.value)}}else{length=toLength(O.length);for(result=new C(length);length>index;index++){createProperty(result,index,mapping?mapfn(O[index],index):O[index])}}result.length=index;return result}})},{"./_create-property":9,"./_ctx":10,"./_export":15,"./_is-array-iter":23,"./_iter-call":25,"./_iter-detect":28,"./_to-length":49,"./_to-object":50,"./core.get-iterator-method":54}],56:[function(require,module,exports){var $export=require("./_export");$export($export.S+$export.F,"Object",{assign:require("./_object-assign")})},{"./_export":15,"./_object-assign":31}],57:[function(require,module,exports){"use strict";var $at=require("./_string-at")(true);require("./_iter-define")(String,"String",function(iterated){this._t=String(iterated);this._i=0},function(){var O=this._t,index=this._i,point;if(index>=O.length)return{value:undefined,done:true};point=$at(O,index);this._i+=point.length;return{value:point,done:false}})},{"./_iter-define":27,"./_string-at":45}],58:[function(require,module,exports){function Voronoi(){this.vertices=null;this.edges=null;this.cells=null;this.toRecycle=null;this.beachsectionJunkyard=[];this.circleEventJunkyard=[];this.vertexJunkyard=[];this.edgeJunkyard=[];this.cellJunkyard=[]}Voronoi.prototype.reset=function(){if(!this.beachline){this.beachline=new this.RBTree}if(this.beachline.root){var beachsection=this.beachline.getFirst(this.beachline.root);while(beachsection){this.beachsectionJunkyard.push(beachsection);beachsection=beachsection.rbNext}}this.beachline.root=null;if(!this.circleEvents){this.circleEvents=new this.RBTree}this.circleEvents.root=this.firstCircleEvent=null;this.vertices=[];this.edges=[];this.cells=[]};Voronoi.prototype.sqrt=Math.sqrt;Voronoi.prototype.abs=Math.abs;Voronoi.prototype.ε=Voronoi.ε=1e-9;Voronoi.prototype.invε=Voronoi.invε=1/Voronoi.ε;Voronoi.prototype.equalWithEpsilon=function(a,b){return this.abs(a-b)<1e-9};Voronoi.prototype.greaterThanWithEpsilon=function(a,b){return a-b>1e-9};Voronoi.prototype.greaterThanOrEqualWithEpsilon=function(a,b){return b-a<1e-9};Voronoi.prototype.lessThanWithEpsilon=function(a,b){return b-a>1e-9};Voronoi.prototype.lessThanOrEqualWithEpsilon=function(a,b){return a-b<1e-9};Voronoi.prototype.RBTree=function(){this.root=null};Voronoi.prototype.RBTree.prototype.rbInsertSuccessor=function(node,successor){var parent;if(node){successor.rbPrevious=node;successor.rbNext=node.rbNext;if(node.rbNext){node.rbNext.rbPrevious=successor}node.rbNext=successor;if(node.rbRight){node=node.rbRight;while(node.rbLeft){node=node.rbLeft}node.rbLeft=successor}else{node.rbRight=successor}parent=node}else if(this.root){node=this.getFirst(this.root);successor.rbPrevious=null;successor.rbNext=node;node.rbPrevious=successor;node.rbLeft=successor;parent=node}else{successor.rbPrevious=successor.rbNext=null;this.root=successor;parent=null}successor.rbLeft=successor.rbRight=null;successor.rbParent=parent;successor.rbRed=true;var grandpa,uncle;node=successor;while(parent&&parent.rbRed){grandpa=parent.rbParent;if(parent===grandpa.rbLeft){uncle=grandpa.rbRight;if(uncle&&uncle.rbRed){parent.rbRed=uncle.rbRed=false;grandpa.rbRed=true;node=grandpa}else{if(node===parent.rbRight){this.rbRotateLeft(parent);node=parent;parent=node.rbParent}parent.rbRed=false;grandpa.rbRed=true;this.rbRotateRight(grandpa)}}else{uncle=grandpa.rbLeft;if(uncle&&uncle.rbRed){parent.rbRed=uncle.rbRed=false;grandpa.rbRed=true;node=grandpa}else{if(node===parent.rbLeft){this.rbRotateRight(parent);node=parent;parent=node.rbParent}parent.rbRed=false;grandpa.rbRed=true;this.rbRotateLeft(grandpa)}}parent=node.rbParent}this.root.rbRed=false};Voronoi.prototype.RBTree.prototype.rbRemoveNode=function(node){if(node.rbNext){node.rbNext.rbPrevious=node.rbPrevious}if(node.rbPrevious){node.rbPrevious.rbNext=node.rbNext}node.rbNext=node.rbPrevious=null;var parent=node.rbParent,left=node.rbLeft,right=node.rbRight,next;if(!left){next=right}else if(!right){next=left}else{next=this.getFirst(right)}if(parent){if(parent.rbLeft===node){parent.rbLeft=next}else{parent.rbRight=next}}else{this.root=next}var isRed;if(left&&right){isRed=next.rbRed;next.rbRed=node.rbRed;next.rbLeft=left;left.rbParent=next;if(next!==right){parent=next.rbParent;next.rbParent=node.rbParent;node=next.rbRight;parent.rbLeft=node;next.rbRight=right;right.rbParent=next}else{next.rbParent=parent;parent=next;node=next.rbRight}}else{isRed=node.rbRed;node=next}if(node){node.rbParent=parent}if(isRed){return}if(node&&node.rbRed){node.rbRed=false;return}var sibling;do{if(node===this.root){break}if(node===parent.rbLeft){sibling=parent.rbRight;if(sibling.rbRed){sibling.rbRed=false;parent.rbRed=true;this.rbRotateLeft(parent);sibling=parent.rbRight}if(sibling.rbLeft&&sibling.rbLeft.rbRed||sibling.rbRight&&sibling.rbRight.rbRed){if(!sibling.rbRight||!sibling.rbRight.rbRed){sibling.rbLeft.rbRed=false;sibling.rbRed=true;this.rbRotateRight(sibling);sibling=parent.rbRight}sibling.rbRed=parent.rbRed;parent.rbRed=sibling.rbRight.rbRed=false;this.rbRotateLeft(parent);node=this.root;break}}else{sibling=parent.rbLeft;if(sibling.rbRed){sibling.rbRed=false;parent.rbRed=true;this.rbRotateRight(parent);sibling=parent.rbLeft}if(sibling.rbLeft&&sibling.rbLeft.rbRed||sibling.rbRight&&sibling.rbRight.rbRed){if(!sibling.rbLeft||!sibling.rbLeft.rbRed){sibling.rbRight.rbRed=false;sibling.rbRed=true;this.rbRotateLeft(sibling);sibling=parent.rbLeft}sibling.rbRed=parent.rbRed;parent.rbRed=sibling.rbLeft.rbRed=false;this.rbRotateRight(parent);node=this.root;break}}sibling.rbRed=true;node=parent;parent=parent.rbParent}while(!node.rbRed);if(node){node.rbRed=false}};Voronoi.prototype.RBTree.prototype.rbRotateLeft=function(node){var p=node,q=node.rbRight,parent=p.rbParent;if(parent){if(parent.rbLeft===p){parent.rbLeft=q}else{parent.rbRight=q}}else{this.root=q}q.rbParent=parent;p.rbParent=q;p.rbRight=q.rbLeft;if(p.rbRight){p.rbRight.rbParent=p}q.rbLeft=p};Voronoi.prototype.RBTree.prototype.rbRotateRight=function(node){var p=node,q=node.rbLeft,parent=p.rbParent;if(parent){if(parent.rbLeft===p){parent.rbLeft=q}else{parent.rbRight=q}}else{this.root=q}q.rbParent=parent;p.rbParent=q;p.rbLeft=q.rbRight;if(p.rbLeft){p.rbLeft.rbParent=p}q.rbRight=p};Voronoi.prototype.RBTree.prototype.getFirst=function(node){while(node.rbLeft){node=node.rbLeft}return node};Voronoi.prototype.RBTree.prototype.getLast=function(node){while(node.rbRight){node=node.rbRight}return node};Voronoi.prototype.Diagram=function(site){this.site=site};Voronoi.prototype.Cell=function(site){this.site=site;this.halfedges=[];this.closeMe=false};Voronoi.prototype.Cell.prototype.init=function(site){this.site=site;this.halfedges=[];this.closeMe=false;return this};Voronoi.prototype.createCell=function(site){var cell=this.cellJunkyard.pop();if(cell){return cell.init(site)}return new this.Cell(site)};Voronoi.prototype.Cell.prototype.prepareHalfedges=function(){var halfedges=this.halfedges,iHalfedge=halfedges.length,edge;while(iHalfedge--){edge=halfedges[iHalfedge].edge;if(!edge.vb||!edge.va){halfedges.splice(iHalfedge,1)}}halfedges.sort(function(a,b){return b.angle-a.angle});return halfedges.length};Voronoi.prototype.Cell.prototype.getNeighborIds=function(){var neighbors=[],iHalfedge=this.halfedges.length,edge;while(iHalfedge--){edge=this.halfedges[iHalfedge].edge;if(edge.lSite!==null&&edge.lSite.voronoiId!=this.site.voronoiId){neighbors.push(edge.lSite.voronoiId)}else if(edge.rSite!==null&&edge.rSite.voronoiId!=this.site.voronoiId){neighbors.push(edge.rSite.voronoiId)}}return neighbors};Voronoi.prototype.Cell.prototype.getBbox=function(){var halfedges=this.halfedges,iHalfedge=halfedges.length,xmin=Infinity,ymin=Infinity,xmax=-Infinity,ymax=-Infinity,v,vx,vy;while(iHalfedge--){v=halfedges[iHalfedge].getStartpoint();vx=v.x;vy=v.y;if(vx<xmin){xmin=vx}if(vy<ymin){ymin=vy}if(vx>xmax){xmax=vx}if(vy>ymax){ymax=vy}}return{x:xmin,y:ymin,width:xmax-xmin,height:ymax-ymin}};Voronoi.prototype.Cell.prototype.pointIntersection=function(x,y){var halfedges=this.halfedges,iHalfedge=halfedges.length,halfedge,p0,p1,r;while(iHalfedge--){halfedge=halfedges[iHalfedge];p0=halfedge.getStartpoint();p1=halfedge.getEndpoint();r=(y-p0.y)*(p1.x-p0.x)-(x-p0.x)*(p1.y-p0.y);if(!r){return 0}if(r>0){return-1}}return 1};Voronoi.prototype.Vertex=function(x,y){this.x=x;this.y=y};Voronoi.prototype.Edge=function(lSite,rSite){this.lSite=lSite;this.rSite=rSite;this.va=this.vb=null};Voronoi.prototype.Halfedge=function(edge,lSite,rSite){this.site=lSite;this.edge=edge;if(rSite){this.angle=Math.atan2(rSite.y-lSite.y,rSite.x-lSite.x)}else{var va=edge.va,vb=edge.vb;this.angle=edge.lSite===lSite?Math.atan2(vb.x-va.x,va.y-vb.y):Math.atan2(va.x-vb.x,vb.y-va.y)}};Voronoi.prototype.createHalfedge=function(edge,lSite,rSite){return new this.Halfedge(edge,lSite,rSite)};Voronoi.prototype.Halfedge.prototype.getStartpoint=function(){return this.edge.lSite===this.site?this.edge.va:this.edge.vb};Voronoi.prototype.Halfedge.prototype.getEndpoint=function(){return this.edge.lSite===this.site?this.edge.vb:this.edge.va};Voronoi.prototype.createVertex=function(x,y){var v=this.vertexJunkyard.pop();if(!v){v=new this.Vertex(x,y)}else{v.x=x;v.y=y}this.vertices.push(v);return v};Voronoi.prototype.createEdge=function(lSite,rSite,va,vb){var edge=this.edgeJunkyard.pop();if(!edge){edge=new this.Edge(lSite,rSite)}else{edge.lSite=lSite;edge.rSite=rSite;edge.va=edge.vb=null}this.edges.push(edge);if(va){this.setEdgeStartpoint(edge,lSite,rSite,va)}if(vb){this.setEdgeEndpoint(edge,lSite,rSite,vb)}this.cells[lSite.voronoiId].halfedges.push(this.createHalfedge(edge,lSite,rSite));this.cells[rSite.voronoiId].halfedges.push(this.createHalfedge(edge,rSite,lSite));return edge};Voronoi.prototype.createBorderEdge=function(lSite,va,vb){var edge=this.edgeJunkyard.pop();if(!edge){edge=new this.Edge(lSite,null)}else{edge.lSite=lSite;edge.rSite=null}edge.va=va;edge.vb=vb;this.edges.push(edge);return edge};Voronoi.prototype.setEdgeStartpoint=function(edge,lSite,rSite,vertex){if(!edge.va&&!edge.vb){edge.va=vertex;edge.lSite=lSite;edge.rSite=rSite}else if(edge.lSite===rSite){edge.vb=vertex}else{edge.va=vertex}};Voronoi.prototype.setEdgeEndpoint=function(edge,lSite,rSite,vertex){this.setEdgeStartpoint(edge,rSite,lSite,vertex)};Voronoi.prototype.Beachsection=function(){};Voronoi.prototype.createBeachsection=function(site){var beachsection=this.beachsectionJunkyard.pop();if(!beachsection){beachsection=new this.Beachsection}beachsection.site=site;return beachsection};Voronoi.prototype.leftBreakPoint=function(arc,directrix){var site=arc.site,rfocx=site.x,rfocy=site.y,pby2=rfocy-directrix;if(!pby2){return rfocx}var lArc=arc.rbPrevious;if(!lArc){return-Infinity}site=lArc.site;var lfocx=site.x,lfocy=site.y,plby2=lfocy-directrix;if(!plby2){return lfocx}var hl=lfocx-rfocx,aby2=1/pby2-1/plby2,b=hl/plby2;if(aby2){return(-b+this.sqrt(b*b-2*aby2*(hl*hl/(-2*plby2)-lfocy+plby2/2+rfocy-pby2/2)))/aby2+rfocx}return(rfocx+lfocx)/2};Voronoi.prototype.rightBreakPoint=function(arc,directrix){var rArc=arc.rbNext;if(rArc){return this.leftBreakPoint(rArc,directrix)}var site=arc.site;return site.y===directrix?site.x:Infinity;
};Voronoi.prototype.detachBeachsection=function(beachsection){this.detachCircleEvent(beachsection);this.beachline.rbRemoveNode(beachsection);this.beachsectionJunkyard.push(beachsection)};Voronoi.prototype.removeBeachsection=function(beachsection){var circle=beachsection.circleEvent,x=circle.x,y=circle.ycenter,vertex=this.createVertex(x,y),previous=beachsection.rbPrevious,next=beachsection.rbNext,disappearingTransitions=[beachsection],abs_fn=Math.abs;this.detachBeachsection(beachsection);var lArc=previous;while(lArc.circleEvent&&abs_fn(x-lArc.circleEvent.x)<1e-9&&abs_fn(y-lArc.circleEvent.ycenter)<1e-9){previous=lArc.rbPrevious;disappearingTransitions.unshift(lArc);this.detachBeachsection(lArc);lArc=previous}disappearingTransitions.unshift(lArc);this.detachCircleEvent(lArc);var rArc=next;while(rArc.circleEvent&&abs_fn(x-rArc.circleEvent.x)<1e-9&&abs_fn(y-rArc.circleEvent.ycenter)<1e-9){next=rArc.rbNext;disappearingTransitions.push(rArc);this.detachBeachsection(rArc);rArc=next}disappearingTransitions.push(rArc);this.detachCircleEvent(rArc);var nArcs=disappearingTransitions.length,iArc;for(iArc=1;iArc<nArcs;iArc++){rArc=disappearingTransitions[iArc];lArc=disappearingTransitions[iArc-1];this.setEdgeStartpoint(rArc.edge,lArc.site,rArc.site,vertex)}lArc=disappearingTransitions[0];rArc=disappearingTransitions[nArcs-1];rArc.edge=this.createEdge(lArc.site,rArc.site,undefined,vertex);this.attachCircleEvent(lArc);this.attachCircleEvent(rArc)};Voronoi.prototype.addBeachsection=function(site){var x=site.x,directrix=site.y;var lArc,rArc,dxl,dxr,node=this.beachline.root;while(node){dxl=this.leftBreakPoint(node,directrix)-x;if(dxl>1e-9){node=node.rbLeft}else{dxr=x-this.rightBreakPoint(node,directrix);if(dxr>1e-9){if(!node.rbRight){lArc=node;break}node=node.rbRight}else{if(dxl>-1e-9){lArc=node.rbPrevious;rArc=node}else if(dxr>-1e-9){lArc=node;rArc=node.rbNext}else{lArc=rArc=node}break}}}var newArc=this.createBeachsection(site);this.beachline.rbInsertSuccessor(lArc,newArc);if(!lArc&&!rArc){return}if(lArc===rArc){this.detachCircleEvent(lArc);rArc=this.createBeachsection(lArc.site);this.beachline.rbInsertSuccessor(newArc,rArc);newArc.edge=rArc.edge=this.createEdge(lArc.site,newArc.site);this.attachCircleEvent(lArc);this.attachCircleEvent(rArc);return}if(lArc&&!rArc){newArc.edge=this.createEdge(lArc.site,newArc.site);return}if(lArc!==rArc){this.detachCircleEvent(lArc);this.detachCircleEvent(rArc);var lSite=lArc.site,ax=lSite.x,ay=lSite.y,bx=site.x-ax,by=site.y-ay,rSite=rArc.site,cx=rSite.x-ax,cy=rSite.y-ay,d=2*(bx*cy-by*cx),hb=bx*bx+by*by,hc=cx*cx+cy*cy,vertex=this.createVertex((cy*hb-by*hc)/d+ax,(bx*hc-cx*hb)/d+ay);this.setEdgeStartpoint(rArc.edge,lSite,rSite,vertex);newArc.edge=this.createEdge(lSite,site,undefined,vertex);rArc.edge=this.createEdge(site,rSite,undefined,vertex);this.attachCircleEvent(lArc);this.attachCircleEvent(rArc);return}};Voronoi.prototype.CircleEvent=function(){this.arc=null;this.rbLeft=null;this.rbNext=null;this.rbParent=null;this.rbPrevious=null;this.rbRed=false;this.rbRight=null;this.site=null;this.x=this.y=this.ycenter=0};Voronoi.prototype.attachCircleEvent=function(arc){var lArc=arc.rbPrevious,rArc=arc.rbNext;if(!lArc||!rArc){return}var lSite=lArc.site,cSite=arc.site,rSite=rArc.site;if(lSite===rSite){return}var bx=cSite.x,by=cSite.y,ax=lSite.x-bx,ay=lSite.y-by,cx=rSite.x-bx,cy=rSite.y-by;var d=2*(ax*cy-ay*cx);if(d>=-2e-12){return}var ha=ax*ax+ay*ay,hc=cx*cx+cy*cy,x=(cy*ha-ay*hc)/d,y=(ax*hc-cx*ha)/d,ycenter=y+by;var circleEvent=this.circleEventJunkyard.pop();if(!circleEvent){circleEvent=new this.CircleEvent}circleEvent.arc=arc;circleEvent.site=cSite;circleEvent.x=x+bx;circleEvent.y=ycenter+this.sqrt(x*x+y*y);circleEvent.ycenter=ycenter;arc.circleEvent=circleEvent;var predecessor=null,node=this.circleEvents.root;while(node){if(circleEvent.y<node.y||circleEvent.y===node.y&&circleEvent.x<=node.x){if(node.rbLeft){node=node.rbLeft}else{predecessor=node.rbPrevious;break}}else{if(node.rbRight){node=node.rbRight}else{predecessor=node;break}}}this.circleEvents.rbInsertSuccessor(predecessor,circleEvent);if(!predecessor){this.firstCircleEvent=circleEvent}};Voronoi.prototype.detachCircleEvent=function(arc){var circleEvent=arc.circleEvent;if(circleEvent){if(!circleEvent.rbPrevious){this.firstCircleEvent=circleEvent.rbNext}this.circleEvents.rbRemoveNode(circleEvent);this.circleEventJunkyard.push(circleEvent);arc.circleEvent=null}};Voronoi.prototype.connectEdge=function(edge,bbox){var vb=edge.vb;if(!!vb){return true}var va=edge.va,xl=bbox.xl,xr=bbox.xr,yt=bbox.yt,yb=bbox.yb,lSite=edge.lSite,rSite=edge.rSite,lx=lSite.x,ly=lSite.y,rx=rSite.x,ry=rSite.y,fx=(lx+rx)/2,fy=(ly+ry)/2,fm,fb;this.cells[lSite.voronoiId].closeMe=true;this.cells[rSite.voronoiId].closeMe=true;if(ry!==ly){fm=(lx-rx)/(ry-ly);fb=fy-fm*fx}if(fm===undefined){if(fx<xl||fx>=xr){return false}if(lx>rx){if(!va||va.y<yt){va=this.createVertex(fx,yt)}else if(va.y>=yb){return false}vb=this.createVertex(fx,yb)}else{if(!va||va.y>yb){va=this.createVertex(fx,yb)}else if(va.y<yt){return false}vb=this.createVertex(fx,yt)}}else if(fm<-1||fm>1){if(lx>rx){if(!va||va.y<yt){va=this.createVertex((yt-fb)/fm,yt)}else if(va.y>=yb){return false}vb=this.createVertex((yb-fb)/fm,yb)}else{if(!va||va.y>yb){va=this.createVertex((yb-fb)/fm,yb)}else if(va.y<yt){return false}vb=this.createVertex((yt-fb)/fm,yt)}}else{if(ly<ry){if(!va||va.x<xl){va=this.createVertex(xl,fm*xl+fb)}else if(va.x>=xr){return false}vb=this.createVertex(xr,fm*xr+fb)}else{if(!va||va.x>xr){va=this.createVertex(xr,fm*xr+fb)}else if(va.x<xl){return false}vb=this.createVertex(xl,fm*xl+fb)}}edge.va=va;edge.vb=vb;return true};Voronoi.prototype.clipEdge=function(edge,bbox){var ax=edge.va.x,ay=edge.va.y,bx=edge.vb.x,by=edge.vb.y,t0=0,t1=1,dx=bx-ax,dy=by-ay;var q=ax-bbox.xl;if(dx===0&&q<0){return false}var r=-q/dx;if(dx<0){if(r<t0){return false}if(r<t1){t1=r}}else if(dx>0){if(r>t1){return false}if(r>t0){t0=r}}q=bbox.xr-ax;if(dx===0&&q<0){return false}r=q/dx;if(dx<0){if(r>t1){return false}if(r>t0){t0=r}}else if(dx>0){if(r<t0){return false}if(r<t1){t1=r}}q=ay-bbox.yt;if(dy===0&&q<0){return false}r=-q/dy;if(dy<0){if(r<t0){return false}if(r<t1){t1=r}}else if(dy>0){if(r>t1){return false}if(r>t0){t0=r}}q=bbox.yb-ay;if(dy===0&&q<0){return false}r=q/dy;if(dy<0){if(r>t1){return false}if(r>t0){t0=r}}else if(dy>0){if(r<t0){return false}if(r<t1){t1=r}}if(t0>0){edge.va=this.createVertex(ax+t0*dx,ay+t0*dy)}if(t1<1){edge.vb=this.createVertex(ax+t1*dx,ay+t1*dy)}if(t0>0||t1<1){this.cells[edge.lSite.voronoiId].closeMe=true;this.cells[edge.rSite.voronoiId].closeMe=true}return true};Voronoi.prototype.clipEdges=function(bbox){var edges=this.edges,iEdge=edges.length,edge,abs_fn=Math.abs;while(iEdge--){edge=edges[iEdge];if(!this.connectEdge(edge,bbox)||!this.clipEdge(edge,bbox)||abs_fn(edge.va.x-edge.vb.x)<1e-9&&abs_fn(edge.va.y-edge.vb.y)<1e-9){edge.va=edge.vb=null;edges.splice(iEdge,1)}}};Voronoi.prototype.closeCells=function(bbox){var xl=bbox.xl,xr=bbox.xr,yt=bbox.yt,yb=bbox.yb,cells=this.cells,iCell=cells.length,cell,iLeft,halfedges,nHalfedges,edge,va,vb,vz,lastBorderSegment,abs_fn=Math.abs;while(iCell--){cell=cells[iCell];if(!cell.prepareHalfedges()){continue}if(!cell.closeMe){continue}halfedges=cell.halfedges;nHalfedges=halfedges.length;iLeft=0;while(iLeft<nHalfedges){va=halfedges[iLeft].getEndpoint();vz=halfedges[(iLeft+1)%nHalfedges].getStartpoint();if(abs_fn(va.x-vz.x)>=1e-9||abs_fn(va.y-vz.y)>=1e-9){switch(true){case this.equalWithEpsilon(va.x,xl)&&this.lessThanWithEpsilon(va.y,yb):lastBorderSegment=this.equalWithEpsilon(vz.x,xl);vb=this.createVertex(xl,lastBorderSegment?vz.y:yb);edge=this.createBorderEdge(cell.site,va,vb);iLeft++;halfedges.splice(iLeft,0,this.createHalfedge(edge,cell.site,null));nHalfedges++;if(lastBorderSegment){break}va=vb;case this.equalWithEpsilon(va.y,yb)&&this.lessThanWithEpsilon(va.x,xr):lastBorderSegment=this.equalWithEpsilon(vz.y,yb);vb=this.createVertex(lastBorderSegment?vz.x:xr,yb);edge=this.createBorderEdge(cell.site,va,vb);iLeft++;halfedges.splice(iLeft,0,this.createHalfedge(edge,cell.site,null));nHalfedges++;if(lastBorderSegment){break}va=vb;case this.equalWithEpsilon(va.x,xr)&&this.greaterThanWithEpsilon(va.y,yt):lastBorderSegment=this.equalWithEpsilon(vz.x,xr);vb=this.createVertex(xr,lastBorderSegment?vz.y:yt);edge=this.createBorderEdge(cell.site,va,vb);iLeft++;halfedges.splice(iLeft,0,this.createHalfedge(edge,cell.site,null));nHalfedges++;if(lastBorderSegment){break}va=vb;case this.equalWithEpsilon(va.y,yt)&&this.greaterThanWithEpsilon(va.x,xl):lastBorderSegment=this.equalWithEpsilon(vz.y,yt);vb=this.createVertex(lastBorderSegment?vz.x:xl,yt);edge=this.createBorderEdge(cell.site,va,vb);iLeft++;halfedges.splice(iLeft,0,this.createHalfedge(edge,cell.site,null));nHalfedges++;if(lastBorderSegment){break}va=vb;lastBorderSegment=this.equalWithEpsilon(vz.x,xl);vb=this.createVertex(xl,lastBorderSegment?vz.y:yb);edge=this.createBorderEdge(cell.site,va,vb);iLeft++;halfedges.splice(iLeft,0,this.createHalfedge(edge,cell.site,null));nHalfedges++;if(lastBorderSegment){break}va=vb;lastBorderSegment=this.equalWithEpsilon(vz.y,yb);vb=this.createVertex(lastBorderSegment?vz.x:xr,yb);edge=this.createBorderEdge(cell.site,va,vb);iLeft++;halfedges.splice(iLeft,0,this.createHalfedge(edge,cell.site,null));nHalfedges++;if(lastBorderSegment){break}va=vb;lastBorderSegment=this.equalWithEpsilon(vz.x,xr);vb=this.createVertex(xr,lastBorderSegment?vz.y:yt);edge=this.createBorderEdge(cell.site,va,vb);iLeft++;halfedges.splice(iLeft,0,this.createHalfedge(edge,cell.site,null));nHalfedges++;if(lastBorderSegment){break}default:throw"Voronoi.closeCells() > this makes no sense!"}}iLeft++}cell.closeMe=false}};Voronoi.prototype.quantizeSites=function(sites){var ε=this.ε,n=sites.length,site;while(n--){site=sites[n];site.x=Math.floor(site.x/ε)*ε;site.y=Math.floor(site.y/ε)*ε}};Voronoi.prototype.recycle=function(diagram){if(diagram){if(diagram instanceof this.Diagram){this.toRecycle=diagram}else{throw"Voronoi.recycleDiagram() > Need a Diagram object."}}};Voronoi.prototype.compute=function(sites,bbox){var startTime=new Date;this.reset();if(this.toRecycle){this.vertexJunkyard=this.vertexJunkyard.concat(this.toRecycle.vertices);this.edgeJunkyard=this.edgeJunkyard.concat(this.toRecycle.edges);this.cellJunkyard=this.cellJunkyard.concat(this.toRecycle.cells);this.toRecycle=null}var siteEvents=sites.slice(0);siteEvents.sort(function(a,b){var r=b.y-a.y;if(r){return r}return b.x-a.x});var site=siteEvents.pop(),siteid=0,xsitex,xsitey,cells=this.cells,circle;for(;;){circle=this.firstCircleEvent;if(site&&(!circle||site.y<circle.y||site.y===circle.y&&site.x<circle.x)){if(site.x!==xsitex||site.y!==xsitey){cells[siteid]=this.createCell(site);site.voronoiId=siteid++;this.addBeachsection(site);xsitey=site.y;xsitex=site.x}site=siteEvents.pop()}else if(circle){this.removeBeachsection(circle.arc)}else{break}}this.clipEdges(bbox);this.closeCells(bbox);var stopTime=new Date;var diagram=new this.Diagram;diagram.cells=this.cells;diagram.edges=this.edges;diagram.vertices=this.vertices;diagram.execTime=stopTime.getTime()-startTime.getTime();this.reset();return diagram};if(typeof module!=="undefined")module.exports=Voronoi},{}],59:[function(require,module,exports){var Voronoi=require("voronoi");require("core-js/fn/object/assign");require("core-js/fn/array/from");function Particles(canvas,options){if(options===void 0)options={};options=Object.assign({edgeLightUpSpeed:.002,edgeFadeSpeed:.001,edgeLightUpBrightness:.2,eraseAlpha:.5,trailSize:25,pulseChance:.06,maxPulsesPerSpawn:1,maxPulses:10,minVertexRadius:1,minPulseSpeed:.03/2.25,pulseSpeedVariation:.04/2.25,vertexRadiusVariation:1,spacing:80,bg:[71,125,194],fg:[128,198,255]},options);var PI2=Math.PI*2;var dpi=window.devicePixelRatio;var ctx=canvas.getContext("2d");var bounds=canvas.getBoundingClientRect();var width=bounds.width*dpi;var height=bounds.height*dpi;var lastBliped=[];var clear=false;var repeat=function(times,callback){for(var i=0;i<times;i++){callback(i)}};var last=function(arr){return arr[arr.length-1]};function drawCircle(ctx,x,y,r){ctx.beginPath();ctx.arc(x*dpi,y*dpi,r*dpi,0,PI2);ctx.closePath()}function fillCircle(ctx,x,y,r){drawCircle(ctx,x,y,r);ctx.fill()}function strokeCircle(ctx,x,y,r){drawCircle(ctx,x,y,r);ctx.stroke()}function Color(r,g,b){this.r=r;this.g=g;this.b=b}Color.prototype={r:0,g:0,b:0,interpolate:function interpolate(color,p){var dr=color.r-this.r;var dg=color.g-this.g;var db=color.b-this.b;return new Color(this.r+dr*p,this.g+dg*p,this.b+db*p)},toString:function toString(){return"rgb("+Math.round(this.r)+","+Math.round(this.g)+","+Math.round(this.b)+")"}};var color={bg:new Color(options.bg[0],options.bg[1],options.bg[2]),fg:new Color(options.fg[0],options.fg[1],options.fg[2])};var getColor=function(v){return color.bg.interpolate(color.fg,v).toString()};function createGrid(width,height,spacing){var particles=[];var cols=Math.ceil(width/spacing)+1;var rows=Math.ceil(height/spacing)+1;var numParticles=cols*rows;particles=Array.from(Array(numParticles)).map(function(item,i){var col=i%cols;var row=Math.floor(i/cols);var dest={x:spacing*col+(row%2==0?spacing/2:0),y:row*spacing};return dest});var voronoi=new Voronoi;var margin=20;var bbox={xl:-margin,xr:width+margin,yt:-margin,yb:height+margin};var diagram=voronoi.compute(particles,bbox);return diagram}function getNeighbors(diagram,vertex,exclude){if(exclude===void 0)exclude=null;var edges=diagram.edges.filter(function(edge){return(edge.va==vertex||edge.vb==vertex)&&(edge.va!=exclude&&edge.vb!=exclude)});return edges.reduce(function(arr,cur){return arr.concat(cur.va,cur.vb)},[]).filter(function(v){return v!=vertex})}function initDiagram(diagram){diagram.pulses=[];diagram.pulse=function(origin,dest){var pulse=new Pulse(origin,dest);pulse.speed=options.minPulseSpeed+options.pulseSpeedVariation*Math.random();if(diagram.pulses.length<options.maxPulses){origin.lightUp();diagram.pulses.push(pulse);var edge=origin.diagram.edges.find(function(edge){return edge.va==origin&&edge.vb==dest||edge.vb==origin&&edge.va==dest});edge.lightUp();return pulse}else return null};initVertices(diagram);initEdges(diagram);diagram.outerVertices=diagram.vertices.filter(function(vertex){return vertex.y<=0||vertex.y>=diagram.height})}function initEdges(diagram){diagram.edges.forEach(function(edge){edge.color=0;edge.colorTo=0;edge.lightUp=function(){edge.colorTo=options.edgeLightUpBrightness;edge.color=Math.max(edge.color,1e-4)};edge.update=function(){if(edge.colorTo>0){edge.color+=options.edgeLightUpSpeed;edge.colorTo-=options.edgeLightUpSpeed;if(edge.colorTo<0)edge.colorTo=0}else if(edge.color>0){edge.color-=options.edgeFadeSpeed;if(edge.color<0)edge.color=0}}})}function initVertices(diagram){var maxClockSpeed=.001;var maxClockIntensity=0*.1;diagram.vertices.forEach(function(vertex){var depth=Math.random();vertex.diagram=diagram;vertex.clockSpeed=-maxClockSpeed+Math.random()*(maxClockSpeed*2);vertex.clock=Math.random()*PI2;vertex.originX=vertex.x;vertex.originY=vertex.y;vertex.clockIntensity=0+maxClockIntensity*Math.pow(depth,3);vertex.depth=depth;vertex.radius=options.minVertexRadius+depth*options.vertexRadiusVariation;vertex.color=0;vertex.colorFadeSpeed=.01;vertex.blips=[];vertex.blipSpeed=.04;vertex.blipRadius=vertex.radius*3.5+Math.random()*vertex.radius*1;vertex.forceStrength=4;vertex.forces=[];vertex.neighbors=getNeighbors(diagram,vertex);vertex.getRandomNeighbor=function(exclude){if(exclude===void 0)exclude=null;var neighbors=this.neighbors.filter(function(neighbor){return neighbor!=exclude});if(neighbors.length==0)return null;var neighbor=neighbors[Math.round(Math.random()*(neighbors.length-1))];return neighbor};vertex.lightUp=function(){this.color=1};vertex.blip=function(){this.blips.push(1)};vertex.applyForces=function(){var result={x:0,y:0};for(var i=vertex.forces.length-1;i>=0;i--){var force=vertex.forces[i];var p=Math.pow(force.power,3);result.x+=force.cosAngle*p*force.strength;result.y+=force.sinAngle*p*force.strength;force.update();if(force.dead){vertex.forces.splice(i,1)}}return result};vertex.update=function(){var this$1=this;if(this.color>0){this.color-=this.colorFadeSpeed;if(this.color<0)this.color=0}this.blips=this.blips.map(function(blip){return blip-=this$1.blipSpeed}).filter(function(blip){return blip>0})}})}function Force(angle,strength){this.angle=angle;this.power=1;this.strength=strength;this.cosAngle=Math.cos(angle);this.sinAngle=Math.sin(angle)}Force.prototype={angle:0,power:0,dead:false,cosAngle:0,sinAngle:0,update:function update(){this.power-=.03;if(this.power<=0)this.dead=true}};function Pulse(origin,dest){this.origin=origin;this.dest=dest;this.lastPos=[]}Pulse.prototype={origin:null,dest:null,v:0,speed:.03+Math.random()*.05,angle:0,dying:false,dyingCounter:options.trailSize,dead:false,lastPos:null,sparkRandom:.2,update:function update$1(delta){var this$1=this;if(delta===void 0)delta=1;if(this.dying){this.dyingCounter--;if(this.dyingCounter<=0)this.dead=true;return}if(this.v>=1){this.dying=true;var p=this;var newPulses=Math.round(Math.random()*2.45);var failedPulses=0;var lastTargets=[];if(newPulses>0){repeat(newPulses,function(i){var neighbor=this$1.dest.getRandomNeighbor(this$1.origin);if(neighbor==null){failedPulses++;return}if(lastTargets.indexOf(neighbor)>-1){failedPulses++;return}var newPulse=this$1.dest.diagram.pulse(this$1.dest,neighbor);if(newPulse==null){failedPulses++;return}lastTargets.push(neighbor);newPulse.speed=this$1.speed;newPulse.lastPos=this$1.lastPos.slice(this$1.lastPos.length-4)})}var forceStrength=1+Math.random()*1;if(newPulses==0||failedPulses>=newPulses){this.dest.blip();lastBliped=[this.dest].concat(lastBliped.slice(0,20));this.dest.lightUp();forceStrength=7.5+this.dest.depth*6}var dx=this.dest.x-this.origin.x;var dy=this.dest.y-this.origin.y;var angle=Math.atan2(dy,dx);this.dest.forces.push(new Force(angle,forceStrength))}this.v+=this.speed*delta;if(this.v>1)this.v=1},getPos:function getPos(){var pos={x:0,y:0};if(this.dying){pos=this.lastPos[this.lastPos.length-1]}else{var dx=this.dest.x-this.origin.x;var dy=this.dest.y-this.origin.y;var dist=Math.sqrt(dx*dx+dy*dy);var angle=Math.atan2(dy,dx);this.angle=angle;pos={x:this.origin.x+Math.cos(angle)*(dist*this.v),y:this.origin.y+Math.sin(angle)*(dist*this.v)};var sparkRandom=this.sparkRandom;pos.x+=-(sparkRandom/2)+Math.random()*sparkRandom;pos.y+=-(sparkRandom/2)+Math.random()*sparkRandom}this.lastPos=this.lastPos.slice(this.lastPos.length-options.trailSize).concat(pos);return pos}};function drawDiagram(diagram,ctx,width,height,delta){if(Math.random()<options.pulseChance){repeat(Math.random()*options.maxPulsesPerSpawn,function(i){var origin=diagram.outerVertices[Math.round(Math.random()*(diagram.outerVertices.length-1))];var dest=origin.getRandomNeighbor();if(lastBliped.length>0&&(dest==null||Math.random()<.1)){origin=lastBliped[Math.round(Math.random()*(lastBliped.length-1))];dest=origin.getRandomNeighbor();if(dest==null)return}else if(dest==null)return;var newPulse=diagram.pulse(origin,dest);if(newPulse!=null){var dx=dest.x-origin.x;var dy=dest.y-origin.y;var angle=Math.atan2(dy,dx);angle+=Math.PI}})}ctx.fillStyle=getColor(0);ctx.globalAlpha=options.eraseAlpha;ctx.fillRect(0,0,width,height);ctx.globalAlpha=1;ctx.fillStyle=getColor(.2);ctx.strokeStyle=getColor(.15);ctx.lineCap="round";diagram.edges.forEach(function(edge){if(edge.color<=0)return;ctx.beginPath();ctx.moveTo(edge.va.x*dpi,edge.va.y*dpi);ctx.lineTo(edge.vb.x*dpi,edge.vb.y*dpi);ctx.strokeStyle=getColor(edge.color);ctx.globalAlpha=1;ctx.lineWidth=1*dpi;ctx.stroke();edge.update()});diagram.pulses.forEach(function(pulse){var pos=pulse.getPos();pulse.update(delta);ctx.beginPath();ctx.moveTo(pulse.lastPos[0].x*dpi,pulse.lastPos[0].y*dpi);pulse.lastPos.slice(1).forEach(function(p){ctx.lineTo(p.x*dpi,p.y*dpi)});ctx.strokeStyle=getColor(1);ctx.globalAlpha=.7;ctx.lineWidth=1*dpi;ctx.stroke();if(pulse.lastPos.length>=2&&!pulse.dying){ctx.lineWidth=5*dpi;ctx.globalAlpha=.7;ctx.beginPath();var lastPos2=pulse.lastPos.length-2;var lastPos1=pulse.lastPos.length-1;ctx.moveTo(pulse.lastPos[lastPos2].x*dpi,pulse.lastPos[lastPos2].y*dpi);ctx.lineTo(pulse.lastPos[lastPos1].x*dpi,pulse.lastPos[lastPos1].y*dpi);ctx.strokeStyle=getColor(1);ctx.stroke()}});diagram.vertices.forEach(function(vertex){var forces=vertex.applyForces();vertex.x=vertex.originX+forces.x;vertex.y=vertex.originY+forces.y;if(vertex.color>0){var depth=vertex.depth;var minColor=.1+depth*depth*.2;minColor=0;var color=getColor(minColor+Math.min(1,vertex.color)*(1-minColor));ctx.fillStyle=color;ctx.globalAlpha=1-(1-depth)*.35;fillCircle(ctx,vertex.x,vertex.y,vertex.radius)}vertex.blips.forEach(function(blip){var iblip=1-blip;var blipRadius=vertex.radius+vertex.blipRadius*Math.pow(iblip,1/2);var blipAlpha=blip*1;ctx.globalAlpha=blipAlpha;ctx.lineWidth=1*dpi;ctx.strokeStyle=getColor(1);strokeCircle(ctx,vertex.x,vertex.y,blipRadius)});vertex.update()});diagram.pulses=diagram.pulses.filter(function(pulse){return!pulse.dead})}function init(ctx,width,height){var diagram=createGrid(width/dpi,height/dpi,options.spacing);diagram.width=width/dpi;diagram.height=height/dpi;initDiagram(diagram);var last=0;var fps=60;var maxDelta=1.5;(function draw(now){if(clear){return}var delta=(now-last)/(fps/1e3);if(delta>maxDelta)delta=maxDelta;drawDiagram(diagram,ctx,width,height,delta);requestAnimationFrame(draw)})()}function stop(){clear=true}function reset(){window.removeEventListener("resize",reset);stop();Particles(canvas,options)}window.addEventListener("resize",reset);canvas.setAttribute("width",width);canvas.setAttribute("height",height);init(ctx,width,height)}module.exports=Particles},{"core-js/fn/array/from":1,"core-js/fn/object/assign":2,voronoi:58}]},{},[59])(59)});

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
        canvas.style.opacity=options.opacity;
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

Particles(document.getElementById('header_canvas'),{
      edgeLightUpSpeed:0.002,
      edgeFadeSpeed:0.001,
      edgeLightUpBrightness:0.2,
      eraseAlpha:0.5,
      trailSize:25,
      pulseChance:0.06,
      maxPulsesPerSpawn:1,
      maxPulses:10,
      minVertexRadius:1,
      minPulseSpeed:0.03/2.25,
      pulseSpeedVariation:0.04/2.25,
      vertexRadiusVariation:1,
      spacing:80,
      bg:[ 255,255,255 ],
      fg:[ 128,198,255 ],
    });
    attachLightning({
      element: ".email-form-button-container",
      opacity: 0.9
    });
