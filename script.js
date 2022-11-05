const margin = {top: 30, bottom: 30, right: 50, left: 50},
width = 800 - margin.left - margin.right,
height = 600 - margin.top - margin.bottom;

const svg = d3
.select(".container")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom);

const group = svg
.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3.csv("driving.csv", d3.autoType).then(data => {
    const x_scale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.miles)).nice()
        .range([0, width]);

    const y_scale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.gas)).nice()
        .range([height, 0]);

    const line = d3.line()
        .curve(d3.curveCatmullRom)
        .x(d => x_scale(d.miles))
        .y(d => y_scale(d.gas));

    const line_length = length(line(data));

    group.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "deeppink")
        .attr("stroke-width", 2.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", `0,${line_length}`)
        .attr("d", line)
        .transition()
        .duration(5000)
        .ease(d3.easeLinear)
        .attr("stroke-dasharray", `${line_length},${line_length}`);

    const circle = group.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("class", "circles")
        .attr("cx", d => x_scale(d.miles))
        .attr("cy", d => y_scale(d.gas))
        .attr("r", 4)
        .attr("fill", "white")
        .attr("stroke", "black");

    const x_axis = d3.axisBottom()
        .scale(x_scale)
        .ticks(7);

    const x_axis_group = group.append("g")
        .attr("class", "axis x-axis")
        .call(x_axis)
        .attr("transform", `translate(0, ${height})`)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
            .clone()
            .attr("y2", -height)
            .attr("stroke-opacity", 0.1))
        .call((g) => g.append('text')
            .attr('x', width - 90)
            .attr('y', -8)
            .attr('font-weight', 'bold')
            .attr('fill', 'black')
            .attr('font-size', 13)
            .text('Miles per person per year')
            .call(halo));

    const y_axis = d3.axisLeft()
        .scale(y_scale)
        .tickFormat((d) => {
            return ('$' + d3.format('.2f')(d));
        });

    const y_axis_group = group.append("g")
        .attr("class", "axis y-axis")
        .call(y_axis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
            .clone()
            .attr("x2", width)
            .attr("stroke-opacity", 0.1))
        .call((g) => g.append('text')
            .attr('x', 5)
            .attr('y', 5)
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .attr('fill', 'black')
            .attr('font-size', 13)
            .text('Cost per gallon')
            .call(halo));

    const label = group
        .append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .selectAll('g')
        .data(data)
        .join('g')
        .attr('transform', (d) => `translate(${x_scale(d.miles)},${y_scale(d.gas)})`)
        .attr('opacity', 0);

    label
        .append('text')
        .text((d) => d.year)
        .each(position)
        .call(halo);

    label.transition()
        .delay((d, i) => length(line(data.slice(0, i + 1))) / line_length * (5000 - 125))
        .attr("opacity", 1);

    function length(path) {
        return (d3.create("svg:path").attr("d", path).node().getTotalLength());
    }

    function position(d) {
        const t = d3.select(this);
        switch (d.side) {
            case "top":
                t.attr("text-anchor", "middle").attr("dy", "-0.7em");
                break;
            case "right":
                t.attr("dx", "0.5em")
                .attr("dy", "0.32em")
                .attr("text-anchor", "start");
                break;
            case "bottom":
                t.attr("text-anchor", "middle")
                .attr("dy", "1.4em");
                break;
            case "left":
                t.attr("dx", "-0.5em")
                .attr("dy", "0.32em")
                .attr("text-anchor", "end");
                break;
        }
    }

    function halo(text) {
        text
            .select(function() {
                return (this.parentNode.insertBefore(this.cloneNode(true), this));
            })
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("stroke-linejoin", "round");
    }
});