$(document).ready(function(){
    // fetchDetailedData();
    fetchCategoriesData();
})


function fetchCategoriesData(params) {
    fetch('https://dummyjson.com/products/categories')
    .then(res => res.json())
    .then(categories => {
        const tagsContainer = document.querySelector('.tags');
        categories.forEach(category => {
        const tag = document.createElement('a');
        tag.classList.add('tag');
        // tag.classList.add('tag');
        tag.textContent = category;
        // tag.href = `#category/${category}`; // add a link to the category page
        tag.addEventListener('click', (event) => {
            event.preventDefault();
            const categoryName = category;
            fetchDetailedData(categoryName);
          });
        tagsContainer.appendChild(tag);
        });
    });

}



function fetchDetailedData(category) {
    fetch('https://dummyjson.com/products/category/' + category)
    .then(res => res.json())
    .then((data) => {
        console.log(data.products[0]);
        fillDetailedData(data.products);
    });
}

function removeAllChild(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
}



function fillDetailedData(products) {
    // console.log("Products: ", products);
    

    const container = document.getElementById("rowholder1");
    removeAllChild(container);

    for (let index = 0; index < products.length; index++) {
        const product = products[index];

        let rowHolder = document.createElement("div");
        rowHolder.classList.add('column','is-4');

        const card = document.createElement("div");
        card.classList.add('card');

        const cardImage = document.createElement('div');
        cardImage.classList.add('card-image');


        // Create previous and next buttons
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Prev';
        prevButton.classList.add('button', 'is-primary');
        prevButton.style.position = 'absolute';
        prevButton.style.top = '50%';
        prevButton.style.left = '0';
        prevButton.style.transform = 'translateY(-50%)';
        prevButton.style.zIndex = 1;

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.classList.add('button', 'is-primary');
        nextButton.style.position = 'absolute';
        nextButton.style.top = '50%';
        nextButton.style.right = '0';
        nextButton.style.transform = 'translateY(-50%)';
        nextButton.style.zIndex = 1;

        let imageIndex = 0;

        prevButton.addEventListener('click', () => {
            imageIndex = (imageIndex - 1 + product.images.length) % product.images.length;
            image.src = product.images[imageIndex];
        });

        nextButton.addEventListener('click', () => {
            imageIndex = (imageIndex + 1) % product.images.length;
            image.src = product.images[imageIndex];
        });

        cardImage.appendChild(prevButton);
        cardImage.appendChild(nextButton);

        

        const figure = document.createElement('figure');
        figure.classList.add('image', 'is-4by3');

        const image = document.createElement('img');
        image.src = product.images[0];
        image.alt =  product.title + 'image';
        // image.width = 1280;
        // image.height = 960;

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

        content.appendChild(document.createElement('br'));
        // content.appendChild(document.createElement('br'));
        const discountPercentage = document.createElement('p');
        discountPercentage.classList.add('subtitle', 'is-6');
        discountPercentage.textContent = `Discount Percentage: ${product.discountPercentage.toFixed(2)} %`;
        content.appendChild(discountPercentage);

        cardContent.appendChild(content);
        card.appendChild(cardContent);

        // Create the "Add to Cart" button
        const buyButton = document.createElement('button');
        buyButton.textContent = 'Add to Cart';
        buyButton.classList.add('button', 'is-primary');
        buyButton.style.margin = "10px";

        // Add an event listener to the button
        buyButton.addEventListener('click', () => {
            // Do something when the button is clicked
            console.log(`Buy ${product.title} for $${product.price.toFixed(2)}`);
            // data to send to server
            let data = {productName : product.title, image : product.images[0], price : product.price.toFixed(2)};
            fetch('/addToCart', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
              })
              .then(() => {
                console.log('Added to cart!');
              })
              .catch((error) => {
                console.error('Error adding to cart', error);
              });
        });

        // Append the button to the card
        card.appendChild(buyButton);

        // Append the card to the container
        rowHolder.appendChild(card);

        container.appendChild(rowHolder);
        
    }
}

