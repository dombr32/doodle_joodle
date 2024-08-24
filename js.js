const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

// добавляем персонажа и платформу
const classic_doodle = new Image();
classic_doodle.src = "images/classic_doodle.png"; 

const platformImg = new Image();
platformImg.src = "images/platform.png";

// задаём размеры платформ
const platformWidth = 70;
const platformHeight = 15;
const platformStart = canvas.height - 30;


let platforms = [{
    // стартовая платформа (находится сразу под игроком)
    x: canvas.width / 2 - platformWidth / 2,
    y: platformStart
}];

// расстояния между платформами
let minPlatformSpace = 120;
let maxPlatformSpace = 180;

// рандомайзер для размещения платформ
function random(min, max) {
    return Math.random() * (max - min) + min;
};

// 
let y = platformStart;
while (y > 0) {
  // расположение следующей платформы в диапазоне указанных значенй
  y -= platformHeight + random(minPlatformSpace, maxPlatformSpace);

  let x;
  do {
    x = random(25, canvas.width - 25 - platformWidth); //25 - отступ от краев
  } while (
    y > canvas.height / 2 &&
    x > canvas.width / 2 - platformWidth * 1.5 &&
    x < canvas.width / 2 + platformWidth / 2
  );

  platforms.push({ x, y });
}

// данные дудлера
const gravity = 0.33;
const accel = 0.3;
const bounceVelocity = -12.5;

const doodle = {
    width: 40,
    height: 60,
    x: canvas.width / 2 - 20,
    y: platformStart - 60,
    
  
    // speed
    dx: 0,
    dy: 0
  };

let playerDir = 0;
let keydown = false;
let prevDoodleY = doodle.y;