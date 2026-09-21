/* =====================================================
   জ্ঞানতরঙ্গ — shared helpers (একটাই উৎস, সব পেজ ব্যবহার করবে)
   Fee, Registration Status, তারিখ, আইকন — এখানে একবারই লেখা।
   ===================================================== */

/* ---------- Text / URL safety ---------- */
export function escapeHtml(value){
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

export function safeUrl(value){
  const v = String(value ?? "").trim();
  return /^https?:\/\//i.test(v) ? v : "";
}

/* শুরুর ইমোজি/চিহ্ন সরিয়ে দেয় (যেমন "🌙 ইসলামিক জ্ঞান" → "ইসলামিক জ্ঞান") */
export function stripLeadingEmoji(value){
  return String(value ?? "").replace(/^(?:[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D\s])+/u, "").trim();
}

/* ---------- Quiz data helpers ---------- */

/* Fee: Quiz Management শুধু registration_fee সেভ করে। পুরোনো ডেটার জন্য fee / price fallback। */
export function getFee(quiz){
  const n = Number(quiz?.registration_fee ?? quiz?.fee ?? quiz?.price ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function toMillis(value){
  if(!value) return NaN;
  if(typeof value === "object" && typeof value.toDate === "function") return value.toDate().getTime();
  if(typeof value === "object" && typeof value.toMillis === "function") return value.toMillis();
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : NaN;
}

/*
  Registration Status — registration.html-এর হিসাবের সাথে হুবহু এক ক্রম:
  ১. Draft/অন্য অপ্রকাশিত → unpublished
  ২. closed বা registration_open=false বা is_active=false → closed
  ৩. শুরুর সময় আসেনি → upcoming
  ৪. শেষ সময় পার → ended
  ৫. নইলে → open
*/
export function getRegistrationState(quiz, now = Date.now()){
  const status = String(quiz?.status || "published").toLowerCase();
  const start = toMillis(quiz?.registration_start ?? quiz?.registrationStart ?? quiz?.reg_start);
  const end   = toMillis(quiz?.registration_end   ?? quiz?.registrationEnd   ?? quiz?.reg_end);

  if(status !== "published" && status !== "closed"){
    return { state:"unpublished", label:"প্রকাশিত নয়", canRegister:false };
  }
  if(status === "closed" || quiz?.registration_open === false || quiz?.is_active === false){
    return { state:"closed", label:"রেজিস্ট্রেশন বন্ধ", canRegister:false };
  }
  if(Number.isFinite(start) && now < start){
    return { state:"upcoming", label:"এখনো শুরু হয়নি", canRegister:false };
  }
  if(Number.isFinite(end) && now >= end){
    return { state:"ended", label:"রেজিস্ট্রেশন শেষ", canRegister:false };
  }
  return { state:"open", label:"রেজিস্ট্রেশন চলছে", canRegister:true };
}

/* ---------- Bengali number / date ---------- */
export function bn(value){
  return Number(value || 0).toLocaleString("bn-BD");
}

export function formatDate(value){
  const ms = toMillis(value);
  if(!Number.isFinite(ms)) return "";
  return new Date(ms).toLocaleDateString("bn-BD", { day:"numeric", month:"long", year:"numeric", timeZone:"Asia/Dhaka" });
}

/* সময় বাংলায়: "রাত ৮:৩০" */
export function formatTime(value){
  const ms = toMillis(value);
  if(!Number.isFinite(ms)) return "";
  const parts = new Intl.DateTimeFormat("en-GB", { hour:"2-digit", minute:"2-digit", hourCycle:"h23", timeZone:"Asia/Dhaka" }).formatToParts(new Date(ms));
  const h24 = Number(parts.find((p) => p.type === "hour").value);
  const min = Number(parts.find((p) => p.type === "minute").value);
  const h12 = h24 % 12 || 12;
  const period = h24 < 5 ? "রাত" : h24 < 12 ? "সকাল" : h24 < 16 ? "দুপুর" : h24 < 18 ? "বিকাল" : h24 < 20 ? "সন্ধ্যা" : "রাত";
  return period + " " + bn(h12) + ":" + min.toLocaleString("bn-BD", { minimumIntegerDigits:2 });
}

export function formatDateTime(value){
  const ms = toMillis(value);
  if(!Number.isFinite(ms)) return "";
  const date = new Date(ms).toLocaleDateString("bn-BD", { day:"numeric", month:"long", timeZone:"Asia/Dhaka" });
  return date + ", " + formatTime(ms);
}

/* ---------- Icons (Lucide-style outline) ---------- */
const P = {
  "arrow-left":'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  "arrow-right":'<path d="M5 12h14M13 6l6 6-6 6"/>',
  "login":'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>',
  "user-plus":'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M19 8v6M16 11h6"/>',
  "user":'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  "home":'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  "target":'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  "grid":'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  "trophy":'<path d="M6 4h12v5a6 6 0 0 1-12 0z"/><path d="M6 6H3v1a4 4 0 0 0 4 4M18 6h3v1a4 4 0 0 1-4 4"/><path d="M12 15v3M8 21h8M9 18h6"/>',
  "book":'<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
  "clipboard":'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 12h6M9 16h4"/>',
  "lock":'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  "loader":'<path d="M12 3a9 9 0 1 0 9 9"/>',
  "clock":'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  "help":'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.2M12 17h.01"/>',
  "wallet":'<path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3"/><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3"/><path d="M21 10v5h-5a2.5 2.5 0 0 1 0-5z"/>',
  "calendar":'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  "hourglass":'<path d="M6 2h12M6 22h12M7 2v4a5 5 0 0 0 2 4l3 2-3 2a5 5 0 0 0-2 4v4M17 2v4a5 5 0 0 1-2 4l-3 2 3 2a5 5 0 0 1 2 4v4"/>',
  "moon":'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  "flag":'<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
  "globe":'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  "cap":'<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6"/>',
  "layers":'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  "check":'<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
  "alert":'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  "info":'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  "inbox":'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z"/>',
  "x":'<path d="M18 6 6 18M6 6l12 12"/>',
  "sparkles":'<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  "users":'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
  "edit":'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  "save":'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  "refresh":'<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/>',
  "shuffle":'<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="m4 4 5 5"/>',
  "eye":'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  "copy":'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  "maximize":'<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
  "settings":'<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  "crown":'<path d="m3 8 4 4 5-7 5 7 4-4-2 11H5z"/>',
  "file":'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  "shield":'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  "logout":'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  "plus":'<path d="M12 5v14M5 12h14"/>',
  "list":'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  "timer":'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
  "id":'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16a3 3 0 0 1 6 0M14 10h4M14 14h3"/>',
  "phone":'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  "mail":'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  "building":'<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M2 21h20M8 7h4M8 11h4M8 15h4"/>',
  "pin":'<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  "map":'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  "card":'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>'
};

export function ICON(name, cls = ""){
  return `<svg class="ic ${cls}" aria-hidden="true"><use href="#ic-${name}"></use></svg>`;
}

/* পেজের শুরুতে একবার ডাকলে সব <use href="#ic-..."> কাজ করবে */
export function injectSprite(){
  if(document.getElementById("gt-sprite")) return;
  const symbols = Object.entries(P)
    .map(([id, body]) => `<symbol id="ic-${id}" viewBox="0 0 24 24">${body}</symbol>`)
    .join("");
  const wrap = document.createElement("div");
  wrap.innerHTML = `<svg id="gt-sprite" xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">${symbols}</svg>`;
  document.body.prepend(wrap.firstChild);
}
