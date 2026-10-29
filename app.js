// Shared helpers for index.html (student search) and admin.html (data builder)

const THAI_DIGITS = '๐๑๒๓๔๕๖๗๘๙';

function toArabicDigits(s) {
  return String(s ?? '').replace(/[๐-๙]/g, d => THAI_DIGITS.indexOf(d));
}

// Student IDs: Thai digits → Arabic, drop spaces/dashes, drop leading zeros for matching
function normalizeId(s) {
  const v = toArabicDigits(s).replace(/[\s\-_.]/g, '').trim();
  return /^\d+$/.test(v) ? v.replace(/^0+(?=\d)/, '') : v.toUpperCase();
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Renders one student's record into HTML. `s` = { id, name, cls, exams: [{ room, seat, loc, extra: {k: v} }] }
function renderStudent(s) {
  const head = `
    <div class="student-head">
      <div>
        <div class="name">${escapeHtml(s.name)}</div>
        <div class="meta">
          <span class="pill">เลขประจำตัว ${escapeHtml(s.id)}</span>
          ${s.cls ? `<span class="pill">ห้อง ${escapeHtml(s.cls)}</span>` : ''}
        </div>
      </div>
    </div>`;

  if (!s.exams || !s.exams.length) {
    return `<div class="card" role="status">${head}
      <div class="alert warn" style="margin-top:16px">ยังไม่พบข้อมูลห้องสอบของนักเรียนคนนี้ กรุณาติดต่อฝ่ายวัดผล</div></div>`;
  }

  const exams = s.exams.map((e, i) => {
    const extra = Object.entries(e.extra || {}).filter(([, v]) => v !== '' && v != null);
    return `
      <section class="exam" aria-label="ห้องสอบ ${escapeHtml(e.room)}">
        ${e.title ? `<div class="exam-title">${escapeHtml(e.title)}</div>`
          : s.exams.length > 1 ? `<div class="exam-title">รายการที่ ${i + 1}</div>` : ''}
        <div class="exam-grid">
          <div><div class="k">ห้องสอบ</div><div class="v">${escapeHtml(e.room) || '-'}</div></div>
          <div><div class="k">เลขที่สอบ</div><div class="v">${escapeHtml(e.seat) || '-'}</div></div>
          <div class="loc-cell"><div class="k">สถานที่สอบ (ห้องจริง)</div><div class="v loc">${escapeHtml(e.loc) || 'ยังไม่ระบุ'}</div></div>
        </div>
        ${extra.length ? `<div class="exam-extra">${extra.map(([k, v]) => `<span><b>${escapeHtml(k)}:</b> ${escapeHtml(v)}</span>`).join('')}</div>` : ''}
      </section>`;
  }).join('');

  return `<div class="card" role="status">${head}${exams}</div>`;
}

// Look up a student in the compiled data (EXAM_DATA.students keyed by normalized id)
function findStudent(data, rawId) {
  const key = normalizeId(rawId);
  const rec = data.students[key];
  if (!rec) return null;
  return { id: rec.id, name: rec.name, cls: rec.cls, exams: rec.exams };
}
