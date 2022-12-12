

function chart3() {
  //Get specified amount of data from specified dataset
  fetch('https://api.energidataservice.dk/dataset/Elspotprices?columns=SpotPriceDKK,HourDK,PriceArea&filter={%22PriceArea%22:[%22DK1%22]}&limit=48')
    .then(response => response.json())
    .then(data => {

      console.group("Data retrieved:");
      data.records.forEach(record => console.log(record));
      console.groupEnd()


      const data_avg_hour3 = data.records

      console.log("Timepris 24 timer", data_avg_hour3)


      // Tilføjer ID i array til animationsbrug
      data.records.forEach((item, i) => {
        item.id = i;
      });



      //Definere højde, bredde og svg elements attributter 
      var width = (window.innerWidth * .6);
      var height = 500;
      var bottomPadding = 20;
      var sidePadding = 100;
      var svg = d3.select("#diagram3").append("svg").attr("width", width + sidePadding).attr("height", height + sidePadding);


      // Skalering 
      var xScale = d3.scaleBand().domain(d3.range(data_avg_hour3.length)).range([width, 51]).padding(.05)
      var yScale = d3.scaleLinear().domain([0, d3.max(data_avg_hour3, (d) => (d.SpotPriceDKK / 1000) + 1.5)]).range([height - bottomPadding, 75]);



      // UDREGNINGER Elafgift + System tarif + Balance tarif + Transmission = 1.01229. (data_avg_hour3 / 1000 + 1,01229) * 1.25 


      // Farver 
      var color = d3.scaleLinear()
        .domain([2600, 3200])
        .range(["#8B43C0", "#FF00DD"]);

      var today = new Date()
      // Laver string der passer til nuværende timetal til sammenligning i grafen 
      var today = new Date();
      var lol = new Date().getDate();
      var datedate = String(lol).padStart(2, '0');
      var date = today.getFullYear() + '-' + (today.getMonth() + 1);
      var time = today.getHours();
      var timeuse = String(time).padStart(2, '0') + ":" + '00' + ":" + '00';


      var dateTime = date + '-' + datedate + 'T' + timeuse;


      // Definere svg elementet som en variabel = bars og koble data og function for barer på 
      var bars = svg.selectAll("body")
        .data(data_avg_hour3)
        .enter()
        .append("path")
        .on("mouseover", function (d, i) {
          tooltip.text(function (d) {
            return (d.SpotPriceDKK)
          })
            .style("visibility", "visible");
          d3.select(this)
            .attr("fill", shadeColor(bar_color, -15));
        })
        .on("mousemove", function () {
          tooltip
            .style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
          tooltip.html(``).style("visibility", "hidden");
          d3.select(this).attr("fill", bar_color);
        })
        .attr("d", function (d) {
          return bar(xScale(d.id), yScale(0), xScale.bandwidth(), yScale(0) - yScale(0), 10);   /* ((d.SpotPriceDKK / 1000)+ 1.01229)*1.25) */
        })
        .attr("fill", function (d) { return color(d.SpotPriceDKK) })
        .style("fill", function (d) {
          if (d.HourDK == dateTime) {
            return "#3FF4EB"
          }
        })
        .transition()
        .duration(4000)
        .attr("d", function (d, i) {
          return bar(xScale(i), yScale(0), xScale.bandwidth(), yScale(0) - yScale((data_avg_hour3[i].SpotPriceDKK / 1000) + 1.01229) * 1.25, 10)  // Tilføjet regnestykket oppefra fra længere oppe 
        })

      // create tooltip element  
      const tooltip = d3.select("body")
        .data(data_avg_hour3)
        .enter()
        .text(function (d) {
          return +(Math.round(d.SpotPriceDKK));
        })
        .append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("padding", "15px")
        .style("background", "rgba(0,0,0,0.6)")
        .style("border-radius", "5px")
        .style("color", "#fff")
        .text("a simple tooltip");


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

      //Labels til xAkse (48 tidspunkter)
      const tickLabels = [`0:00`, `1:00`, `2:00`, `3:00`, `4:00`, `5:00`, `6:00`, `7:00`, `8:00`, `9:00`,
        `10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`, `19:00`, `20:00`,
        `21:00`, `22:00`, `23:00`, `0:00`, `1:00`, `2:00`, `3:00`, `4:00`, `5:00`, `6:00`, `7:00`, `8:00`,
        `9:00`, `10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`, `19:00`,
        `20:00`, `21:00`, `22:00`, `23:00`]


      const xAxis = d3.axisBottom().scale(d3.scaleLinear().domain([0, data_avg_hour3.length]).range([0, width - data_avg_hour3.length - 3.4])).ticks(data_avg_hour3.length).tickFormat((d, i) => tickLabels[i]);

      svg.append("g")
        .attr("transform", "translate(51, " + (height - 20) + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-65)")
        .attr("y", "1.5em")
        .attr("x", "-2em");

      const yAxis = d3.axisLeft().scale(yScale).ticks();

      svg.append("g")
        .attr("transform", "translate(51)")
        .attr("y", function (d) {
          console.log(data_avg_hour3, yScale(data_avg_hour3));
          return yScale(data_avg_hour3);
        })
        .call(d3.axisLeft(yScale));


      // Y-aksen labels
      svg.append('text')
        .attr('id', 'y-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(110,' + ((height / 4.8) - 2) + ')')
        .style('font-family', 'Sans-serif')
        .style('font-size', 14)
        .text('Elpris pr.time')
        .style('fill', 'white')


      console.log("Loading complete");
      console.log(timeuse);

    var legend_keys = [""]

    var lineLegend = svg.selectAll(".lineLegend").data(legend_keys)
        .enter().append("g")
        .attr("class","lineLegend")
       
    
    lineLegend.append("text").text("Nuværende time")
        .attr("x", 210)
        .attr('y', 103)
        .style("fill","#FFFFFF") // obs skifte farve 
        .style("font-family", "sans-serif")
        .style("font-size", "14px")
    
    lineLegend.append("circle")
        .attr("cx", 200)
        .attr('cy', 98)
        .attr("r", 6)
        .style("fill", "#3FF4EB")
        .style("stroke-width", 2)
        /* .attr("transform", "translate(40, 50)"); //align texts with boxes */

    })



}



// NYT BARCHART TIL DK2 HERUNDER //////////////////////////////////////////////////////////////////////////////////////////////////

function chart4() {
  //Get specified amount of data from specified dataset
  fetch('https://api.energidataservice.dk/dataset/Elspotprices?columns=SpotPriceDKK,HourDK,PriceArea&filter={%22PriceArea%22:[%22DK2%22]}&limit=48')
    .then(response => response.json())
    .then(data => {

      console.group("Data retrieved:");
      data.records.forEach(record => console.log(record));
      console.groupEnd()


      const data_avg_hour3 = data.records

      console.log("Timepris 24 timer", data_avg_hour3)


      // Tilføjer ID i array til animationsbrug
      data.records.forEach((item, i) => {
        item.id = i;
      });



      //Definere højde, bredde og svg elements attributter 
      var width = (window.innerWidth * .6);
      var height = 500;
      var bottomPadding = 20;
      var sidePadding = 100;
      var svg = d3.select("#diagram3").append("svg").attr("width", width + sidePadding).attr("height", height + sidePadding);


      // Skalering 
      var xScale = d3.scaleBand().domain(d3.range(data_avg_hour3.length)).range([width, 51]).padding(.05)
      var yScale = d3.scaleLinear().domain([0, d3.max(data_avg_hour3, (d) => (d.SpotPriceDKK / 1000) + 1.5)]).range([height - bottomPadding, 75]);


      // Farver 
      var color = d3.scaleLinear()
        .domain([2000, 3200])
        .range(["#FF00DD", "#8B43C0"]);

      var today = new Date()
      // Laver string der passer til nuværende timetal til sammenligning i grafen 
      var today = new Date();
      var lol = new Date().getDate();
      var datedate = String(lol).padStart(2, '0');
      var date = today.getFullYear() + '-' + (today.getMonth() + 1);
      var time = today.getHours();
      var timeuse = String(time).padStart(2, '0') + ":" + '00' + ":" + '00';


      var dateTime = date + '-' + datedate + 'T' + timeuse;


      // Definere svg elementet som en variabel = bars og koble data og function for barer på 
      var bars = svg.selectAll("body")
        .data(data_avg_hour3)
        .enter()
        .append("path")
        .on("mouseover", function (d, i) {
          tooltip.text(function (d) {
            return (d.SpotPriceDKK)
          })
            .style("visibility", "visible");
          d3.select(this)
            .attr("fill", shadeColor(bar_color, -15));
        })
        .on("mousemove", function () {
          tooltip
            .style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
          tooltip.html(``).style("visibility", "hidden");
          d3.select(this).attr("fill", bar_color);
        })
        .attr("d", function (d) {
          return bar(xScale(d.id), yScale(0), xScale.bandwidth(), yScale(0) - yScale(0), 10);   /* ((d.SpotPriceDKK / 1000)+ 1.01229)*1.25) */
        })
        .attr("fill", function (d) { return color(d.SpotPriceDKK) })
        .style("fill", function (d) {
          if (d.HourDK == dateTime) {
            return "#3FF4EB"
          }
        })
        .transition()
        .duration(4000)
        .attr("d", function (d, i) {
          return bar(xScale(i), yScale(0), xScale.bandwidth(), yScale(0) - yScale((data_avg_hour3[i].SpotPriceDKK / 1000) + 1.01229) * 1.25, 10)  // Tilføjet regnestykket oppefra fra længere oppe 
        })

      // create tooltip element  
      const tooltip = d3.select("body")
        .data(data_avg_hour3)
        .enter()
        .text(function (d) {
          return +(Math.round(d.SpotPriceDKK));
        })
        .append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("padding", "15px")
        .style("background", "rgba(0,0,0,0.6)")
        .style("border-radius", "5px")
        .style("color", "#fff")
        .text("a simple tooltip");


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

      //Labels til xAkse (48 tidspunkter)
      const tickLabels = [`0:00`, `1:00`, `2:00`, `3:00`, `4:00`, `5:00`, `6:00`, `7:00`, `8:00`, `9:00`,
        `10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`, `19:00`, `20:00`,
        `21:00`, `22:00`, `23:00`, `0:00`, `1:00`, `2:00`, `3:00`, `4:00`, `5:00`, `6:00`, `7:00`, `8:00`,
        `9:00`, `10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`, `19:00`,
        `20:00`, `21:00`, `22:00`, `23:00`]


      const xAxis = d3.axisBottom().scale(d3.scaleLinear().domain([0, data_avg_hour3.length]).range([0, width - data_avg_hour3.length - 3.4])).ticks(data_avg_hour3.length).tickFormat((d, i) => tickLabels[i]);

      svg.append("g")
        .attr("transform", "translate(51, " + (height - 20) + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-65)")
        .attr("y", "1.5em")
        .attr("x", "-2em");

      const yAxis = d3.axisLeft().scale(yScale).ticks();

      svg.append("g")
        .attr("transform", "translate(51)")
        .attr("y", function (d) {
          console.log(data_avg_hour3, yScale(data_avg_hour3));
          return yScale(data_avg_hour3);
        })
        .call(d3.axisLeft(yScale));



      // Y-aksen labels
      svg.append('text')
        .attr('id', 'y-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(110,' + ((height / 4.8) - 2) + ')')
        .style('font-family', 'Sans-serif')
        .style('font-size', 12)
        .text('Elpris pr.time')
        .style('fill', 'white')

        .attr("data-legend", function (d) { return d.name })

      legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(50,30)")
        .style("font-size", "12px")
        .call(d3.legend)


    })
}
