var modal = document.querySelector('.modal');

var btn = document.querySelector('button');

btn.addEventListener('click' , openModal);


function openModal(){
    modal.style.display = 'block';
    console.log('working');
}