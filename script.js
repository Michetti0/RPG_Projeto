// === Variáveis de estado ===
let selectedClass = '';
let currentZone = 1;
let playerHP = 100;
let enemyHP = 100;
let defending = false;

const enemiesByZone = {
  1: { name: "Goblin", hp: 50 },
  2: { name: "Escorpião", hp: 80 },
  3: { name: "Yeti", hp: 120 },
  4: { name: "Dragão", hp: 200 },
};

const classSkills = {
  guerreiro: [
    { name: "Corte Pesado", damage: () => rand(15, 25), description: "Um golpe poderoso com sua espada. Dano entre 15-25." },
    { name: "Investida", damage: () => rand(10, 18), description: "Você avança rapidamente no inimigo. Dano entre 10-18." }
  ],
  mago: [
    { name: "Bola de Fogo", damage: () => rand(12, 22), description: "Lança uma bola flamejante. Dano entre 12-22." },
    { name: "Raio Congelante", damage: () => rand(8, 14), description: "Ataca com um raio de gelo. Dano entre 8-14." }
  ],
  arqueiro: [
    { name: "Tiro Rápido", damage: () => rand(10, 15), description: "Dispara flechas rapidamente. Dano entre 10-15." },
    { name: "Flecha Envenenada", damage: () => rand(5, 12), description: "Envenena o inimigo com uma flecha. Dano entre 5-12." }
  ]
};

function selectClass(classe) {
  selectedClass = classe;
  document.getElementById("class-selection").style.display = "none";
  document.getElementById("map-section").style.display = "block";
}

document.querySelectorAll(".zone").forEach(zone => {
  zone.addEventListener("click", function () {
    const zoneNumber = parseInt(this.getAttribute("data-zone"));
    if (!this.classList.contains("locked")) {
      enterZone(zoneNumber);
    }
  });
});

function enterZone(zoneNumber) {
  currentZone = zoneNumber;
  const enemy = enemiesByZone[zoneNumber];
  playerHP = 100;
  enemyHP = enemy.hp;
  defending = false;

  document.getElementById("map-section").style.display = "none";
  document.getElementById("battle").style.display = "flex";
  document.getElementById("actions").style.display = "block";
  document.getElementById("zone-name").textContent = enemy.name;
  updateHP();
  renderSkills();
  log(`Você encontrou um ${enemy.name}! Prepare-se!`);
}

function renderSkills() {
  const actionsDiv = document.getElementById("actions");
  actionsDiv.innerHTML = "";

  classSkills[selectedClass].forEach((skill, index) => {
    const btn = document.createElement("button");
    btn.textContent = skill.name;
    btn.onclick = () => attack(index);
    btn.onmouseover = () => showDescription(skill.description);
    btn.onmouseout = hideDescription;
    actionsDiv.appendChild(btn);
  });

  const defBtn = document.createElement("button");
  defBtn.textContent = "Defender";
  defBtn.onclick = defend;
  defBtn.onmouseover = () => showDescription("Reduz o dano recebido pela metade neste turno.");
  defBtn.onmouseout = hideDescription;
  actionsDiv.appendChild(defBtn);
}

function attack(skillIndex) {
  const skill = classSkills[selectedClass][skillIndex];
  let dmg = skill.damage();

  const chanceToMiss = Math.random() < (dmg / 100);
  if (chanceToMiss) {
    log("O ataque errou!");
  } else {
    const isCritical = Math.random() < 0.2;
    if (isCritical) {
      dmg *= 2;
      log(`⚡ CRÍTICO! Você usou ${skill.name} e causou ${dmg} de dano!`);
    } else {
      log(`Você usou ${skill.name} e causou ${dmg} de dano.`);
    }

    enemyHP -= dmg;
    updateHP();

    if (enemyHP <= 0) {
      log("Você venceu!");
      disableButtons();
      unlockNextZone();
      document.getElementById("restart-btn").style.display = "inline-block";
      return;
    }
  }

  setTimeout(enemyTurn, 1000);
}

function defend() {
  defending = true;
  log("Você está se defendendo!");
  setTimeout(enemyTurn, 1000);
}

function enemyTurn() {
  const enemyDmg = rand(8, 20);
  const chanceToMiss = Math.random() < (enemyDmg / 100);

  if (chanceToMiss) {
    log("O inimigo errou o ataque!");
  } else {
    const isCritical = Math.random() < 0.2;
    let dmgTaken = isCritical ? enemyDmg * 2 : enemyDmg;
    dmgTaken = defending ? Math.floor(dmgTaken / 2) : dmgTaken;

    playerHP -= dmgTaken;
    log(`O inimigo atacou e você recebeu ${dmgTaken} de dano.`);

    if (isCritical) {
      log("⚡ CRÍTICO! O inimigo causou dano dobrado!");
    }
  }

  updateHP();
  defending = false;

  if (playerHP <= 0) {
    log("Você foi derrotado!");
    disableButtons();
    document.getElementById("restart-btn").style.display = "inline-block";
  }
}

function updateHP() {
  const playerBar = document.getElementById("player-hp-bar");
  const enemyBar = document.getElementById("enemy-hp-bar");

  const playerPercent = Math.max(playerHP, 0);
  const enemyPercent = Math.max(enemyHP, 0);

  document.getElementById("player-hp").textContent = playerPercent;
  document.getElementById("enemy-hp").textContent = enemyPercent;

  playerBar.style.width = playerPercent + "%";
  enemyBar.style.width = enemyPercent + "%";

  playerBar.style.backgroundColor = getHPColor(playerPercent);
  enemyBar.style.backgroundColor = getHPColor(enemyPercent);
}

function getHPColor(hp) {
  if (hp > 60) return "limegreen";
  if (hp > 30) return "orange";
  return "red";
}

function log(message) {
  document.getElementById("log").textContent = message;
}

function disableButtons() {
  document.querySelectorAll("#actions button").forEach(btn => btn.disabled = true);
}

function unlockNextZone() {
  const nextZone = currentZone + 1;
  const nextZoneElement = document.querySelector(`.zone[data-zone="${nextZone}"]`);
  if (nextZoneElement) {
    nextZoneElement.classList.remove("locked");
  }
}

function restartGame() {
  playerHP = 100;
  enemyHP = enemiesByZone[currentZone].hp;
  defending = false;

  document.getElementById("restart-btn").style.display = "none";
  document.getElementById("log").textContent = "";
  document.getElementById("battle").style.display = "none";
  document.getElementById("actions").style.display = "none";
  document.getElementById("map-section").style.display = "block";

  updateHP();
  document.querySelectorAll("#actions button").forEach(btn => btn.disabled = false);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showDescription(text) {
  const desc = document.getElementById("skill-description");
  desc.textContent = text;
  desc.style.display = "block";
}

function hideDescription() {
  const desc = document.getElementById("skill-description");
  desc.style.display = "none";
}
