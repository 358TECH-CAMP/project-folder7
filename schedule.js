const tbody = document.getElementById('time-rows');
const saveBtn = document.getElementById('saveBtn');
const currentTeacherDisplay = document.getElementById('currentTeacherDisplay');

const urlParams = new URLSearchParams(window.location.search);
const teacherName = urlParams.get('name');
const currentTeacher = localStorage.getItem("currentTeacher");

if(!teacherName){ 
    alert("講師情報がありません"); 
    location.href="register.html"; 
}

// 左上に講師名表示
currentTeacherDisplay.textContent = `操作中：${teacherName}`;

// 時間表生成
const dates = ["12/31", "1/1", "1/2", "1/3"];
let savedSchedules = JSON.parse(localStorage.getItem("teacherSchedules") || "[]");

for(let h=0; h<24; h++){
  for(let m of [0,30]){
    const time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="time-cell">${time}</td>
      ${dates.map(d=>`<td><div class="cell" data-date="${d}" data-time="${time}"></div></td>`).join('')}
    `;
    tbody.appendChild(tr);
  }
}

// 保存済みスケジュール読み込み
savedSchedules.filter(s=>s.name===teacherName).forEach(s=>{
    const cell = tbody.querySelector(`.cell[data-date="${s.date}"][data-time="${s.time}"]`);
    if(cell){ cell.classList.add("marked"); cell.textContent="◯"; }
});

// セルクリックで◯切り替え（本人のみ）
const canEdit = teacherName === currentTeacher;

tbody.querySelectorAll(".cell").forEach(c => {
  if(canEdit){
      c.addEventListener("click", ()=>{
        c.classList.toggle("marked");
        c.textContent = c.classList.contains("marked") ? "◯" : "";
      });
  } else {
      c.style.cursor = "not-allowed";
      c.title = "編集権限がありません";
  }
});

// 保存（本人のみ）
if(canEdit){
    saveBtn.addEventListener("click", ()=>{
        const newMarked = [];
        tbody.querySelectorAll(".cell").forEach(c=>{
            if(c.classList.contains("marked")){
                newMarked.push({name: teacherName, date: c.dataset.date, time: c.dataset.time});
            }
        });

        const otherSchedules = savedSchedules.filter(s => s.name !== teacherName);
        const mergedSchedules = otherSchedules.concat(newMarked);

        localStorage.setItem("teacherSchedules", JSON.stringify(mergedSchedules));
        alert("保存完了！");
        window.location.href = "list.html";
    });
} else {
    saveBtn.style.display = "none";
}
