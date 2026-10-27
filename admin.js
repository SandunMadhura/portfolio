const STORAGE_KEY="sm-portfolio-projects-v1", PROFILE_KEY="sm-portfolio-profile-v1";
const $=id=>document.getElementById(id), client=window.portfolioSupabase, cfg=window.PORTFOLIO_CONFIG||{};
const safe=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let editingId=null, pendingFile=null, existingMedia="", currentUser=null, projectsCache=[];
function setStatus(msg){$("form-message").textContent=msg;}
function adminAllowed(user){return Boolean(user&&cfg.adminEmail&&user.email&&user.email.toLowerCase()===cfg.adminEmail.toLowerCase());}
function showDashboard(show){$("admin-content").hidden=!show;$("auth-panel").hidden=show;}
function showAuth(){showDashboard(false);$("auth-message").textContent="Sign in with the admin email configured in config.js.";}
async function ensureAdmin(){
  if(!client){$("auth-message").textContent="First configure Supabase URL and anon key in config.js, then run the SQL from supabase-setup.sql.";showAuth();return;}
  const {data:{session}}=await client.auth.getSession();
  if(session&&adminAllowed(session.user)){currentUser=session.user;showDashboard(true);await loadProjects();await loadProfileForm();}
  else {if(session)await client.auth.signOut();showAuth();}
}
$("admin-login-form").addEventListener("submit",async e=>{
  e.preventDefault();
  if(!client){$("auth-message").textContent="Supabase is not configured yet. Fill config.js first.";return;}
  $("auth-message").textContent="Signing in…";
  const {error}=await client.auth.signInWithPassword({email:$("login-email").value.trim(),password:$("login-password").value});
  if(error){$("auth-message").textContent=error.message;return;}
  const {data:{user}}=await client.auth.getUser();
  if(!adminAllowed(user)){await client.auth.signOut();$("auth-message").textContent="This account is not the configured admin email.";return;}
  currentUser=user;showDashboard(true);await loadProjects();await loadProfileForm();
});
$("logout-button").addEventListener("click",async()=>{if(client)await client.auth.signOut();currentUser=null;showAuth();});
async function loadProjects(){
  if(!client){projectsCache=[];renderList();return;}
  const {data,error}=await client.from("projects").select("*").order("created_at",{ascending:false});
  if(error){$("admin-project-list").innerHTML=`<p class="form-message">Could not load projects: ${safe(error.message)}. Check the setup SQL and RLS policies.</p>`;return;}
  projectsCache=(data||[]).map(p=>({id:p.id,title:p.title,category:p.category,description:p.description||"",year:p.year||"",image:p.media_url||"",kind:p.media_type||"image",storage_path:p.storage_path||""}));
  renderList();
}
function renderList(){
  $("admin-project-list").innerHTML=projectsCache.map(p=>{
    const thumb=p.image?(p.kind==="video"?`<video src="${safe(p.image)}" muted></video>`:`<img src="${safe(p.image)}" alt="">`):"SM.";
    return `<article class="admin-project-row"><div class="admin-thumb">${thumb}</div><div><h3>${safe(p.title)}</h3><p>${safe(p.category)} · ${safe(p.year||"")}</p></div><div class="admin-row-actions"><button class="small-button edit" data-id="${safe(p.id)}">Edit</button><button class="small-button delete" data-id="${safe(p.id)}">Delete</button></div></article>`;
  }).join("");
  $("admin-project-list").querySelectorAll(".edit").forEach(b=>b.addEventListener("click",()=>editProject(b.dataset.id)));
  $("admin-project-list").querySelectorAll(".delete").forEach(b=>b.addEventListener("click",()=>deleteProject(b.dataset.id)));
}
function clearForm(){
  editingId=null;pendingFile=null;existingMedia="";$("project-form").reset();$("project-id").value="";
  $("form-title").textContent="New project";setStatus("");$("media-file").value="";
}
function editProject(id){
  const p=projectsCache.find(x=>String(x.id)===String(id));if(!p)return;
  editingId=id;pendingFile=null;existingMedia=p.image||"";
  $("project-form").hidden=false;$("form-title").textContent="Edit project";
  $("project-id").value=p.id;$("title").value=p.title;$("category").value=p.category;
  $("description").value=p.description||"";$("year").value=p.year||"";
  $("media-url").value=p.image||"";$("form-message").textContent="Choose a new file to replace the current media, or keep the existing URL.";
  $("project-form").scrollIntoView({behavior:"smooth",block:"start"});
}
async function removeStorageFile(path){
  if(!path)return;
  const {error}=await client.storage.from("portfolio-media").remove([path]);
  if(error)console.warn("Storage cleanup failed:",error.message);
}
async function deleteProject(id){
  const p=projectsCache.find(x=>String(x.id)===String(id));if(!p||!confirm(`Delete "${p.title}"?`))return;
  const {error}=await client.from("projects").delete().eq("id",id);
  if(error){alert("Could not delete project: "+error.message);return;}
  await removeStorageFile(p.storage_path);await loadProjects();
}
$("new-project").addEventListener("click",()=>{$("project-form").hidden=false;clearForm();$("project-form").scrollIntoView({behavior:"smooth",block:"start"});});
$("cancel-form").addEventListener("click",()=>{$("project-form").hidden=true;clearForm();});
$("reset-form").addEventListener("click",clearForm);
$("media-file").addEventListener("change",e=>{
  const file=e.target.files[0];if(!file)return;
  if(!file.type.startsWith("image/")&&!file.type.startsWith("video/")){setStatus("Choose an image or video file.");e.target.value="";return;}
  if(file.size>50*1024*1024){setStatus("File is larger than 50 MB. Please compress it and try again.");e.target.value="";return;}
  pendingFile=file;$("media-url").value="";setStatus("File selected. Click Save project to upload it.");
});
$("media-url").addEventListener("input",()=>{if($("media-url").value.trim())pendingFile=null;});
$("project-form").addEventListener("submit",async e=>{
  e.preventDefault();if(!client||!currentUser||!adminAllowed(currentUser)){setStatus("Please sign in as the configured admin.");return;}
  const title=$("title").value.trim();if(!title)return;
  const url=$("media-url").value.trim();let mediaUrl=url||existingMedia,storagePath="";
  const old=projectsCache.find(p=>String(p.id)===String(editingId));
  if(pendingFile){
    const ext=(pendingFile.name.split(".").pop()||"bin").toLowerCase().replace(/[^a-z0-9]/g,"");
    storagePath=`${currentUser.id}/${crypto.randomUUID()}.${ext}`;
    setStatus("Uploading media to Supabase Storage…");
    const {error:uploadError}=await client.storage.from("portfolio-media").upload(storagePath,pendingFile,{upsert:false,contentType:pendingFile.type||undefined});
    if(uploadError){setStatus("Upload failed: "+uploadError.message);return;}
    const {data}=client.storage.from("portfolio-media").getPublicUrl(storagePath);mediaUrl=data.publicUrl;
  } else if(old&&old.storage_path) storagePath=old.storage_path;
  const kind=(pendingFile?pendingFile.type.startsWith("video/"):(/\.(mp4|webm|ogg)(\?|$)/i.test(mediaUrl||"")) )?"video":"image";
  const record={title,category:$("category").value,description:$("description").value.trim(),year:$("year").value.trim()||String(new Date().getFullYear()),media_url:mediaUrl||null,media_type:kind,storage_path:storagePath||null};
  setStatus("Saving project…");
  let result;
  if(editingId)result=await client.from("projects").update(record).eq("id",editingId);
  else result=await client.from("projects").insert(record);
  if(result.error){if(pendingFile)await removeStorageFile(storagePath);setStatus("Save failed: "+result.error.message);return;}
  if(pendingFile&&old&&old.storage_path&&old.storage_path!==storagePath)await removeStorageFile(old.storage_path);
  await loadProjects();clearForm();setStatus("Project saved online. Visitors can now see it.");setTimeout(()=>$("project-form").hidden=true,1000);
});
document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b===btn));
  $("projects-panel").hidden=btn.dataset.tab!=="projects";$("profile-panel").hidden=btn.dataset.tab!=="profile";
}));
async function loadProfileForm(){
  let p={};
  if(client){const {data,error}=await client.from("site_profile").select("*").eq("id",1).maybeSingle();if(!error&&data)p=data;}
  $("profile-email").value=p.email||"";$("profile-whatsapp").value=p.whatsapp||"";$("profile-instagram").value=p.instagram||"";$("profile-behance").value=p.behance||"";
}
$("profile-form").addEventListener("submit",async e=>{
  e.preventDefault();if(!client||!currentUser||!adminAllowed(currentUser))return;
  const p={id:1,email:$("profile-email").value.trim(),whatsapp:$("profile-whatsapp").value.trim(),instagram:$("profile-instagram").value.trim(),behance:$("profile-behance").value.trim()};
  const {error}=await client.from("site_profile").upsert(p,{onConflict:"id"});
  $("profile-message").textContent=error?"Save failed: "+error.message:"Profile links saved online.";
});
ensureAdmin();
