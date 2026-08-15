// Female talent expansion + casting safety layer.
(() => {
  const women = [
    ['Cate Blanchett',98,93,19000000,['Drama','Fantasy','Thriller']],
    ['Natalie Portman',96,92,17000000,['Drama','Sci-Fi','Thriller']],
    ['Jennifer Lawrence',94,96,22000000,['Drama','Comedy','Action']],
    ['Scarlett Johansson',94,98,25000000,['Action','Sci-Fi','Drama']],
    ['Jessica Chastain',95,88,12000000,['Drama','Thriller','Crime']],
    ['Saoirse Ronan',96,88,10000000,['Drama','Romance','Historical']],
    ['Michelle Williams',96,82,9000000,['Drama','Romance']],
    ['Amy Adams',97,90,14000000,['Drama','Sci-Fi','Thriller']],
    ['Charlize Theron',94,93,18000000,['Action','Drama','Thriller']],
    ['Emily Blunt',94,95,18000000,['Action','Drama','Sci-Fi']],
    ['Viola Davis',98,91,12000000,['Drama','Thriller','Action']],
    ['Jodie Comer',91,87,7000000,['Drama','Thriller','Action']],
    ['Rachel McAdams',91,91,10000000,['Drama','Comedy','Romance']],
    ['Jessica Alba',86,89,8000000,['Action','Drama','Comedy']],
    ['Halle Berry',93,90,11000000,['Action','Drama','Thriller']],
    ['Regina King',96,87,9000000,['Drama','Crime']],
    ['Octavia Spencer',95,84,7000000,['Drama','Comedy','Thriller']],
    ['Tilda Swinton',97,84,8000000,['Drama','Fantasy','Sci-Fi']],
    ['Rachel Zegler',84,88,5000000,['Drama','Musical','Fantasy']],
    ['Jenna Ortega',88,96,9000000,['Horror','Thriller','Drama']],
    ['Sydney Sweeney',86,95,9000000,['Drama','Comedy','Thriller']],
    ['Margaret Qualley',89,87,6000000,['Drama','Thriller','Comedy']],
    ['Ayo Edebiri',88,91,5000000,['Comedy','Drama']],
    ['Mia Goth',90,84,6000000,['Horror','Thriller','Drama']],
    ['Elizabeth Olsen',91,93,12000000,['Drama','Action','Sci-Fi']],
    ['Lupita Nyong’o',95,90,11000000,['Drama','Horror','Sci-Fi']],
    ['Zoe Saldaña',92,96,18000000,['Action','Sci-Fi','Adventure']],
    ['Viola Davis',98,91,12000000,['Drama','Thriller','Action']]
  ];
  function ensure(){
    if(!window.INDUSTRY_PEOPLE)return;
    const a=window.INDUSTRY_PEOPLE.actors||(window.INDUSTRY_PEOPLE.actors=[]);
    for(const w of women){if(!a.some(x=>x.name===w[0]))a.push({name:w[0],role:'Actress',gender:'female',talent:w[1],popularity:w[2],genres:w[4],fee:w[3]});}
  }
  ensure();
  // If the Talent modal is rendered with a stale/empty Actress list, rebuild its
  // actress rows from the same source array used by main.js.
  const observer=new MutationObserver(()=>{
    ensure();
    const tab=[...document.querySelectorAll('[data-cat]')].find(x=>x.dataset.cat==='Actress' && x.classList.contains('active'));
    const list=document.querySelector('#talentList');
    if(!tab||!list)return;
    if(list.querySelector('[data-talent-role="Actress"]'))return;
    const flat=Object.values(window.INDUSTRY_PEOPLE).flat();
    const actresses=flat.map((x,i)=>({x,i})).filter(o=>o.x.role==='Actress');
    const esc=x=>String(x).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
    actresses.slice(0,30).forEach(o=>{const x=o.x;const b=document.createElement('button');b.className='talentRow';b.dataset.talent=String(o.i);b.dataset.talentRole='Actress';b.innerHTML=`<span class="talentAvatar">${esc(x.name[0])}</span><div><em class="talentRoleLabel">🎭 ACTRESS</em><b>${esc(x.name)}</b><small>Actress · ⭐ ${x.talent} · $${(x.fee/1000000).toFixed(1)}M asking</small></div><strong>VIEW →</strong>`;list.appendChild(b);});
  });
  observer.observe(document.body,{childList:true,subtree:true});
})();