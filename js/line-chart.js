//Load data

const parseDate = d3.timeParse("%d/%m/%Y");

d3.csv("../data/Urea_prices2.csv", d => ({
    Date: parseDate(d.Date),
    Urea: +d.Urea
})).then(data => {
    console.log(data);
    drawLineChart(data);
});

// Create the line chart here
const drawLineChart = (data) => {
    const margin = { top: 40, right: 170, bottom: 55, left: 40 };

    const width = 1000;
    const height = 500;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select("#line-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`);

    const innerChart = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const firstDate = d3.min(data, d => d.Date);
    const lastDate = d3.max(data, d => d.Date);

    const xScale = d3.scaleTime()
        .domain([firstDate, lastDate])
        .range([0, innerWidth]);

    const maxPrice = d3.max(data, d => d.Urea);
    const yScale = d3.scaleLinear()
        .domain([0, maxPrice * 1.05]) // adding some headroom
        .range([innerHeight, 0]);

    // grid first
    innerChart.append("g")
        .attr("class", "grid")
        .call(
            d3.axisLeft(yScale)
                .ticks(6)
                .tickSize(-innerWidth)
                .tickFormat("")
        );

    const bottomAxis = d3.axisBottom(xScale)
        .ticks(d3.timeMonth.every(6))
        .tickFormat(d => {
            const month = d.getMonth();
            if (month === 0) return d3.timeFormat("%Y")(d);
            if (month === 6) return "Jul";
            return "";
        });

    const leftAxis = d3.axisLeft(yScale);

    const aubergine = "#b52e5fff";

    innerChart
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("r", 2)
        .attr("cx", d => xScale(d.Date))
        .attr("cy", d => yScale(d.Urea))
        .attr("fill", aubergine);

    innerChart
        .append("g")
        .attr("class", "axis-x")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(bottomAxis);

    innerChart
        .append("g")
        .attr("class", "axis-y")
        .call(leftAxis);

    const lineGenerator = d3.line()
        .x(d => xScale(d.Date))
        .y(d => yScale(d.Urea))
        .curve(d3.curveCardinal);

    innerChart
        .append("path")
        .attr("d", lineGenerator(data))
        .attr("stroke", aubergine)
        .attr("stroke-width", 1.8)
        .attr("fill", "none");

    const areaGenerator = d3.area()
        .x(d => xScale(d.Date))
        .y0(yScale(0))
        .y1(d => yScale(d.Urea))
        .curve(d3.curveCardinal);

    innerChart
        .append("path")
        .attr("d", areaGenerator(data))
        .attr("fill", aubergine)
        .attr("fill", "url(#area-gradient)");

    //try and append area gradient fill
    const defs = svg.append("defs");

    const gradient = defs.append("linearGradient")
        .attr("id", "area-gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", aubergine)
        .attr("stop-opacity", 0);

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", aubergine)
        .attr("stop-opacity", 0.35);

    svg
        .append("text")
        .attr("class", "chart-label")
        .text("Urea prices ($/mt)")
        .attr("x", margin.left)
        .attr("y", 20);

    //innerChart
     //   .append("text")
     //   .text("Monthly Urea prices")
      //  .attr("x", xScale(lastDate) + 10)
      //  .attr("y", yScale(data[data.length - 1].Urea))
     //   .attr("dominant-baseline", "middle")
      //  .attr("class", "chart-label");

    // add russian invasion of Ukraine to marke rise of prices

    const invasionDate = new Date(2022, 1, 24); // 24 Feb 2022 Russia Ukraine
    
    innerChart
        .append("line")
        .attr("class", "event-line")
        .attr("x1", xScale(invasionDate))
        .attr("x2", xScale(invasionDate))
        .attr("y1", yScale(0))
        .attr("y2", 0)
        .attr("stroke", "#777")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");

    innerChart
        .append("text")
        .attr("class", "event-label")
        .attr("x", xScale(invasionDate) + 6)
        .attr("y", 10)
        .text("Russian invasion of Ukraine");

    const invasionDateUS = new Date(2026, 1, 28); // 15 Feb 2026 US launch attacks on Iran

    innerChart
        .append("line")
        .attr("class", "event-line")
        .attr("x1", xScale(invasionDateUS))
        .attr("x2", xScale(invasionDateUS))
        .attr("y1", yScale(0))
        .attr("y2", 0)
        .attr("stroke", "#777")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");

    const usLabel = innerChart
    .append("text")
    .attr("class", "event-label")
    .attr("x", xScale(invasionDateUS) + 6)
    .attr("y", 10);

    usLabel.append("tspan")
        .attr("x", xScale(invasionDateUS) + 6)
        .attr("dy", "0em")
        .text("US and Israel launch");

    usLabel.append("tspan")
        .attr("x", xScale(invasionDateUS) + 6)
        .attr("dy", "1.1em")
        .text("attacks on Iran");
};