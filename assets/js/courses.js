import{COURSES as l}from"./data.js";function u(c,s){c.innerHTML=`
    <h3>${s.title}</h3>
    <div class="org">${s.org}</div>
    ${s.when?`<div class="when">${s.when}</div>`:""}
    <ul class="course-list">
      ${s.courses.map((n,r)=>`<li style="animation-delay:${r*40}ms">${n}</li>`).join("")}
    </ul>
  `}export function initCourses(c,s){const n=document.getElementById(c),r=document.getElementById(s);if(!n||!r)return;n.innerHTML=l.map((e,t)=>`
      <button class="course-tab" type="button" role="tab" data-i="${t}"
              aria-selected="${t===0}" aria-controls="${s}">
        <span class="name">${e.tab}</span>
        <span class="org">${e.tabOrg}</span>
      </button>`).join("");const o=Array.from(n.querySelectorAll(".course-tab"));function i(e){o.forEach((t,a)=>{t.classList.toggle("active",a===e),t.setAttribute("aria-selected",String(a===e))}),u(r,l[e])}o.forEach(e=>{const t=Number(e.dataset.i);e.addEventListener("mouseenter",()=>i(t)),e.addEventListener("click",()=>i(t)),e.addEventListener("focus",()=>i(t)),e.addEventListener("keydown",a=>{a.key==="ArrowRight"?(a.preventDefault(),o[Math.min(o.length-1,t+1)].focus()):a.key==="ArrowLeft"&&(a.preventDefault(),o[Math.max(0,t-1)].focus())})}),i(0)}
