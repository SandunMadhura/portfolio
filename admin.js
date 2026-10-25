const STORAGE_KEY="sm-portfolio-projects-v1", PROFILE_KEY="sm-portfolio-profile-v1";
const sampleProjects=[
{id:"sample-1",title:"Midnight Sessions",category:"Flyers",description:"Event campaign · Art direction",year:"2025",image:"",kind:"image",sample:true,art:"MIDNIGHT"},
{id:"sample-2",title:"Good Things Daily",category:"Social Media",description:"Social campaign · Visual design",year:"2025",image:"",kind:"image",sample:true,art:"GOOD THINGS"},
{id:"sample-3",title:"Form & Field",category:"Packaging",description:"Concept packaging · Branding",year:"2025",image:"",kind:"image",sample:true,art:"FORM / FIELD"},
{id:"sample-4",title:"A New Perspective",category:"Web Design",description:"Landing page · UI design",year:"2025",image:"",kind:"image",sample:true,art:"NEW VIEW"}
];
const $=id=>document.getElementById(id);
const readProjects=()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||sampleProjects}catch{return sampleProjects}};
const writeProjects=p=>localStorage.setItem(STORAGE_KEY,JSON.stringify(p));
const readProfile=()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}")}catch{return {}}};
const safe=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let editingId=null, pendingMedia="";
function renderList(){
  $("admin-project-list").innerHTML=readProjects().map(p=>{
    const thumb=p.image?(p.kind==="video"?`<video src="${safe(p.image)}" muted></video>`:`<img src="${safe(p.image)}" alt="">`):"SM.";
    return `<article class="admin-project-row"><div class="admin-thumb">${thumb}</div><div><h3>${safe(p.title)}</h3><p>${safe(p.category)} · ${safe(p.year||"")} ${p.sample?"· Sample project":""}</p></div><div class="admin-row-actions"><button class="small-button edit" data-id="${safe(p.id)}">Edit</button><button class="small-button delete" data-id="${safe(p.id)}">Delete</button></div></article>`;
  }).join("");
  $("admin-project-list").querySelectorAll(".edit").forEach(b=>b.addEventListener("click",()=>editProject(b.dataset.id)));
  $("admin-project-list").querySelectorAll(".delete").forEach(b=>b.addEventListener("click",()=>deleteProject(b.dataset.id)));
}
function clearForm(){
  editingId=null;pendingMedia="";$("project-form").reset();$("project-id").value="";$("form-title").textContent="New project";$("form-message").textContent="";$("media-file").value="";
}
function editProject(id){
  const p=readProjects().find(x=>x.id===id);if(!p)return;
  editingId=id;pendingMedia=p.image||"";
  $("project-form").hidden=false;$("form-title").textContent="Edit project";
  $("project-id").value=p.id;$("title").value=p.title;$("category").value=p.category;
  $("description").value=p.description||"";$("year").value=p.year||"";
  $("media-url").value=p.image&&/^https?:/i.test(p.image)?p.image:"";
  $("form-message").textContent=p.image&&!/^https?:/i.test(p.image)?"Existing uploaded file is kept unless replaced.":"";
  $("project-form").scrollIntoView({behavior:"smooth",block:"start"});
}
function deleteProject(id){
  const p=readProjects().find(x=>x.id===id);if(!p||!confirm(`Delete "${p.title}"?`))return;
  writeProjects(readProjects().filter(x=>x.id!==id));renderList();
}
$("new-project").addEventListener("click",()=>{$("project-form").hidden=false;clearForm();$("project-form").scrollIntoView({behavior:"smooth",block:"start"});});
$("cancel-form").addEventListener("click",()=>{$("project-form").hidden=true;clearForm();});
$("reset-form").addEventListener("click",clearForm);
$("media-file").addEventListener("change",async e=>{
  const file=e.target.files[0];if(!file)return;
  if(file.size>2*1024*1024){$("form-message").textContent="This local demo accepts files up to 2 MB. Use a hosted media URL for larger files.";e.target.value="";return;}
  pendingMedia=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
  $("media-url").value="";$("form-message").textContent="File selected. Save project to apply it.";
});
$("media-url").addEventListener("input",()=>{if($("media-url").value.trim())pendingMedia=$("media-url").value.trim();});
$("project-form").addEventListener("submit",e=>{
  e.preventDefault();
  const title=$("title").value.trim();if(!title)return;
  const url=$("media-url").value.trim();
  const media=url||pendingMedia||"";
  const kind=(media.startsWith("data:video/")||/\.(mp4|webm|ogg)(\?|$)/i.test(media))?"video":"image";
  const projects=readProjects();
  const item={id:editingId||`project-${Date.now()}`,title,category:$("category").value,description:$("description").value.trim(),year:$("year").value.trim()||String(new Date().getFullYear()),image:media,kind,sample:false};
  const next=editingId?projects.map(p=>p.id===editingId?item:p):[item,...projects.filter(p=>!p.sample)];
  try{writeProjects(next);renderList();clearForm();$("form-message").textContent="Project saved in this browser.";setTimeout(()=>$("project-form").hidden=true,900);}
  catch{ $("form-message").textContent="Storage is full. Try a smaller file or use a hosted media URL."; }
});
document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b===btn));
  $("projects-panel").hidden=btn.dataset.tab!=="projects";$("profile-panel").hidden=btn.dataset.tab!=="profile";
}));
$("profile-form").addEventListener("submit",e=>{
  e.preventDefault();
  const p={email:$("profile-email").value.trim(),whatsapp:$("profile-whatsapp").value.trim(),instagram:$("profile-instagram").value.trim(),behance:$("profile-behance").value.trim()};
  localStorage.setItem(PROFILE_KEY,JSON.stringify(p));$("profile-message").textContent="Profile links saved in this browser.";
});
const profile=readProfile();$("profile-email").value=profile.email||"";$("profile-whatsapp").value=profile.whatsapp||"";$("profile-instagram").value=profile.instagram||"";$("profile-behance").value=profile.behance||"";
renderList();
