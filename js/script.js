function changeDisplay(tampilan) {
    // Hilangkan kelas 'selected' dari semua tombol
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(button => button.classList.remove('selected'));

    const tampilan1 = document.getElementById('tampilan1');
    const tampilan2 = document.getElementById('tampilan2');
    
    if (tampilan === 'tampilan1') {
        tampilan1.style.display = 'block';
        tampilan2.style.display = 'none';
        document.querySelector('[onclick="changeDisplay(\'tampilan1\')"]').classList.add('selected');
    } else if (tampilan === 'tampilan2') {
        tampilan2.style.display = 'block';
        tampilan1.style.display = 'none';
        document.querySelector('[onclick="changeDisplay(\'tampilan2\')"]').classList.add('selected');
    }

    // Sembunyikan semua tampilan dengan animasi
    const tampilans = document.querySelectorAll('.tampilan');
    tampilans.forEach(t => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(100%)';
        setTimeout(() => t.style.display = 'none', 500); // Tunggu hingga transisi selesai
    });

    // Tampilkan tampilan yang sesuai dengan animasi
    setTimeout(() => {
        const selectedTampilan = document.getElementById(tampilan);
        selectedTampilan.style.display = 'block';
        selectedTampilan.style.opacity = '1';
        selectedTampilan.style.transform = 'translateX(0)';
    }, 500); // Waktu harus sama dengan durasi transisi
}

