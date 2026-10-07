import { showToast } from "./utils.js";
export function renderYouTube(container){
 container.innerHTML=`<div class="view-card"><h3>YouTube</h3><p class="sub">Search and go directly to YouTube. Voice commands use the same action.</p><form id="ytForm" class="chat-composer"><input id="ytQuery" placeholder="Search YouTube…"/><button class="send-btn" type="submit"><i class="icon icon-search"></i></button></form><div id="ytStatus" class="result-box" style="margin-top:14px">Type a search and AURA will open YouTube.</div></div>`;
 document.getElementById("ytForm").onsubmit=e=>{e.preventDefault();const q=document.getElementById("ytQuery").value.trim();if(!q)return showToast("Enter a search.");openYouTube(q);};
}
export function openYouTube(q){window.location.href=`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;}
