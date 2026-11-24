// College Placement System - front-end demo (in-memory data, no backend)
const db = {
  jobs: [
    {id:1, company:'TechNova', title:'Software Engineer', pkg:'8 LPA', minCgpa:7.0, desc:'Build web services in Java/Python.'},
    {id:2, company:'DataWorks', title:'Data Analyst', pkg:'6 LPA', minCgpa:6.5, desc:'SQL, dashboards and reporting.'},
    {id:3, company:'CloudEdge', title:'QA Engineer', pkg:'5 LPA', minCgpa:6.0, desc:'Manual and automated testing.'}
  ],
  apps: [ // {id, jobId, student, cgpa, status}
    {id:1, jobId:1, student:'Soham Jain', cgpa:8.2, status:'Shortlisted'},
    {id:2, jobId:1, student:'Riya Sharma', cgpa:7.4, status:'Applied'},
    {id:3, jobId:2, student:'Soham Jain', cgpa:8.2, status:'Applied'}
  ],
  companies: [
    {name:'TechNova', status:'Approved'}, {name:'DataWorks', status:'Approved'},
    {name:'CloudEdge', status:'Approved'}, {name:'FinSolve', status:'Pending'}
  ],
  students: [
    {name:'Soham Jain', branch:'CSE', cgpa:8.2}, {name:'Riya Sharma', branch:'IT', cgpa:7.4},
    {name:'Kabir Singh', branch:'ECE', cgpa:6.8}
  ]
};
const me = {role:'', name:'Soham Jain', cgpa:8.2, company:'TechNova', resume:''};
let tab = '';
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function toast(msg){const t=$('toast');t.textContent=msg;t.hidden=false;setTimeout(()=>t.hidden=true,2200);}
function login(){
  if(!$('email').value.trim() || !$('pass').value){toast('Enter email and password');return;}
  me.role = $('role').value;
  $('login').hidden = true; $('app').hidden = false;
  $('who').textContent = ({student:me.name, company:me.company, admin:'Placement Officer'})[me.role];
  $('title').textContent = ({student:'Student Dashboard', company:'Company Dashboard', admin:'TPO Dashboard'})[me.role];
  tab = ({student:'jobs', company:'post', admin:'stats'})[me.role];
  render();
}
function logout(){ $('app').hidden = true; $('login').hidden = false; }
function setTab(t){ tab = t; render(); }
function tabs(list){
  return '<div class="tabs">' + list.map(([k,l]) =>
    `<button class="tab ${tab===k?'on':''}" onclick="setTab('${k}')">${l}</button>`).join('') + '</div>';
}
function jobTitle(id){ const j = db.jobs.find(j=>j.id===id); return j ? `${j.title} (${j.company})` : ''; }

function render(){
  const v = $('view');
  if(me.role==='student') v.innerHTML = studentView();
  else if(me.role==='company') v.innerHTML = companyView();
  else v.innerHTML = adminView();
}

/* ---------- Student ---------- */
function studentView(){
  let h = tabs([['jobs','Open jobs'],['mine','My applications'],['profile','Profile & resume']]);
  if(tab==='jobs'){
    const approved = db.companies.filter(c=>c.status==='Approved').map(c=>c.name);
    const list = db.jobs.filter(j=>approved.includes(j.company));
    h += list.length ? list.map(j=>{
      const applied = db.apps.some(a=>a.jobId===j.id && a.student===me.name);
      const eligible = me.cgpa >= j.minCgpa;
      return `<div class="card row"><div><h3>${esc(j.title)} at ${esc(j.company)}</h3>
        <div class="muted">${esc(j.pkg)} - Minimum CGPA ${j.minCgpa}</div><p>${esc(j.desc)}</p></div>
        ${applied ? '<span class="badge">Applied</span>' :
          eligible ? `<button class="btn" onclick="apply(${j.id})">Apply</button>` :
          '<span class="muted">Not eligible (CGPA)</span>'}</div>`;}).join('')
      : '<div class="empty">No open jobs yet. Check back soon.</div>';
  } else if(tab==='mine'){
    const mine = db.apps.filter(a=>a.student===me.name);
    h += mine.length ? '<div class="card"><table><tr><th>Job</th><th>Status</th></tr>' +
      mine.map(a=>`<tr><td>${esc(jobTitle(a.jobId))}</td><td><span class="badge ${a.status}">${a.status}</span></td></tr>`).join('') + '</table></div>'
      : '<div class="empty">You have not applied yet. Open the jobs tab to start.</div>';
  } else {
    h += `<div class="card"><h3>Profile</h3>
      <label>Name <input id="pname" value="${esc(me.name)}"></label>
      <label>CGPA <input id="pcgpa" type="number" step="0.1" min="0" max="10" value="${me.cgpa}"></label>
      <label>Resume (PDF) <input id="presume" type="file" accept=".pdf"></label>
      <p class="muted">${me.resume ? 'Uploaded: '+esc(me.resume) : 'No resume uploaded.'}</p>
      <button class="btn" onclick="saveProfile()">Save profile</button></div>`;
  }
  return h;
}
function apply(id){ db.apps.push({id:Date.now(), jobId:id, student:me.name, cgpa:me.cgpa, status:'Applied'}); toast('Application submitted'); render(); }
function saveProfile(){
  const n=$('pname').value.trim(), c=parseFloat($('pcgpa').value), f=$('presume').files[0];
  if(!n || isNaN(c) || c<0 || c>10){toast('Enter a name and a CGPA between 0 and 10');return;}
  me.name=n; me.cgpa=c; if(f) me.resume=f.name;
  $('who').textContent=n; toast('Profile saved'); render();
}

/* ---------- Company ---------- */
function companyView(){
  let h = tabs([['post','Post a job'],['apps','Applicants']]);
  if(tab==='post'){
    h += `<div class="card"><h3>New job</h3>
      <label>Title <input id="jt"></label><label>Package <input id="jp" placeholder="e.g. 6 LPA"></label>
      <label>Minimum CGPA <input id="jc" type="number" step="0.1" value="6"></label>
      <label>Description <textarea id="jd" rows="3"></textarea></label>
      <button class="btn" onclick="postJob()">Post job</button></div>`;
    h += db.jobs.filter(j=>j.company===me.company).map(j=>`<div class="card"><b>${esc(j.title)}</b> <span class="muted">${esc(j.pkg)}</span></div>`).join('');
  } else {
    const mine = db.jobs.filter(j=>j.company===me.company).map(j=>j.id);
    const list = db.apps.filter(a=>mine.includes(a.jobId));
    h += list.length ? '<div class="card"><table><tr><th>Student</th><th>Job</th><th>CGPA</th><th>Status</th><th></th></tr>' +
      list.map(a=>`<tr><td>${esc(a.student)}</td><td>${esc(jobTitle(a.jobId))}</td><td>${a.cgpa}</td>
        <td><span class="badge ${a.status}">${a.status}</span></td>
        <td><button class="btn small ok" onclick="setStatus(${a.id},'Shortlisted')">Shortlist</button>
        <button class="btn small bad" onclick="setStatus(${a.id},'Rejected')">Reject</button></td></tr>`).join('') + '</table></div>'
      : '<div class="empty">No applicants yet. Post a job to receive applications.</div>';
  }
  return h;
}
function postJob(){
  const t=$('jt').value.trim(), p=$('jp').value.trim(), c=parseFloat($('jc').value);
  if(!t||!p||isNaN(c)){toast('Fill in title, package and CGPA');return;}
  db.jobs.push({id:Date.now(), company:me.company, title:t, pkg:p, minCgpa:c, desc:$('jd').value.trim()});
  toast('Job posted'); render();
}
function setStatus(id,s){ db.apps.find(a=>a.id===id).status=s; toast('Marked '+s.toLowerCase()); render(); }

/* ---------- Admin / TPO ---------- */
function adminView(){
  let h = tabs([['stats','Placement stats'],['companies','Companies'],['students','Students']]);
  if(tab==='stats'){
    const sel = db.apps.filter(a=>a.status==='Shortlisted').length;
    h += `<div class="stats">
      <div class="stat"><b>${db.students.length}</b>Registered students</div>
      <div class="stat"><b>${db.companies.filter(c=>c.status==='Approved').length}</b>Approved companies</div>
      <div class="stat"><b>${db.jobs.length}</b>Jobs posted</div>
      <div class="stat"><b>${sel}</b>Students shortlisted</div></div>
      <div class="card"><h3>Applications per job</h3>` +
      db.jobs.map(j=>{const n=db.apps.filter(a=>a.jobId===j.id).length;
        return `<div class="row"><span>${esc(jobTitle(j.id))}</span><b>${n}</b></div>`;}).join('') + '</div>';
  } else if(tab==='companies'){
    h += '<div class="card"><table><tr><th>Company</th><th>Status</th><th></th></tr>' +
      db.companies.map((c,i)=>`<tr><td>${esc(c.name)}</td><td><span class="badge ${c.status}">${c.status}</span></td>
        <td>${c.status==='Pending' ? `<button class="btn small ok" onclick="approve(${i})">Approve</button>` : ''}</td></tr>`).join('') + '</table></div>';
  } else {
    h += '<div class="card"><table><tr><th>Name</th><th>Branch</th><th>CGPA</th></tr>' +
      db.students.map(s=>`<tr><td>${esc(s.name)}</td><td>${s.branch}</td><td>${s.cgpa}</td></tr>`).join('') + '</table></div>';
  }
  return h;
}
function approve(i){ db.companies[i].status='Approved'; toast('Company approved'); render(); }
