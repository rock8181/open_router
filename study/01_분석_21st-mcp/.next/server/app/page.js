(()=>{var e={};e.id=931,e.ids=[931],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},1038:(e,t,a)=>{"use strict";a.r(t),a.d(t,{GlobalError:()=>s.a,__next_app__:()=>p,originalPathname:()=>d,pages:()=>g,routeModule:()=>c,tree:()=>f}),a(2821),a(1506),a(5866);var r=a(3191),o=a(8716),n=a(7922),s=a.n(n),i=a(5231),l={};for(let e in i)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>i[e]);a.d(t,l);let f=["",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(a.bind(a,2821)),"C:\\work\\openrouter\\study\\01_분석_21st-mcp\\app\\page.tsx"]}]},{layout:[()=>Promise.resolve().then(a.bind(a,1506)),"C:\\work\\openrouter\\study\\01_분석_21st-mcp\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(a.t.bind(a,5866,23)),"next/dist/client/components/not-found-error"]}],g=["C:\\work\\openrouter\\study\\01_분석_21st-mcp\\app\\page.tsx"],d="/page",p={require:a,loadChunk:()=>Promise.resolve()},c=new r.AppPageRouteModule({definition:{kind:o.x.APP_PAGE,page:"/page",pathname:"/",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:f}})},2158:(e,t,a)=>{Promise.resolve().then(a.bind(a,7882))},5082:(e,t,a)=>{Promise.resolve().then(a.t.bind(a,2994,23)),Promise.resolve().then(a.t.bind(a,6114,23)),Promise.resolve().then(a.t.bind(a,9727,23)),Promise.resolve().then(a.t.bind(a,9671,23)),Promise.resolve().then(a.t.bind(a,1868,23)),Promise.resolve().then(a.t.bind(a,4759,23))},5303:()=>{},7882:(e,t,a)=>{"use strict";a.d(t,{default:()=>x});var r=a(326),o=a(7577);let n={aurora:{style:"streak",colors:["#f4efe9","#e9c2b8","#c2433f","#2a1e2a","#22395e","#6f97c2","#e5edf4"],scale:.7,warp:1.4,angle:-.62,gloss:.18,veins:0},ember:{style:"marble",colors:["#07090c","#16252c","#3d5f68","#1a1416","#a3201a","#ef4a2b","#ff8a5c"],scale:.62,warp:3.2,angle:-.5,gloss:.55,veins:.6},dusk:{style:"marble",colors:["#120c18","#3e2850","#8f6c9c","#2b1a24","#b3502f","#eab08a","#fbe7d2"],scale:.75,warp:3.6,angle:.8,gloss:.5,veins:.5},glacier:{style:"streak",colors:["#f7f8fa","#d9e2ea","#9fb4c7","#e8edf2","#bccbd8","#ffffff"],scale:.7,warp:1.6,angle:.35,gloss:.25,veins:0},verdant:{style:"marble",colors:["#070b08","#173024","#4f7a5a","#141812","#a7843a","#e9cf87","#fbf3d6"],scale:.7,warp:3.4,angle:2.1,gloss:.5,veins:.5}};function s(e){let t=e>>>0;return()=>{let e=t=t+1831565813>>>0;return e=Math.imul(e^e>>>15,1|e),(((e^=e+Math.imul(e^e>>>7,61|e))^e>>>14)>>>0)/4294967296}}function i(e){let t=2166136261;for(let a=0;a<e.length;a++)t=Math.imul(t^e.charCodeAt(a),16777619);return t>>>0}let l=e=>"string"==typeof e?n[e]:e,f=new Map,g=[],d=!1;function p({art:e,seed:t,w:a,h:n,density:i,priority:p,className:c}){let u=o.useRef(null),[h,x]=o.useState(!1),m=JSON.stringify(l(e)),b=Math.round(a*i),v=Math.round(n*i);return o.useEffect(()=>{let e=!0;return x(!1),(function(e,t,a,r,o){let n=JSON.stringify([e,t,a,r]),i=f.get(n);return i||(i=new Promise(n=>{let i=g.length;for(;i>1&&g[i-1].priority>o;)i--;g.splice(i,0,{job:function(e,t,a,r){let o=Math.max(1,Math.round(e)),n=Math.max(1,Math.round(t)),i=a.colors.length>=2?a.colors:["#111111","#eeeeee"],l=i.map((e,t)=>({t:t/(i.length-1),c:function(e){let t=e.trim().replace(/^#/,"");3===t.length&&(t=t[0]+t[0]+t[1]+t[1]+t[2]+t[2]);let a=/^[0-9a-f]{6}$/i.test(t)?parseInt(t,16):8421504;return[a>>16&255,a>>8&255,255&a]}(e)})),f=a.scale??.7,g=a.warp??3,d=a.gloss??.4,p=a.veins??0,c="streak"===a.style,u=function(e){let t=s(e),a=new Uint8Array(512),r=new Float32Array(512),o=[];for(let e=0;e<256;e++)o.push(e);for(let e=255;e>0;e--){let a=Math.floor(t()*(e+1)),r=o[e];o[e]=o[a],o[a]=r}for(let e=0;e<512;e++)a[e]=o[255&e];for(let e=0;e<256;e++){let a=t()*Math.PI*2;r[2*e]=Math.cos(a),r[2*e+1]=Math.sin(a)}let n=(e,t)=>{let o=Math.floor(e),n=Math.floor(t),s=e-o,i=t-n,l=255&o,f=255&n,g=2*a[l+a[f]],d=2*a[l+1+a[f]],p=2*a[l+a[f+1]],c=2*a[l+1+a[f+1]],u=r[g]*s+r[g+1]*i,h=r[d]*(s-1)+r[d+1]*i,x=r[p]*s+r[p+1]*(i-1),m=r[c]*(s-1)+r[c+1]*(i-1),b=s*s*s*(s*(6*s-15)+10);return u+b*(h-u)+i*i*i*(i*(6*i-15)+10)*(x-u+b*(m-x-h+u))};return(e,t,a)=>{let r=0,o=.5;for(let s=0;s<a;s++){r+=o*n(e,t);let a=1.6*e+1.2*t+7.1;t=-1.2*e+1.6*t+3.3,e=a,o*=.5}return r}}(977*r+13),h=s(r+1),x=50*h(),m=50*h(),b=(a.angle??0)+(h()-.5)*.5,v=Math.cos(b),y=Math.sin(b),k=Math.min(o,n),w=Math.ceil(o/2)+3,j=Math.ceil(n/2)+3,M=new Float32Array(w*j),P=new Float32Array(w*j),N=new Float32Array(o*n),C=new Float32Array(o*n),A=new Uint8ClampedArray(o*n*4),S=0,_=e=>{for(let t=0;t<w;t++){let a=((t-1)*2-o/2)/k,r=((e-1)*2-n/2)/k,s=(a*v-r*y)*f,i=(a*y+r*v)*f;c&&(s*=.14,i*=2.2);let l=u(s+=x,i+=m,3),d=u(s+5.2,i+1.3,3),p=u(s+g*l+1.7,i+g*d+9.2,3),h=u(s+g*l+8.3,i+g*d+2.8,3);M[e*w+t]=u(s+g*p,i+g*h,4),P[e*w+t]=Math.sqrt(l*l+d*d)}},F=()=>{let e=(e,t,a,r)=>(-e+9*t+9*a-r)/16,t=new Float32Array(o*j);for(let a=0;a<j;a++){let r=a*w;for(let n=0;n<o;n++){let s=(n>>1)+1;t[a*o+n]=1&n?e(M[r+s-1],M[r+s],M[r+s+1],M[r+s+2]):M[r+s]}}for(let a=0;a<n;a++){let r=(a>>1)+1;for(let n=0;n<o;n++){N[a*o+n]=1&a?e(t[(r-1)*o+n],t[r*o+n],t[(r+1)*o+n],t[(r+2)*o+n]):t[r*o+n];let s=(n>>1)+1,i=P[r*w+s],l=1&n?(i+P[r*w+s+1])/2:i,f=1&a?1&n?(P[(r+1)*w+s]+P[(r+1)*w+s+1])/2:P[(r+1)*w+s]:l;C[a*o+n]=(l+f)/2}}},E=()=>{let e=[],t=Math.max(1,Math.floor(N.length/4096));for(let a=0;a<N.length;a+=t)e.push(N[a]);e.sort((e,t)=>e-t);let a=e[Math.floor(.02*e.length)],r=1/(e[Math.floor(.98*e.length)]-a||1),s=r*k*.012;for(let e=0;e<n;e++)for(let t=0;t<o;t++){let i=e*o+t,f=(N[i]-a)*r;f=f<0?0:f>1?1:f;let g=1;for(;g<l.length-1&&l[g].t<f;)g++;let c=l[g-1],u=l[g],h=(f-c.t)/(u.t-c.t||1);h=(h=h<0?0:h>1?1:h)*h*(3-2*h);let x=(N[t<o-1?i+1:i]-N[t>0?i-1:i])*s,m=(N[e<n-1?i+o:i]-N[e>0?i-o:i])*s,b=(-(-.55*x)- -.65*m+.52)/Math.sqrt(x*x+m*m+1),v=Math.pow(b>0?b:0,24)*d*255,y=(.82+.28*b)*(1+.035*Math.sin(150*f+24*C[i]))*(1-p*Math.max(0,1-14*Math.abs(C[i]-.42))*.6);A[4*i]=(c.c[0]+(u.c[0]-c.c[0])*h)*y+v,A[4*i+1]=(c.c[1]+(u.c[1]-c.c[1])*h)*y+v,A[4*i+2]=(c.c[2]+(u.c[2]-c.c[2])*h)*y+v,A[4*i+3]=255}};return{width:o,height:n,pixels:A,step:e=>{if(S>=j)return!0;let t=Math.min(j,S+Math.max(1,e));for(;S<t;)_(S++);return!(S<j)&&(F(),E(),!0)}}}(a,r,e,t),priority:o,done:n}),function(){if(d)return;d=!0;let e=()=>{let t=performance.now()+7;for(;g.length&&performance.now()<t;){let e=g[0];if(e.job.step(4)){g.shift();let t=document.createElement("canvas");t.width=e.job.width,t.height=e.job.height,t.getContext("2d")?.putImageData(new ImageData(e.job.pixels,t.width,t.height),0,0),e.done(t)}}g.length?requestAnimationFrame(e):d=!1};requestAnimationFrame(e)}()}),f.set(n,i)),i})(JSON.parse(m),t,b,v,p).then(t=>{let a=u.current;e&&a&&(a.width=t.width,a.height=t.height,a.getContext("2d")?.drawImage(t,0,0),x(!0))}),()=>{e=!1}},[m,t,b,v,p]),r.jsx("canvas",{ref:u,"aria-hidden":"true",className:c,"data-ready":h||void 0,style:{width:a,height:n,maxWidth:"none"}})}let c="M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z",u="M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 176A22 22 0 0 1 318 198L22 198A22 22 0 0 1 0 176Z",h=[{name:"Cover — final",meta:"PNG \xb7 4.8 MB",art:"ember"},{name:"Moodboard",meta:"24 images",art:"dusk"},{name:"Brief.pdf",meta:"PDF \xb7 1.2 MB"}];function x({label:e="My Files",meta:t,tone:a="light",art:n="aurora",seed:l=3,image:f,files:g=h,action:d="add",onAdd:x,onFilesChange:b,menu:v=[],labelPlacement:y="bottom-left",open:k,defaultOpen:w=!1,onOpenChange:j,onFileSelect:M,width:P=340,appear:N=!0,appearDelay:C=0,className:A,style:S}){let _=o.useId().replace(/:/g,""),F=o.useRef(null),E=o.useRef(null),z=o.useRef(null),R=o.useRef(null),L=o.useRef(null),[I,q]=o.useState(g),T=o.useRef(g.map((e,t)=>t)),B=o.useRef(g.length),[D,O]=o.useState(null),[G,X]=o.useState(0),[U,Y]=o.useState(w),J=k??U,H=o.useCallback(e=>{void 0===k&&Y(e),j?.(e)},[k,j]),[K,W]=o.useState(!1),[Z,$]=o.useState(!N),Q=P/340,V=1*Q;o.useEffect(()=>{if(!N)return;let e=F.current;if(!e||"undefined"==typeof IntersectionObserver){$(!0);return}let t=0,a=new IntersectionObserver(e=>{e.some(e=>e.isIntersecting)&&(a.disconnect(),t=window.setTimeout(()=>$(!0),C))},{threshold:.25});return a.observe(e),()=>{a.disconnect(),window.clearTimeout(t)}},[N,C]),o.useEffect(()=>{let e=F.current;if(!e)return;let t=0,a=0,r=0,o=()=>{t=0,e.style.setProperty("--gf-px",a.toFixed(3)),e.style.setProperty("--gf-py",r.toFixed(3))},n=n=>{if("touch"===n.pointerType)return;let s=e.getBoundingClientRect();a=(n.clientX-s.left)/s.width*2-1,r=(n.clientY-s.top)/s.height*2-1,t||(t=requestAnimationFrame(o))},s=()=>{a=0,r=0,t||(t=requestAnimationFrame(o))};return e.addEventListener("pointermove",n),e.addEventListener("pointerleave",s),()=>{e.removeEventListener("pointermove",n),e.removeEventListener("pointerleave",s),cancelAnimationFrame(t)}},[]),o.useEffect(()=>{E.current?.toggleAttribute("inert",!J)},[J]),o.useEffect(()=>{if(!J&&!K)return;let e=e=>{"Escape"===e.key&&(K?(W(!1),R.current?.focus()):(H(!1),z.current?.focus()))},t=e=>{let t=e.target;!K||L.current?.contains(t)||R.current?.contains(t)||W(!1),!J||K||F.current?.contains(t)||H(!1)};return document.addEventListener("keydown",e),document.addEventListener("pointerdown",t),()=>{document.removeEventListener("keydown",e),document.removeEventListener("pointerdown",t)}},[J,K,H]),o.useEffect(()=>{K&&L.current?.querySelector("[role=menuitem]")?.focus()},[K]);let ee=()=>{let e=x?.(I)||{name:"Untitled "+(I.length+1),meta:"Just now"},t=[...I,e],a=B.current++;T.current=[...T.current,a],q(t),O(a),X(e=>e+1),b?.(t)},et=[{label:J?"Close folder":"Open folder",onSelect:()=>H(!J)},...v],ea=Math.max(0,I.length-4),er=I.slice(ea),eo=I.length,en=t??eo+(1===eo?" item":" items");return(0,r.jsxs)("div",{ref:F,className:"gf-root"+(A?" "+A:""),"data-tone":a,"data-open":J||void 0,"data-entered":Z||void 0,"data-place":y,style:{width:P,height:326*Q,...S},children:[r.jsx("style",{children:m}),r.jsx("div",{className:"gf-stage",style:{transform:"translateY("+54*Q+"px) scale("+Q+")"},children:(0,r.jsxs)("div",{className:"gf-tilt",children:[r.jsx("div",{className:"gf-shadow","aria-hidden":"true"}),(0,r.jsxs)("div",{className:"gf-back",style:{clipPath:"path('"+c+"')"},"aria-hidden":"true",children:[f?r.jsx("img",{className:"gf-art",src:f,alt:"",width:364,height:296,draggable:!1}):"none"!==n?r.jsx(p,{className:"gf-art",art:n,seed:l,w:364,h:296,density:V,priority:0}):null,r.jsx("div",{className:"gf-back-sheen"})]}),r.jsx("svg",{className:"gf-rim gf-back-rim",viewBox:"0 0 340 272","aria-hidden":"true",children:r.jsx("path",{d:c})}),(0,r.jsxs)("div",{className:"gf-front"+(G?" gf-front--bump":""),style:{clipPath:"path('"+u+"')"},children:[r.jsx("div",{className:"gf-tint","aria-hidden":"true"}),r.jsx("div",{className:"gf-spec","aria-hidden":"true"}),(0,r.jsxs)("svg",{className:"gf-rim gf-front-rim",viewBox:"0 0 340 198","aria-hidden":"true",children:[r.jsx("defs",{children:(0,r.jsxs)("linearGradient",{id:"gf-rim-"+_,x1:"0",y1:"0",x2:"0",y2:"1",children:[r.jsx("stop",{offset:"0",stopColor:"#fff",stopOpacity:"0.95"}),r.jsx("stop",{offset:"0.35",stopColor:"#fff",stopOpacity:"0.35"}),r.jsx("stop",{offset:"1",stopColor:"#fff",stopOpacity:"0.12"})]})}),r.jsx("path",{d:u,stroke:"url(#gf-rim-"+_+")"})]}),r.jsx("button",{ref:z,type:"button",className:"gf-hit","aria-expanded":J,"aria-label":(J?"Close ":"Open ")+e+", "+eo+(1===eo?" item":" items"),onClick:()=>{W(!1),H(!J)}}),(0,r.jsxs)("div",{className:"gf-label",children:[r.jsx("span",{className:"gf-title",children:e}),r.jsx("span",{className:"gf-meta",children:en},en)]})]},G),r.jsx("div",{ref:E,className:"gf-files",role:"list","aria-label":e+" contents",children:er.map((e,t)=>{var a;let o=T.current[ea+t],n=(a=er.length)<=1?0:t/(a-1)*2-1,l=s(i(e.name)+o),f=!!(e.art||e.image),g=(0,r.jsxs)(r.Fragment,{children:[f?e.image?r.jsx("img",{className:"gf-sheet-art",src:e.image,alt:"",width:272,height:184,draggable:!1}):r.jsx(p,{className:"gf-sheet-art",art:e.art,seed:i(e.name)%997,w:272,h:184,density:Math.min(V,1.25),priority:1}):(0,r.jsxs)("span",{className:"gf-lines","aria-hidden":"true",children:[r.jsx("i",{style:{width:"86%"}}),r.jsx("i",{style:{width:"92%"}}),r.jsx("i",{style:{width:"64%"}}),r.jsx("i",{style:{width:"88%"}}),r.jsx("i",{style:{width:"42%"}})]}),(0,r.jsxs)("span",{className:"gf-sheet-head",children:[r.jsx("span",{className:"gf-sheet-name",children:e.name}),e.meta?r.jsx("span",{className:"gf-sheet-meta",children:e.meta}):null]})]}),d={className:"gf-sheet"+(f?" gf-sheet--art":"")+(o===D?" gf-sheet--drop":""),style:{"--gf-slot":n,"--gf-depth":er.length-1-t,"--gf-jx":((l()-.5)*10).toFixed(2)+"px","--gf-jr":((l()-.5)*3.2).toFixed(2)+"deg",zIndex:t+1},onAnimationEnd:o===D?()=>O(null):void 0};return r.jsx("div",{role:"listitem",className:"gf-sheet-slot",children:e.href?r.jsx("a",{...d,href:e.href,onClick:()=>M?.(e,ea+t),children:g}):r.jsx("button",{...d,type:"button",onClick:()=>M?.(e,ea+t),children:g})},o)})}),"none"!==d?r.jsx("button",{ref:R,type:"button",className:"gf-key gf-key--"+d,"aria-label":"add"===d?"Add a file to "+e:"More options for "+e,"aria-haspopup":"more"===d?"menu":void 0,"aria-expanded":"more"===d?K:void 0,"aria-controls":"more"===d?"gf-menu-"+_:void 0,onClick:()=>"add"===d?ee():W(e=>!e),children:"add"===d?r.jsx("svg",{className:"gf-glyph gf-glyph--plus",viewBox:"0 0 24 24","aria-hidden":"true",children:r.jsx("path",{d:"M12 4.5v15M4.5 12h15"})},G):(0,r.jsxs)("svg",{className:"gf-glyph gf-glyph--more",viewBox:"0 0 30 12","aria-hidden":"true",children:[r.jsx("rect",{x:"1",y:"1.5",width:"8",height:"9",rx:"3.4"}),r.jsx("rect",{x:"11",y:"1.5",width:"8",height:"9",rx:"3.4"}),r.jsx("rect",{x:"21",y:"1.5",width:"8",height:"9",rx:"3.4"})]})}):null,"more"===d?r.jsx("div",{ref:L,id:"gf-menu-"+_,role:"menu","aria-label":e+" options",className:"gf-menu","data-open":K||void 0,onKeyDown:e=>{let t=Array.from(L.current?.querySelectorAll("[role=menuitem]")??[]),a=t.indexOf(document.activeElement),r=a=>{e.preventDefault(),t[(a+t.length)%t.length]?.focus()};"ArrowDown"===e.key?r(a+1):"ArrowUp"===e.key?r(a-1):"Home"===e.key?r(0):"End"===e.key?r(t.length-1):"Tab"===e.key&&W(!1)},children:et.map((e,t)=>r.jsx("button",{type:"button",role:"menuitem",tabIndex:K?-1:void 0,disabled:!K,className:"gf-menu-item"+(e.danger?" gf-menu-item--danger":""),onClick:()=>{W(!1),R.current?.focus(),e.onSelect?.()},children:e.label},e.label+t))}):null]})})]})}let m=`
.gf-root {
  --gf-px: 0;
  --gf-py: 0;
  --gf-ease: cubic-bezier(.2, .8, .2, 1);
  --gf-spring: cubic-bezier(.34, 1.36, .5, 1);
  --gf-hinge: 0deg;
  --gf-lift: 42px;
  --gf-spread: 0px;
  --gf-fan: 0deg;
  --gf-stack: 15px;
  --gf-ink: #141416;
  --gf-ink-soft: rgba(20, 20, 22, .55);
  position: relative;
  display: inline-block;
  flex: none;
  vertical-align: top;
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  isolation: isolate;
}
.gf-root[data-tone="dark"] { --gf-ink: #f5f5f7; --gf-ink-soft: rgba(245, 245, 247, .58); }
.gf-root:hover, .gf-root:focus-within { --gf-hinge: -11deg; --gf-lift: -34px; --gf-spread: 8px; --gf-fan: 1.4deg; --gf-stack: 10px; }
.gf-root[data-open] { --gf-hinge: -24deg; --gf-lift: -96px; --gf-spread: 40px; --gf-fan: 5deg; --gf-stack: 30px; }

.gf-stage {
  position: absolute;
  left: 0;
  top: 0;
  width: 340px;
  height: 272px;
  transform-origin: 0 0;
}
.gf-tilt {
  position: absolute;
  inset: 0;
  transform: perspective(1400px) rotateX(calc(var(--gf-py) * -3deg)) rotateY(calc(var(--gf-px) * 4deg));
  transition: transform .9s var(--gf-ease);
}

.gf-shadow {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: -6px;
  height: 60px;
  border-radius: 40px;
  background: rgba(16, 18, 24, .34);
  filter: blur(22px);
  transform: translateX(calc(var(--gf-px) * -8px));
  transition: transform .9s var(--gf-ease), opacity .9s var(--gf-ease);
}
.gf-root[data-tone="dark"] .gf-shadow { background: rgba(0, 0, 0, .62); }

.gf-back {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #f3f3f4 0%, #e3e3e6 100%);
}
.gf-root[data-tone="dark"] .gf-back { background: linear-gradient(180deg, #2a2a2e 0%, #121214 100%); }
.gf-art {
  position: absolute;
  left: -12px;
  top: -12px;
  max-width: none;
  object-fit: cover;
  transform: translate(calc(var(--gf-px) * -7px), calc(var(--gf-py) * -6px)) scale(1.02);
  transition: transform 1.1s var(--gf-ease), opacity 1.2s var(--gf-ease), filter 1.2s var(--gf-ease);
}
canvas.gf-art { opacity: 0; filter: blur(14px) saturate(.6); }
canvas.gf-art[data-ready] { opacity: 1; filter: none; }
.gf-back-sheen {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .22) 0%, rgba(255, 255, 255, 0) 22%),
    radial-gradient(120% 80% at 80% 0%, rgba(255, 255, 255, .16), rgba(255, 255, 255, 0) 60%);
  pointer-events: none;
}

.gf-rim {
  position: absolute;
  left: 0;
  top: 0;
  max-width: none;
  overflow: visible;
  pointer-events: none;
  fill: none;
}
.gf-back-rim { width: 340px; height: 272px; }
.gf-back-rim path { stroke: rgba(255, 255, 255, .45); stroke-width: 1; }
.gf-root[data-tone="dark"] .gf-back-rim path { stroke: rgba(255, 255, 255, .16); }

/* ---- files ---------------------------------------------------------------- */
.gf-files {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  /* nothing hangs out of the bottom of the pocket, however tall the stack */
  clip-path: inset(-400px -400px 10px -400px);
}
.gf-sheet-slot { display: contents; }
.gf-sheet {
  all: unset;
  box-sizing: border-box;
  position: absolute;
  left: 34px;
  top: 96px;
  width: 272px;
  height: 184px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
  background: linear-gradient(180deg, #ffffff 0%, #f2f2f0 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .9),
    0 0 0 .5px rgba(0, 0, 0, .1),
    0 10px 26px -8px rgba(10, 12, 20, .28);
  transform-origin: 50% 100%;
  transform:
    translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1))
    rotate(calc(var(--gf-jr) + var(--gf-slot) * var(--gf-fan)));
  transition:
    transform .75s var(--gf-spring) calc(var(--gf-depth) * 40ms),
    box-shadow .4s var(--gf-ease),
    translate .9s var(--gf-ease),
    opacity .9s var(--gf-ease);
}
.gf-root[data-tone="dark"] .gf-sheet { background: linear-gradient(180deg, #2c2c30 0%, #1c1c1f 100%); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .14), 0 0 0 .5px rgba(255, 255, 255, .08), 0 12px 28px -8px rgba(0, 0, 0, .7); }
.gf-sheet--art { background: #1a1a1d; }
.gf-root[data-open] .gf-sheet:hover,
.gf-root[data-open] .gf-sheet:focus-visible {
  transform:
    translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1 - 18px))
    rotate(calc(var(--gf-slot) * var(--gf-fan) * .6));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9), 0 0 0 .5px rgba(0, 0, 0, .1), 0 22px 40px -12px rgba(10, 12, 20, .42);
  transition-delay: 0s;
}
.gf-sheet:focus-visible { outline: 2px solid #4c8dff; outline-offset: 2px; }
.gf-sheet-art {
  position: absolute;
  left: 0;
  top: 0;
  width: 272px;
  height: 184px;
  max-width: none;
  object-fit: cover;
  transition: opacity .9s var(--gf-ease), filter .9s var(--gf-ease);
}
canvas.gf-sheet-art { opacity: 0; filter: blur(10px); }
canvas.gf-sheet-art[data-ready] { opacity: 1; filter: none; }
.gf-sheet--art::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(0, 0, 0, .42) 0%, rgba(0, 0, 0, 0) 34%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .2);
  pointer-events: none;
}
.gf-sheet-head {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 11px;
  z-index: 1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  white-space: nowrap;
}
.gf-sheet-name {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12.5px;
  font-weight: 560;
  letter-spacing: -.005em;
  color: #18181b;
}
.gf-sheet-meta {
  flex: none;
  font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: .02em;
  color: rgba(24, 24, 27, .5);
}
.gf-root[data-tone="dark"] .gf-sheet-name, .gf-sheet--art .gf-sheet-name { color: #fafafa; }
.gf-root[data-tone="dark"] .gf-sheet-meta, .gf-sheet--art .gf-sheet-meta { color: rgba(250, 250, 250, .66); }
.gf-lines {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 40px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.gf-lines i {
  display: block;
  height: 5px;
  border-radius: 3px;
  background: rgba(24, 24, 27, .08);
}
.gf-lines i:first-child { height: 9px; margin-bottom: 4px; background: rgba(24, 24, 27, .14); }
.gf-root[data-tone="dark"] .gf-lines i { background: rgba(255, 255, 255, .08); }
.gf-root[data-tone="dark"] .gf-lines i:first-child { background: rgba(255, 255, 255, .16); }

.gf-sheet--drop { animation: gf-drop .85s var(--gf-ease) both; }
@keyframes gf-drop {
  0% { translate: 0 -190px; rotate: -9deg; opacity: 0; }
  35% { opacity: 1; }
  72% { translate: 0 10px; rotate: 1deg; }
  100% { translate: 0 0; rotate: 0deg; opacity: 1; }
}

/* ---- front glass ----------------------------------------------------------- */
.gf-front {
  position: absolute;
  left: 0;
  top: 74px;
  width: 340px;
  height: 198px;
  z-index: 10;
  -webkit-backdrop-filter: blur(22px) saturate(1.5);
  backdrop-filter: blur(22px) saturate(1.5);
  transform-origin: 50% 100%;
  transform: perspective(760px) rotateX(var(--gf-hinge));
  transition: transform .8s var(--gf-spring), translate 1s var(--gf-ease), opacity 1s var(--gf-ease);
}
.gf-front--bump { animation: gf-bump .7s var(--gf-ease) .38s both; }
@keyframes gf-bump {
  0% { scale: 1; }
  35% { scale: 1.018 .975; }
  70% { scale: .996 1.006; }
  100% { scale: 1; }
}
.gf-tint {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .16) 0%, rgba(255, 255, 255, .5) 42%, rgba(252, 252, 252, .93) 100%);
}
.gf-root[data-tone="dark"] .gf-tint {
  background: linear-gradient(180deg, rgba(18, 18, 20, .18) 0%, rgba(14, 14, 16, .62) 46%, rgba(8, 8, 10, .94) 100%);
}
.gf-spec {
  position: absolute;
  inset: 0;
  background: radial-gradient(260px 200px at calc(50% + var(--gf-px) * 46%) calc(30% + var(--gf-py) * 40%), rgba(255, 255, 255, .5), rgba(255, 255, 255, 0) 70%);
  mix-blend-mode: soft-light;
  opacity: .9;
  transition: background-position .6s var(--gf-ease);
  pointer-events: none;
}
.gf-root[data-tone="dark"] .gf-spec { mix-blend-mode: screen; opacity: .16; }
.gf-front-rim { width: 340px; height: 198px; }
.gf-front-rim path { stroke-width: 2.4; transition: stroke-width .3s var(--gf-ease); }
.gf-root[data-tone="dark"] .gf-front-rim { opacity: .55; }

.gf-hit {
  all: unset;
  position: absolute;
  inset: 0;
  z-index: 1;
  cursor: pointer;
}
.gf-hit:focus-visible ~ .gf-label .gf-title { text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; }
.gf-front:has(.gf-hit:focus-visible) .gf-front-rim path { stroke-width: 5; }

.gf-label {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 200px;
  pointer-events: none;
  color: var(--gf-ink);
}
.gf-root[data-place="bottom-left"] .gf-label { left: 28px; bottom: 32px; }
.gf-root[data-place="top-left"] .gf-label { left: 28px; top: 34px; }
.gf-root[data-place="top-right"] .gf-label { right: 32px; top: 52px; align-items: flex-start; }
.gf-title {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -.012em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gf-meta {
  font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  letter-spacing: .03em;
  color: var(--gf-ink-soft);
  white-space: nowrap;
  animation: gf-roll .5s var(--gf-ease) both;
}
@keyframes gf-roll {
  from { opacity: 0; translate: 0 7px; filter: blur(3px); }
  to { opacity: 1; translate: 0 0; filter: blur(0); }
}

/* ---- the key: + or \xb7\xb7\xb7 ------------------------------------------------------ */
.gf-key {
  all: unset;
  box-sizing: border-box;
  position: absolute;
  right: 22px;
  bottom: 22px;
  z-index: 12;
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform .35s var(--gf-spring), box-shadow .35s var(--gf-ease), background .35s var(--gf-ease);
}
.gf-key:hover { transform: translateY(-2px); }
.gf-key:active { transform: translateY(0) scale(.93); transition-duration: .12s; }
.gf-key:focus-visible { outline: 2px solid #4c8dff; outline-offset: 3px; }
.gf-key--add {
  color: #fff;
  background: radial-gradient(120% 90% at 50% 0%, #3a3a3f 0%, #121214 55%, #050506 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .22),
    inset 0 -3px 8px rgba(0, 0, 0, .7),
    0 0 0 1px rgba(0, 0, 0, .75),
    0 14px 22px -8px rgba(0, 0, 0, .55),
    0 3px 6px -2px rgba(0, 0, 0, .35);
}
.gf-root[data-tone="dark"] .gf-key--add {
  color: #111113;
  background: radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #ececee 55%, #d2d2d6 100%);
  box-shadow: inset 0 1px 0 #fff, inset 0 -3px 8px rgba(0, 0, 0, .14), 0 0 0 1px rgba(0, 0, 0, .4), 0 14px 22px -8px rgba(0, 0, 0, .7);
}
.gf-key--more {
  color: #111113;
  background: linear-gradient(180deg, rgba(255, 255, 255, .92) 0%, rgba(226, 226, 230, .82) 100%);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow:
    inset 0 1px 0 #fff,
    inset 0 -2px 4px rgba(0, 0, 0, .06),
    0 0 0 1px rgba(0, 0, 0, .16),
    0 10px 18px -8px rgba(0, 0, 0, .3);
}
.gf-root[data-tone="dark"] .gf-key--more {
  color: #f5f5f7;
  background: linear-gradient(180deg, rgba(255, 255, 255, .16) 0%, rgba(255, 255, 255, .06) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .22), 0 0 0 1px rgba(255, 255, 255, .1), 0 10px 18px -8px rgba(0, 0, 0, .6);
}
.gf-key--more[aria-expanded="true"] { transform: scale(.96); }
.gf-glyph { display: block; max-width: none; fill: none; stroke: currentColor; stroke-linecap: round; }
.gf-glyph--plus { width: 26px; height: 26px; stroke-width: 1.6; animation: gf-turn .6s var(--gf-spring); }
.gf-glyph--more { width: 30px; height: 12px; stroke-width: 1.7; }
@keyframes gf-turn { from { rotate: -90deg; } to { rotate: 0deg; } }

/* ---- menu ------------------------------------------------------------------- */
.gf-menu {
  position: absolute;
  right: 22px;
  bottom: 90px;
  z-index: 20;
  min-width: 176px;
  padding: 6px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  background: rgba(252, 252, 253, .72);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  backdrop-filter: blur(24px) saturate(1.6);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9), 0 0 0 .5px rgba(0, 0, 0, .14), 0 24px 48px -16px rgba(10, 12, 20, .4);
  transform-origin: 100% 100%;
  opacity: 0;
  visibility: hidden;
  transform: translateY(6px) scale(.94);
  transition: opacity .2s var(--gf-ease), transform .32s var(--gf-spring), visibility 0s .32s;
}
.gf-menu[data-open] { opacity: 1; visibility: visible; transform: none; transition-delay: 0s; }
.gf-root[data-tone="dark"] .gf-menu { background: rgba(30, 30, 34, .72); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1), 0 0 0 .5px rgba(255, 255, 255, .1), 0 24px 48px -16px rgba(0, 0, 0, .8); }
.gf-menu-item {
  all: unset;
  box-sizing: border-box;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 450;
  color: #18181b;
  cursor: pointer;
}
.gf-root[data-tone="dark"] .gf-menu-item { color: #f4f4f5; }
.gf-menu-item:hover, .gf-menu-item:focus-visible { background: rgba(24, 24, 27, .07); }
.gf-root[data-tone="dark"] .gf-menu-item:hover, .gf-root[data-tone="dark"] .gf-menu-item:focus-visible { background: rgba(255, 255, 255, .09); }
.gf-menu-item--danger { color: #d92d20; }
.gf-root[data-tone="dark"] .gf-menu-item--danger { color: #ff6b5e; }

/* ---- entrance: the folder assembles itself ---------------------------------- */
.gf-root:not([data-entered]) .gf-back,
.gf-root:not([data-entered]) .gf-back-rim { translate: 0 22px; opacity: 0; }
.gf-root:not([data-entered]) .gf-sheet { translate: 0 -120px; opacity: 0; }
.gf-root:not([data-entered]) .gf-front { translate: 0 46px; opacity: 0; }
.gf-root:not([data-entered]) .gf-key { opacity: 0; scale: .6; }
.gf-root:not([data-entered]) .gf-shadow { opacity: 0; }
.gf-back, .gf-back-rim { transition: translate 1s var(--gf-ease), opacity .9s var(--gf-ease); }
.gf-root[data-entered] .gf-sheet { transition-delay: calc(var(--gf-depth) * 40ms), 0s, calc(.18s + var(--gf-depth) * 90ms), calc(.18s + var(--gf-depth) * 90ms); }
.gf-root[data-entered] .gf-front { transition-delay: 0s, .42s, .42s; }
.gf-key { transition: transform .35s var(--gf-spring), box-shadow .35s var(--gf-ease), opacity .6s var(--gf-ease) .7s, scale .7s var(--gf-spring) .7s; }

@media (prefers-reduced-motion: reduce) {
  .gf-root *, .gf-root *::before, .gf-root *::after {
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    animation: none !important;
  }
  .gf-tilt { transform: none; }
}
`},1506:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>n,metadata:()=>o});var r=a(9510);let o={title:"Glass Folder Cards — 21st.dev MCP Integration",description:"Glass folder component with frosted glass UI, built with shadcn/ui + Tailwind CSS"};function n({children:e}){return r.jsx("html",{lang:"ko",children:r.jsx("body",{children:e})})}},2821:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>s});var r=a(9510),o=a(8570);(0,o.createProxy)(String.raw`C:\work\openrouter\study\01_분석_21st-mcp\components\ui\glass-folder-cards.tsx#ART_PRESETS`),(0,o.createProxy)(String.raw`C:\work\openrouter\study\01_분석_21st-mcp\components\ui\glass-folder-cards.tsx#hexToRgb`),(0,o.createProxy)(String.raw`C:\work\openrouter\study\01_분석_21st-mcp\components\ui\glass-folder-cards.tsx#rng`),(0,o.createProxy)(String.raw`C:\work\openrouter\study\01_분석_21st-mcp\components\ui\glass-folder-cards.tsx#hashString`),(0,o.createProxy)(String.raw`C:\work\openrouter\study\01_분석_21st-mcp\components\ui\glass-folder-cards.tsx#createArtJob`),(0,o.createProxy)(String.raw`C:\work\openrouter\study\01_분석_21st-mcp\components\ui\glass-folder-cards.tsx#fanSlot`);let n=(0,o.createProxy)(String.raw`C:\work\openrouter\study\01_분석_21st-mcp\components\ui\glass-folder-cards.tsx#default`);function s(){return(0,r.jsxs)("main",{className:"flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-16",children:[r.jsx("div",{"aria-hidden":"true",className:"pointer-events-none absolute inset-0 text-foreground opacity-[0.13]",style:{backgroundImage:"radial-gradient(currentColor 1.1px, transparent 1.4px)",backgroundSize:"22px 22px"}}),(0,r.jsxs)("div",{className:"relative grid max-w-[1180px] grid-cols-1 items-end justify-items-center gap-x-14 gap-y-10 md:grid-cols-2 xl:grid-cols-3",children:[r.jsx(n,{label:"My Files",art:"aurora",seed:3,appearDelay:0}),r.jsx(n,{label:"Archives",art:"none",action:"more",labelPlacement:"top-left",appearDelay:140,files:[{name:"Lookbook 2024",meta:"38 images",art:"dusk"},{name:"Invoices",meta:"12 PDFs"},{name:"Shoot — Lisbon",meta:"RAW \xb7 2.1 GB",art:"ember"},{name:"Contract.pdf",meta:"PDF \xb7 320 KB"}],menu:[{label:"Rename"},{label:"Share…"},{label:"Move to Trash",danger:!0}]}),r.jsx(n,{label:"My Files",meta:"Wed 19 Aug",tone:"dark",art:"ember",seed:11,action:"none",labelPlacement:"top-right",appearDelay:280,files:[{name:"Stills",meta:"64 images",art:"verdant"},{name:"Edit notes",meta:"TXT \xb7 4 KB"},{name:"Grade v3",meta:"DRX \xb7 18 MB",art:"aurora"}]})]}),r.jsx("p",{className:"relative mt-14 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase",children:"Hover to lean \xb7 Click to open \xb7 + to add"})]})}}};var t=require("../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[819],()=>a(1038));module.exports=r})();