import {api,setSession,getToken} from "./api.js";
if(getToken()) location.href="index.html";
const form=document.getElementById("authForm"), nameField=document.getElementById("nameField"), loginTab=document.getElementById("loginTab"), signupTab=document.getElementById("signupTab"), submit=document.getElementById("submitBtn"), msg=document.getElementById("authMessage");
let mode="login";
function setMode(next){mode=next; nameField.style.display=mode==="signup"?"block":"none"; loginTab.classList.toggle("active",mode==="login"); signupTab.classList.toggle("active",mode==="signup"); submit.textContent=mode==="login"?"Login":"Create account"; document.getElementById("password").autocomplete=mode==="login"?"current-password":"new-password"; msg.style.display="none";}
loginTab.onclick=()=>setMode("login"); signupTab.onclick=()=>setMode("signup");
form.onsubmit=async e=>{e.preventDefault(); msg.style.display="none"; submit.disabled=true; try{const data=await api(`/auth/${mode}`,{method:"POST",body:JSON.stringify({name:document.getElementById("name").value,email:document.getElementById("email").value,password:document.getElementById("password").value})}); setSession(data); location.href="index.html";}catch(err){msg.textContent=err.message;msg.style.display="block";}finally{submit.disabled=false;}};
