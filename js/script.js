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

/*feedback form*/ 
document.addEventListener("DOMContentLoaded", function () {
    const suggestionForm = document.getElementById("suggestionForm");
    const sendFeedback = document.getElementById("send-feedback");
    const thanksFeedback = document.getElementById("thanks-feedback");
    const okayButton = document.getElementById("okay-button");

    suggestionForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(suggestionForm);
        fetch(suggestionForm.action, {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                sendFeedback.style.display = "none";
                thanksFeedback.style.display = "block";
                suggestionForm.reset();
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    });

    okayButton.addEventListener("click", function (event) {
        event.preventDefault();
        thanksFeedback.style.display = "none";
        sendFeedback.style.display = "block";
        suggestionForm.reset();
    });
});
