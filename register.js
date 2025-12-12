const imgInput = document.getElementById('imgInput');
const previewImg = document.getElementById('previewImg');
const nameInput = document.getElementById('nameInput');
const fieldInput = document.getElementById('fieldInput');
const bioInput = document.getElementById('bioInput');
const submitBtn = document.getElementById('submitBtn');

let currentProfile = null;

// 画像プレビュー
imgInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        previewImg.src = event.target.result;
        previewImg.style.display = 'block';
    };
    reader.readAsDataURL(file);
});

// 編集用: URLに ?name=山田太郎 があればその情報を読み込む
const urlParams = new URLSearchParams(window.location.search);
const editName = urlParams.get('name');
const profiles = JSON.parse(localStorage.getItem("teacherProfiles") || "[]");

if(editName) {
    const profile = profiles.find(p => p.name === editName);
    if(profile){
        currentProfile = profile;
        nameInput.value = profile.name;
        fieldInput.value = profile.field;
        bioInput.value = profile.bio;
        if(profile.img){ previewImg.src = profile.img; previewImg.style.display='block'; }
        submitBtn.textContent = "変更保存";
    }
}

// フォーム送信
document.getElementById('registerForm').addEventListener('submit', function(e){
    e.preventDefault();

    const newProfile = {
        name: nameInput.value.trim(),
        field: fieldInput.value.trim(),
        bio: bioInput.value.trim(),
        img: previewImg.src || ""
    };

    // 登録 or 更新
    let updatedProfiles = profiles.filter(p => p.name !== newProfile.name);
    updatedProfiles.push(newProfile);
    localStorage.setItem("teacherProfiles", JSON.stringify(updatedProfiles));

    // 現在講師として設定（本人判定用）
    localStorage.setItem("currentTeacher", newProfile.name);

    alert("登録完了！");
    // 登録後は本人スケジュール画面へ
    window.location.href = "schedule.html?name=" + encodeURIComponent(newProfile.name);
});

// ----------------------------
// 本人削除ボタン追加（編集モードのみ）
if(currentProfile){
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "プロフィール削除";
    deleteBtn.style.marginTop = "10px";
    deleteBtn.style.backgroundColor = "#e53935";
    deleteBtn.style.color = "white";
    deleteBtn.style.border = "none";
    deleteBtn.style.borderRadius = "6px";
    deleteBtn.style.padding = "8px 12px";
    deleteBtn.style.cursor = "pointer";

    deleteBtn.addEventListener("click", ()=>{
        if(confirm(`「${currentProfile.name}」のプロフィールとスケジュールを削除しますか？`)){
            // プロフィール削除
            let profiles = JSON.parse(localStorage.getItem("teacherProfiles")||"[]");
            profiles = profiles.filter(p => p.name !== currentProfile.name);
            localStorage.setItem("teacherProfiles", JSON.stringify(profiles));

            // スケジュール削除
            let schedules = JSON.parse(localStorage.getItem("teacherSchedules")||"[]");
            schedules = schedules.filter(s => s.name !== currentProfile.name);
            localStorage.setItem("teacherSchedules", JSON.stringify(schedules));

            // 本人判定解除
            localStorage.removeItem("currentTeacher");

            alert("削除しました");
            window.location.href = "list.html";
        }
    });

    document.querySelector(".profile-card").appendChild(deleteBtn);
}
