"use strict";

// import { storeInfo } from 'store.js';
// document.addEventListener('DOMContentLoaded',storeInfo);

const scoreTable = document.getElementById('score');
let score = 0;


//загружаем картинки
const classic_doodle = new Image();
classic_doodle.src = "images/classic_doodle.png"; 

const super_doodle = new Image();
super_doodle.src = "images/super_doodle.png"; 

const ninja_doodle = new Image();
ninja_doodle.src = "images/ninja_doodle.png"; 


const platformImg = new Image();
platformImg.src = "images/platform.png"; 


const canvas = document.getElementById('game');
const context = canvas.getContext('2d');



// задаём размеры платформ
const platformWidth = 70;
const platformHeight = 15;
const platformStart = canvas.height - 30;

// данные дудлера
const gravity = 0.33;
const drag = 0.3;
const bounceVelocity = -12.5;



// расстояния между платформами
let minPlatformSpace = 120;
let maxPlatformSpace = 180;

// стартовая платформа (находится сразу под игроком)
let platforms = [{
  x: canvas.width / 2 - platformWidth / 2,
  y: platformStart
}];

// рандомайзер для размещения платформ
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// первоначальное расставление платформ
let y = platformStart;
while (y > 0) {
  // растояние до каждой следующей платформы
  y -= platformHeight + random(minPlatformSpace, maxPlatformSpace);

// добавляем по 25 пикселей от каждой стороны и убираем возможность появления начальных платформ в центре
  let x;
  do {
    x = random(25, canvas.width - 25 - platformWidth);
  } while (
    y > canvas.height / 2 &&
    x > canvas.width / 2 - platformWidth * 1.5 &&
    x < canvas.width / 2 + platformWidth / 2
  );

  platforms.push({ x, y });
}


// данные дудлера
const doodle = {
  width: 45,
  height: 55,
  x: canvas.width / 2 - 20,
  y: platformStart - 60,
  
  dx: 0,
  dy: 0
};


// взаимодействие с пользователем 
let playerDir = 0;
let keydown = false;
let prevDoodleY = doodle.y;



// игра
function loop() {
  // requestAnimationFrame(loop);
  statusGame=1;
  request = requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);
  
  doodle.dy += gravity;

  // платформы вниз, когда дудлер пересек половину высоты канвас поля
  if (doodle.y < canvas.height / 2 && doodle.dy < 0) {
    platforms.forEach(function(platform) {
      platform.y += -doodle.dy;
      
    });

    

    // добавляем платформы
    while (platforms[platforms.length - 1].y > 0) {
      platforms.push({
        x: random(25, canvas.width - 25 - platformWidth),
        y: platforms[platforms.length - 1].y - (platformHeight + random(minPlatformSpace, maxPlatformSpace))
      })

      // в момент когда пушим новую платформу добавляем +1 ко счёту + звуковой сигнал
      score++;
      clickSoundJump();
      
      
      // console.log(score)
      scoreTable.innerHTML = score;

    }
  }
  else {
    doodle.y += doodle.dy;
  
  }

  // не зажата клавиша
  if (!keydown) {
    if (playerDir < 0) {
      doodle.dx += drag;

      if (doodle.dx > 0) {
        doodle.dx = 0;
        playerDir = 0;
      }
    }
    else if (playerDir > 0) {
      doodle.dx -= drag;

      if (doodle.dx < 0) {
        doodle.dx = 0;
        playerDir = 0;
      }
    }
  }

  doodle.x += doodle.dx;

  // левая и правая стороны игрового поля 
  if (doodle.x + doodle.width < 0) {
    doodle.x = canvas.width;
  }
  else if (doodle.x > canvas.width) {
    doodle.x = -doodle.width;
  }

  // рисуем платформы
  context.fillStyle = 'green';
  platforms.forEach(function(platform) {
    // context.fillRect(platform.x, platform.y, platformWidth, platformHeight);

    context.drawImage(platformImg, platform.x, platform.y, platformWidth, platformHeight)
    

    // прыжок с платформы 
    if (
      doodle.dy > 0 &&
      prevDoodleY + doodle.height <= platform.y &&

      doodle.x < platform.x + platformWidth &&
      doodle.x + doodle.width > platform.x &&
      doodle.y < platform.y + platformHeight &&
      doodle.y + doodle.height > platform.y
    ) {
      doodle.y = platform.y - doodle.height;
      doodle.dy = bounceVelocity;
        
    }
  });



  // console.log(doodle.y);

  // рисуем дудлера
  context.fillStyle = 'yellow';
  // context.fillRect(doodle.x, doodle.y, doodle.width, doodle.height);

  let doodlerType=JSON.parse(localStorage.getItem('doodlerType'));
    if ( doodlerType ) {
      if (doodlerType=='1')
      context.drawImage(classic_doodle, doodle.x, doodle.y, doodle.width, doodle.height);
      if (doodlerType=='2')
      context.drawImage(super_doodle, doodle.x, doodle.y, doodle.width, doodle.height);
      if (doodlerType=='3')
      context.drawImage(ninja_doodle, doodle.x, doodle.y, doodle.width, doodle.height);
    }
    else context.drawImage(classic_doodle, doodle.x, doodle.y, doodle.width, doodle.height);

    // if (score>10){
    // context.clearRect(doodle.x, doodle.y, doodle.width, doodle.height);
    // context.drawImage(super_doodle, doodle.x, doodle.y, doodle.width*1.5, doodle.height*1.5);
    
    // }
  prevDoodleY = doodle.y;
  
  //дудл вылетает за пределы игрового поля
  if (doodle.y > canvas.height){
    sendRecords();
    clickSoundFall();
    
    // doodle.y=canvas.height+doodle.height*0.999;
    doodle.dy=0;
    doodle.dx=0;
    
    
    stopGame();
    // statusGame = 0;
    
        scoreTable.innerHTML = 'Game over :(';
        context.fillStyle='Indigo';
        // context.font = '70px serif';
        // context.fillText('Game over ', 40,300);
        context.font = '70px serif';
        context.fillText('you scored', 40,300);
        context.fillText(score, 165,380);
        context.fillText('points', 100,460);

    // document.addEventListener('click', sendRecords);
    
    
    
  }
}

// управление дудлером при нажатии кнопки
document.addEventListener('keydown', function(eo) {
  // влево
    eo=eo||window.event; 
    // console.log(eo.key)

  if (eo.key === 'ArrowLeft') {
    keydown = true;
    playerDir = -1;
    doodle.dx = -3;

  }
  // вправо
  else if (eo.key === 'ArrowRight') {
    keydown = true;
    playerDir = 1;
    doodle.dx = 3;
  }
});

// остановка дудлера во время опускания клавиш
document.addEventListener('keyup', function(eo) {
  eo=eo||window.event; 
  keydown = false;
});



const clickAudioJump = new Audio("sounds/jump.wav");
const clickAudioFall = new Audio("sounds/fall.mp3");

let request;

let startBut = document.getElementById('startGame');
startBut.addEventListener('click', startGame, false)
// startBut.addEventListener('click', startGame, { once: true })

// запуск игры по кнопке
let playtBut = document.getElementById('playGame');
playtBut.addEventListener('click', playPauseGame)

// и остановка игры 
// let stopBut = document.getElementById('pauseGame');
// stopBut.addEventListener('click', stopGame)

let statusGame; // 0-pause, 1-game, 2-lose, 

function startGame() {
  // request = requestAnimationFrame(loop);

  if (statusGame==1){
    if (confirm('start a new game?')){
      statusGame=2;
      score=0;
      cancelAnimationFrame(request); 
      // startGame();
    } else  {
      statusGame = 1;
      playPauseGame();
    }
  }
  
  if (statusGame==2){
    debugger
    score = 0;
    context.clearRect(0,0,canvas.width,canvas.height);
    scoreTable.innerHTML = 'Your points';

    let game = document.getElementById('game');
    game.style.display = 'inline';
    let recordsTable = document.getElementById('records');
    recordsTable.style.display = 'none';
    scoreTable.innerHTML = 'Your points';


    doodle.x = canvas.width / 2 - 20; 
    doodle.y = platformStart - 100
    doodle.dx = 0;
    doodle.dy = 0

    platforms.x =  canvas.width / 2 - platformWidth / 2;
    platforms.y = platformStart;
    

    y = platformStart;
    while (y > 0) {
      // растояние до каждой следующей платформы
      y -= platformHeight + random(minPlatformSpace, maxPlatformSpace);
    
    // добавляем по 25 пикселей от каждой стороны и убираем возможность появления начальных платформ в центре
      let x;
      do {
        x = random(25, canvas.width - 25 - platformWidth);
      } while (
        y > canvas.height / 2 &&
        x > canvas.width / 2 - platformWidth * 1.5 &&
        x < canvas.width / 2 + platformWidth / 2
      );
    
      // platforms.push({ x, y });
    }


    // взаимодействие с пользователем 
    playerDir = 0;
    keydown = false;
    prevDoodleY = doodle.y;

    
    
    statusGame = 1;
    requestAnimationFrame(loop);

  } 
  
  else {
    statusGame = 1;
    
    requestAnimationFrame(loop);

    scoreTable.innerHTML = 'Your points';
    clickSoundInit();
  }
}

function playPauseGame() {
  // request = requestAnimationFrame(loop);
  if (statusGame!=1){
  requestAnimationFrame(loop);
  statusGame = 1;
  } if (statusGame==2){
    startGame();
  }
  else {cancelAnimationFrame(request);
    statusGame = 0;
  }
  // scoreTable.innerHTML = 'Your points';
  // clickSoundInit();
}

let scores;

function stopGame() {
  statusGame = 2;
  localStorage.setItem('score',score);
  scores=localStorage.getItem('score');
    cancelAnimationFrame(request); 
    // refreshRecords();
}

function clickSoundInit() {
  clickAudioJump.play(); // запускаем звук
  clickAudioJump.pause(); // и сразу останавливаем
  clickAudioFall.play(); 
  clickAudioFall.pause();
}

function clickSoundJump() {
  clickAudioJump.currentTime=0; // в секундах
  clickAudioJump.play();
}

function clickSoundFall() {
  clickAudioFall.currentTime=0; // в секундах
  clickAudioFall.play();
}


// requestAnimationFrame(loop);


// Работа с данными

// если игрок указал имя и выбрал дудлера сохраняем это в локальное хранилище
const userName=localStorage.getItem('userName');
if ( userName )
    document.getElementById('userName').value=userName;

const doodlerType = localStorage.getItem('doodlerType');
if (doodlerType) {
    const radioButton = document.querySelector(`input[name="doodlerType"][value="${doodlerType}"]`);
    if (radioButton) {
        // console.log(radioButton)
        radioButton.checked = true; // Устанавливаем выбранным сохраненное значение
    }
}

const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', store);


function store() {
    const name=document.getElementById('userName').value;
    const doodler=document.querySelector('input[name="doodlerType"]:checked');
    localStorage.setItem('userName',name);
    localStorage.setItem('doodlerType',doodler.value);
}


// let scores=localStorage.getItem('score');


// добавляем данные на сервер через ajax

const ajaxHandlerScript="https://fe.it-academy.by/AjaxStringStorage2.php";
let updatePassword;
const stringName='DAMBROUSKI_GAME';
let records; // элемент массива - {name:'Иванов',score:'12'};
const recordsBut = document.getElementById('recordsButton');
recordsBut.addEventListener('click', refreshRecords);


// показывает все рекорды из messages на страницу
function showRecords() {

  let str='-Records-<br>';
  for ( let i=0; i<records.length; i++ ) {
      const userScore=records[i];
      if (userScore.name==null) userScore.name = 'not authorized';
      str+=escapeHTML(userScore.name)+"........"
          +escapeHTML(userScore.score)+"<br />";
  }
  let game = document.getElementById('game');
  game.style.display = 'none';
  let recordsTable = document.getElementById('records');
  recordsTable.innerHTML=str;
}

function escapeHTML(text) {
  if ( !text )
      return text;
  text=text.toString()
      .split("&").join("&amp;")
      .split("<").join("&lt;")
      .split(">").join("&gt;")
      .split('"').join("&quot;")
      .split("'").join("&#039;");
  return text;
}

// получает рекорды с сервера и потом показывает
function refreshRecords() {
  $.ajax( {
          url : ajaxHandlerScript,
          type : 'POST', dataType:'json',
          data : { f : 'READ', n : stringName },
          cache : false,
          success : readReady,
          error : errorHandler
      }
  );

  statusGame=2;
}

// рекорды получены - показываем
function readReady(callresult) {
  if ( callresult.error!=undefined )
      alert(callresult.error);
  else {
      records=[];
      if ( callresult.result!="" ) { // строка пустая - сообщений нет
          // либо в строке - JSON-представление массива сообщений
          records=JSON.parse(callresult.result);
          // вдруг кто-то сохранил мусор?
          if ( !Array.isArray(records) )
          records=[];
      }
      // sendRecords()
      showRecords();
  }
}

// получает рекорды с сервера, добавляет новый,
// показывает и сохраняет на сервере
function sendRecords() {
  updatePassword=Math.random();
  $.ajax( {
          url : ajaxHandlerScript,
          type : 'POST', dataType:'json',
          data : { f : 'LOCKGET', n : stringName,
              p : updatePassword },
          cache : false,
          success : lockGetReady,
          error : errorHandler
      }
  );
}

// рекорды получены, добавляет, показывает, сохраняет
function lockGetReady(callresult) {
  if ( callresult.error!=undefined )
      alert(callresult.error);
  else {
      records=[];
      if ( callresult.result!="" ) { // строка пустая - рекордов нет
          // либо в строке - JSON-представление массива сообщений
          records=JSON.parse(callresult.result);
          // вдруг кто-то сохранил мусор?
          if ( !Array.isArray(records) )
          records=[];
      }

      if (userName==null || userName=='') userName='No name';
      if (scores>records[records.length-1].score){
        records.push( { name:userName, score:scores } );
        records.sort((a, b) => b.score - a.score);

        if ( records.length>5 )
          records=records.slice(records.length-1);
      } 
      
      

          // showRecords();
      $.ajax( {
              url : ajaxHandlerScript,
              type : 'POST', dataType:'json',
              data : { f : 'UPDATE', n : stringName,
                  v : JSON.stringify(records), p : updatePassword },
              cache : false,
              success : updateReady,
              error : errorHandler
          }
      );
      
  }
}

// сообщения вместе с новым сохранены на сервере
function updateReady(callresult) {
  if ( callresult.error!=undefined )
      alert(callresult.error);
      // showRecords();
      debugger
      setTimeout(showRecords, 1500);
      // scores=0
      // refreshRecords()
}

function errorHandler(jqXHR,statusStr,errorStr) {
  alert(statusStr+' '+errorStr);
}


