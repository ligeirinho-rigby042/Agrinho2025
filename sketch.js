 const MAP_W = 800;
      const MAP_H = 600;
      const TOTAL_TASKS = 5;
      const ANIMAL_EMOJIS = ["🐄", "🐖", "🐑", "🐓", "🐕"];
      let player, imposter;
      let tasks = [];
      let completed = 0;
      let gameState = "jogando";

      function setup() {
        createCanvas(MAP_W, MAP_H);
        textFont("Arial");
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

      function draw() {
        background(30);
        drawBackground();

        textSize(24);
        for (const t of tasks) {
          if (!t.done) {
            text(t.emoji, t.pos.x, t.pos.y);
          }
        }

        player.draw();
        imposter.draw();

        fill(255);
        textSize(16);
        text("Tarefas: " + completed + " / " + TOTAL_TASKS, width / 2, 20);

        if (gameState === "jogando") {
          handlePlayerControls();
          imposter.pursue(player);
          checkCollisions();
        } else {
          textSize(36);
          fill(255);
          text(
            gameState === "venceu" ? "Você completou tudo! Vitória!" : "Oops, o impostor pegou você!",
            width / 2,
            height / 2
          );
          textSize(16);
          text("Pressione R para jogar novamente", width / 2, height / 2 + 40);
        }
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

      function resetGame() {
        completed = 0;
        gameState = "jogando";
        player.pos.set(MAP_W / 4, MAP_H / 2);
        imposter.pos.set((3 * MAP_W) / 4, MAP_H / 2);
        generateTasks();
      }
