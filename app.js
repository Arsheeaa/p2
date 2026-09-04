const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
let DATA=null, LANG=localStorage.getItem("portfolio-lang")||"fa";

const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const tr=o=>o&&typeof o==="object"&&o[LANG]!==undefined?o[LANG]:(o??"");
const ui=k=>DATA.ui[LANG][k]??"";

function setLang(lang){
  LANG=lang; localStorage.setItem("portfolio-lang",lang);
  document.documentElement.lang=lang; document.documentElement.dir=lang==="fa"?"rtl":"ltr"; document.documentElement.dataset.lang=lang;
  $$("[data-ui]").forEach(el=>el.textContent=ui(el.dataset.ui));
  $$("[data-note-en]").forEach(el=>el.textContent=LANG==="fa"?el.dataset.noteFa:el.dataset.noteEn);
  render();
}
function nav(){
  const labels=DATA.ui[LANG].nav, ids=["home","projects","skills","about","contact"];
  $("#desktopNav").innerHTML=labels.map((x,i)=>`<a href="#${ids[i]}" data-nav="${ids[i]}">${esc(x)}</a>`).join("");
}
function render(){
  nav();
  $("#name").textContent=tr(DATA.profile.name); $("#role").textContent=tr(DATA.profile.role); $("#intro").textContent=tr(DATA.profile.intro);
  $("#workspace").src=DATA.profile.workspaceImage;
  $("#aboutText").textContent=tr(DATA.profile.about);
  $("#aboutShort").textContent=tr(DATA.profile.about);
  $("#emailLink").textContent=DATA.profile.email; $("#emailLink").href=`mailto:${DATA.profile.email}`;
  $("#githubLink").href=DATA.profile.github;
  renderFeatured(); renderProjects(); renderSkills(); observe();
}
function renderFeatured(){
  const p=DATA.projects.find(x=>x.featured)||DATA.projects[0];
  $("#featured").innerHTML=`<div class="featured-copy">
    <span class="label">${ui("featured")} / ${esc(p.year)}</span>
    <h3>${esc(tr(p.title))}</h3>
    <p>${esc(tr(p.short))}</p>
    <div class="tags">${p.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
    <button class="button primary" data-open="${esc(p.id)}">${ui("view")} <em>↙</em></button>
  </div><div class="featured-media"><img src="${esc(p.image)}" alt="${esc(tr(p.title))}" loading="eager"></div>`;
}
function renderProjects(){
  const featured=DATA.projects.find(x=>x.featured)||DATA.projects[0];
  $("#projectGrid").innerHTML=DATA.projects.filter(x=>x.id!==featured.id).map((p,i)=>`<article class="project-card reveal" data-open="${esc(p.id)}" style="transition-delay:${(i%3)*60}ms">
    <div class="media"><span class="project-no">${String(p.number).padStart(2,"0")}</span><img src="${esc(p.image)}" alt="${esc(tr(p.title))}" loading="lazy"></div>
    <div class="project-body"><h3>${esc(tr(p.title))}</h3><p>${esc(tr(p.short))}</p><div class="project-meta"><span>${esc(p.year)}</span><b>${ui("view")} ↙</b></div></div>
  </article>`).join("");
  $$("[data-open]").forEach(el=>el.addEventListener("click",()=>openModal(el.dataset.open)));
}
function renderSkills(){
  const groups={};
  DATA.skills.forEach(s=>(groups[s.group]??=[]).push(s));
  const order=["embedded","iot","web","electronics","fabrication"];
  $("#skillsList").innerHTML=order.filter(k=>groups[k]).flatMap(k=>groups[k]).map((s,i)=>{
    const level=s.level==="strong"?5:s.level==="practical"?4:3;
    return `<div class="skill reveal" style="transition-delay:${(i%5)*45}ms">
      <div class="skill-top"><span class="skill-name">${esc(s.name)}</span><span class="skill-level">${esc(s.level.toUpperCase())}</span></div>
      <div class="skill-bar">${[1,2,3,4,5].map(n=>`<i class="${n<=level?"on":""}"></i>`).join("")}</div>
    </div>`;
  }).join("");
}
function openModal(id){
  const p=DATA.projects.find(x=>x.id===id); if(!p)return;
  $("#modalBody").innerHTML=`<div class="modal-content">
    <div class="modal-image"><img src="${esc(p.image)}" alt="${esc(tr(p.title))}"></div>
    <div class="modal-copy">
      <span class="label">${ui("project")} ${esc(p.number)} / ${esc(p.year)}</span>
      <h3>${esc(tr(p.title))}</h3>
      <p>${esc(tr(p.desc))}</p>
      <div class="modal-info">
        <div class="info"><small>${ui("year")}</small><b>${esc(p.year)}</b></div>
        <div class="info"><small>${ui("stack")}</small><b>${esc(p.tags.join(" · "))}</b></div>
      </div>
      <h4>${ui("learned")}</h4>
      <ul>${(tr(p.highlights)||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
    </div></div>`;
  $("#modal").classList.add("open"); $("#modal").setAttribute("aria-hidden","false"); document.body.style.overflow="hidden";
}
function closeModal(){ $("#modal").classList.remove("open"); $("#modal").setAttribute("aria-hidden","true"); document.body.style.overflow=""; }
function observe(){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12});
  $$(".reveal").forEach(el=>{if(!el.classList.contains("in"))io.observe(el)});
}
function setup(){
  $("#langBtn").addEventListener("click",()=>setLang(LANG==="fa"?"en":"fa"));
  $("#menuBtn").addEventListener("click",()=>{$("#menuBtn").classList.toggle("open");$("#desktopNav").classList.toggle("open")});
  document.addEventListener("click",e=>{if(e.target.matches("[data-close]"))closeModal();if(e.target.closest("#desktopNav a")){$("#menuBtn").classList.remove("open");$("#desktopNav").classList.remove("open")}});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
  window.addEventListener("scroll",()=>{
    const y=scrollY, max=document.documentElement.scrollHeight-innerHeight;
    $("#progress").style.width=(max?y/max*100:0)+"%"; $("#nav").classList.toggle("scrolled",y>20);
    const ids=["home","projects","skills","about","contact"], pos=ids.map(id=>({id,y:$("#"+id).offsetTop-120})); const cur=pos.reverse().find(x=>y>=x.y)?.id||"home";
    $$("[data-nav]").forEach(a=>a.classList.toggle("active",a.dataset.nav===cur));
  },{passive:true});
  window.addEventListener("pointermove",e=>{$(".cursor-glow").style.left=e.clientX+"px";$(".cursor-glow").style.top=e.clientY+"px"},{passive:true});
  const frame=$("[data-tilt]");
  if(frame && matchMedia("(pointer:fine)").matches){
    frame.addEventListener("pointermove",e=>{const r=frame.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;frame.style.transform=`rotate(3deg) rotateX(${y*-3}deg) rotateY(${x*4}deg) translateY(-3px)`});
    frame.addEventListener("pointerleave",()=>frame.style.transform="rotate(3deg)");
  }
  $("#yearNow").textContent=new Date().getFullYear();
}
async function boot(){
  try{const r=await fetch("./data.json",{cache:"no-store"});DATA=await r.json()}catch(e){console.error("data.json could not be loaded",e);return}
  setup();setLang(LANG);
}
document.addEventListener("DOMContentLoaded",boot);
