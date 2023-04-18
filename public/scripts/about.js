function fetchProductData() {
    fetch('https://dummyjson.com/products')
    .then(res => res.json())
    .then((data) => {
      console.log('Fetched data:', data); // Log the fetched data

      if (Array.isArray(data.products)) {
        // Simulate product data by mapping the fetched data to product objects
        const products = data.products.map((item) => {
          return {
            id: item.id,
            name: item.title,
            price: item.price,
            rating: item.rating,
            category: item.category,
            stock: item.stock,
            discount: item.discountPercentage,
          };
        });
        const categoryData = products.reduce((categories, product) => {
          if (!categories[product.category]) {
            categories[product.category] = 1;
          } else {
            categories[product.category]++;
          }
          return categories;
        }, {});

        const chartData = Object.entries(categoryData).map(([category, count]) => {
          return { category, count };
        });

        function getTopRatedProducts(products, limit = 10) {
          const sortedProducts = products.sort((a, b) => b.rating - a.rating);
          return sortedProducts.slice(0, limit);
        }
        
        const topRatedProducts = getTopRatedProducts(products);

        function getAveragePricePerCategory(products) {
          const categories = {};
        
          products.forEach(product => {
            if (!categories[product.category]) {
              categories[product.category] = { sum: 0, count: 0 };
            }
            categories[product.category].sum += product.price;
            categories[product.category].count += 1;
          });
        
          return Object.entries(categories).map(([category, { sum, count }]) => ({
            category,
            averagePrice: sum / count,
          }));
        }
        
        const averagePricePerCategoryData = getAveragePricePerCategory(products);

        function getTopDiscountedProducts(products, topN) {
          return products
            .sort((a, b) => b.discount - a.discount)
            .slice(0, topN);
        }
        
        const topDiscountedProducts = getTopDiscountedProducts(products, 5);

    
        displayProductStatistics(products);
        drawCategoryChart(chartData);
        const stockData = aggregateStockByCategory(products);
        drawStockByCategoryChart(stockData);
        drawTopRatedProductsChart(topRatedProducts);
        drawAveragePricePerCategoryChart(averagePricePerCategoryData);
        drawTopDiscountedProductsChart(topDiscountedProducts);

      } 
    });
}

function drawTopDiscountedProductsChart(data) {
  const margin = { top: 20, right: 20, bottom: 100, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#top-discounted-products-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.discount)])
    .range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
    .attr("y", 0)
    .attr("x", -10)
    .attr("dy", ".35em")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(y));

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.name))
    .attr("y", d => y(d.discount))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.discount))
    .attr("fill", "#69b3a2");
}

function drawAveragePricePerCategoryChart(data) {
  const margin = { top: 20, right: 20, bottom: 100, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#average-price-per-category-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.averagePrice)])
    .range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
    .attr("y", 0)
    .attr("x", -10)
    .attr("dy", ".35em")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(y));

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.category))
    .attr("y", d => y(d.averagePrice))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.averagePrice))
    .attr("fill", "#69b3a2");
}
function drawTopRatedProductsChart(data) {
  const margin = { top: 20, right: 20, bottom: 100, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#top-rated-products-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.rating)])
    .range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
    .attr("y", 0)
    .attr("x", -10)
    .attr("dy", ".35em")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(y));

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.name))
    .attr("y", d => y(d.rating))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.rating))
    .attr("fill", "#69b3a2");
}





function drawStockByCategoryChart(data) {
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#stock-by-category-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.stock)])
    .range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.category))
    .attr("y", d => y(d.stock))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.stock))
    .attr("fill", "#69b3a2");
}
function aggregateStockByCategory(products) {
  const stockByCategory = {};

  products.forEach(product => {
    if (!stockByCategory[product.category]) {
      stockByCategory[product.category] = 0;
    }
    stockByCategory[product.category] += product.stock;
  });

  const aggregatedData = Object.entries(stockByCategory).map(([category, stock]) => {
    return { category, stock };
  });

  return aggregatedData;
}



function displayProductStatistics(products) {
    const totalProducts = products.length;
    const totalValue = products.reduce((total, product) => total + product.price, 0);
    const averagePrice = totalValue / totalProducts;
    const mostExpensiveProduct = products.reduce((max, product) => (product.price > max.price ? product : max), products[0]);
    const highestRatedProduct = products.reduce((max, product) => (product.rating > max.rating ? product : max), products[0]);
  
    document.getElementById('totalProducts').innerText = totalProducts;
    document.getElementById('highestRating').innerText = highestRatedProduct.name + `: ${highestRatedProduct.rating.toFixed(2)}`;
    document.getElementById('averagePrice').innerText = `$${averagePrice.toFixed(2)}`;

    document.getElementById('mostExpensive').innerText = mostExpensiveProduct.name + `: $${mostExpensiveProduct.price.toFixed(2)}`;
  }

  function drawCategoryChart(data) {
    const width = 500;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  
    const x = d3.scaleBand()
      .domain(data.map(d => d.category))
      .rangeRound([margin.left, width - margin.right])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .range([height - margin.bottom, margin.top]);
  
    const svg = d3.select("#category-chart")
      .append("svg")
      .attr("viewBox", [0, 0, width, height]);
  
    svg.append("g")
      .attr("fill", "steelblue")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.category))
      .attr("y", d => y(d.count))
      .attr("height", d => y(0) - y(d.count))
      .attr("width", x.bandwidth());
  
    svg.append("g")
      .call(d3.axisLeft(y))
      .attr("transform", `translate(${margin.left},0)`);
  
    svg.append("g")
      .call(d3.axisBottom(x))
      .attr("transform", `translate(0,${height - margin.bottom})`);
  }
  
  
  fetchProductData();
  
  