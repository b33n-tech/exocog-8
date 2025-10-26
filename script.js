// --- Elements ---
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const archiveBtn = document.getElementById("archiveBtn");
const tasksContainer = document.getElementById("tasksContainer");
const copiedMsg = document.getElementById("copiedMsg");
const pasteJson = document.getElementById("pasteJson");
const llmSelect = document.getElementById("llmSelect");
const promptsContainer = document.getElementById("promptsContainer");
const clearBtn = document.getElementById("clearBtn");

// --- Stockage ---
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// --- Render tasks ---
function renderTasks(){
  tasksContainer.innerHTML="";
  tasks.forEach((t,i)=>{
    const li=document.createElement("li");
    li.className="task-item";
    li.textContent=t.text;
    
    const commentDiv=document.createElement("div");
    commentDiv.className="comment-section";
    commentDiv.style.display="flex";

    const commentInput=document.createElement("input");
    commentInput.placeholder="Ajouter un commentaire…";
    const commentBtn=document.createElement("button");
    commentBtn.textContent="+";
    commentBtn.addEventListener("click",()=>{
      const val=commentInput.value.trim();
      if(val!==""){
        if(!t.comments) t.comments=[];
        t.comments.push({text:val,date:new Date().toISOString()});
        localStorage.setItem("tasks",JSON.stringify(tasks));
        commentInput.value="";
        renderTasks();
      }
    });
    commentDiv.appendChild(commentInput);
    commentDiv.appendChild(commentBtn);
    li.appendChild(commentDiv);
    tasksContainer.appendChild(li);
  });
}

// --- Ajouter tâche ---
addBtn.addEventListener("click",()=>{
  const text=taskInput.value.trim();
  if(text!==""){
    tasks.push({text,date:new Date().toISOString(),comments:[]});
    localStorage.setItem("tasks",JSON.stringify(tasks));
    taskInput.value="";
    renderTasks();
  }
});

// --- Tout nettoyer ---
clearBtn.addEventListener("click",()=>{
  if(confirm("Es-tu sûr ?")) { tasks=[]; localStorage.removeItem("tasks"); renderTasks(); }
});

// --- Archiver JSON ---
archiveBtn.addEventListener("click",()=>{
  if(tasks.length===0){ alert("Aucune tâche !"); return; }
  const blob=new Blob([JSON.stringify(tasks,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`taches_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
});

// --- Prompts ---
const prompts=[
  {id:"planifier", label:"Plan", text:"Transforme ces tâches en plan structuré étape par étape :"},
  {id:"prioriser", label:"Priorité", text:"Classe ces tâches par ordre de priorité et urgence :"},
  {id:"categoriser", label:"Catégories", text:"Range ces tâches dans des catégories logiques :"}
];
prompts.forEach(p=>{
  const btn=document.createElement("button");
  btn.textContent=p.label;
  btn.addEventListener("click",()=>{
    const combined=p.text+"\n\n"+tasks.map(t=>{
      let str="- "+t.text;
      if(t.comments?.length){
        str+="\n  Commentaires:\n"+t.comments.map(c=>`    - [${c.date}] ${c.text}`).join("\n");
      }
      return str;
    }).join("\n");
    navigator.clipboard.writeText(combined).then(()=>{
      copiedMsg.style.display="block";
      setTimeout(()=>copiedMsg.style.display="none",2000);
      window.open(llmSelect.value,"_blank");
    });
  });
  promptsContainer.appendChild(btn);
});

// --- Initial render ---
renderTasks();
