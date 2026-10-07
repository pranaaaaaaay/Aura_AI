const API_BASE = window.AURA_API_BASE || "/api";

export function getToken(){ return localStorage.getItem("auraToken") || ""; }
export function setSession(data){ localStorage.setItem("auraToken", data.token); localStorage.setItem("auraUser", JSON.stringify(data.user)); }
export function clearSession(){ localStorage.removeItem("auraToken"); localStorage.removeItem("auraUser"); }
export function getUser(){ try{return JSON.parse(localStorage.getItem("auraUser")||"null")}catch{return null} }
export function requireLogin(){ if(!getToken()){ window.location.href="auth.html"; return false; } return true; }
export async function api(path, options={}){
  const headers={...(options.headers||{})};
  if(options.body && !headers["Content-Type"]) headers["Content-Type"]="application/json";
  const token=getToken(); if(token) headers.Authorization=`Bearer ${token}`;
  const res=await fetch(`${API_BASE}${path}`,{...options,headers});
  let data={}; try{data=await res.json()}catch{}
  if(res.status===401){ clearSession(); if(!location.pathname.endsWith("auth.html")) location.href="auth.html"; }
  if(!res.ok) throw new Error(data.detail||"Request failed");
  return data;
}
