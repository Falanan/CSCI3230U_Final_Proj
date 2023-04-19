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
            brand: item.brand,
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

        function getProductsPerCategory(products) {
          const categoryCounts = {};
        
          products.forEach(product => {
            if (categoryCounts[product.category]) {
              categoryCounts[product.category]++;
            } else {
              categoryCounts[product.category] = 1;
            }
          });
        
          return Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));
        }
        
        const productsPerCategory = getProductsPerCategory(products);

        function getProductsPerBrand(products) {
          const brandCounts = {};
        
          products.forEach(product => {
            if (brandCounts[product.brand]) {
              brandCounts[product.brand]++;
            } else {
              brandCounts[product.brand] = 1;
            }
          });
        
          return Object.entries(brandCounts).map(([brand, count]) => ({ brand, count }));
        }
        
        const productsPerBrand = getProductsPerBrand(products);
        
        
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
        const stockData = aggregateStockByCategory(products);

        
    
        displayProductStatistics(products);
        // drawCategoryChart(chartData);
        drawStockByCategoryChart(stockData);
        drawTopRatedProductsChart(topRatedProducts);
        drawAveragePricePerCategoryChart(averagePricePerCategoryData);
        drawTopDiscountedProductsChart(topDiscountedProducts);
        drawProductsPerCategoryPieChart(productsPerCategory);
        drawPieChart(productsPerBrand);
       

      } 
    });
}
//create a top 10 and others category for the brand piechart (drawPieChart)
function prepareDataForPieChart(products, limit) {
  const brandCounts = products.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1;
    return acc;
  }, {});

  const sortedBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1]);

  const topBrands = sortedBrands.slice(0, limit);
  const otherBrandsCount = sortedBrands.slice(limit).reduce((acc, brand) => acc + brand[1], 0);

  if (otherBrandsCount > 0) {
    topBrands.push(["Others", otherBrandsCount]);
  }

  return topBrands;
}
function drawPieChart(data) {
  const width = 400;
  const height = 400;
  const radius = Math.min(width, height) / 2;
  const dataN = prepareDataForPieChart(data, 8);

  const svg = d3.select("#pie-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const pie = d3.pie()
    .value(d => d[1]); 

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const arcs = svg.selectAll("g.arc")
    .data(pie(dataN))
    .enter()
    .append("g")
    .attr("class", "arc");

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", (d, i) => color(i));

 
  const total = dataN.reduce((acc, item) => acc + item[1], 0);

  


  const legend = d3.select("#pie-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const legendRectSize = 18;
  const legendSpacing = 4;

  const legendData = dataN.map((item, index) => ({ label: item[0], color: color(index) }));

  const legendItems = legend.selectAll('.legend-item')
    .data(legendData)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0,${i * (legendRectSize + legendSpacing)})`);

  legendItems.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', d => d.color)
    .style('stroke', d => d.color);

  legendItems.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(d => d.label);
   

    
}


function drawProductsPerCategoryPieChart(data) {
  const width = 400;
  const height = 400;
  const radius = Math.min(width, height) / 2;

  const svg = d3.select("#products-per-category-pie-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const pie = d3.pie()
    .value(d => d.count);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const arcs = svg.selectAll("g.arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc");

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", (d, i) => color(i));

  arcs.append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .text(d => d.data.category);
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

  //bar chart version of category chart, using pie chart instead
  // function drawCategoryChart(data) {
  //   const width = 500;
  //   const height = 200;
  //   const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  
  //   const x = d3.scaleBand()
  //     .domain(data.map(d => d.category))
  //     .rangeRound([margin.left, width - margin.right])
  //     .padding(0.1);
  
  //   const y = d3.scaleLinear()
  //     .domain([0, d3.max(data, d => d.count)])
  //     .range([height - margin.bottom, margin.top]);
  
  //   const svg = d3.select("#category-chart")
  //     .append("svg")
  //     .attr("viewBox", [0, 0, width, height]);
  
  //   svg.append("g")
  //     .attr("fill", "steelblue")
  //     .selectAll("rect")
  //     .data(data)
  //     .join("rect")
  //     .attr("x", d => x(d.category))
  //     .attr("y", d => y(d.count))
  //     .attr("height", d => y(0) - y(d.count))
  //     .attr("width", x.bandwidth());
  
  //   svg.append("g")
  //     .call(d3.axisLeft(y))
  //     .attr("transform", `translate(${margin.left},0)`);
  
  //   svg.append("g")
  //     .call(d3.axisBottom(x))
  //     .attr("transform", `translate(0,${height - margin.bottom})`);
  // }
  
  
  fetchProductData();
  
  