/* Kalender für das Jahr 2026
   - Generiert alle Monate
   - Speichert Termine in localStorage unter key 'calendar_2026'
   - Export / Import (JSON)
*/
(function(){
  const YEAR = 2026;
  const monthNames = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  const weekdayNames = ['Mo','Di','Mi','Do','Fr','Sa','So'];

  // storage key (global calendar for 2026)
  const STORAGE_KEY = 'calendar_' + YEAR;

  let data = loadData();
  let currentMonth = 0; // 0..11, start with Januar

  document.addEventListener('DOMContentLoaded', ()=>{
    // initialize currentMonth: if today is in 2026 use that month
    const now = new Date();
    if(now.getFullYear() === YEAR) currentMonth = now.getMonth();
    renderMonth(currentMonth);

    // Export/Import/Clear buttons removed
    document.getElementById('prevMonth').addEventListener('click', ()=>{ if(currentMonth>0){ currentMonth--; renderMonth(currentMonth);} });
    document.getElementById('nextMonth').addEventListener('click', ()=>{ if(currentMonth<11){ currentMonth++; renderMonth(currentMonth);} });
  });

  function loadData(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    }catch(e){ console.error('Fehler beim Laden', e); return {}; }
  }

  function saveData(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }catch(e){ console.error('Fehler beim Speichern', e); }
  }

  function formatDate(y,m,d){
    const mm = String(m).padStart(2,'0');
    const dd = String(d).padStart(2,'0');
    return `${y}-${mm}-${dd}`;
  }

  function daysInMonth(y,m){ return new Date(y, m+1, 0).getDate(); }

  function renderMonth(monthIndex){
    const container = document.getElementById('monthContainer');
    container.innerHTML = '';
    document.getElementById('currentMonthLabel').textContent = `${monthNames[monthIndex]} ${YEAR}`;

    const card = document.createElement('article'); card.className='month';
    const title = document.createElement('h2'); title.textContent = `${monthNames[monthIndex]} ${YEAR}`;
    card.appendChild(title);

    const weekdays = document.createElement('div'); weekdays.className='weekdays';
    weekdayNames.forEach(w=>{ const el=document.createElement('div'); el.textContent=w; weekdays.appendChild(el); });
    card.appendChild(weekdays);

    const daysGrid = document.createElement('div'); daysGrid.className='days';

    // Bestimme das heutige Datum (auf Mitternacht setzen für reinen Datum-Vergleich)
    const today = new Date(); today.setHours(0,0,0,0);

    // first weekday (Mon=0)
    const first = new Date(YEAR, monthIndex, 1).getDay(); // 0=Sun
    const firstMonIndex = (first + 6) % 7;
    for(let i=0;i<firstMonIndex;i++){ const empty=document.createElement('div'); empty.className='day empty'; daysGrid.appendChild(empty); }

    const dim = daysInMonth(YEAR, monthIndex);
    for(let d=1; d<=dim; d++){
      const dateKey = formatDate(YEAR, monthIndex+1, d);
      const dayDiv = document.createElement('div'); dayDiv.className = 'day';
      const dateObj = new Date(YEAR, monthIndex, d);
      // Heute markieren, sonst als vergangen kennzeichnen
      if(dateObj.getTime() === today.getTime()) {
        dayDiv.classList.add('today');
      } else if(dateObj < today) {
        dayDiv.classList.add('past');
      }
      const weekday = dateObj.getDay();
      const monIndex = (weekday + 6) % 7; if(monIndex>=5) dayDiv.classList.add('weekend');

      const dateNum = document.createElement('div'); dateNum.className='date-num'; dateNum.textContent = d;
      const content = document.createElement('div'); content.className='content'; content.contentEditable='true';
      content.dataset.date = dateKey; content.textContent = data[dateKey] || '';

      let timeout;
      content.addEventListener('input', ()=>{
        clearTimeout(timeout); timeout = setTimeout(()=>{
          data[dateKey] = content.textContent.trim(); if(!data[dateKey]) delete data[dateKey]; saveData();
        }, 500);
      });

      dayDiv.appendChild(dateNum); dayDiv.appendChild(content); daysGrid.appendChild(dayDiv);
    }

    card.appendChild(daysGrid); container.appendChild(card);
    // update navigation button disabled state
    document.getElementById('prevMonth').disabled = (monthIndex===0);
    document.getElementById('nextMonth').disabled = (monthIndex===11);
  }

  // Export/import/clear functionality removed per user request

})();
