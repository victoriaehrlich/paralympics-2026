// ─── colour palette ──────────────────────────────────────────────
const girls      = "#5478b5ff";
const boys      = "#634344ff";
const lightGrey = "#dfdfdeff";

// ─── shared helpers ───────────────────────────────────────────────

// Draws a single donut chart into a given selector.
// `data` is an array of objects with keys: label, value, color
const drawDonut = (selector, data) => {

    const width  = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.52;

    // The arc generator turns each slice's start/end angles into a <path> d attribute.
    // Think of it like d3.line() but for wedges instead of points.
    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);

    // d3.pie() takes raw values and converts them into angle objects
    // { startAngle, endAngle, value, data } — ready for arc() to draw
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);                     // keep the order from the CSV

    const svg = d3.select(selector)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height + 20}`)
        .attr("width", "100%")
        .style("max-width", "200px")
        .style("display", "block")
        .style("margin", "0 auto");

    // Move the origin to the centre so the arcs sit in the middle
    const innerChart = svg
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Draw each slice
    innerChart
        .selectAll("path")
        .data(pie(data))
        .join("path")
        .attr("d", arc)
        .attr("fill", d => d.data.color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

    // ── slice labels ──────────────────────────────────────────────
    innerChart
        .selectAll("text.slice-label")
        .data(pie(data))
        .join("text")
        .attr("class", "slice-label")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("font-family", "Inter, sans-serif")
        .style("font-size", "11px")
        .style("font-weight", "500")
        .style("fill", "#fff")
        .style("opacity", d => d.data.color === lightGrey ? 0 : 1)
        .text(d => `${Math.round(d.data.value * 100)}%`);

    // ── legend ────────────────────────────────────────────────────
    data.forEach((d, i) => {
        const g = svg
            .append("g")
            .attr("transform", `translate(10, ${height + 10 + i * 18})`);

        g.append("rect")
            .attr("width", 9)
            .attr("height", 9)
            .attr("rx", 2)
            .attr("fill", d.color);

        g.append("text")
            .attr("x", 14)
            .attr("y", 7.7)
            .attr("class", "chart-label")
            .style("font-family", "Inter, sans-serif")
            .style("font-size", "12px")
            .style("font-weight", "500")
            .style("letter-spacing", "0.04em")
            .style("fill", "#777")
            .text(`${d.label}`);
    });

}
// ─── chart 1: all athletes ─────────────────────────────────────────
// participants.csv has a "total" row we don't want to plot — filter it out

d3.csv("data/participants.csv", d => ({
    label: d.gender,
    value: +d.athletes,
    color: d.gender === "Women" ? girls : lightGrey
})).then(data => {
    const filtered = data.filter(d => d.label !== "Total");

    // Convert raw counts to proportions so d3.pie() works cleanly
    const total = d3.sum(filtered, d => d.value);
    filtered.forEach(d => d.value = d.value / total);

    drawDonut("#chart-participants", filtered);
});


// ─── chart 2a: disabled girls dream gap ────────────────────────────

d3.csv("data/dream_girls.csv", d => ({
    label: d.dreams,
    value: +d.percentage,
    color: d.dreams === "Dream Big" ? girls : lightGrey
})).then(data => {
    drawDonut("#chart-girls", data);
});


// ─── chart 2b: disabled boys dream gap ─────────────────────────────

d3.csv("data/dream_boys.csv", d => ({
    label: d.dreams,
    value: +d.percentage,
    color: d.dreams === "Dream Big" ? boys : lightGrey
})).then(data => {
    drawDonut("#chart-boys", data);
});