let cart = 0;

const count = document.getElementById('count');
const toast = document.getElementById('toast');

let timer;

function notify(message) {
    toast.textContent = message;

    toast.classList.add('show');

    clearTimeout(timer);

    timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2200);
}


// إضافة المنتجات إلى السلة

document.querySelectorAll('.add').forEach(button => {

    button.addEventListener('click', () => {

        cart++;

        count.textContent = cart;

        notify('تمت إضافة القطعة إلى السلة');

    });

});


// عرض عدد المنتجات في السلة

document.getElementById('cart').addEventListener('click', () => {

    notify('عدد القطع في السلة: ' + cart);

});


// زر المفضلة

document.getElementById('fav').addEventListener('click', () => {

    notify('قائمة المفضلة');

});


// فتح القائمة

document.getElementById('menu').addEventListener('click', () => {

    document.getElementById('nav').classList.toggle('open');

});


// إغلاق القائمة بعد اختيار صفحة

document.querySelectorAll('nav a').forEach(link => {

    link.addEventListener('click', () => {

        document.getElementById('nav').classList.remove('open');

    });

});


// البحث عن الملابس

document.getElementById('search').addEventListener('input', event => {

    let q = event.target.value.toLowerCase().trim();

    let n = 0;

    document.querySelectorAll('.tile').forEach(tile => {

        let ok = tile.dataset.name.toLowerCase().includes(q);

        tile.style.display = ok ? '' : 'none';

        if (ok) {
            n++;
        }

    });

    document.getElementById('empty').hidden = n !== 0;

});