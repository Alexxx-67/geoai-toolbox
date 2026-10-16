(function(){var h=document.documentElement,b=document.getElementById('lang');
function set(l){h.setAttribute('data-lang',l);h.lang=l==='en'?'en':'zh-CN';if(b)b.textContent=l==='en'?'中文':'EN';try{localStorage.setItem('lang',l)}catch(e){}}
var s='zh';try{s=localStorage.getItem('lang')||'zh'}catch(e){}set(s);
if(b)b.onclick=function(){set(h.getAttribute('data-lang')==='en'?'zh':'en')};
var q=document.getElementById('q');if(!q)return;var cards=[].slice.call(document.querySelectorAll('#grid .card')),f='all',geo=document.getElementById('geoOnly'),cnt=document.getElementById('count');
function run(){var t=q.value.trim().toLowerCase(),n=0;cards.forEach(function(c){var ok=(f==='all'||c.dataset.cat===f)&&(!t||c.dataset.search.indexOf(t)>-1)&&(!geo.checked||c.querySelector('.g-yes'));c.style.display=ok?'':'none';if(ok)n++});cnt.textContent=h.getAttribute('data-lang')==='en'?n+' tools shown':'显示 '+n+' 个工具'}
q.oninput=run;geo.onchange=run;[].forEach.call(document.querySelectorAll('.chip'),function(c){c.onclick=function(){document.querySelector('.chip.on').classList.remove('on');c.classList.add('on');f=c.dataset.f;run()}});
if(b)b.addEventListener('click',run);run();})();
