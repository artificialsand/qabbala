'use strict';
(()=>{
 const $c=id=>document.getElementById(id), h=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const compare={active:false,panels:[],catalog:[],cache:new Map(),valueCache:new Map()};
 let searchTimer=null, drawFrame=null;
 function scheduleDraw(){if(!compare.active||drawFrame!==null)return;drawFrame=requestAnimationFrame(()=>{drawFrame=null;drawAll();});}
 function catalog(){
 const out=[{id:'bible',label:'King James Version (standardized text)',kind:'bible'},
 ...BIBLE_EDITIONS.map(b=>({id:b.id,label:b.name.replace(/^Bible — /,''),kind:'bible'})),
 ...EDITION_GROUPS.find(g=>g.id==='milton').items.map(([id,label])=>({id,label,kind:'milton'})),
 ...CLASSICS.map(x=>({id:x.id,label:x.name,kind:'classic'}))];
 for(const [id,t] of taoEntries)out.push({id,label:t.name,kind:'tao'});
 return out;
 }
 function groupList(){return collectionGroups();}
 function val(s,c){return cipherValue(s,c);}
 function units(item,unit){let key=item.id+'|'+unit;if(compare.cache.has(key))return compare.cache.get(key);
 let raw=state.texts[item.id];
 let sections=item.kind==='milton'?(raw?cleanMilton(raw):[]):item.kind==='bible'?(raw?cleanBible(raw):[]):item.kind==='classic'?(raw?cleanClassic(raw):[]):taoSection(item.id)?[taoSection(item.id)]:[];
 let rows=[];
 const add=(text,book,chapter,ref)=>rows.push({book,chapter,ref,text});
 const addWords=(text,book,chapter,ref)=>tokenizeWords(text).forEach((word,i)=>add(word,book,chapter,ref+', word '+(i+1)));
 for(const sec of sections){
 if(item.kind==='tao'){for(const [chapter,lines] of sec.chapters){
  if(unit==='word')lines.forEach((line,i)=>addWords(line,sec.name,chapter,`Chapter ${chapter}, verse ${i+1}`));
  else{let texts=unit==='sentence'?sentenceSplit(lines.join(' ')):lines;texts.forEach((text,i)=>add(text,sec.name,chapter,`Chapter ${chapter}, ${unit} ${i+1}`));}
 }}else if(item.kind==='bible'){
  if(unit==='verse')for(const v of sec.verses)add(v.text,sec.name,v.chapter,v.reference);
  else if(unit==='word')for(const v of sec.verses)addWords(v.text,sec.name,v.chapter,v.reference);
  else for(const [chapter,verses] of sec.chapters)sentenceSplit(verses.map(v=>v.text).join(' ')).forEach((text,i)=>add(text,sec.name,chapter,`${sec.name} ${chapter}, sentence ${i+1}`));
 }else{
  if(unit==='word')sec.lines.forEach((line,i)=>addWords(line,sec.name,null,`${sec.name}, verse ${i+1}`));
  else{let texts=unit==='sentence'?sentenceSplit(sec.lines.join(' ')):sec.lines;texts.forEach((text,i)=>add(text,sec.name,null,`${sec.name}, ${unit} ${i+1}`));}
 }}
 const result={sections,rows:rows.filter(r=>charCount(r.text)>0)};compare.cache.set(key,result);return result;
 }
 function options(p){let item=compare.catalog.find(t=>t.id===p.book);if(!item)return null;let possible=['verse','sentence','word'];if(item.kind==='classic'&& !p.unit)p.unit=(VERSE_CLASSICS.has(item.id)||/^(iliad|odyssey)_(pope|cowper|chapman)$/.test(item.id))?'verse':'sentence';if(!possible.includes(p.unit))p.unit=possible[0];let result=units(item,p.unit);let sections=item.kind==='tao'?[]:result.sections.map(s=>s.name);if(state.texts[item.id] && p.section!=='all'&&!sections.includes(p.section))p.section='all';let chapters=[...new Set(result.rows.filter(r=>p.section==='all'||r.book===p.section).map(r=>r.chapter).filter(x=>x!=null))].sort((a,b)=>a-b);if(state.texts[item.id] && p.chapter!=='all'&&!chapters.map(String).includes(p.chapter))p.chapter='all';return {item,possible,result,sections,chapters};}
 function rowsFor(p){
   let o=options(p);if(!o)return [];
   // Values are invariant under search. Cache by collection, unit and cipher,
   // and only slice cached rows when book/chapter selection changes.
   const baseKey=[p.book,p.unit,p.cipher].join('\u001f');
   let values=compare.valueCache.get(baseKey);
   if(!values){const cipher=ciphers.find(c=>c.name===p.cipher);values=o.result.rows.map(r=>({...r,value:val(r.text,cipher)}));compare.valueCache.set(baseKey,values);}
   return values.filter(r=>(p.section==='all'||r.book===p.section)&&(p.chapter==='all'||String(r.chapter)===p.chapter));
 }
 function selectHTML(items,chosen){return items.map(([id,label])=>`<option value="${h(id)}" ${id===chosen?'selected':''}>${h(label)}</option>`).join('');}
 function card(i){let p=compare.panels[i],o=options(p),node=document.createElement('section');node.className='panel compare-card';node.id='comparePanel'+i;
 node.innerHTML=`<div class="compare-card-top"><h3>TEXT ${i+1}</h3><button type="button" class="compare-remove" aria-label="Remove text ${i+1}" title="Remove this text">REMOVE</button></div><div class="fields"><div class="field grow"><label>Collection</label><select data-f="collection">${selectHTML(groupList().map(g=>[g.id,g.name]),groupForDataset(p.book).id)}</select></div><div class="field grow"><label>Translation</label><select data-f="book"></select></div><div class="field grow"><label>Cipher</label><select data-f="cipher">${selectHTML(ciphers.map(c=>[c.name,c.name]),p.cipher)}</select></div><div class="field"><label>Unit</label><select data-f="unit"></select></div><div class="field"><label>Book / section</label><select data-f="section"></select></div><div class="field"><label>Chapter</label><select data-f="chapter"></select></div></div><div data-part="stats"><div class="compare-stat-row" data-role="stats"></div></div><div data-part="timeline"><h3>Chronological values</h3><div class="timeline-wrap"><canvas class="compare-chart" data-role="timeline"></canvas><div class="timeline-tooltip" data-role="tooltip"></div></div><p class="compare-info" data-role="info"></p></div><div data-part="hist"><h3>Histogram</h3><canvas class="compare-chart compare-hist" data-role="hist"></canvas><div class="compare-hits" data-role="hits"></div></div><div data-part="search"><div class="compare-card-top"><h3>Matching ${p.unit==='sentence'?'sentences':'texts'}</h3><span class="small" data-role="match-count"></span></div><div class="compare-results" data-role="results"></div><div class="endrow" style="margin-top:8px"><span class="small" data-role="shown"></span><button type="button" data-role="more">Show more</button></div></div>`;
 node.querySelector('.compare-remove').addEventListener('click',()=>{compare.panels.splice(i,1);cards();});
 node.querySelector('[data-role="more"]').addEventListener('click',()=>{p.display=(p.display||60)+60;renderMatches(node,p);});
 for(let f of ['collection','book','cipher','unit','section','chapter'])node.querySelector(`[data-f="${f}"]`).addEventListener('change',e=>{if(f==='collection'){const g=groupById(e.target.value);p.book=defaultDataset(g)||p.book;}else p[f]=e.target.value;if(f==='collection'||f==='book'){p.unit='';p.section='all';p.chapter='all';}if(f==='unit')p.chapter='all';if(f==='section')p.chapter='all';p.hit=null;if(['collection','book','unit','section'].includes(f))refreshSelects(node,p);scheduleDraw();if(f==='collection'&&e.target.value==='tao')discoverTaoCatalog();if(['collection','book'].includes(f))ensureDataset(p.book).then(()=>{if(compare.active&&node.isConnected){refreshSelects(node,p);scheduleDraw();}});window.dispatchEvent(new Event('qabbala:compare-updated'));});
 node.querySelector('[data-role="hist"]').addEventListener('click',e=>{let c=e.currentTarget,g=c._hist;if(!g)return;let x=e.clientX-c.getBoundingClientRect().left,i=Math.floor((x-g.left)/g.width*g.bins.length);if(i>=0&&i<g.bins.length){p.hit=g.bins[i];hits(node,p);}});
 node.querySelector('[data-role="timeline"]').addEventListener('mousemove',e=>{let c=e.currentTarget,g=c._line,tip=node.querySelector('[data-role="tooltip"]');if(!g)return;let box=c.getBoundingClientRect(),x=e.clientX-box.left,index=Math.round(g.start+(x-g.left)/g.width*(g.end-g.start))-1,r=p.rows[index];if(!r){tip.style.display='none';return;}tip.innerHTML=`<strong>#${index+1} · ${r.value} · ${h(r.ref)}</strong><div>${h(r.text.slice(0,180))}</div>`;tip.style.display='block';tip.style.left=Math.max(0,Math.min(box.width-290,x+12))+'px';tip.style.top='12px';});
 node.querySelector('[data-role="timeline"]').addEventListener('mouseleave',()=>node.querySelector('[data-role="tooltip"]').style.display='none');refreshSelects(node,p);return node;}
 function refreshSelects(node,p){let o=options(p);if(!o)return;
 let group=groupForDataset(p.book),untranslated=group.items.length===1&&!group.items[0][1];
 const collection=node.querySelector('[data-f="collection"]');collection.value=group.id;
 const translation=node.querySelector('[data-f="book"]');translation.innerHTML=selectHTML(group.items.map(([id,name])=>[id,name||'—']),p.book);translation.value=p.book;translation.disabled=untranslated;
 for(const [f,arr] of [['unit',o.possible.map(x=>[x,x==='verse'?'Verse':x==='sentence'?'Sentence':'Word'])],['section',[['all','All sections'],...o.sections.map(x=>[x,x])]],['chapter',[['all','All chapters'],...o.chapters.map(x=>[String(x),String(x)])]]]){let sel=node.querySelector(`[data-f="${f}"]`);sel.innerHTML=selectHTML(arr,p[f]);sel.value=p[f];}
 node.querySelector('[data-f="chapter"]').disabled=o.item.kind==='milton'||o.item.kind==='classic';
 }
 function canvas(c){let r=c.getBoundingClientRect(),w=Math.max(270,Math.round(r.width)),height=Math.max(120,Math.round(r.height)),scale=window.devicePixelRatio||1;c.width=w*scale;c.height=height*scale;let ctx=c.getContext('2d');ctx.setTransform(scale,0,0,scale,0,0);ctx.clearRect(0,0,w,height);ctx.font='11px system-ui';return {ctx,w,height};}
 function line(node,rows,shared,unit){let c=node.querySelector('[data-role="timeline"]'),{ctx,w,height}=canvas(c),start=1,end=rows.length,left=61,right=12,top=15,bottom=31,width=w-left-right,ph=height-top-bottom;c._line={start,end,left,width};let visible=rows.slice(start-1,end).filter(r=>Number.isFinite(r.value));if(!visible.length||start<1||end<start){ctx.fillStyle='#aeb9b7';ctx.fillText('No numeric values in this interval',20,height/2);return;}let mn=Infinity,mx=-Infinity;for(const r of visible){if(r.value<mn)mn=r.value;if(r.value>mx)mx=r.value;}let pad=Math.max(1,(mx-mn)*.05),low=shared?shared[0]:mn-pad,high=shared?shared[1]:mx+pad;
 const X=n=>left+(start===end?.5:(n-start)/(end-start))*width,Y=v=>top+(high-v)/(high-low)*ph;ctx.strokeStyle='#3b3b35';ctx.fillStyle='#b0bdbc';for(let i=0;i<=4;i++){let y=top+i/4*ph;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke();ctx.textAlign='right';ctx.fillText(String(Math.round(high-(high-low)*i/4)),left-5,y+3);ctx.textAlign='center';let ord=Math.round(start+(end-start)*i/4);ctx.fillText(String(ord),X(ord),height-6);}ctx.beginPath();ctx.lineWidth=1.3;ctx.strokeStyle='#45bcff';let connected=false;const stride=unit==='word'?Math.max(1,Math.ceil((end-start+1)/(width*2))):1;for(let n=start;n<=end;n+=stride){let r=rows[n-1];if(!r||!Number.isFinite(r.value)){connected=false;continue;}let x=X(n),y=Y(r.value);if(!connected)ctx.moveTo(x,y);else ctx.lineTo(x,y);connected=true;}ctx.stroke();}
 function hist(node,rows){let c=node.querySelector('[data-role="hist"]'),{ctx,w,height}=canvas(c),vals=rows.map(r=>r.value).filter(Number.isFinite);c._hist=null;if(!vals.length){ctx.fillStyle='#aeb9b7';ctx.fillText('No numeric values',20,60);return;}let mn=Infinity,mx=-Infinity;for(const v of vals){if(v<mn)mn=v;if(v>mx)mx=v;}let step=Math.max(1,Math.ceil((mx-mn+1)/36)),first=Math.floor(mn/step)*step,n=Math.floor((mx-first)/step)+1,bins=Array.from({length:n},(_,i)=>({lo:first+i*step,hi:first+(i+1)*step-1,n:0}));for(const v of vals)bins[Math.floor((v-first)/step)].n++;let left=43,right=10,top=8,bottom=24,width=w-left-right,ph=height-top-bottom,max=Math.max(...bins.map(b=>b.n));for(let i=0;i<bins.length;i++){let bh=bins[i].n/max*ph;ctx.fillStyle='#45bcff';ctx.fillRect(left+i*width/bins.length,top+ph-bh,Math.max(.5,width/bins.length-1),bh);}ctx.fillStyle='#aeb9b7';ctx.textAlign='left';ctx.fillText(String(first),left,height-6);ctx.textAlign='right';ctx.fillText(String(bins.at(-1).hi),w-right,height-6);c._hist={left,width,bins};}
 function hits(node,p){let div=node.querySelector('[data-role="hits"]');if(!p.hit){div.innerHTML='';return;}let rows=p.rows.filter(r=>r.value>=p.hit.lo&&r.value<=p.hit.hi);div.innerHTML=`<p class="small">${rows.length} matches for ${p.hit.lo}–${p.hit.hi}</p>`+rows.slice(0,40).map(r=>`<div class="compare-hit"><b>${r.value}</b><div><small>${h(r.ref)}</small><div>${h(r.text)}</div></div></div>`).join('');}
 function getSharedSearch(){
   const mode=$c('compareValueMode').value,rawMin=$c('compareMin').value,rawMax=$c('compareMax').value;
   const min=rawMin===''?-Infinity:Number(rawMin);
   const max=mode==='single'?(rawMin===''?Infinity:min):(rawMax===''?Infinity:Number(rawMax));
   return {min,max,query:normalizedSearch($c('compareQuery').value.trim())};
 }
 function renderMatches(node,p){
   const {min,max,query}=getSharedSearch();
   let matches=p.rows.filter(r=>Number.isFinite(r.value)?r.value>=min&&r.value<=max:!Number.isFinite(min)&&!Number.isFinite(max));
   if(query)matches=matches.filter(r=>{if(r._searchText===undefined)r._searchText=normalizedSearch(r.text);return r._searchText.includes(query);});
   const maxShown=p.display||60,shown=matches.slice(0,maxShown),target=node.querySelector('[data-role="results"]');
   node.querySelector('[data-role="match-count"]').textContent=matches.length.toLocaleString()+' matches';
   target.innerHTML=shown.length?shown.map(r=>`<div class="compare-hit"><b>${r.value===null?'—':r.value}</b><div><div class="ref">${h(r.ref)}</div><div class="verse">${h(r.text)}</div></div></div>`).join(''):'<p class="empty">No matches. Change the filters or select a loaded text.</p>';
   node.querySelector('[data-role="shown"]').textContent=`Showing ${shown.length.toLocaleString()} / ${matches.length.toLocaleString()}`;
   node.querySelector('[data-role="more"]').hidden=matches.length<=maxShown;
 }
 function drawAll(){if(!compare.active)return;let all=compare.panels.map(p=>p.rows=rowsFor(p)),shared=null;for(let i=0;i<all.length;i++){let node=$c('comparePanel'+i),p=compare.panels[i],rows=all[i],nums=rows.map(r=>r.value).filter(Number.isFinite),mean=nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:null,words=rows.length?rows.reduce((a,r)=>a+wordCount(r.text),0)/rows.length:0,chars=rows.length?rows.reduce((a,r)=>a+charCount(r.text),0)/rows.length:0,E=expectedCharValue(ciphers.find(c=>c.name===p.cipher)),expected=E===null?null:chars*E;node.querySelector('[data-role="stats"]').innerHTML=`<span>Units: ${rows.length.toLocaleString()}</span><span>Mean value: ${mean===null?'N/A':mean.toFixed(1)}</span><span>E: ${E===null?'N/A':E.toFixed(3)}</span><span>Expected mean: ${expected===null?'N/A':expected.toFixed(1)}</span><span>Mean deviation: ${mean===null||expected===null?'N/A':(mean-expected).toFixed(1)}</span><span>Mean words: ${words.toFixed(1)}</span><span>Mean characters: ${chars.toFixed(1)}</span>`;node.querySelector('[data-role="info"]').textContent=!state.texts[p.book]?(loadingErrors.get(p.book)||'Loading selected text…'):`${p.section==='all'?'All sections':p.section} · ${p.chapter==='all'?'All chapters':'Chapter '+p.chapter} · ${p.unit}`;if(!node.querySelector('[data-part="timeline"]').hidden)line(node,rows,shared,p.unit);if(!node.querySelector('[data-part="hist"]').hidden){hist(node,rows);hits(node,p);}if(!node.querySelector('[data-part="search"]').hidden)renderMatches(node,p);}}
 function appendPanel(){let i=compare.panels.length;compare.panels.push({book:(i===0&&sourceFilename(state.dataset)?state.dataset:compare.catalog[Math.min(i,compare.catalog.length-1)]?.id)||'milton',cipher:'Alphanumeric Qabbala',unit:'',section:'all',chapter:'all',hit:null,rows:[]});cards();}
 function cards(){if(!compare.active)return;let host=$c('compareCards');host.innerHTML='';if(!compare.catalog.length){host.textContent='No texts available';return;}compare.panels.forEach((p,i)=>{if(!compare.catalog.some(c=>c.id===p.book)){p.book=compare.catalog[0].id;p.unit='';p.section='all';}let node=card(i);host.append(node);});let add=document.createElement('button');add.type='button';add.className='compare-add';add.id='compareAdd';add.setAttribute('aria-label','Add another text');add.innerHTML='<span class="plus" aria-hidden="true">+</span><span class="plus-label">ADD TEXT</span>';add.addEventListener('click',appendPanel);host.append(add);applyCompareVisibility();scheduleDraw();for(const p of compare.panels)if(!state.texts[p.book])ensureDataset(p.book).then(()=>{if(compare.active){const ix=compare.panels.indexOf(p),node=$c('comparePanel'+ix);if(ix>=0&&node){refreshSelects(node,p);scheduleDraw();}}});window.dispatchEvent(new Event('qabbala:compare-updated'));}
 function applyCompareVisibility(){const sharedSearch=document.querySelector('[data-visible="search"]');$c('compareSearchPanel').hidden=!!sharedSearch&&!sharedSearch.checked;for(let node of document.querySelectorAll('.compare-card'))for(let part of ['stats','timeline','hist','search']){let box=node.querySelector(`[data-part="${part}"]`);if(box)box.hidden=!document.querySelector(`[data-visible="${part}"]`).checked;}}
 function sync(){compare.catalog=catalog();compare.cache.clear();compare.valueCache.clear();if(compare.active)cards();}
 function mode(on){if(compare.active===on)return;if(on){const fresh=catalog();const previous=compare.catalog.map(t=>t.id).join('\u001f');const current=fresh.map(t=>t.id).join('\u001f');if(previous!==current){compare.catalog=fresh;compare.cache.clear();compare.valueCache.clear();}}if(searchTimer!==null){clearTimeout(searchTimer);searchTimer=null;}compare.active=on;document.body.classList.toggle('compare-mode',on);$c('compareWorkspace').hidden=!on;$c('modeSingle').classList.toggle('primary',!on);$c('modeCompare').classList.toggle('primary',on);if(on){syncSearchFromSingle();if(!compare.panels.length){appendPanel();}else if(!$c('compareCards').querySelector('.compare-card')){cards();}else{applyCompareVisibility();scheduleDraw();}}else{if(drawFrame!==null){cancelAnimationFrame(drawFrame);drawFrame=null;}if(typeof filter==='function')filter();}}
 function syncSearchFromSingle(){
   for(const [a,b] of [['valueMode','compareValueMode'],['min','compareMin'],['max','compareMax'],['query','compareQuery']])$c(b).value=$c(a).value;
   updateRangeLabel();
   compare.panels.forEach(p=>p.display=60);
   if(compare.active)scheduleSearch();
 }
 function syncSearchToSingle(){
   updateRangeLabel();
   for(const [a,b] of [['valueMode','compareValueMode'],['min','compareMin'],['max','compareMax'],['query','compareQuery']])$c(a).value=$c(b).value;
   $c('maxField').hidden=$c('valueMode').value!=='range';
   $c('minLabel').textContent=$c('valueMode').value==='range'?'Minimum value':'Exact value';
   // Do not rerender the hidden SINGLE charts on each COMPARE keystroke.
   compare.panels.forEach(p=>p.display=60);
   scheduleSearch();
 }
 function renderAllMatches(){
   if(!compare.active)return;
   for(let i=0;i<compare.panels.length;i++){
     const node=$c('comparePanel'+i),p=compare.panels[i];
     if(node&&!node.querySelector('[data-part="search"]').hidden)renderMatches(node,p);
   }
 }
 function scheduleSearch(immediate=false){
   if(searchTimer!==null)clearTimeout(searchTimer);
   searchTimer=null;
   if(!compare.active)return;
   if(immediate)renderAllMatches();
   else searchTimer=setTimeout(()=>{searchTimer=null;renderAllMatches();},160);
 }
 function updateRangeLabel(){
   const range=$c('compareValueMode').value==='range';
   $c('compareMaxField').hidden=!range;
   $c('compareMinLabel').textContent=range?'Minimum value':'Exact value';
 }
 for(const id of ['compareValueMode','compareMin','compareMax','compareQuery'])$c(id).addEventListener(id==='compareValueMode'?'change':'input',syncSearchToSingle);
 $c('compareClear').addEventListener('click',()=>{$c('compareMin').value='';$c('compareMax').value='';$c('compareQuery').value='';syncSearchToSingle();});
 for(const id of ['valueMode','min','max','query'])$c(id).addEventListener(id==='valueMode'?'change':'input',syncSearchFromSingle);
 $c('clear').addEventListener('click',()=>queueMicrotask(syncSearchFromSingle));
 $c('chart').addEventListener('click',()=>queueMicrotask(syncSearchFromSingle));
 syncSearchFromSingle();
 $c('modeSingle').addEventListener('click',()=>mode(false));$c('modeCompare').addEventListener('click',()=>mode(true));
 window.addEventListener('qabbala:catalog-updated',sync);
 window.addEventListener('qabbala:dataset-loaded',e=>{const id=e.detail.id;for(const k of [...compare.cache.keys()])if(k.startsWith(id+'|'))compare.cache.delete(k);for(const k of [...compare.valueCache.keys()])if(k.startsWith(id+'\u001f'))compare.valueCache.delete(k);if(compare.active&&compare.panels.some(p=>p.book===id))cards();});
 window.addEventListener('qabbala:dataset-reloaded',e=>{const id=e.detail.id;for(const k of [...compare.cache.keys()])if(k.startsWith(id+'|'))compare.cache.delete(k);for(const k of [...compare.valueCache.keys()])if(k.startsWith(id+'\u001f'))compare.valueCache.delete(k);if(compare.active)cards();});
 document.querySelectorAll('[data-visible]').forEach(el=>el.addEventListener('change',()=>{if(compare.active){applyCompareVisibility();scheduleDraw();}}));
 let timer;window.addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(scheduleDraw,140);});
 window.QabbalaCompare={
   active:()=>compare.active,
   getPanels:()=>compare.panels.map(p=>({book:p.book,cipher:p.cipher,unit:p.unit,section:p.section,chapter:p.chapter})),
   restore:(items)=>{
     const available=new Set(compare.catalog.map(x=>x.id));
     const validCiphers=new Set(ciphers.map(x=>x.name));
     if(Array.isArray(items)){
       compare.panels=items.slice(0,6).filter(x=>x&&typeof x==='object'&&available.has(x.book)).map(x=>({
         book:x.book,cipher:validCiphers.has(x.cipher)?x.cipher:(ciphers[0]?.name||''),
         unit:typeof x.unit==='string'?x.unit:'',
         section:typeof x.section==='string'?x.section.slice(0,120):'all',
         chapter:typeof x.chapter==='string'?x.chapter.slice(0,20):'all',
         hit:null,rows:[],display:60
       }));
     }
     const wasActive=compare.active;
     mode(true); // Don't fetch a temporary default panel before restoring linked panels.
     if(wasActive)cards();
   }
 };
 sync();
})();
