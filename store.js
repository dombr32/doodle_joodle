"use strict";

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

const recordsPush = document.getElementById('recordsPush');
recordsPush.addEventListener('click', storeInfo);


function store() {
    const name=document.getElementById('userName').value;
    const doodler=document.querySelector('input[name="doodlerType"]:checked');
    localStorage.setItem('userName',name);
    localStorage.setItem('doodlerType',doodler.value);
}


const scores=localStorage.getItem('score');


// добавляем данные на сервер через ajax

const ajaxHandlerScript="https://fe.it-academy.by/AjaxStringStorage2.php";
let updatePassword;
const stringName='DAMBROUSKI_GAME';
let records; // элемент массива - {name:'Иванов',score:'12'};


// function storeInfo() {
export const storeInfo = () => {
    updatePassword=Math.random();
    $.ajax( {
            url : ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
            data : { f : 'LOCKGET', n : stringName, p : updatePassword },
            success : lockGetReady, error : errorHandler
        }
    );
}

function lockGetReady(callresult) {
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

        records.push( { name:userName, score:scores } );
        if ( records.length>8 )
            records=records.slice(records.length-8);
        $.ajax( {
                url : ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
                data : { f : 'UPDATE', n : stringName,
                    v : JSON.stringify(records), p : updatePassword },
                success : updateReady, error : errorHandler
            }
        );
    }
}

function updateReady(callresult) {
    if ( callresult.error!=undefined )
        alert(callresult.error);
}

function restoreInfo() {
    $.ajax(
        {
            url : ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
            data : { f : 'READ', n : stringName },
            success : readReady, error : errorHandler
        }
    );
}

const recordsBut = document.getElementById('recordsButton');
recordsBut.addEventListener('click', showRecords);

// показывает рекорда
function showRecords() {
    let str='-Records-<br>';
    for ( let i=0; i<records.length; i++ ) {
        const userScore=records[i];
        str+="<b>"+escapeHTML(userScore.name)+"..........</b> "
            +escapeHTML(userScore.score)+"<br />";
    }
    let game = document.getElementById('game');
    game.style.display = 'none';
    let recordsTable = document.getElementById('records');
    recordsTable.innerHTML=str;
    
}

// получает сообщения с сервера, добавляет новое,
// показывает и сохраняет на сервере
function sendMessage() {
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




function readReady(callresult) {
    if ( callresult.error!=undefined )
        alert(callresult.error);
    else  {
            records=[];
        if ( callresult.result!="" ) { // строка пустая - сообщений нет
            // либо в строке - JSON-представление массива сообщений
            records=JSON.parse(callresult.result);
            // вдруг кто-то сохранил мусор?
            if ( !Array.isArray(records) )
            records=[];
        }
        showRecords();
    }
}



// избегаем "неправильных" символов ввода
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

function errorHandler(jqXHR,statusStr,errorStr) {
    alert(statusStr+' '+errorStr);
}


