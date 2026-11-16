(function(){
  var root=document.documentElement;
  document.getElementById('yr').textContent=new Date().getFullYear();

  /* white / dark mode */
  var btn=document.getElementById('theme'),moon=document.getElementById('ico-moon'),sun=document.getElementById('ico-sun');
  var mq=window.matchMedia('(prefers-color-scheme: dark)');
  var animApi={set:function(){}};
  function isDark(){var t=root.getAttribute('data-theme');return t?t==='dark':mq.matches}
  function paint(){
    var d=isDark();moon.toggleAttribute('hidden',d);sun.toggleAttribute('hidden',!d);
    btn.setAttribute('aria-label',d?'Switch to white mode':'Switch to dark mode');
  }
  btn.addEventListener('click',function(){
    var next=isDark()?'light':'dark';
    root.setAttribute('data-theme',next);
    try{localStorage.setItem('theme',next)}catch(e){}
    paint();
  });
  if(mq.addEventListener)mq.addEventListener('change',paint);
  paint();
  var tp=document.getElementById('topo');
  if(tp&&tp.pauseAnimations&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)tp.pauseAnimations();

  /* scroll + load reveal */
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets=[].slice.call(document.querySelectorAll('.hero .wrap > div > *, .portrait, .head, .about .text, .facts, .sk, .item, .proj, .calc, .edu article, .contact'));
  targets.forEach(function(el){
    el.classList.add('rv');
    var sibs=[].slice.call(el.parentNode.children).filter(function(c){return c.classList.contains('rv')||targets.indexOf(c)>-1});
    el.style.setProperty('--d',(Math.max(0,sibs.indexOf(el))*0.09)+'s');
  });
  if(reduce||!('IntersectionObserver' in window)){targets.forEach(function(el){el.classList.add('in')})}
  else{
    var rio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    targets.forEach(function(el){rio.observe(el)});
  }

  /* hero background scenes */
  (function(){
    var cv=document.getElementById('net');if(!cv||!cv.getContext)return;
    var ctx=cv.getContext('2d'),hero=cv.parentNode,W=0,H=0,cols=['#888','#888','#888'],tick=0,live=true,scene='waves',raf=0,phase=0;
    var dpr=Math.min(window.devicePixelRatio||1,2),probe=document.createElement('i');probe.style.display='none';hero.appendChild(probe);
    var R=function(n){return Math.random()*n};
    function readCols(){['--indigo','--pink','--teal'].forEach(function(v,i){probe.style.color='var('+v+')';cols[i]=getComputedStyle(probe).color})}
    var S={};
    S.network={
      pts:[],
      init:function(){var n=Math.max(16,Math.min(46,Math.round(W*H/20000)));this.pts=[];for(var i=0;i<n;i++)this.pts.push({x:R(W),y:R(H),vx:R(.4)-.2,vy:R(.4)-.2,c:i%3,r:1.8+R(1.8)})},
      draw:function(mv){
        var P=this.pts,i,j;
        for(i=0;i<P.length;i++){
          var p=P[i];
          if(mv){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1}
          for(j=i+1;j<P.length;j++){
            var q=P[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.sqrt(dx*dx+dy*dy);
            if(d<150){ctx.globalAlpha=(1-d/150)*.4;ctx.strokeStyle=cols[p.c];ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}
          }
        }
        for(i=0;i<P.length;i++){var n=P[i];ctx.globalAlpha=.75;ctx.fillStyle=cols[n.c];ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,6.283);ctx.fill()}
      }
    };
    S.flow={
      lanes:[],
      init:function(){this.lanes=[];var gap=46;for(var y=gap/2;y<H;y+=gap){var L={y:y,dir:this.lanes.length%2?1:-1,pk:[]};for(var k=0,c=Math.ceil(W/240)+1;k<c;k++)L.pk.push({x:R(W),w:14+R(34),v:.8+R(2.2),c:(k+this.lanes.length)%3});this.lanes.push(L)}},
      draw:function(mv){
        this.lanes.forEach(function(L){
          ctx.globalAlpha=.08;ctx.strokeStyle=cols[0];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,L.y);ctx.lineTo(W,L.y);ctx.stroke();
          L.pk.forEach(function(p){
            if(mv){p.x+=p.v*L.dir;if(L.dir>0&&p.x>W+60)p.x=-60-p.w;if(L.dir<0&&p.x<-60-p.w)p.x=W+60}
            ctx.globalAlpha=.6;ctx.fillStyle=cols[p.c];
            if(ctx.roundRect){ctx.beginPath();ctx.roundRect(p.x,L.y-3.5,p.w,7,3.5);ctx.fill()}else ctx.fillRect(p.x,L.y-3.5,p.w,7);
          });
        });
      }
    };
    S.waves={
      init:function(){},
      draw:function(mv){
        if(mv)phase+=.014;
        for(var i=0;i<4;i++){
          ctx.globalAlpha=.1+i*.035;ctx.fillStyle=cols[i%3];ctx.beginPath();ctx.moveTo(0,H);
          for(var x=0;x<=W+8;x+=8)ctx.lineTo(x,H*(.52+.1*i)+Math.sin(x*.006*(1+i*.3)+phase*(1+i*.4)+i*2)*(22+i*8));
          ctx.lineTo(W,H);ctx.closePath();ctx.fill();
        }
      }
    };
    S.bubbles={
      b:[],
      init:function(){var n=Math.max(14,Math.min(34,Math.round(W/38)));this.b=[];for(var i=0;i<n;i++)this.b.push({x:R(W),y:R(H),r:6+R(24),v:.25+R(.7),s:R(6.28),c:i%3})},
      draw:function(mv){
        if(mv)phase+=.01;
        this.b.forEach(function(o){
          if(mv){o.y-=o.v;o.x+=Math.sin(phase*2+o.s)*.35;if(o.y<-o.r){o.y=H+o.r;o.x=R(W)}}
          ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,6.283);
          ctx.globalAlpha=.12;ctx.fillStyle=cols[o.c];ctx.fill();
          ctx.globalAlpha=.4;ctx.strokeStyle=cols[o.c];ctx.lineWidth=1.5;ctx.stroke();
        });
      }
    };
    S.bits={
      c:[],
      init:function(){this.c=[];for(var x=8;x<W;x+=22){var col={x:x,y:R(H),v:.7+R(1.6),k:(x/22)%3|0,ch:[]};for(var j=0;j<11;j++)col.ch.push(R(1)<.5?'0':'1');this.c.push(col)}},
      draw:function(mv){
        ctx.font='500 15px "JetBrains Mono",ui-monospace,monospace';
        this.c.forEach(function(col){
          if(mv){col.y+=col.v;if(col.y-11*18>H){col.y=-R(160)}if(R(1)<.08)col.ch[(R(11))|0]=R(1)<.5?'0':'1'}
          for(var k=0;k<11;k++){ctx.globalAlpha=k===0?.85:(1-k/11)*.4;ctx.fillStyle=cols[col.k];ctx.fillText(col.ch[k],col.x,col.y-k*18)}
        });
      }
    };
    var masks={waves:'none',bubbles:'none'},defMask='linear-gradient(180deg,#000 55%,transparent)';
    function draw(mv){ctx.clearRect(0,0,W,H);if(tick++%45===0)readCols();if(S[scene])S[scene].draw(mv);ctx.globalAlpha=1}
    function frame(){raf=0;if(!live||reduceNow()||scene==='off')return;draw(true);raf=requestAnimationFrame(frame)}
    function reduceNow(){return window.matchMedia('(prefers-reduced-motion: reduce)').matches}
    function start(){
      if(raf){cancelAnimationFrame(raf);raf=0}
      if(scene==='off'||!S[scene]){ctx.clearRect(0,0,W,H);return}
      draw(false);
      if(!reduceNow()&&live)raf=requestAnimationFrame(frame);
    }
    function size(){
      W=hero.clientWidth;H=hero.clientHeight;if(!W||!H)return;
      cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      if(S[scene])S[scene].init();
    }
    function setScene(n){
      scene=n;var m=masks[n]||defMask;cv.style.webkitMaskImage=m;cv.style.maskImage=m;
      readCols();size();start();
    }
    animApi.set=setScene;
    var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){size();start()},150)});
    if('IntersectionObserver' in window){new IntersectionObserver(function(es){live=es[0].isIntersecting;if(live&&!raf&&scene!=='off'&&!reduceNow())raf=requestAnimationFrame(frame)}).observe(hero)}
    setScene('waves');
  })();

  /* active nav link */
  var links=[].slice.call(document.querySelectorAll('.nav nav a:not(.cta)'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){links.forEach(function(a){
        if(a.getAttribute('href')==='#'+e.target.id)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');
      })}
    })},{rootMargin:'-45% 0px -50% 0px'});
    links.forEach(function(a){var s=document.querySelector(a.getAttribute('href'));if(s)io.observe(s)});
  }

  /* subnet calculator */
  var ip=document.getElementById('ip'),res=document.getElementById('res'),err=document.getElementById('err');
  function str(n){return [n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join('.')}
  function calc(){
    var m=ip.value.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
    res.innerHTML='';err.textContent='';
    if(!m){err.textContent='Use the format 192.168.10.37/26';return}
    var o=m.slice(1,5).map(Number),n=Number(m[5]);
    if(o.some(function(x){return x>255})||n>32){err.textContent='Each number must be 0-255 and the prefix 0-32.';return}
    var a=((o[0]<<24)|(o[1]<<16)|(o[2]<<8)|o[3])>>>0;
    var mask=n===0?0:(0xFFFFFFFF<<(32-n))>>>0, net=(a&mask)>>>0, bc=(net|(~mask>>>0))>>>0;
    var total=Math.pow(2,32-n), usable=n>=31?total:total-2;
    var first=n>=31?net:net+1, last=n>=31?bc:bc-1;
    var rows=[['Network address',str(net)],['Subnet mask',str(mask)],['Wildcard mask',str((~mask)>>>0)],['Broadcast address',str(bc)],['First host',str(first)],['Last host',str(last)],['Usable hosts',usable.toLocaleString()]];
    rows.forEach(function(r){var d=document.createElement('div'),t=document.createElement('dt'),v=document.createElement('dd');t.textContent=r[0];v.textContent=r[1];d.appendChild(t);d.appendChild(v);res.appendChild(d)});
  }
  document.getElementById('go').onclick=calc;
  ip.addEventListener('keydown',function(e){if(e.key==='Enter')calc()});
  calc();
})();
