

function chart3() {
  //Get specified amount of data from specified dataset
  fetch('https://api.energidataservice.dk/dataset/Elspotprices?columns=SpotPriceDKK,HourDK,PriceArea&filter={%22PriceArea%22:[%22DK1%22]}&limit=48')
    .then(response => response.json())
    .then(data => {

      console.group("Data retrieved:");
      data.records.forEach(record => console.log(record));
      console.groupEnd()


      const data_avg_hour3 = data.records



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
      var xScale = d3.scaleBand().domain(d3.range(data_avg_hour3.length)).range([width, 51]).padding(0.05).paddingInner(0.12)
      var yScale = d3.scaleLinear().domain([0, d3.max(data_avg_hour3, (d) => ((d.SpotPriceDKK / 1000) + 1.01229) * 1.25) + 1]).range([height - bottomPadding, 125]);


      // Farver 
      var color = d3.scaleLinear()
        .domain([1600, 4000])
        .range(["#FF00DD", "#8B43C0"]); //


      var today = new Date()
      // Laver string der passer til nuværende timetal til sammenligning i grafen 
      var today = new Date();
      var lol = new Date().getDate();
      var datedate = String(lol).padStart(2, '0');
      var date = today.getFullYear() + '-' + (today.getMonth() + 1);
      var time = today.getHours();
      var timeuse = String(time).padStart(2, '0') + ":" + '00' + ":" + '00';


      var dateTime = date + '-' + datedate + 'T' + timeuse;


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

      // create tooltip element  til mouseover funktion 
      const tooltip = d3.select("body")
        .data(data_avg_hour3)
        .enter()
        .append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("padding", "15px")
        .style("background", "rgba(0,0,0,0.6)")
        .style("border-radius", "5px")
        .style("color", "#ffffff")
        .text("a simple tooltip");


      //Container for the gradients
      var defs = svg.append("defs");

      //Filter for the outside glow
      var filter = defs.append("filter")
        .attr("id", "glow");
      filter.append("feGaussianBlur")
        .attr("stdDeviation", "1")
        .attr("result", "coloredBlur");
      var feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode")
        .attr("in", "coloredBlur");
      feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");

      // Definere svg elementet som en variabel = bars og koble data og function for barer på 
      var bars = svg.selectAll("body")
        .data(data_avg_hour3)
        .enter()
        .append("path")
        .attr("d", function (d) {
          return bar(xScale(d.id), yScale(0), xScale.bandwidth(), yScale(0) - yScale(0), 10);
        })
        .on("mouseover", function (event, d) {
          /* 
          * Her havde i lavet en ekstra funktion inde i tooltip.text som returnede d.SpotPriceDKK med parameteret 'd', som overskrev mouseover funktionens 'd' parameter.
          * Dette gjorde at i stedet for at få det _ene_ datapunkt, som musen hoverede over, så blev tooltip blev kaldt data_avg_hour3.length gange. . 
          */
          console.log(d);
          tooltip.text((((d.SpotPriceDKK / 1000) + 1.01229) * 1.25).toFixed(2) + " DKK kl. " + new Date(d.HourDK).getHours() + ':00').style("top", (event.y - 10) + "px")
            .style("left", (event.x + 10) + "px")
            .style("visibility", "visible")
        })
        .on("mouseout", function () {
          tooltip.html(``).style("visibility", "hidden");
          // d3.select(this).attr("fill", '#FFFFFF'); //Gør bars hvide når man mouser over dem
        })
        .attr("fill", function (d) { return color(d.SpotPriceDKK) })
        .style("fill", function (d) {                     //Funktion som skifter farven på den bar der repræsentere den nuværende timepris
          if (d.HourDK == dateTime) {
            return "#3FF4EB"
          }
        })
        .attr("opacity", function (d) {                   //Sænker oppacity en smule på den nuværende timepris, så den passer bedre ind
          if (d.HourDK == dateTime) {
            return "0.8"
          }
        })
        .attr("filter", "url(#glow)")
        .transition()
        .duration(4000)
        .attr("d", function (d, i) {
          return bar(xScale(i), yScale(0), xScale.bandwidth(), yScale(0) - yScale(((d.SpotPriceDKK / 1000) + 1.01229) * 1.25), 10)  // Tilføjet regnestykket oppefra fra længere oppe 
        })


      const xAxis = d3.axisBottom().scale(d3.scaleLinear()
        .domain([0, data_avg_hour3.length])
        .range([0, width - data_avg_hour3.length - 3.4])).ticks(data_avg_hour3.length).tickFormat((d, i) => tickLabels[i]);


      //Labels til xAkse (48 tidspunkter)
      const tickLabels = [`0:00`, `1:00`, `2:00`, `3:00`, `4:00`, `5:00`, `6:00`, `7:00`, `8:00`, `9:00`,
        `10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`, `19:00`, `20:00`,
        `21:00`, `22:00`, `23:00`, `0:00`, `1:00`, `2:00`, `3:00`, `4:00`, `5:00`, `6:00`, `7:00`, `8:00`,
        `9:00`, `10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`, `19:00`,
        `20:00`, `21:00`, `22:00`, `23:00`]


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
        .attr('transform', 'translate(110,' + ((height / 4.8) + 30) + ')')
        .style('font-family', 'Sans-serif')
        .style('font-size', 14)
        .text('Pris (DKK)')
        .style('fill', 'white')


      console.log("Loading complete");
      console.log(timeuse);


      // laver legend til diagrammet (Tekst og cirkel)
      var legend_keys = [""]

      var lineLegend = svg.selectAll(".lineLegend").data(legend_keys)
        .enter().append("g")
        .attr("class", "lineLegend")

      lineLegend.append("text").text("Nuværende time")
        .attr("x", 210)
        .attr('y', 135)
        .style("fill", "#FFFFFF") // obs skifte farve 
        .style("font-family", "sans-serif")
        .style("font-size", "14px")

      lineLegend.append("circle")
        .attr("cx", 200)
        .attr('cy', 130)
        .attr("r", 6)
        .style("fill", "#3FF4EB")
        .style("opacity", "0.8")
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


      // Tilføjer ID i array til animationsbrug (måden bars kommer op på)
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
        .domain([1600, 4000])
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

            // create tooltip element  til mouseover funktion 
            const tooltip = d3.select("body")
            .data(data_avg_hour3)
            .enter()
            .append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("padding", "15px")
            .style("background", "rgba(0,0,0,0.6)")
            .style("border-radius", "5px")
            .style("color", "#ffffff")
            .text("a simple tooltip");


                  // Definere svg elementet som en variabel = bars og koble data og function for barer på 
      var bars = svg.selectAll("body")
      .data(data_avg_hour3)
      .enter()
      .append("path")
      .attr("d", function (d) {
        return bar(xScale(d.id), yScale(0), xScale.bandwidth(), yScale(0) - yScale(0), 10);
      })
      .on("mouseover", function (event, d) {
        /* 
        * Her havde i lavet en ekstra funktion inde i tooltip.text som returnede d.SpotPriceDKK med parameteret 'd', som overskrev mouseover funktionens 'd' parameter.
        * Dette gjorde at i stedet for at få det _ene_ datapunkt, som musen hoverede over, så blev tooltip blev kaldt data_avg_hour3.length gange. . 
        */
        console.log(d);
        tooltip.text((((d.SpotPriceDKK / 1000) + 1.01229) * 1.25).toFixed(2) + " DKK kl. " + new Date(d.HourDK).getHours() + ':00').style("top", (event.y - 10) + "px")
          .style("left", (event.x + 10) + "px")
          .style("visibility", "visible")
      })
      .on("mouseout", function () {
        tooltip.html(``).style("visibility", "hidden");
        // d3.select(this).attr("fill", '#FFFFFF'); //Gør bars hvide når man mouser over dem
      })
      .attr("fill", function (d) { return color(d.SpotPriceDKK) })
      .style("fill", function (d) {
        if (d.HourDK == dateTime) {
          return "#3FF4EB"
        }
      })
      .attr("opacity", function (d) {                   //Sænker oppacity en smule på den nuværende timepris, så den passer bedre ind
        if (d.HourDK == dateTime) {
          return "0.8"
        }
      })
      .attr("filter", "url(#glow)")
      .transition()
      .duration(4000)
      .attr("d", function (d, i) {
        return bar(xScale(i), yScale(0), xScale.bandwidth(), yScale(0) - yScale((data_avg_hour3[i].SpotPriceDKK / 1000) + 1.01229) * 1.25, 10)  // Tilføjet regnestykket oppefra fra længere oppe 
      })


      const xAxis = d3.axisBottom().scale(d3.scaleLinear()
      .domain([0, data_avg_hour3.length])
      .range([0, width - data_avg_hour3.length - 3.4])).ticks(data_avg_hour3.length).tickFormat((d, i) => tickLabels[i]);

      //Labels til xAkse (48 tidspunkter)
      const tickLabels = [`0:00`, `1:00`, `2:00`, `3:00`, `4:00`, `5:00`, `6:00`, `7:00`, `8:00`, `9:00`,
        `10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`, `19:00`, `20:00`,
        `21:00`, `22:00`, `23:00`, `0:00`, `1:00`, `2:00`, `3:00`, `4:00`, `5:00`, `6:00`, `7:00`, `8:00`,
        `9:00`, `10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`, `19:00`,
        `20:00`, `21:00`, `22:00`, `23:00`]


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
        .text('Pris (DKK)')
        .style('fill', 'white')




      // laver legend til diagrammet (Tekst og cirkel)
      var legend_keys = [""]

      var lineLegend = svg.selectAll(".lineLegend").data(legend_keys)
        .enter().append("g")
        .attr("class", "lineLegend")

      lineLegend.append("text").text("Nuværende time")
        .attr("x", 210)
        .attr('y', 135)
        .style("fill", "#FFFFFF") // obs skifte farve 
        .style("font-family", "sans-serif")
        .style("font-size", "14px")

      lineLegend.append("circle")
        .attr("cx", 200)
        .attr('cy', 130)
        .attr("r", 6)
        .style("fill", "#3FF4EB")
        .style("opacity", "0.8")
        .style("stroke-width", 2)
      /* .attr("transform", "translate(40, 50)"); //align texts with boxes */

    })
}
