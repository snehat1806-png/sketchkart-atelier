document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.querySelector(".search-box");

    if (searchForm) {

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
    }
});

let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartContainer = document.querySelector("#cart-container");

if (cartContainer) {
    cart.forEach(function (item) {
        const product = document.createElement("div");
        product.innerHTML = `
    <h3>${item.name}</h3>
    <p>₹${item.price}</p>

    <div class="quantity-controls">
        <button class="decrease">−</button>
        <span>${item.quantity}</span>
        <button class="increase">+</button>
    </div>
`;
        const decreaseButton = product.querySelector(".decrease");
        const increaseButton = product.querySelector(".increase");

        increaseButton.addEventListener("click", function () {
            item.quantity += 1;

            localStorage.setItem("cart", JSON.stringify(cart));

            location.reload();
        });

        decreaseButton.addEventListener("click", function () {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                cart = cart.filter(function (product) {
                    return product.name !== item.name;
                });
            }

            localStorage.setItem("cart", JSON.stringify(cart));

            location.reload();
        });
        cartContainer.appendChild(product);
    });
}
const cartButtons = document.querySelectorAll(".add-to-cart");

cartButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const name = button.dataset.name;
        const price = button.dataset.price;
        const existingProduct = cart.find(function (item) {
            return item.name === name;
        });

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        console.log(cart);
    });
});