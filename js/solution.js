"use strict";

// для Сергея

const currentImg = document.querySelector(".current-image");
const wrap = document.querySelector('.wrap');
const menu = document.querySelector('.menu');
const burger = document.querySelector('.burger');
const share = document.querySelector('.share');
const comments = document.querySelector('.comments');
const draw = document.querySelector('.draw');
const menuCopy = document.querySelector('.menu_copy');
const menuUrl = document.querySelector('.menu__url');
const mode = document.querySelectorAll('.mode');	
// const share = document.querySelector('.share');

// burger.style.display = 'none'; 
// вид по заданию

// menu.dataset.state = 'default';

// костыль чтоб бургер работал
getMenuDefault();
burger.addEventListener('click', getMenuSelected);
// burger.addEventListener('click', getMenuSelected);
 

function getImg() {
	let imgFromStorage = JSON.parse(localStorage.img);
	currentImg.src = imgFromStorage.url;
}

if (localStorage.length !== 0) {
	getImg();
	// getMenuSelectedShare();
} else {
	
	hideCurrentImg(); 
}


function hideCurrentImg() {

	currentImg.style.display = "none";
}

document.addEventListener("blur", clearStorage);


function clearStorage() {
	localStorage.clear();
};


// ~~~~~~~  Перетаскивание меню ~~~~~~~

let movedMenu = null;

let maxX, maxY, menuWidth, menuHeight;
let minX = 0;
let minY = 0;

const dragStart = event => {
	if (event.target.classList.contains('drag')) {
		movedMenu = event.target;
	}
};

const drag = throttle((x, y) => {

	if (movedMenu) {
		const menu = movedMenu.parentNode;

  	x = x - movedMenu.offsetWidth / 2; // держать курсор по середине элемента меню drag
  	y = y - movedMenu.offsetHeight / 2;

  	maxX = wrap.offsetWidth - menu.offsetWidth;
  	maxY = wrap.offsetHeight - menu.offsetHeight;

  	x = Math.min(x, maxX);
  	y = Math.min(y, maxY);
  	x = Math.max(x, minX);
  	y = Math.max(y, minY);
  	menu.style.left = x + 'px';
  	menu.style.top = y + 'px';

  }
});


const drop = event => {
	if (movedMenu) {

		document.removeEventListener('mousemove', event => drag(event.pageX, event.pageY));
		document.removeEventListener('touchend', event => drop(event.changedTouches[0]));

		movedMenu = null;
	}
};

document.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', event => drag(event.pageX, event.pageY));
document.addEventListener('mouseup', drop);

document.addEventListener('touchstart', event => dragStart(event.touches[0])); // [0] - берем первое касание первого пальца
document.addEventListener('touchmove', event => drag(event.touches[0].pageX, event.touches[0].pageY));
//~~~~~~~ !!!!!!  Здесь надо протестить на тачскрине !!!!!!  ~~~~~~~~~
document.addEventListener('touchend', event => drop(event.changedTouches[0]));  


function throttle(callback) {
	let isWaiting = false;
	return function () {
		if (!isWaiting) {
			callback.apply(this, arguments);
			isWaiting = true;
			requestAnimationFrame(() => {
				isWaiting = false;
			});
		}
	};
}


// ~~~~~~~загрузка изображения с компьютера


const newFile = document.querySelector('.new');
let files;
const loader = document.querySelector('.image-loader');

const downloadFile = event => {

	const inputHidden = document.createElement("input");
	

	inputHidden.type = "file";
	inputHidden.id = "fileInput";
	inputHidden.accept = "image/jpg, image/png"; 
	inputHidden.style ="position:absolute; top:-999px; display:none";
	inputHidden.click();
	inputHidden.addEventListener('change', onSelectFiles);

};


function onSelectFiles(event) { 

	event.preventDefault();
	files = Array.from(event.target.files);
	try { send(files);
	} catch(e) {
		alert (e.message);
	}
}

function onSelectFilesDrop(event) {
	event.preventDefault();
	wrap.style.border = 'none';

	if (event.target.classList.contains('wrap')) { 	
		files = Array.from(event.dataTransfer.files);
		// send(files);
		try { send(files);
		} catch(e) {
			alert (e.message);
		}
	}
}

function onSecondDrop(event) {
	event.preventDefault();
	alert("Воспользользуйтесь опцией «Загрузить новое»");
}

const send = function() {
	// console.log(files[0].type);

	const error = document.querySelector(".error");

	if (files[0].type === "image/png" || files[0].type === "image/jpeg") {

		error.style.display = "none";
		let xhr = new XMLHttpRequest();
		const formData = new FormData();
		formData.append('title', files[0].name);
		formData.append('image', files[0]);

		xhr.addEventListener("loadstart", onLoadStart); 
		xhr.addEventListener("loadend", event => onLoadEnd(xhr.response));
		xhr.open('POST', 'https://neto-api.herokuapp.com/pic', /* async = */ true);
		xhr.send(formData);
	} else {
		error.style.display = "block";
		return;
	}
}; 


function onLoadStart() {
	loader.style.display = 'block';
}

function onLoadEnd(response) {
	try {
		loader.style.display = 'none';

    const imageObject = JSON.parse(response);

 currentImg.src = imageObject.url;

// window.history.pushState(null, null, url);
const url = document.location.href.split('?')[0] + '?id=' + imageObject.id;
// console.log(url);

		// const url = 'https://maxxapok.github.io/diplonama/index.html' + '?id=' + imageObject.id;
		menuUrl.value = url;

		// window.history.pushState(null, null, url);

		getWsSrc(imageObject.id);
		setTimeout(currentImgDisplay, 1000);
		saveImg(imageObject);
		getMenuSelectedShare();

		wrap.removeEventListener('drop', onSelectFilesDrop);
		wrap.addEventListener('drop', onSecondDrop);
 	} catch(e) {
		alert('При публикации произошла ошибка: '+e.message+'. Попробуйте заново загрузить изображение');
	}
}

// 3 функции обЪединить

function getMenuSelectedShare() {
	menu.dataset.state = 'selected';
	share.dataset.state = 'selected';
}

function getMenuSelectedComments() {
	menu.dataset.state = 'selected';
	comments.dataset.state = 'selected';
}

function getMenuSelectedDraw() {
	menu.dataset.state = 'selected';
	draw.dataset.state = 'selected';
}

// 2 функции для костыля чтоб бургер работал

function getMenuDefault() {

	const menuItemsWithDataAttr = document.querySelectorAll(".menu__item[data-state]");
	
	for (let item of menuItemsWithDataAttr) {
		item.style.display = 'none';

	}
}

function getMenuSelected(event) {
	const menuItemsWithDataAttr = document.querySelectorAll(".menu__item[data-state]");
    // menu.dataset.state = 'selected';
	
	for (let item of menuItemsWithDataAttr) {
		item.style.display = 'inline-block';
		item.dataset.state = 'default';
	}
}



function currentImgDisplay() {
	currentImg.style.display = "block";
}

function saveImg(img) { 
	localStorage.img = JSON.stringify(img);
}



function onError() {
	alert("Сработало событие error");
}

// копирование в буфер обмена
function copyToBuffer() {
	menuUrl.select();
	document.execCommand('copy');
}

// передачка по ссылке!!!



newFile.addEventListener('click', downloadFile);
wrap.addEventListener('drop', onSelectFilesDrop); 
wrap.addEventListener('dragover', event => { 

	event.preventDefault(); 
	if (event.target.classList.contains('wrap')) { 
		event.target.style.border = '2px solid red'; 
	} 
}
);

comments.addEventListener('click', getMenuSelectedComments);
share.addEventListener('click', getMenuSelectedShare);
draw.addEventListener('click', getMenuSelectedDraw);
document.addEventListener('error', onError);
// document.addEventListener('blur', getMenuSelectedComments);
menuCopy.addEventListener('click',copyToBuffer);

// сделать переход по ссылке!!!

// доделать чтоб менюшка оставалась на месте

// комменты должны сохраняться при обновлении страницы

// коммент-пример убрать 



// Режим комментирование

const menuToggleOn = document.getElementById('comments-on');
const menuToggleOff = document.getElementById('comments-off');
const menuToggleTitleOn = document.querySelector('.menu__toggle-title_on');
const menuToggleTitleOff = document.querySelector('.menu__toggle-title_off');
const menuToggleBg = document.querySelector('.menu__toggle-bg');

let commentsFormCol = document.querySelectorAll('.comments__form');

function menuToggleGetOn() {

	if (menuToggleOn.checked = true) {
		for (let item of commentsFormCol) {
			item.style.display = 'block';
		}
	} 
}

function menuToggleGetOff () {
	if (menuToggleOff.checked = true) {
		for (let item of commentsFormCol) {
			item.style.display = 'none';
		}
 	} 	
}
menuToggleOn.addEventListener('click', menuToggleGetOn);
menuToggleTitleOn.addEventListener('click', menuToggleGetOn);
menuToggleOff.addEventListener('click', menuToggleGetOff);
menuToggleTitleOff.addEventListener('click', menuToggleGetOff);
document.addEventListener('DOMContentLoaded', menuToggleGetOn);

wrap.addEventListener('click', addCommentForm);


function addCommentForm(event) {

	if (!event.target.classList.contains('current-image')) {
		return;
	} else {
		let newCommentForm = commentsFormCol[0].cloneNode(true);
		newCommentForm.style.top = event.pageY + 'px';
		newCommentForm.style.left = event.pageX + 'px';
		let divToRemoveCol = newCommentForm.querySelectorAll('.comment');

		for (let item of divToRemoveCol) {
			item.remove();
		}

		wrap.appendChild(newCommentForm);
		let currentInput = newCommentForm.querySelector('.comments__marker-checkbox');
		currentInput.setAttribute('disabled', 'true');

	// обновляем коллекцию
	commentsFormCol = document.querySelectorAll('.comments__form');

	for (let item of commentsFormCol) {
		let inputToHide = item.querySelector('.comments__marker-checkbox');
		inputToHide.checked = false;
	}
	currentInput.checked = true; 
}
addSubmitListeners();
}


// вебсокет

function getWsSrc (id) {
	const srcWebsocket = 'wss://neto-api.herokuapp.com/pic/' + id;
	openWebsocket(srcWebsocket);
}

let connect;
function openWebsocket(srcWebsocket) {
	connect = new WebSocket(srcWebsocket);
	connect.addEventListener('open', chatOpen);
	connect.addEventListener('message', event => {
		getMessage(event.data);
	});
}

function addSubmitListeners() {
	let commmentsSubmitCol = document.querySelectorAll('.comments__submit');
	for (let item of commmentsSubmitCol) {
		item.addEventListener('click', sendMessage);
	}
}

function chatOpen(argument) {
	// body...
}


function sendMessage(event) {

	event.preventDefault();
	let commentsSubmitParent = event.target.parentNode;
	let commentsArea = commentsSubmitParent.querySelector('.comments__input');
	let commentsText = commentsArea.value;

	if (commentsText.lenght == 0) {
		return false;
	}
	connect.send(commentsText);
	displayMessage(commentsText, commentsArea);

}

function displayMessage(commentsText, commentsArea) {
	let newCommentDiv = document.createElement('div');
	newCommentDiv.classList.add('comment');

	let newCommentTimeP = document.createElement('p');
	newCommentTimeP.classList.add('comment__time');
	let now = new Date();
	newCommentTimeP.textContent = `${now.getHours()} : ${now.getMinutes()}`;
	newCommentDiv.appendChild(newCommentTimeP);

	let newCommentMessageP = document.createElement('p');
	newCommentMessageP.classList.add('comment__message');
	
	newCommentMessageP.textContent = commentsText;
	newCommentDiv.appendChild(newCommentMessageP);
	commentsArea.before(newCommentDiv);

	commentsArea.value = '';
}

function getMessage(data) {

	// console.log(data);

	const dataParsed = JSON.parse(data);

	if (dataParsed.event == 'comment') {
		const commentTop = data.comment.top;
		const commentLeft = data.comment.left;

		for (let item of commentsFormCol) {

			if ((item.style.top == commentTop)&&(item.style.left == commentLeft)) {
				const currentCommentsAreaToShow = item.querySelector('.comments__marker-checkbox');
				currentCommentsAreaToShow.checked = true;
				displayMessage(data.comment.message, currentCommentsArea);
			} else {
				const currentCommentsAreaToHide = item.querySelector('.comments__marker-checkbox');
				currentCommentsAreaToHide.checked = false;

			}
			

		}
	}

}

// const regexp = /id=([^&]+)/i;
// if (!!regexp.exec(document.location.search)) {
//     let picID = regexp.exec(document.location.search)[1];
//     console.log(picID);
// }

// привет
// пока