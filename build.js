// Zero-dependency static site generator. Usage: node build.js  -> outputs ./dist
// Internal links use a configurable base path so the same build works at / (local)
// and under /geoai-toolbox/ (GitHub Pages). BASE_PATH overrides data/site.json "base".
const fs=require('fs'),path=require('path');
const D=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'data',p),'utf8'));
const site=D('site.json'),cats=D('categories.json');
const tools=fs.readdirSync(path.join(__dirname,'data/tools')).filter(f=>f.endsWith('.json')).map(f=>D('tools/'+f)).sort((a,b)=>a.name.localeCompare(b.name));
const OUT=path.join(__dirname,'dist');fs.rmSync(OUT,{recursive:true,force:true});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const B=(zh,en)=>`<span class="zh">${zh}</span><span class="en">${en}</span>`;
const catBy=Object.fromEntries(cats.map(c=>[c.slug,c]));
const PR={free:['免费','Free'],freemium:['免费+付费','Freemium'],paid:['付费','Paid'],unknown:['价格待核实','Pricing TBD']};
const GEO={yes:['地学专用','Geo-specific'],partial:['部分地学功能','Partly geo'],general:['通用工具','General']};
const badge=(t)=>`<span class="badge p-${t.pricing}">${B(...PR[t.pricing])}</span><span class="badge g-${t.geo}">${B(...GEO[t.geo])}</span>`;
function normBase(b){
  b=String(b??'').trim();
  if(!b||b==='/')return '/';
  if(!b.startsWith('/'))b='/'+b;
  if(!b.endsWith('/'))b+='/';
  return b;
}
// Empty BASE_PATH is treated as "unset" so CI can leave it blank without wiping site.base.
const base=normBase(process.env.BASE_PATH?process.env.BASE_PATH:site.base);
const href=rel=>esc(base+String(rel).replace(/^\/+/,''));
if(!site.newsletter_form||!site.newsletter_archive)throw new Error('data/site.json needs newsletter_form and newsletter_archive');
const newsletterForm=()=>`<form class="form" action="${esc(site.newsletter_form)}" method="post" target="_blank">
<label>${B('邮箱','Email')}<input type="email" name="email" required autocomplete="email"></label>
<input type="hidden" name="embed" value="1">
<button class="btn" type="submit">${B('订阅','Subscribe')}</button></form>
<p class="archive"><a href="${esc(site.newsletter_archive)}" target="_blank" rel="noopener">${B('往期周报','Archive')}</a></p>`;
function page(rel,title,body){
  const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · ${esc(site.name_zh)}</title><meta name="description" content="${esc(site.tagline_zh)}">
<link rel="stylesheet" href="${href('assets/style.css')}"></head><body>
<header class="top"><a class="brand" href="${href('index.html')}">🌏 ${B(esc(site.name_zh),esc(site.name_en))}</a>
<nav><a href="${href('index.html')}">${B('全部工具','All tools')}</a><a href="${href('submit/index.html')}">${B('提交工具','Submit')}</a><a href="${href('newsletter/index.html')}">${B('订阅周报','Newsletter')}</a><a href="${href('about/index.html')}">${B('关于','About')}</a>
<button id="lang" type="button" aria-label="switch language">EN</button></nav></header>
<main>${body}</main>
<footer><p>${B('收录信息均来自工具官网（核实日期见各页）；「实测笔记」为站长亲测后补充。','Listing info comes from official sites (verification date on each page). Hands-on notes are added after the editor tests each tool.')}</p></footer>
<script src="${href('assets/app.js')}"></script></body></html>`;
  const f=path.join(OUT,rel);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,html);
}
const card=(t)=>`<a class="card" href="${href('tools/'+t.slug+'/index.html')}" data-cat="${t.category}" data-search="${esc((t.name+' '+t.desc_zh+' '+t.desc_en+' '+t.tags.join(' ')).toLowerCase())}">
<div class="cat">${catBy[t.category].icon} ${B(catBy[t.category].zh,catBy[t.category].en)}</div><h3>${esc(t.name)}</h3>
<p>${B(esc(t.desc_zh),esc(t.desc_en))}</p><div class="badges">${badge(t)}</div></a>`;
// home
page('index.html',site.name_zh,`<section class="hero"><h1>${B(esc(site.tagline_zh),esc(site.tagline_en))}</h1>
<p>${B(`已收录 ${tools.length} 个工具，按科研任务分类。每个工具都标明价格和是否适合地学任务。`,`${tools.length} tools, organized by research task, each marked for pricing and geoscience fit.`)}</p>
<input id="q" type="search" placeholder="搜索：GEE、文献综述、基础模型、润色…" autocomplete="off">
<div class="chips"><button class="chip on" data-f="all">${B('全部','All')}</button>${cats.map(c=>`<button class="chip" data-f="${c.slug}">${c.icon} ${B(c.zh,c.en)}</button>`).join('')}
<label class="geo-only"><input type="checkbox" id="geoOnly"> ${B('只看地学专用','Geo-specific only')}</label></div></section>
<nav class="catlinks">${B('按分类浏览：','Browse by category: ')}${cats.map(c=>`<a href="${href('category/'+c.slug+'/index.html')}">${c.icon} ${B(c.zh,c.en)}</a>`).join(' · ')}</nav>
<p id="count" class="muted"></p><section class="grid" id="grid">${tools.map(t=>card(t)).join('')}</section>
<section class="cta"><h2>${B('每周一封：地学 AI 新工具 + 实测','Weekly: new GeoAI tools + hands-on notes')}</h2>${newsletterForm()}</section>`);
// categories
cats.forEach(c=>{const ts=tools.filter(t=>t.category===c.slug);
 page(`category/${c.slug}/index.html`,c.zh,`<p class="crumb"><a href="${href('index.html')}">${B('首页','Home')}</a> / ${B(c.zh,c.en)}</p><h1>${c.icon} ${B(c.zh,c.en)}</h1><p>${B(c.desc_zh,c.desc_en)}</p><p class="muted">${B(`${ts.length} 个工具`,`${ts.length} tools`)}</p><section class="grid">${ts.map(t=>card(t)).join('')}</section>`);});
// tools
tools.forEach(t=>{const c=catBy[t.category];const rel=tools.filter(x=>x.category===t.category&&x.slug!==t.slug).slice(0,3);
 page(`tools/${t.slug}/index.html`,t.name,`<p class="crumb"><a href="${href('index.html')}">${B('首页','Home')}</a> / <a href="${href('category/'+c.slug+'/index.html')}">${B(c.zh,c.en)}</a> / ${esc(t.name)}</p>
<article class="tool"><h1>${esc(t.name)}</h1><p class="lead">${B(esc(t.desc_zh),esc(t.desc_en))}</p><div class="badges">${badge(t)}</div>
<p><a class="btn" href="${esc(t.url)}" target="_blank" rel="noopener nofollow">${B('访问官网 ↗','Visit site ↗')}</a></p>
<table class="facts"><tr><th>${B('分类','Category')}</th><td><a href="${href('category/'+c.slug+'/index.html')}">${c.icon} ${B(c.zh,c.en)}</a></td></tr>
<tr><th>${B('价格','Pricing')}</th><td>${B(...PR[t.pricing])}<br><small>${esc(t.pricing_note)}</small></td></tr>
<tr><th>${B('地学适用性','Geoscience fit')}</th><td>${B(...GEO[t.geo])}<br><small>${esc(t.geo_note)}</small></td></tr>
<tr><th>${B('标签','Tags')}</th><td>${t.tags.map(x=>`<span class="tag">${esc(x)}</span>`).join(' ')}</td></tr>
<tr><th>${B('信息来源','Source')}</th><td><a href="${esc(t.verified_source)}" target="_blank" rel="noopener nofollow">${esc(t.verified_source)}</a><br><small>${B('核实日期','Verified on')} ${t.verified_on}</small></td></tr></table>
<section class="notes ${t.test_status}"><h2>🧪 ${B('实测笔记','Hands-on notes')}</h2><p><strong>${esc(t.test_notes)}</strong> — ${B('站长尚未亲自测试这个工具，测试后会在这里写下用地学任务（如 GEE 脚本、遥感文献综述）实测的结果。','Not yet tested by the editor. Results on real geoscience tasks will appear here.')}</p></section></article>
${rel.length?`<h2>${B('同类工具','Related tools')}</h2><section class="grid">${rel.map(x=>card(x)).join('')}</section>`:''}`);});
// submit
page('submit/index.html','提交工具',`<h1>${B('提交一个工具','Submit a tool')}</h1><p>${B('知道适合地学科研的 AI 工具？告诉我们。免费收录；工具方可咨询付费置顶（即将开放）。','Know an AI tool useful for geoscience research? Free listing; featured placements coming soon.')}</p>
<form class="form" onsubmit="event.preventDefault();document.getElementById('ok').hidden=false;">
<label>${B('工具名称','Tool name')}<input required name="name"></label><label>${B('官网链接','Website')}<input required type="url" name="url"></label>
<label>${B('分类','Category')}<select name="cat">${cats.map(c=>`<option>${c.zh}</option>`).join('')}</select></label>
<label>${B('一句话介绍','One-line description')}<textarea name="desc" rows="3"></textarea></label><label>${B('你的邮箱（可选）','Your email (optional)')}<input type="email" name="email"></label>
<button class="btn" type="submit">${B('提交','Submit')}</button><p id="ok" hidden class="muted">${B('（占位）表单尚未接入后端，提交内容不会被发送。','(Placeholder) No backend yet — nothing was sent.')}</p></form>`);
// newsletter
page('newsletter/index.html','订阅周报',`<h1>${B('订阅「地学 AI 周报」','Subscribe to the GeoAI weekly')}</h1><p>${B('每周一封：1–2 个值得试的新工具、一段地学任务实测、一条 GEE/Python 小技巧。','Weekly: 1–2 new tools, one hands-on geoscience test, one GEE/Python tip.')}</p>
${newsletterForm()}`);
// about
page('about/index.html','关于',`<h1>${B('关于本站','About')}</h1>
<p class="zh">你好，我是 <strong>[站长姓名/昵称]</strong>，一名地理学博士生，研究方向是 <strong>[研究方向]</strong>。做研究时我每天都在用 AI：查文献、写 GEE 和 Python 代码、找数据、改英文论文。但新工具太多，哪个真的适合地学任务，很难判断。</p>
<p class="zh">所以我做了这个导航站：按科研任务分类，每个工具都标明价格、是否适合地学，并在亲自用地学任务测试之后写下「实测笔记」。没测过的会明确标注「待实测」，不编造结果。</p>
<p class="zh">合作说明：本站未来可能包含联盟推广链接或赞助位，会明确标注，不影响评价。联系方式：<strong>[联系邮箱]</strong></p>
<p class="en">Hi, I'm <strong>[Name]</strong>, a geography PhD student working on <strong>[research topic]</strong>. I use AI daily for literature, GEE/Python coding, data and writing. This directory organizes tools by research task, marks pricing and geoscience fit, and adds hands-on notes only after I've tested a tool. Untested tools are clearly marked. Future affiliate links or sponsorships will always be disclosed. Contact: <strong>[email]</strong></p>`);
// assets
fs.mkdirSync(path.join(OUT,'assets'),{recursive:true});
for(const f of ['style.css','app.js'])fs.copyFileSync(path.join(__dirname,'src',f),path.join(OUT,'assets',f));
fs.writeFileSync(path.join(OUT,'tools.json'),JSON.stringify(tools,null,1));
console.log(`Built ${tools.length} tools, ${cats.length} categories -> dist/ (base ${base})`);
