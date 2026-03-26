window.SUPABASE_URL = "https://ghqbtbkzosqhmvsnejoj.supabase.co";
window.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_tO6-VKSzsALVV4eKA0RSjg_34Tfl8Ld";
window.ADMIN_EMAIL = "tyascg@gmail.com";

const AuthUI = (() => {
  let supabaseClient = null;
  let currentUser = null;
  let currentProfile = null;

  async function waitForSupabase(maxTries = 40, interval = 250) {
    return new Promise((resolve, reject) => {
      let tries = 0;
      const timer = setInterval(() => {
        tries += 1;
        if (window.supabase && typeof window.supabase.createClient === "function") {
          clearInterval(timer);
          resolve();
        } else if (tries >= maxTries) {
          clearInterval(timer);
          reject(new Error("Supabase load timeout"));
        }
      }, interval);
    });
  }

  async function getClient() {
    if (supabaseClient) return supabaseClient;

    await waitForSupabase();
    supabaseClient = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    );
    return supabaseClient;
  }

  function getRoleFromEmail(email = "") {
    return email === window.ADMIN_EMAIL ? "admin" : "member";
  }

  async function ensureProfile(user) {
    if (!user) return null;
    const client = await getClient();

    const role = getRoleFromEmail(user.email || "");
    const fallbackName = (user.email || "member").split("@")[0].slice(0, 24);

    const { data: existing, error: readError } = await client
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (readError) {
      console.error("Profile read error:", readError);
      return null;
    }

    if (existing) {
      const updates = {};
      if (!existing.email) updates.email = user.email;
      if (!existing.display_name) updates.display_name = fallbackName;
      if (existing.role !== role) updates.role = role;

      if (Object.keys(updates).length > 0) {
        const { data: updated } = await client
          .from("user_profiles")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", user.id)
          .select()
          .single();

        return updated || existing;
      }

      return existing;
    }

    const { data: inserted, error: insertError } = await client
      .from("user_profiles")
      .insert([{
        id: user.id,
        email: user.email,
        display_name: fallbackName,
        bio: "",
        avatar_url: "",
        role
      }])
      .select()
      .single();

    if (insertError) {
      console.error("Profile insert error:", insertError);
      return null;
    }

    return inserted;
  }

  async function refreshSession() {
    const client = await getClient();
    const { data, error } = await client.auth.getUser();

    if (error) {
      console.error("getUser error:", error);
      currentUser = null;
      currentProfile = null;
      return { user: null, profile: null, role: "guest" };
    }

    currentUser = data?.user || null;

    if (!currentUser) {
      currentProfile = null;
      return { user: null, profile: null, role: "guest" };
    }

    currentProfile = await ensureProfile(currentUser);

    return {
      user: currentUser,
      profile: currentProfile,
      role: currentProfile?.role || getRoleFromEmail(currentUser.email || "")
    };
  }

  function renderHeaderAuth(session) {
    const guestEl = document.getElementById("authGuest");
    const memberEl = document.getElementById("authMember");
    const nameEl = document.getElementById("authMemberName");
    const roleEl = document.getElementById("authMemberRole");

    if (!guestEl || !memberEl) return;

    if (!session.user) {
      guestEl.style.display = "flex";
      memberEl.style.display = "none";
      return;
    }

    guestEl.style.display = "none";
    memberEl.style.display = "flex";

    const displayName =
      session.profile?.display_name ||
      (session.user.email ? session.user.email.split("@")[0] : "member");

    if (nameEl) nameEl.textContent = displayName;
    if (roleEl) roleEl.textContent = session.role === "admin" ? "Admin" : "Member";
  }

  async function initHeaderAuth() {
    const client = await getClient();
    const session = await refreshSession();
    renderHeaderAuth(session);

    const signOutBtn = document.getElementById("authSignOutBtn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", async () => {
        await client.auth.signOut();
        window.location.href = "index.html";
      });
    }

    client.auth.onAuthStateChange(async () => {
      const updated = await refreshSession();
      renderHeaderAuth(updated);
    });

    return {
      supabase: client,
      getSession: () => ({
        user: currentUser,
        profile: currentProfile,
        role: currentProfile?.role || (currentUser ? getRoleFromEmail(currentUser.email || "") : "guest")
      })
    };
  }

  async function signUp(email, password, displayName = "") {
    const client = await getClient();
    const { error } = await client.auth.signUp({ email, password });
    if (error) throw error;

    const session = await refreshSession();

    if (session.user && displayName) {
      await client
        .from("user_profiles")
        .update({
          display_name: displayName.slice(0, 24),
          updated_at: new Date().toISOString()
        })
        .eq("id", session.user.id);
    }

    return refreshSession();
  }

  async function signIn(email, password) {
    const client = await getClient();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return refreshSession();
  }

  async function initAuthPage() {
    await getClient();

    const modeTabs = document.querySelectorAll("[data-auth-mode]");
    const signUpFields = document.getElementById("signUpFields");
    const titleEl = document.getElementById("authPageTitle");
    const descEl = document.getElementById("authPageDesc");
    const form = document.getElementById("authForm");
    const emailEl = document.getElementById("authEmail");
    const passwordEl = document.getElementById("authPassword");
    const displayNameEl = document.getElementById("authDisplayName");
    const submitEl = document.getElementById("authSubmit");
    const statusEl = document.getElementById("authPageStatus");

    let mode = "signin";

    function applyMode(nextMode) {
      mode = nextMode;

      modeTabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.authMode === mode);
      });

      if (mode === "signin") {
        signUpFields.style.display = "none";
        titleEl.textContent = "登入來開始你的旅程";
        descEl.textContent = "進入 XS UTOPIA，開始你的連結、參與與探索。";
        submitEl.textContent = "開始旅程";
      } else {
        signUpFields.style.display = "block";
        titleEl.textContent = "建立你的存在";
        descEl.textContent = "成為會員後，你可以留言、刪除自己的留言，並參與合作與生態內容發表。";
        submitEl.textContent = "建立存在";
      }

      statusEl.textContent = "";
    }

    modeTabs.forEach((tab) => {
      tab.addEventListener("click", () => applyMode(tab.dataset.authMode));
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      submitEl.disabled = true;
      statusEl.textContent = mode === "signin" ? "登入中..." : "建立帳號中...";

      try {
        if (mode === "signin") {
          await signIn(emailEl.value.trim(), passwordEl.value);
          window.location.href = "index.html";
        } else {
          await signUp(
            emailEl.value.trim(),
            passwordEl.value,
            displayNameEl.value.trim()
          );
          statusEl.textContent = "帳號已建立。如果你有開啟 Email 驗證，請先去信箱確認。";
          applyMode("signin");
        }
      } catch (err) {
        console.error(err);
        statusEl.textContent = err.message || "登入或註冊失敗。";
      } finally {
        submitEl.disabled = false;
      }
    });

    applyMode("signin");
  }

  function initReveal() {
    const targets = document.querySelectorAll(".reveal");
    if (!targets.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    targets.forEach((el) => io.observe(el));
  }

  return {
    initHeaderAuth,
    initAuthPage,
    initReveal
  };
})();