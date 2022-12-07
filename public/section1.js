
        // Denne query kører op imod API'en som findes i 'main.js'.
        // Gennemsnits timepris (2021)
        d3.json("/api/avg_timepris", {
          method: "POST",
        }).then(function (response) {
          const data_avg_hour = response.data; // Hent data ud af response
          console.log("Gennemsnits time pris", data_avg_hour)
    
    
          //Definere højde, bredde og svg elements attributter 
          var width = (window.innerWidth * .6);
          var height = 500;
          var bottomPadding = 20;
          var svg = d3.select("#diagram1").append("svg").attr("width", width).attr("height", height);
    
    
          // Skalering 
          var xScale = d3.scaleBand().domain(d3.range(data_avg_hour.length + 1)).range([24, width]).padding(.05)
          var yScale = d3.scaleLinear().domain([0, d3.max(data_avg_hour, (d) => d.avg * 1.25)]).range([height - bottomPadding, 125]);
    
          var color = d3.scaleLinear() //farve skalering
            .domain([0, d3.max(data_avg_hour)])
            .range(['#9ad97f', '#d97642']);
    
          // Lave og placere akser (Y aksen)
    
    
    
          // Farver 
          var color = d3.scaleLinear()
            .domain([0, d3.max(data_avg_hour, (d) => d.avg)])
            .range(["#9ad97f", "#d97642"]);
    
    
    
          // Definere svg elementet som en variabel = bars og koble data og function for barer på 
          var bars = svg.selectAll()
            .data(data_avg_hour)
            .enter()
            .append("path")
            .attr("d", function (d) {
              return bar(xScale(d.hour), yScale(0), xScale.bandwidth(), yScale(0) - yScale(0), 10);
            })
            .attr("fill", function (d) { return color(d.avg) })
            .transition()
            .delay(function (d, i) {
              return i / data_avg_hour.length * 4000
            })
            .duration(1000)
            .attr("d", function (d, i) {
              return bar(xScale(i), yScale(0), xScale.bandwidth(), yScale(0) - yScale(data_avg_hour[i].avg * 1.25), 10)
            })
    
    
    
    
          // Funktion som lager barer med afrundede kanter 
          function bar(x, y, w, h, r, f) {
            // Flag for sweep:
            if (f == undefined) f = 1;
    
            // x coordinates of top of arcs
            var x0 = x + r;
            var x1 = x + w - r;
            // y coordinates of bottom of arcs
            var y0 = y - h + r;
            // just for convenience (slightly different than above):
            var l = "L", a = "A";
    
            var parts = ["M", x, y, l, x, y0, a, r, r, 0, 0, f, x0, y - h, l, x1, y - h, a, r, r, 0, 0, f, x + w, y0, l, x + w, y, "Z"];
            return parts.join(" ");
          }
          //Create labels
          svg.selectAll("text") // Alt tekst med class 'label'
            .data(data_avg_hour)
            .enter()
            .append("text")
            .text(function (d) {
              return +(Math.round(d.avg * 1.25 + "e+2") + "e-2");
            })
            .transition()
            .duration(1000)
            .delay(function (d, i) {
              return i / data_avg_hour.length * 4000
            })
            .attr("x", function (d, i) {
              return i * (width / data_avg_hour.length - 2.8) + 44;
            })
            .attr("y", function (d) {
              return height - (d.avg * 185) - 43;
            })
        
    
            .attr("class", "label") // Husk class på nye labels
            .attr("font-family", "sans-serif")
            .attr("font-weight", 800)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", data_avg_hour => color(data_avg_hour.avg * 1.25))
    
    
          const formatHours = d3.timeFormat("%H : %M")
    
          const xAxis = d3.axisBottom().scale(d3.scaleLinear().domain([0, data_avg_hour.length]).range([2, width - 65])).ticks().tickFormat(formatHours).tickValues([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24])
          svg.append("g")
            .attr("transform", "translate(23," + (height - 20) + ")")
            .call(xAxis);
            
    
            
            
    
          const yAxis = d3.axisLeft().scale(yScale).ticks(data_avg_hour).tickValues([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24])
          svg.append("g")
            .attr("transform", "translate(25)")
            .attr("y", function (d) {
              console.log(data_avg_hour, yScale(data_avg_hour));
              return yScale(data_avg_hour);
            })
            .call(d3.axisLeft(yScale));
            
    
    
    
          console.log("Loading complete")
         
        })
