$(document).ready(function(){
    fetchData()
})





function fetchData() {
    fetch('https://dummyjson.com/products')
    .then(res => res.json())
    .then((data) => {
        // console.log(data.products[0]);
        fillData(data.products);
    });
}



function fillData(products) {
    console.log("Products: ", products);

    const container = document.getElementById("rowholder1");

    for (let index = 0; index < products.length; index++) {
        const product = products[index];

        let rowHolder = document.createElement("div");
        rowHolder.classList.add('column','is-4');

        const card = document.createElement("div");
        card.classList.add('card');

        const cardImage = document.createElement('div');
        cardImage.classList.add('card-image');

        const figure = document.createElement('figure');
        figure.classList.add('image', 'is-4by3');

        const image = document.createElement('img');
        image.src = product.images[0];
        image.alt =  product.title + 'image';
        image.width = 1280;
        image.height = 960;

        figure.appendChild(image);
        cardImage.appendChild(figure);
        card.appendChild(cardImage);

        // Create the card content element
        const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');

        const media = document.createElement('div');
        media.classList.add('media');

        const mediaContent = document.createElement('div');
        mediaContent.classList.add('media-content');

        const productName = document.createElement('p');
        productName.classList.add('title', 'is-4');
        productName.textContent = product.title;

        mediaContent.appendChild(productName);
        media.appendChild(mediaContent);
        cardContent.appendChild(media);

        const content = document.createElement('div');
        content.classList.add('content');
        content.textContent = product.description;

        const price = document.createElement('p');
        price.classList.add('subtitle', 'is-6');
        price.textContent = `Price: $${product.price.toFixed(2)}`;

        content.appendChild(document.createElement('br'));
        content.appendChild(document.createElement('br'));
        content.appendChild(price);

        cardContent.appendChild(content);
        card.appendChild(cardContent);

        // Append the card to the container
        rowHolder.appendChild(card);

        container.appendChild(rowHolder);
        
    }
}

