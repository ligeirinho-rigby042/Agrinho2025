//O jogo foi feito com o ChatGPT.
//-crie um jogo estilo amoung us, no p5js, com tema festejando conexão campo e cidade.
//-faça com que o impostor persiga.
//-substitua os circulos amarelos por emojis de animais.
//-chat agora adicione uma tela de menu com apenas o fundo a mostra com opções de (jogar) e com as instruções ao lado .
//-adicione um emoji de trator passando pela rua e que se encostar no trator seja pego, mas com outra fala projetada pelo acerto do trator.
//-mude a cor da fonte dos textos para branco.



const MAP_W = 800;
const MAP_H = 600;
const TOTAL_TASKS = 5;
const ANIMAL_EMOJIS = ["🐄", "🐖", "🐑", "🐓", "🐕"];
let player, imposter;
let tasks = [];
let completed = 0;
let gameState = "menu";
let tractorX = -100;
let tractorSpeed = 2;

function setup() {
  createCanvas(MAP_W, MAP_H);
  textFont("Arial");
  fill(255); 
  player = new Character(MAP_W / 4, MAP_H / 2, color(40, 150, 255));
  imposter = new Character((3 * MAP_W) / 4, MAP_H / 2, color(200, 50, 50));
  imposter.speed = 1.8;
  generateTasks();
  textAlign(CENTER, CENTER);
  textSize(16);
}

function generateTasks() {
  tasks = [];
  for (let i = 0; i < TOTAL_TASKS; i++) {
    const side = i < TOTAL_TASKS / 2 ? 0 : 1;
    const x = random(
      side === 0 ? 50 : MAP_W / 2 + 50,
      side === 0 ? MAP_W / 2 - 50 : MAP_W - 50
    );
    const y = random(80, MAP_H - 80);
    tasks.push({ pos: createVector(x, y), done: false, emoji: ANIMAL_EMOJIS[i % ANIMAL_EMOJIS.length] });
  }
}

class Character {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    this.col = col;
    this.size = 32;
    this.speed = 2.5;
  }
  draw() {
    fill(this.col);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.size, this.size * 1.2);
    fill(220);
    ellipse(this.pos.x + 6, this.pos.y - 4, this.size / 1.8, this.size / 2.5);
  }
  move(dx, dy) {
    this.pos.x = constrain(this.pos.x + dx * this.speed, 0, MAP_W);
    this.pos.y = constrain(this.pos.y + dy * this.speed, 0, MAP_H);
  }
  pursue(target) {
    let direction = p5.Vector.sub(target.pos, this.pos);
    direction.limit(this.speed);
    this.move(direction.x / this.speed, direction.y / this.speed);
  }
}

function drawBackground() {
  noStroke();
  fill(70, 170, 70);
  rect(0, 0, MAP_W / 2, MAP_H);
  stroke(90, 190, 90);
  for (let y = 40; y < MAP_H; y += 40) {
    line(0, y, MAP_W / 2, y);
  }
  noStroke();
  fill(180, 60, 60);
  rect(90, MAP_H / 2 - 70, 70, 70);
  triangle(90, MAP_H / 2 - 70, 160, MAP_H / 2 - 70, 125, MAP_H / 2 - 110);

  fill(120);
  rect(MAP_W / 2, 0, MAP_W / 2, MAP_H);
  fill(160);
  for (let i = 0; i < 6; i++) {
    const bx = MAP_W / 2 + 50 + i * 90;
    rect(bx, MAP_H - 200, 60, 200);
  }

  fill(60);
  rect(0, MAP_H / 2 - 25, MAP_W, 50);
  stroke(255, 255, 0);
  for (let x = 0; x < MAP_W; x += 40) {
    line(x, MAP_H / 2, x + 20, MAP_H / 2);
  }
}

function drawTractor() {
  textSize(40);
  fill(255);
  text("🚜", tractorX, MAP_H / 2);

  tractorX += tractorSpeed;
  
  if (tractorX < -100 || tractorX > MAP_W + 100) {
    tractorSpeed *= -1;
  }
}


function draw() {
  background(30);
  drawBackground();

  if (gameState === "menu") {
    drawMenu();
    return;
  }

  textSize(24);
  fill(255);
  for (const t of tasks) {
    if (!t.done) {
      text(t.emoji, t.pos.x, t.pos.y);
    }
  }

  player.draw();
  imposter.draw();
  drawTractor();

  fill(255);
  textSize(16);
  text("Tarefas: " + completed + " / " + TOTAL_TASKS, width / 2, 20);

  if (gameState === "jogando") {
    handlePlayerControls();
    imposter.pursue(player);
    checkCollisions();
    checkTractorCollision();
  } else {
    textSize(36);
    fill(255);
    let msg = "";
    if (gameState === "venceu") msg = "Você completou tudo! Vitória!";
    else if (gameState === "perdeu") msg = "Oops, o impostor pegou você!";
    else if (gameState === "atropelado") msg = "Cuidado! Você foi atropelado pelo trator!";
    text(msg, width / 2, height / 2);
    textSize(16);
    text("Pressione R para jogar novamente", width / 2, height / 2 + 40);
  }
}

function drawMenu() {
  fill(255);
  textSize(48);
  text("Campo & Cidade", MAP_W / 2, 80);

  textSize(28);
  fill(255);
  text("Pressione ENTER para jogar", MAP_W / 2, MAP_H / 2);

  textSize(16);
  fill(255);
  textAlign(LEFT, TOP);
  text(
    "Instruções:\n- Mova-se com as teclas WASD ou setas.\n- Pressione E perto de um emoji de animal para completar tarefas.\n- Fuja do impostor vermelho!\n- Não seja atropelado pelo trator!\n- Complete todas as tarefas para vencer.",
    40,
    120
  );
  textAlign(CENTER, CENTER);
}

function handlePlayerControls() {
  let dx = 0, dy = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) dx = -1;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) dx = 1;
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) dy = -1;
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) dy = 1;
  if (dx !== 0 || dy !== 0) {
    const v = createVector(dx, dy).normalize();
    player.move(v.x, v.y);
  }
}

function keyPressed() {
  if (gameState === "menu" && keyCode === ENTER) {
    gameState = "jogando";
    return;
  }

  if (key === "e" || key === "E") attemptTask();
  if (key === "r" || key === "R") {
    if (gameState !== "jogando") resetGame();
  }
}

function attemptTask() {
  for (const t of tasks) {
    if (!t.done && p5.Vector.dist(player.pos, t.pos) < 25) {
      t.done = true;
      completed++;
      if (completed >= TOTAL_TASKS) {
        gameState = "venceu";
      }
      break;
    }
  }
}

function checkCollisions() {
  if (p5.Vector.dist(player.pos, imposter.pos) < (player.size + imposter.size) / 2) {
    gameState = "perdeu";
  }
}

function checkTractorCollision() {
  if (abs(player.pos.x - tractorX) < 25 && abs(player.pos.y - MAP_H / 2) < 25) {
    gameState = "atropelado";
  }
}

function resetGame() {
  completed = 0;
  gameState = "jogando";
  player.pos.set(MAP_W / 4, MAP_H / 2);
  imposter.pos.set((3 * MAP_W) / 4, MAP_H / 2);
  generateTasks();
  tractorX = -100;
}
