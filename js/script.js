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
