// --- Elements DOM ---
const taskInput=document.getElementById("taskInput");
const addBtn=document.getElementById("addBtn");
const archiveBtn=document.getElementById("archiveBtn");
const tasksContainer=document.getElementById("tasksContainer");
const clearBtn=document.getElementById("clearBtn");
const textInput=document.getElementById("textInput");
const llmSelect=document.getElementById("llmSelect");
const promptsContainer=document.getElementById("promptsContainer");
const copiedMsg=document.getElementById("copiedMsg");

// Module Elements
const jalonsList=document.getElementById("jalonsList");
const generateJalonsBtn=document.getElementById("generateJalonsBtn");
const messagesTable=document.querySelector("#messagesTable tbody");
const generateMailBtn=document.getElementById("generateMailBtn");
const livrablesList=document.getElementById("livrablesList");
const generateLivrableBtn=document.getElementById("generateLivrableBtn");

// --- Data ---
let tasks=JSON.parse(localStorage.getItem("tasks"))||[];
let jalons=[{titre:"Lancer projet",datePrévue:"2025-10-28",sousActions:[{texte:"Créer repo",statut:"à faire"}]}];
let messages=[{destinataire:"client@example.com",sujet:"Résumé projet",texte:"Voici le résumé",envoyé:false}];
let livrables=[{titre:"Rapport Oct",type:"docx",template:{plan:["Intro","Analyse","Conclusion"]}}];

// --- Format date ---
function formatDate(iso){const d=new Date(iso);return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}

// --- Render Tasks ---
function renderTasks(){
  tasksContainer.innerHTML="";
  tasks.forEach((t,i)=>{
    const li=document.createElement("li"); li.className="task-item"; li.textContent=t.text+" (ajoutée le "+t.date.split("T")[0]+")";
    const commentBlock=document.createElement("div"); commentBlock.className="comment-section"; commentBlock.style.display="none";
    const commentInput=document.createElement("input"); commentInput.placeholder="Ajouter un commentaire…";
    const commentBtn=document.createElement("button"); commentBtn.textContent="+";
    commentBtn.addEventListener("click",()=>{
      const val=commentInput.value.trim(); if(val==="") return; if(!t.comments) t.comments=[]; t.comments.push({text:val,date:new Date().toISOString()}); localStorage.setItem("tasks",JSON.stringify(tasks)); commentInput.value=""; renderTasks();
    });
    commentBlock.appendChild(commentInput); commentBlock.appendChild(commentBtn);
    li.appendChild(commentBlock);
    li.addEventListener("click",()=>{ commentBlock.style.display="flex"; });
    tasksContainer.appendChild(li);
  });
}
renderTasks();

// --- Ajouter tâche ---
addBtn.addEventListener("click",()=>{
  const val=taskInput.value.trim(); if(val==="") return; tasks.push({text:val,date:new Date().toISOString(),comments:[]}); localStorage.setItem("tasks",JSON.stringify(tasks)); taskInput.value=""; renderTasks();
});

// --- Nettoyer ---
clearBtn.addEventListener("click",()=>{ if(confirm("Es-tu sûr ?")){ tasks=[]; localStorage.removeItem("tasks"); renderTasks(); }});

// --- Archiver JSON ---
archiveBtn.addEventListener("click",()=>{
  if(tasks.length===0) return alert("Aucune tâche à archiver !");
  const blob=new Blob([JSON.stringify(tasks,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download=`taches_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
});

// --- Prompts (section input) ---
const prompts=[{id:"planifier",label:"Plan",text:"Transforme ces tâches en plan structuré :"}];
prompts.forEach(p=>{
  const btn=document.createElement("button"); btn.textContent=p.label;
  btn.addEventListener("click",()=>{
    const inputText=textInput.value.trim();
    const taskText=tasks.map(t=>{ let s="- "+t.text; if(t.comments?.length){ s+="\n  Commentaires :\n"+t.comments.map(c=>`    - [${formatDate(c.date)}] ${c.text}`).join("\n"); } return s; }).join("\n");
    const combined=p.text+"\n\n"+taskText+(inputText?"\n\n"+inputText:"");
    navigator.clipboard.writeText(combined).then(()=>{ copiedMsg.style.display="block"; setTimeout(()=>copiedMsg.style.display="none",2000); if(llmSelect.value) window.open(llmSelect.value,"_blank"); });
  });
  promptsContainer.appendChild(btn);
});

// --- Modules rendering ---
function renderModules(){
  // Jalons
  jalonsList.innerHTML="";
  jalons.forEach((j,i)=>{
    const li=document.createElement("li"); li.textContent=j.titre; jalonsList.appendChild(li);
  });
  // Messages
  messagesTable.innerHTML="";
  messages.forEach((m,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td><input type="checkbox"></td><td>${m.destinataire}</td><td>${m.sujet}</td><td>${m.texte}</td><td><input type="text" placeholder="Note…"></td>`;
    messagesTable.appendChild(tr);
  });
  // Livrables
  livrablesList.innerHTML="";
  livrables.forEach((l,i)=>{
    const li=document.createElement("li"); li.innerHTML=`<input type="checkbox"> ${l.titre} (${l.type}) <input type="text" placeholder="Note…">`; livrablesList.appendChild(li);
  });
}
renderModules();

// --- Envoyer modules au LLM ---
generateMailBtn.addEventListener("click",()=>{
  const selected=[];
  messagesTable.querySelectorAll("tr").forEach(tr=>{
    const cb=tr.querySelector("input[type=checkbox]");
    if(cb.checked){
      const note=tr.querySelector("input[type=text]").value.trim();
      selected.push({destinataire:tr.cells[1].textContent,sujet:tr.cells[2].textContent,texte:tr.cells[3].textContent,note});
    }
  });
  if(selected.length===0) return alert("Sélectionne au moins un message !");
  navigator.clipboard.writeText(JSON.stringify(selected,null,2)).then(()=>{ if(llmSelect.value) window.open(llmSelect.value,"_blank"); });
});

generateLivrableBtn.addEventListener("click",()=>{
  const selected=[];
  livrablesList.querySelectorAll("li").forEach(li=>{
    const cb=li.querySelector("input[type=checkbox]");
    if(cb.checked){
      const note=li.querySelector("input[type=text]").value.trim();
      selected.push({titre:li.textContent,note});
    }
  });
  if(selected.length===0) return alert("Sélectionne au moins un livrable !");
  navigator.clipboard.writeText(JSON.stringify(selected,null,2)).then(()=>{ if(llmSelect.value) window.open(llmSelect.value,"_blank"); });
});
