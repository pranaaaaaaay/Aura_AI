import { escapeHTML, formatTime, showToast } from "./utils.js";
import { api, requireLogin } from "./api.js";
let messages=JSON.parse(sessionStorage.getItem("auraChat")||"[]");
if(!messages.length) messages=[{role:"ai",text:"Hello! I'm AURA. Ask me anything.",time:formatTime()}];
function persist(){sessionStorage.setItem("auraChat",JSON.stringify(messages));}
export function renderChat(container){
 if(!requireLogin()) return;
 container.innerHTML=`<div class="view-card chat-layout"><div class="chat-messages" id="chatMessages"></div><form class="chat-composer" id="chatForm"><button type="button" class="icon-btn" id="chatVoiceBtn" title="Use voice"><i class="icon icon-mic"></i></button><input id="chatInput" autocomplete="off" placeholder="Ask AURA anything..." /><button class="send-btn" type="submit"><i class="icon icon-send"></i></button></form></div>`;
 drawMessages();
 document.getElementById("chatForm").onsubmit=async e=>{e.preventDefault();const input=document.getElementById("chatInput"),text=input.value.trim();if(!text)return;messages.push({role:"user",text,time:formatTime()});input.value="";drawMessages();const pending={role:"ai",text:"AURA is thinking…",time:formatTime()};messages.push(pending);drawMessages();try{const data=await api("/chat",{method:"POST",body:JSON.stringify({messages:messages.filter(m=>m!==pending).map(m=>({role:m.role,content:m.text}))})});pending.text=data.content;persist();drawMessages();}catch(err){pending.text="I couldn't reach the AI backend. "+err.message;drawMessages();}};
 document.getElementById("chatVoiceBtn").onclick=()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)return showToast("Speech recognition is not supported in this browser.");const r=new R();r.lang="en-IN";r.onresult=e=>document.getElementById("chatInput").value=e.results[0][0].transcript;r.start();showToast("Listening…");};
}
function drawMessages(){const box=document.getElementById("chatMessages");if(!box)return;box.innerHTML=messages.map(m=>`<div class="message ${m.role}">${escapeHTML(m.text)}<div style="font-size:9px;opacity:.45;margin-top:5px">${m.time}</div></div>`).join("");box.scrollTop=box.scrollHeight;}
export function clearChat(){messages=[{role:"ai",text:"Workspace cleared. What would you like to do?",time:formatTime()}];persist();drawMessages();}
