(function(){
var W=window.WORKS||[],LIMIT=6,STEP=6,cur="all",shown=LIMIT;
var grid=document.getElementById("grid"),stack=document.getElementById("stack"),pg=document.getElementById("pg");
var more=document.getElementById("more"),moreBtn=document.getElementById("moreBtn"),count=document.getElementById("count");
var btns=document.querySelectorAll(".filters button");
var NAMES={nature:"NATURE",event:"EVENT",space:"COMMERCIAL & SPACE",portrait:"PORTRAIT"};
function el(h){var d=document.createElement("div");d.innerHTML=h;return d.firstChild}
function cap(w){return [w.title,w.place,w.year].filter(Boolean).join("｜")}
function pad(n){return (n<10?"0":"")+n}

/* Top: top:1〜 の作品を順番に重ねる */
var tops=W.filter(function(w){return w.top}).sort(function(a,b){return a.top-b.top});
var slides=tops.map(function(w,i){
  var s=el('<div class="slide"><img decoding="async"><div class="cap"></div></div>');
  var im=s.querySelector("img");im.src=w.src;im.alt=w.alt||"";im.style.objectPosition=w.pos||"50% 50%";
  if(i>0)im.loading="lazy";else im.fetchPriority="high";
  var c=s.querySelector(".cap");
  var first=document.getElementById("tpl-first"),last=document.getElementById("tpl-last");
  if(i===0&&first)c.appendChild(first.content.cloneNode(true));
  var no=el('<span class="no"></span>');no.textContent=pad(i+1)+" / "+pad(tops.length)+"　"+(NAMES[w.cat]||"");c.appendChild(no);
  var t=el('<p class="t"></p>');t.textContent=cap(w);c.appendChild(t);
  if(i===tops.length-1&&last)c.appendChild(last.content.cloneNode(true));
  stack.appendChild(s);return s;
});
if("IntersectionObserver" in window&&slides.length){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){e.target.classList.add("on");pg.textContent=pad(slides.indexOf(e.target)+1)+" / "+pad(slides.length)}
  })},{threshold:.55});
  slides.forEach(function(s){io.observe(s)});
  new IntersectionObserver(function(es){pg.hidden=!es[0].isIntersecting},{threshold:0}).observe(stack);
}else{slides.forEach(function(s){s.classList.add("on")})}
if(slides[0])requestAnimationFrame(function(){slides[0].classList.add("on")});

/* Works */
W.forEach(function(w){
  var f=el('<figure><button type="button"><img loading="lazy" decoding="async"></button><figcaption></figcaption></figure>');
  var im=f.querySelector("img");im.src=w.thumb;im.width=w.tw;im.height=w.th;im.alt=w.alt||"";
  f.dataset.c=w.cat;f.querySelector("figcaption").textContent=cap(w);f._w=w;grid.appendChild(f);
});
var figs=[].slice.call(grid.children);
btns.forEach(function(b){var c=b.dataset.f;if(c!=="all"&&!W.some(function(w){return w.cat===c}))b.hidden=true});  // 写真が無いカテゴリーは非表示
function render(){var n=0,total=0;
  figs.forEach(function(f){var ok=cur==="all"||f.dataset.c===cur;if(ok)total++;f.hidden=!(ok&&++n<=shown)});
  var left=Math.max(total-shown,0);
  count.textContent=Math.min(shown,total)+" / "+total+" 枚を表示中";
  moreBtn.textContent="もっと見る（残り"+Math.min(left,STEP)+"枚）";
  moreBtn.hidden=left===0;more.hidden=total<=LIMIT;}
function setF(v){cur=v;shown=LIMIT;btns.forEach(function(x){x.setAttribute("aria-pressed",x.dataset.f===v)});render()}
btns.forEach(function(b){b.addEventListener("click",function(){setF(b.dataset.f)})});
moreBtn.addEventListener("click",function(){shown+=STEP;render()});render();

/* 拡大表示 */
var lb=document.getElementById("lb"),li=lb.querySelector("img"),lc=lb.querySelector("p"),idx=0;
function vis(){return figs.filter(function(f){return !f.hidden})}
function show(i){var v=vis();if(!v.length)return;idx=(i+v.length)%v.length;var w=v[idx]._w;
  li.src=w.src;li.alt=w.alt||"";lc.textContent=cap(w);lb.classList.add("on")}
figs.forEach(function(f){f.querySelector("button").addEventListener("click",function(){show(vis().indexOf(f))})});
lb.querySelector(".x").onclick=function(){lb.classList.remove("on")};
lb.querySelector(".p").onclick=function(e){e.stopPropagation();show(idx-1)};
lb.querySelector(".nx").onclick=function(e){e.stopPropagation();show(idx+1)};
lb.addEventListener("click",function(e){if(e.target===lb)lb.classList.remove("on")});
document.addEventListener("keydown",function(e){if(!lb.classList.contains("on"))return;
  if(e.key==="Escape")lb.classList.remove("on");if(e.key==="ArrowLeft")show(idx-1);if(e.key==="ArrowRight")show(idx+1)});

/* お問い合わせ（画面上の動作のみ。実際に送るには Formspree 等をつなぐ） */
document.getElementById("f").addEventListener("submit",function(e){e.preventDefault();
  var f=e.target,m=document.getElementById("msg");
  if(!f.name.value||!f.email.value||!f.body.value){m.textContent="お名前、メールアドレス、メッセージを入力してください。";return}
  m.textContent="送信しました。（雛形のため、実際には送信されません）";f.reset()});
})();
