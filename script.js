// --- Éléments DOM ---
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const archiveBtn = document.getElementById("archiveBtn");
const tasksContainer = document.getElementById("tasksContainer");
const clearBtn = document.getElementById("clearBtn");
const textInput = document.getElementById("textInput");
const llmSelect = document.getElementById("llmSelect");
const promptsContainer = document.getElementById("promptsContainer");
const copiedMsg = document.getElementById("copiedMsg");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// --- Format date ---
function formatDate(iso){
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// --- Render Tasks ---
function renderTasks(){
  tasksContainer.innerHTML="";
  tasks.forEach((t,i)=>{
    const li = document.createElement("li");
    li.className="task-item";
    li.textContent=t.text+" (ajoutée le "+t.date.split("T")[0]+")";

    const commentBlock = document.createElement("div");
    commentBlock.className="comment-section";
    commentBlock.style.display="none";

    const commentInput = document.createElement("input");
    commentInput.placeholder="Ajouter un commentaire…";
    const commentBtn = document.createElement("button");
    commentBtn.textContent="+";
    commentBtn.addEventListener("click",()=>{
      const val = commentInput.value.trim();
      if(val==="") return;
      if(!t.comments) t.comments=[];
      t.comments.push({text:val,date:new Date().toISOString()});
      localStorage.setItem("tasks",JSON.stringify(tasks));
      commentInput.value="";
      renderTasks();
    });
    commentBlock.appendChild(commentInput);
    commentBlock.appendChild(commentBtn);

    li.appendChild(commentBlock);
    li.addEventListener("click", ()=>{
      commentBlock.style.display = "flex";
    });

    tasksContainer.appendChild(li);
  });
}
renderTasks();

// --- Ajouter tâche ---
addBtn.addEventListener("click",()=>{
  const val=taskInput.value.trim();
  if(val==="") return;
  tasks.push({text:val,date:new Date().toISOString(),comments:[]});
  localStorage.setItem("tasks",JSON.stringify(tasks));
  taskInput.value="";
  renderTasks();
});

// --- Nettoyer ---
clearBtn.addEventListener("click",()=>{
  if(confirm("Es-tu sûr ?")){ tasks=[]; localStorage.removeItem("tasks"); renderTasks();}
});

// --- Archiver JSON ---
archiveBtn.addEventListener("click",()=>{
  if(tasks.length===0) return alert("Aucune tâche à archiver !");
  const blob = new Blob([JSON.stringify(tasks,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url;
  a.download=`taches_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// --- Prompts ---
const prompts = [
  {id:"planifier",label:"Plan",text:"Transforme ces tâches en plan structuré étape par étape :"},
  {id:"prioriser",label:"Priorité",text:"Classe ces tâches par ordre de priorité et urgence :"},
  {id:"categoriser",label:"Catégories",text:"Range ces tâches dans des catégories logiques :"}
];
prompts.forEach(p=>{
  const btn=document.createElement("button");
  btn.textContent=p.label;
  btn.addEventListener("click",()=>{
    const inputText=textInput.value.trim();
    const taskText=tasks.map(t=>{
      let s="- "+t.text;
      if(t.comments?.length){
        s+="\n  Commentaires :\n"+t.comments.map(c=>`    - [${formatDate(c.date)}] ${c.text}`).join("\n");
      }
      return s;
    }).join("\n");
    const combined=p.text+"\n\n"+taskText+(inputText? "\n\n"+inputText:"");

    navigator.clipboard.writeText(combined).then(()=>{
      copiedMsg.style.display="block";
      setTimeout(()=>copiedMsg.style.display="none",2000);
      if(llmSelect.value) window.open(llmSelect.value,"_blank");
    });
  });
  promptsContainer.appendChild(btn);
});
