window.onload = () => {
  setTimeout(()=>{
    const o = document.getElementById("opening");
    if(o){
      o.style.opacity = 0;
      setTimeout(()=>o.remove(),1000);
    }
  },1500);
};

let lang = "en";

function toggleLang(){
  lang = lang==="en" ? "zh" : "en";

  document.querySelectorAll("[data-en]").forEach(el=>{
    el.innerText = lang==="en" ? el.dataset.en : el.dataset.zh;
  });
}