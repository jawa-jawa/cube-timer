const select=document.getElementById('modeSelect');
const page=location.pathname.split('/').pop()||'index.html';
select.value=['index.html','practice.html','quiz.html'].includes(page)?page:'index.html';
select.addEventListener('change',()=>{if(document.body.classList.contains('running')){select.value=page;return;}location.href='./'+select.value;});
function sync(){select.disabled=document.body.classList.contains('running');}
new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});sync();
