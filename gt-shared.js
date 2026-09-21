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
  "card":'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  "search":'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  "award":'<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>',
  "gem":'<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6M2 9h20"/>',
  "percent":'<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  "download":'<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'
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


/* =====================================================
   RESULT — নম্বর হিসাব, ক্রম (Ranking), উত্তর-পর্যালোচনা
   একটাই উৎস: result-management, result, answer-review সবাই এটি ব্যবহার করবে।

   results/{attemptId} ডকুমেন্টের কাঠামো (canonical):
     attempt_id, quiz_id, quiz_name, student_uid, student_name, student_id,
     roll_number, institution, class,
     total_questions, correct, wrong, unanswered,
     obtained_marks, total_marks, negative_mark, percentage,
     time_taken_seconds, submitted_at, rank,
     review: [{ question_id, student_answer, correct_answer, status, marks, explanation? }],
     published, published_at, updated_at, updated_by
   ===================================================== */

export const LETTERS = ["A", "B", "C", "D"];

export function normLetter(value){
  const v = String(value ?? "").trim().toUpperCase();
  return LETTERS.includes(v) ? v : "";
}

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/*
  একটি attempt-এর নম্বর হিসাব।
  - attempt.question_order : প্রশ্নের id (পরীক্ষায় যে ক্রমে দেখানো হয়েছে)
  - attempt.answers        : ওই ক্রমে শিক্ষার্থীর উত্তর (A/B/C/D বা null)
  - questionMap            : Map(questionId → { correct_answer, marks, negative_mark, explanation })
  - quiz.negative_marking  : কুইজ-স্তরের Negative Mark (প্রতি ভুল উত্তরে কাটা নম্বর)
  Negative: প্রশ্নে negative_mark > 0 থাকলে সেটি, না থাকলে কুইজের negative_marking।
  সঠিক উত্তর পাওয়া না গেলে প্রশ্নটি unresolved-এ যায়, যাতে ভুল ফলাফল প্রকাশ না হয়।
*/
export function gradeAttempt(attempt, questionMap, quiz = {}){
  const order = Array.isArray(attempt?.question_order) && attempt.question_order.length
    ? attempt.question_order
    : (Array.isArray(attempt?.selected_question_ids) ? attempt.selected_question_ids : []);
  const answers = Array.isArray(attempt?.answers) ? attempt.answers : [];
  const quizNegative = Number(quiz?.negative_marking ?? 0) || 0;

  let correct = 0, wrong = 0, unanswered = 0, obtained = 0, total = 0, negative = 0;
  const review = [];
  const unresolved = [];

  order.forEach((questionId, index) => {
    const q = questionMap.get(questionId);
    const right = normLetter(q?.correct_answer);
    const mine = normLetter(answers[index]);

    if(!q || !right) unresolved.push(questionId);

    const marks = q && q.marks !== undefined && q.marks !== null ? Number(q.marks) || 0 : 1;
    const negativePerWrong = Number(q?.negative_mark) > 0 ? Number(q.negative_mark) : quizNegative;

    total += marks;

    let status, awarded = 0;
    if(!mine){
      status = "unanswered"; unanswered++;
    }else if(right && mine === right){
      status = "correct"; correct++; awarded = marks;
    }else{
      status = "wrong"; wrong++; awarded = -negativePerWrong; negative += negativePerWrong;
    }
    obtained += awarded;

    const entry = {
      question_id: questionId,
      student_answer: mine || null,
      correct_answer: right || null,
      status,
      marks: round2(awarded)
    };
    const explanation = String(q?.explanation ?? "").trim();
    if(explanation) entry.explanation = explanation;
    review.push(entry);
  });

  return {
    total_questions: order.length,
    correct, wrong, unanswered,
    obtained_marks: round2(obtained),
    total_marks: round2(total),
    negative_mark: round2(negative),
    percentage: total > 0 ? Math.max(0, round2((obtained / total) * 100)) : 0,
    review,
    unresolved
  };
}

/*
  Ranking নিয়ম (পরিবর্তন করা যাবে না):
  ১. বেশি নম্বর  ২. নম্বর সমান হলে কম সময়  ৩. সময়ও সমান হলে আগে জমা
*/
export function rankResults(rows){
  const time = (r) => {
    const t = Number(r.time_taken_seconds);
    return Number.isFinite(t) ? t : Infinity;
  };
  const sub = (r) => {
    const ms = toMillis(r.submitted_at);
    return Number.isFinite(ms) ? ms : Infinity;
  };
  const sorted = [...rows].sort((a, b) =>
    (Number(b.obtained_marks) || 0) - (Number(a.obtained_marks) || 0) ||
    (time(a) === time(b) ? 0 : time(a) < time(b) ? -1 : 1) ||
    (sub(a) === sub(b) ? 0 : sub(a) < sub(b) ? -1 : 1)
  );
  return sorted.map((row, i) => ({ ...row, rank: i + 1 }));
}

/* "১২ মি ০৫ সে" */
export function formatDuration(seconds){
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return bn(m) + " মি " + r.toLocaleString("bn-BD", { minimumIntegerDigits: 2 }) + " সে";
}

/* নম্বর: পূর্ণসংখ্যা হলে দশমিক ছাড়া */
export function formatMarks(value){
  const n = Number(value) || 0;
  return n.toLocaleString("bn-BD", { maximumFractionDigits: 2 });
}

/* ---------- উত্তর-পর্যালোচনা (Answer Review) ---------- */

/* প্রশ্ন ডকুমেন্ট (exam_questions বা questions) থেকে প্রদর্শনযোগ্য রূপ */
export function questionView(q){
  return {
    text: q?.question_text ?? q?.question ?? "",
    options: {
      A: q?.option_a ?? q?.a ?? "",
      B: q?.option_b ?? q?.b ?? "",
      C: q?.option_c ?? q?.c ?? "",
      D: q?.option_d ?? q?.d ?? ""
    }
  };
}

const STATUS_LABEL = { correct:"সঠিক", wrong:"ভুল", unanswered:"উত্তর দেননি" };

export function renderReview(review, questionMap){
  if(!Array.isArray(review) || !review.length){
    return `<div class="rv-empty">এই ফলাফলের সাথে উত্তরের বিবরণ সংরক্ষিত নেই।</div>`;
  }
  return review.map((item, index) => {
    const view = questionView(questionMap.get(item.question_id));
    const options = LETTERS.map((letter) => {
      const isRight = item.correct_answer === letter;
      const isMine = item.student_answer === letter;
      const cls = ["rv-opt"];
      if(isRight) cls.push("right");
      if(isMine && !isRight) cls.push("mine-wrong");
      const tags = [];
      if(isMine) tags.push(`<span class="rv-tag mine">আপনার উত্তর</span>`);
      if(isRight) tags.push(`<span class="rv-tag right">সঠিক উত্তর</span>`);
      return `<div class="${cls.join(" ")}"><b>${letter}</b><span class="rv-txt">${escapeHtml(view.options[letter] || "—")}</span>${tags.join("")}</div>`;
    }).join("");

    const marks = Number(item.marks) || 0;
    const marksText = marks > 0 ? "+" + formatMarks(marks) : marks < 0 ? "−" + formatMarks(Math.abs(marks)) : "০";

    return `
      <article class="rv-card ${item.status}">
        <div class="rv-head">
          <span class="rv-no">প্রশ্ন ${bn(index + 1)}</span>
          <span class="rv-chip ${item.status}">${STATUS_LABEL[item.status] || ""}</span>
          <span class="rv-marks">${marksText}</span>
        </div>
        <div class="rv-q">${escapeHtml(view.text || "প্রশ্নটি পাওয়া যায়নি (মুছে ফেলা হয়েছে হতে পারে)।")}</div>
        <div class="rv-opts">${options}</div>
        ${item.explanation ? `<div class="rv-exp"><b>ব্যাখ্যা:</b> ${escapeHtml(item.explanation)}</div>` : ""}
      </article>`;
  }).join("");
}

export const REVIEW_CSS = `
.rv-card{padding:15px;border-radius:18px;margin-bottom:12px;background:linear-gradient(145deg,#12162f,#0c1024);border:1px solid rgba(255,255,255,.08)}
.rv-card.correct{border-color:rgba(47,214,138,.32)}
.rv-card.wrong{border-color:rgba(255,84,112,.36)}
.rv-card.unanswered{border-color:rgba(255,178,28,.3)}
.rv-head{display:flex;align-items:center;gap:9px;margin-bottom:9px}
.rv-no{font-weight:800;font-size:13px;color:#d8c5ff}
.rv-chip{padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800}
.rv-chip.correct{color:#75efb8;background:rgba(47,214,138,.12)}
.rv-chip.wrong{color:#ff9aaa;background:rgba(255,84,112,.12)}
.rv-chip.unanswered{color:#ffd574;background:rgba(255,178,28,.12)}
.rv-marks{margin-left:auto;font-weight:800;font-size:13px;color:#cfd4ec}
.rv-q{font-weight:700;font-size:15px;line-height:1.7;margin-bottom:11px}
.rv-opts{display:grid;gap:7px}
.rv-opt{display:flex;align-items:center;flex-wrap:wrap;gap:9px;padding:10px 12px;border-radius:12px;font-size:13.5px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08)}
.rv-opt b{width:24px;height:24px;flex:0 0 24px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(255,255,255,.07);font-size:12px}
.rv-opt .rv-txt{flex:1;min-width:120px;line-height:1.55}
.rv-opt.right{background:rgba(47,214,138,.11);border-color:rgba(47,214,138,.5)}
.rv-opt.right b{background:#2fd68a;color:#04130c}
.rv-opt.mine-wrong{background:rgba(255,84,112,.11);border-color:rgba(255,84,112,.5)}
.rv-opt.mine-wrong b{background:#ff5470;color:#fff}
.rv-tag{padding:3px 8px;border-radius:999px;font-size:10.5px;font-weight:800}
.rv-tag.mine{color:#d8c5ff;background:rgba(139,61,255,.22)}
.rv-tag.right{color:#75efb8;background:rgba(47,214,138,.16)}
.rv-exp{margin-top:10px;padding:10px 12px;border-radius:12px;font-size:12.5px;line-height:1.7;color:#cfd3ea;background:rgba(139,61,255,.08);border:1px solid rgba(139,61,255,.22)}
.rv-empty{padding:22px;text-align:center;color:#9aa0c0}
`;

export function injectReviewStyles(){
  if(document.getElementById("gt-review-css")) return;
  const style = document.createElement("style");
  style.id = "gt-review-css";
  style.textContent = REVIEW_CSS;
  document.head.appendChild(style);
}
