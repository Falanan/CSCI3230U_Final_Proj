function fetchData() {
    fetch('https://dummyjson.com/products')
    .then(res => res.json())
    .then((data) => {
        console.log(data);
    });
}

fetchData();