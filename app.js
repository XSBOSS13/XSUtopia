window.addEventListener("load", () => {
  const opening = document.getElementById("opening");
  if (opening) {
    setTimeout(() => {
      opening.style.opacity = "0";
      setTimeout(() => opening.remove(), 1000);
    }, 1700);
  }
});

const i18n = {
  en: {
    nav_home: "Home",
    nav_world: "World",
    nav_commons: "Commons",
    nav_partners: "Partners",
    nav_store: "Store",
    nav_join: "Join",
    footer_text: "A free aesthetic platform for thought, community, partner spaces, and cultural ecology.",
    cta_join: "Join / Contact",
    cta_ig: "Instagram"
  },
  zh: {
    nav_home: "首頁",
    nav_world: "世界觀",
    nav_commons: "公共社群",
    nav_partners: "合作商店",
    nav_store: "生態商店",
    nav_join: "加入平台",
    footer_text: "一個關於思想、社群、合作空間與文化生態的自由美學平台。",
    cta_join: "加入 / 聯繫",
    cta_ig: "Instagram"
  }
};

let currentLang = localStorage.getItem("xs_lang") || "zh";

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem("xs_lang", lang);
  document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (i18n[lang] && i18n[lang][key]) el.textContent = i18n[lang][key];
  });

  document.querySelectorAll("[data-lang-en][data-lang-zh]").forEach((el) => {
    el.innerHTML = lang === "en" ? el.dataset.langEn : el.dataset.langZh;
  });

  const toggle = document.getElementById("langToggle");
  if (toggle) toggle.textContent = lang === "en" ? "中文" : "EN";
}

function toggleLang() {
  applyLang(currentLang === "en" ? "zh" : "en");
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("langToggle");
  if (toggle) toggle.addEventListener("click", toggleLang);
  applyLang(currentLang);

  const page = document.body.dataset.page;
  if (page) {
    const active = document.querySelector(`.nav-links a[data-page="${page}"]`);
    if (active) active.classList.add("active");
  }
});