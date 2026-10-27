const STORAGE_KEY = "sm-portfolio-projects-v1";
const PROFILE_KEY = "sm-portfolio-profile-v1";
const sampleProjects = [
  {id:"sample-1",title:"Midnight Sessions",category:"Flyers",description:"Event campaign · Art direction",year:"2025",image:"",kind:"image",sample:true,art:"MIDNIGHT"},
  {id:"sample-2",title:"Good Things Daily",category:"Social Media",description:"Social campaign · Visual design",year:"2025",image:"",kind:"image",sample:true,art:"GOOD THINGS"},
  {id:"sample-3",title:"Form & Field",category:"Packaging",description:"Concept packaging · Branding",year:"2025",image:"",kind:"image",sample:true,art:"FORM / FIELD"},
  {id:"sample-4",title:"A New Perspective",category:"Web Design",description:"Landing page · UI design",year:"2025",image:"",kind:"image",sample:true,art:"NEW VIEW"}
];
const client = window.portfolioSupabase;
function getLocalProjects(){try{const saved=localStorage.getItem(STORAGE_KEY);return saved?JSON.parse(saved):sampleProjects;}catch{return sampleProjects;}}
async function getProjects(){
  if(client){
    const {data,error}=await client.from("projects").select("*").order("created_at",{ascending:false});
    if(!error) return (data||[]).map(p=>({id:p.id,title:p.title,category:p.category,description:p.description||"",year:p.year||"",image:p.media_url||"",kind:p.media_type||"image",sample:false}));
    console.error("Supabase projects load failed:",error.message);
  }
  return getLocalProjects();
}
async function getProfile(){
  if(client){const {data,error}=await client.from("site_profile").select("*").eq("id",1).maybeSingle();if(!error&&data)return data;}
  try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}");}catch{return {};}
}
async function applyProfile(){
  const p=await getProfile();
  const set=(id,value)=>{const el=document.getElementById(id);if(el&&value)el.href=value;};
  set("email-link",p.email?`mailto:${p.email}`:"");
  set("whatsapp-link",p.whatsapp?`https://wa.me/${String(p.whatsapp).replace(/\D/g,"")}`:"");
  set("instagram-link",p.instagram);set("behance-link",p.behance);
}
function escapeHTML(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
const grid=document.getElementById("project-grid");
if(grid){
  let activeFilter="All", projectCache=[];
  const render=()=>{
    const projects=projectCache.filter(p=>activeFilter==="All"||p.category===activeFilter);
    grid.innerHTML=projects.map((p,i)=>{
      const media=p.image?(p.kind==="video"?`<video src="${escapeHTML(p.image)}" muted playsinline preload="metadata"></video>`:`<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title)}" loading="lazy">`):`<div class="image-placeholder"><span class="placeholder-mark">SM.</span><span class="placeholder-label">${escapeHTML(p.art||p.category)}</span></div>`;
      return `<article class="project-card" data-id="${escapeHTML(p.id)}" style="animation-delay:${i*55}ms"><div class="project-image">${media}<span class="project-badge">${escapeHTML(p.category)}</span><span class="project-open">↗</span></div><div class="project-info"><div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.description||"Creative project")}</p></div><span class="project-year">${escapeHTML(p.year||"")}</span></div></article>`;
    }).join("");
    document.getElementById("all-count").textContent=String(projectCache.length).padStart(2,"0");
    document.getElementById("empty-state").hidden=projects.length>0;
    grid.querySelectorAll(".project-card").forEach(card=>card.addEventListener("click",()=>openProject(card.dataset.id)));
  };
  const lightbox=document.getElementById("lightbox"), content=document.getElementById("lightbox-content");
  function openProject(id){
    const p=projectCache.find(x=>String(x.id)===String(id));if(!p)return;
    let media="";
    if(p.image) media=p.kind==="video"?`<video src="${escapeHTML(p.image)}" controls autoplay playsinline></video>`:`<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title)}">`;
    else media=`<div class="image-placeholder" style="width:min(700px,85vw);height:50vh"><span class="placeholder-mark">SM.</span><span class="placeholder-label">${escapeHTML(p.art||p.category)}</span></div>`;
    content.innerHTML=`${media}<h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.category)}${p.description?" · "+escapeHTML(p.description):""}</p>`;
    lightbox.classList.add("open");lightbox.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
  }
  function closeLightbox(){lightbox.classList.remove("open");lightbox.setAttribute("aria-hidden","true");content.innerHTML="";document.body.style.overflow="";}
  document.getElementById("lightbox-close").addEventListener("click",closeLightbox);
  lightbox.addEventListener("click",e=>{if(e.target===lightbox)closeLightbox();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeLightbox();});
  document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));btn.classList.add("active");activeFilter=btn.dataset.filter;render();}));
  (async()=>{projectCache=await getProjects();render();})();
  window.addEventListener("storage",async()=>{projectCache=await getProjects();render();});
}
const menuToggle=document.querySelector(".menu-toggle"), nav=document.querySelector(".desktop-nav");
if(menuToggle&&nav){menuToggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuToggle.setAttribute("aria-expanded",String(open));});nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));}
const year=document.getElementById("year");if(year)year.textContent=new Date().getFullYear();
applyProfile();
