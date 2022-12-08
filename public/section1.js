
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
            .domain([0, d3.max(data_avg_hour, (d) => d.avg - 3.5)])
            .range(["#9ad97f", "#d97642"]);

          
          //Container for the gradients
var defs = svg.append("defs");

//Filter for the outside glow
var filter = defs.append("filter")
    .attr("id","glow");
filter.append("feGaussianBlur")
    .attr("stdDeviation","5")
    .attr("result","coloredBlur");
var feMerge = filter.append("feMerge");
feMerge.append("feMergeNode")
    .attr("in","coloredBlur");
feMerge.append("feMergeNode")
    .attr("in","SourceGraphic");
    

    //Append a defs (for definition) element to your SVG
var defs = svg.append("defs");

//Append a linearGradient element to the defs and give it a unique id
var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient")
    //Vertical gradient
linearGradient
.attr("x1", "0%")
.attr("y1", "100%")
.attr("x2", "0%")
.attr("y2", "0%")
//Set the color for the start (0%)
linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#ffa474"); //light blue

//Set the color for the end (100%)
linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#8b0000"); //dark blue
    
    
          // Definere svg elementet som en variabel = bars og koble data og function for barer på 
          var bars = svg.selectAll()
            .data(data_avg_hour)
            .enter()
            .append("path")
            .attr("d", function (d) {
              return bar(xScale(d.hour), yScale(0), xScale.bandwidth(), yScale(0) - yScale(0), 10);
            })
            .attr("fill", function (d) { return color(d.avg) })
            .style("filter", "url(#glow)")
            .style("fill", "url(#linear-gradient)")
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
    
    // Tilføjer ID i array til animationsbrug
    data_avg_hour.forEach((item, i) => {
      item.hourid = `${i}:00`;
    });


          
          const tickLabels = [`0:00`, `1:00`, `2:00`, `3:00`, `4:00`,`5:00`, `6:00`, `7:00`, `8:00`, `9:00`,`10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`,`18:00`, `19:00`, `20:00`, `21:00`, `22:00`, `23:00`, `24:00` ]
    
          const xAxis = d3.axisBottom().scale(d3.scaleLinear().domain([0, data_avg_hour.length]).range([0, width - 65])).ticks(24).tickFormat((d,i) => tickLabels[i]);
          svg.append("g")
            .attr("transform", "translate(23," + (height - 20) + ")")
            .call(xAxis);
            
    
            
         

          const yAxis = d3.axisLeft().scale(yScale).ticks()
          svg.append("g")
            .attr("transform", "translate(25)")
            .attr("y", function (d) {

            return yScale(data_avg_hour);
            })
            .call(d3.axisLeft(yScale))
            
            
    
    
    
          console.log("Loading complete")
         
        })
