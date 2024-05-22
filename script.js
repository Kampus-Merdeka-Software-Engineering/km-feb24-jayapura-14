// Function untuk mengubah tampilan berdasarkan pilihan dropdown
function changeDisplay() {
    const select = document.getElementById('dropdownSelect');
    const tampilan1 = document.getElementById('tampilan1');
    const tampilan2 = document.getElementById('tampilan2');

    if (select.value === 'tampilan1') {
        tampilan1.style.display = 'block';
        tampilan2.style.display = 'none';
    } else if (select.value === 'tampilan2') {
        tampilan1.style.display = 'none';
        tampilan2.style.display = 'block';
    }
}
