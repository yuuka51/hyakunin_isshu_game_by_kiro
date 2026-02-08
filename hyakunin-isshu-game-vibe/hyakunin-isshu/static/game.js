let order = [];
let current = 0;
let score = 0;
let total = 10; // 1ゲーム10問

function show(id) {
    document.querySelectorAll("#start-screen, #game-screen, #result-screen")
        .forEach(el => el.style.display = "none");
    document.getElementById(id).style.display = "block";
}

async function startGame() {
    const res = await fetch("/api/start", { method: "POST" });
    const data = await res.json();
    order = data.order.slice(0, total);
    current = 0;
    score = 0;
    show("game-screen");
    loadQuestion();
}

async function loadQuestion() {
    const idx = order[current];
    const res = await fetch(`/api/question/${idx}`);
    const data = await res.json();

    document.getElementById("progress").textContent = `第 ${current + 1} 問 / ${total}`;
    document.getElementById("score").textContent = `正解: ${score}`;
    document.getElementById("kami-text").textContent = data.kami;
    document.getElementById("author-text").textContent = `— ${data.author}`;
    document.getElementById("feedback").textContent = "";
    document.getElementById("feedback").className = "feedback";
    document.getElementById("next-btn").style.display = "none";

    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";

    data.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = choice.shimo;
        btn.dataset.id = choice.id;
        btn.onclick = () => answer(btn, choice.id, data.correct_id, choicesDiv);
        choicesDiv.appendChild(btn);
    });
}

function answer(btn, selectedId, correctId, container) {
    const buttons = container.querySelectorAll(".choice-btn");
    buttons.forEach(b => {
        b.classList.add("disabled");
        b.onclick = null;
    });

    const feedback = document.getElementById("feedback");

    if (selectedId === correctId) {
        btn.classList.add("correct");
        feedback.textContent = "⭕ 正解！";
        feedback.className = "feedback correct-msg";
        score++;
        document.getElementById("score").textContent = `正解: ${score}`;
    } else {
        btn.classList.add("wrong");
        feedback.textContent = "❌ 不正解…";
        feedback.className = "feedback wrong-msg";
        // 正解のボタンをハイライト (data-id属性で特定)
        buttons.forEach(b => {
            if (parseInt(b.dataset.id) === correctId) {
                b.classList.add("correct");
            }
        });
    }

    document.getElementById("next-btn").style.display = "inline-block";
}

function nextQuestion() {
    current++;
    if (current >= total) {
        showResult();
    } else {
        loadQuestion();
    }
}

function showResult() {
    show("result-screen");
    document.getElementById("result-score").textContent = `${score} / ${total}`;

    let msg;
    const rate = score / total;
    if (rate === 1) msg = "完璧！百人一首マスターです！🎉";
    else if (rate >= 0.8) msg = "素晴らしい！かなりの実力です！";
    else if (rate >= 0.6) msg = "なかなかの腕前です！";
    else if (rate >= 0.4) msg = "もう少し練習しましょう！";
    else msg = "百人一首を覚えていきましょう！📖";

    document.getElementById("result-message").textContent = msg;
}
