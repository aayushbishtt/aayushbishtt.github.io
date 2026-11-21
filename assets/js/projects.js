import{PROJECTS as i}from"./data.js";const j={graph:"fa-diagram-project",scissors:"fa-scissors",lock:"fa-lock",brain:"fa-brain",heartbeat:"fa-heart-pulse",radiation:"fa-radiation",chat:"fa-comments",cloud:"fa-cloud",plane:"fa-plane"},b=5,h=3;function M(){const t=[];for(let a=0;a<b;a++)for(let s=0;s<b;s++)t.push({r:a,c:s,val:1+Math.floor(Math.random()*9)});return t}function k(t){const a=document.getElementById("project-card");a&&(a.innerHTML=`
    <div class="project-icon"><i class="fas ${j[t.icon]||"fa-code"}"></i></div>
    <div>
      <div class="project-body-top">
        <div>
          <div class="project-context">${t.context}</div>
          <h3>${t.title}</h3>
        </div>
        ${t.badge?`<span class="project-badge">${t.badge}</span>`:""}
      </div>
      <p>${t.description}</p>
      <div class="project-tags">${t.tags.map(s=>`<span class="tag">${s}</span>`).join("")}</div>
      <a class="project-repo-link" href="${t.repo}" target="_blank" rel="noopener">
        View on GitHub <i class="fas fa-arrow-up-right-from-square" style="font-size:11px;"></i>
      </a>
    </div>
  `)}export function initProjects(){const t=document.getElementById("conv-grid"),a=document.getElementById("conv-output"),s=document.getElementById("conv-replay-btn");if(!t||!a)return;const L=M();t.innerHTML=L.map(e=>`<div class="conv-cell" data-r="${e.r}" data-c="${e.c}">${e.val}</div>`).join("");const $=t.querySelectorAll(".conv-cell");a.innerHTML=i.map((e,n)=>`
    <button class="conv-output-cell" role="tab" data-index="${n}" aria-selected="false" aria-label="${e.title}">
      ${e.id}
    </button>`).join("");const f=a.querySelectorAll(".conv-output-cell");let p=0;function v(e,n){$.forEach(o=>{const c=Number(o.dataset.r),E=Number(o.dataset.c),C=c>=e&&c<e+h&&E>=n&&E<n+h;o.classList.toggle("kernel",C)})}function r(e){p=e;const n=i[e];f.forEach((o,c)=>{o.classList.toggle("active",c===e),o.setAttribute("aria-selected",c===e?"true":"false")}),v(n.pos[0],n.pos[1]),k(n)}const y=3200,m=window.matchMedia("(prefers-reduced-motion: reduce)").matches;let l=null,g=m;function d(){g||l||(l=setInterval(()=>r((p+1)%i.length),y))}function u(){clearInterval(l),l=null}function I(){g=!0,u()}f.forEach(e=>{const n=Number(e.dataset.index);e.addEventListener("mouseenter",()=>r(n)),e.addEventListener("click",()=>{I(),r(n)}),e.addEventListener("focus",()=>r(n))}),a.addEventListener("mouseenter",u),a.addEventListener("mouseleave",d),a.addEventListener("focusin",u),a.addEventListener("focusout",d),r(0),d(),s?.addEventListener("click",()=>{if(m)return;u();let e=0;s.disabled=!0;const n=()=>{if(v(i[e].pos[0],i[e].pos[1]),e++,e<i.length)setTimeout(n,260);else{s.disabled=!1;const o=[...f].findIndex(c=>c.classList.contains("active"));r(o>=0?o:0),d()}};n()})}
