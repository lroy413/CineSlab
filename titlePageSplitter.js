/* ------------------------------------------------------------------
   Title-page splitter for Slate & Page

   Takes the flat element array your importer produces, e.g.
     [ { type:'action', text:'Lovelock' },
       { type:'action', text:'written by' },
       { type:'action', text:'Concrete' }, ... ]

   Returns { titlePage, script }:
     - titlePage: { title, credit, author, contact, source, draftDate,
                    copyright, notes }  (or null if none detected)
     - script:    the element array with the front matter removed

   >>> Adjust the TYPE values below to match YOUR element.type strings. <<<
------------------------------------------------------------------ */

const TYPE = {
  action:     'action',
  scene:      'scene',
  character:  'character',
  dialogue:   'dialogue',
  parens:     'parens',
  transition: 'transition',
};

const SCENE_RE   = /^(INT|EXT|EST|INT\.?\/EXT|I\/E)[.\s]/i;
const FADE_IN_RE = /^FADE IN\s*:?\s*$/i;

// Fountain "Key: value" front-matter keys -> title-page field names
const FOUNTAIN_KEYS = {
  title: 'title', credit: 'credit', author: 'author', authors: 'author',
  source: 'source', 'draft date': 'draftDate', date: 'draftDate',
  contact: 'contact', copyright: 'copyright', notes: 'notes',
};

// Where does the actual screenplay begin?
function findScriptStart(els) {
  for (let i = 0; i < els.length; i++) {
    const t = (els[i].text || '').trim();
    if (els[i].type === TYPE.scene || SCENE_RE.test(t)) return i; // first slug
    if (FADE_IN_RE.test(t)) return i;                             // FADE IN:
  }
  return -1;
}

function looksLikeContact(l) {
  return /\S+@\S+\.\S+/.test(l)                              // email
      || /(\+?\d[\d\s().-]{6,}\d)/.test(l)                    // phone number
      || /^(address|phone|e-?mail|tel|cell)\b/i.test(l)       // template labels
      || /\d+\s+\w+.*\b(st|ave|blvd|rd|road|street|lane|dr)\b/i.test(l);
}

function parseFrontMatter(frontEls) {
  const lines = frontEls.map(e => (e.text || '').trim()).filter(Boolean);
  const page = { title:'', credit:'', author:'', contact:'',
                 source:'', draftDate:'', copyright:'', notes:'' };
  if (!lines.length) return page;

  // ---- Case A: Fountain key:value front matter (Title: Lovelock, etc.) ----
  const isFountain = lines.some(l => {
    const m = l.match(/^([A-Za-z][A-Za-z ]*):/);
    return m && FOUNTAIN_KEYS[m[1].trim().toLowerCase()];
  });
  if (isFountain) {
    let key = null;
    for (const l of lines) {
      const m = l.match(/^([A-Za-z][A-Za-z ]*):\s*(.*)$/);
      if (m && FOUNTAIN_KEYS[m[1].trim().toLowerCase()]) {
        key = FOUNTAIN_KEYS[m[1].trim().toLowerCase()];
        page[key] = m[2].trim();
      } else if (key) {                     // indented continuation line
        page[key] += (page[key] ? '\n' : '') + l;
      }
    }
    return page;
  }

  // ---- Case B: rendered / positional title page (your Lovelock PDF) ----
  const creditRe = /^(written by|screenplay by|story by|teleplay by|created by|by)$/i;
  page.title = lines[0];
  let i = 1;
  for (; i < lines.length; i++) {
    if (creditRe.test(lines[i])) {
      page.credit = lines[i];
      const next = lines[i + 1];
      if (next && !creditRe.test(next) && !looksLikeContact(next)) {
        page.author = next;                 // name on the line after "written by"
        i += 2;
      } else {
        i += 1;
      }
      break;
    }
  }
  page.contact = lines.slice(i).join('\n');  // Address / Phone / E-mail block
  return page;
}

function splitTitlePage(els) {
  const start = findScriptStart(els);
  if (start <= 0) return { titlePage: null, script: els }; // nothing to pull out

  const front = els.slice(0, start);

  // Guard against false positives: a real title page is short and contains
  // no dialogue/character/scene elements before the script start.
  const hasBodyStuff = front.some(e =>
    [TYPE.character, TYPE.dialogue, TYPE.parens, TYPE.scene].includes(e.type));
  if (hasBodyStuff || front.length > 20) return { titlePage: null, script: els };

  return { titlePage: parseFrontMatter(front), script: els.slice(start) };
}

export { splitTitlePage, parseFrontMatter, findScriptStart };
