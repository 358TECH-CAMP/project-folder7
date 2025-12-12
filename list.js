const scheduleList = document.getElementById("scheduleList");
const teacherSelect = document.getElementById("teacherSelect");
const registerBtn = document.getElementById("registerBtn");

const profiles = JSON.parse(localStorage.getItem("teacherProfiles") || "[]");
const savedSchedules = JSON.parse(localStorage.getItem("teacherSchedules") || "[]");
const currentTeacher = localStorage.getItem("currentTeacher"); // 本人判定用

// 講師選択肢作成
profiles.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.name;
    opt.textContent = p.name;
    teacherSelect.appendChild(opt);
});

// 登録ボタン切替
teacherSelect.addEventListener("change", () => {
    const name = teacherSelect.value;
    if (name) {
        registerBtn.textContent = "登録変更";
        registerBtn.href = "register.html?name=" + encodeURIComponent(name);
    } else {
        registerBtn.textContent = "講師登録";
        registerBtn.href = "register.html";
    }
});

// スケジュール表示
function renderSchedules(filterName = "") {
    scheduleList.innerHTML = "";
    const filtered = filterName ? savedSchedules.filter(s => s.name === filterName) : savedSchedules;

    if (filtered.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="3">スケジュールがありません</td>`;
        scheduleList.appendChild(tr);
        return;
    }

    const grouped = {};
    filtered.forEach(item => {
        // 時間を「開始〜終了」に変更
        let [hour, min] = item.time.split(":").map(Number);
        let endHour = hour;
        let endMin = min + 30;
        if (endMin >= 60) {
            endHour += 1;
            endMin -= 60;
        }
        const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}〜${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

        const key = `${item.date}-${item.time}`;
        if (!grouped[key]) grouped[key] = { date: item.date, time: timeStr, names: [] };
        grouped[key].names.push(item.name);
    });

    Object.values(grouped)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        .forEach(item => {
            const tr = document.createElement("tr");

            const namesWithLinks = item.names.map(name => {
                const profile = profiles.find(p => p.name === name);
                if (!profile) return name;

                // ツールチップ用 HTML
                const tooltipContent = `
                    <div style="text-align:center;">
                        ${profile.img ? `<img src="${profile.img}" style="width:60px;height:60px;border-radius:50%;margin-bottom:6px;">` : ''}
                        <div><strong>${profile.name}</strong></div>
                        <div style="font-size:12px;color:#555;">${profile.field}</div>
                        <div style="font-size:13px;margin-top:4px;">${profile.bio}</div>
                    </div>
                `;

                // span.tooltip に保持
                const span = document.createElement("span");
                span.className = "tooltip";
                span.innerHTML = profile.name;
                span.dataset.tooltip = tooltipContent;

                // 本人なら編集リンク追加
                if (name === currentTeacher) {
                    const link = document.createElement("a");
                    link.href = "schedule.html?name=" + encodeURIComponent(name);
                    link.style.color = "#0ea35a";
                    link.style.textDecoration = "underline";
                    link.style.marginLeft = "4px";
                    link.textContent = "編集";

                    const container = document.createElement("span");
                    container.appendChild(span);
                    container.appendChild(link);
                    return container.outerHTML;
                }

                return span.outerHTML;
            }).join(" / ");

            tr.innerHTML = `<td>${item.date}</td><td>${item.time}</td><td>${namesWithLinks}</td>`;
            scheduleList.appendChild(tr);
        });

    // ツールチップ表示イベント
    document.querySelectorAll(".tooltip").forEach(t => {
        t.addEventListener("mouseenter", () => {
            if (!t.querySelector(".tooltiptext")) {
                const div = document.createElement("div");
                div.className = "tooltiptext";
                div.innerHTML = t.dataset.tooltip;
                t.appendChild(div);
            }
        });
        t.addEventListener("mouseleave", () => {
            const div = t.querySelector(".tooltiptext");
            if (div) div.remove();
        });
    });
}

// 初期表示＆講師選択時に再描画
teacherSelect.addEventListener("change", () => renderSchedules(teacherSelect.value));
renderSchedules();
