document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.querySelector(".search-box");
    const searchInput = searchForm.querySelector("input");
    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const searchText = searchInput.value.trim().toLowerCase();
        if (searchText === "") {
            alert("Please enter something to search.");
            return;
        }
        if (searchText.includes("sketch")) {
            window.location.href = "Sketches.html";

        } else if (
            searchText.includes("paint")
        ) {
            window.location.href = "Paintings.html";

        } else if (
            searchText.includes("portrait")
        ) {
            window.location.href = "Portraits.html";

        } else if (
            searchText.includes("gift") ||
            searchText.includes("custom")
        ) {
            window.location.href = "CustomGifts.html";

        } else {
            alert("Sorry, we couldn't find anything matching your search.");
        }

    });

});