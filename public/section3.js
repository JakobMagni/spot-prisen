

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

      //Definere højde, bredde og svg elements størrelse 
      var width = (window.innerWidth * .6);
      var height = 500;
      var bottomPadding = 20;
      var sidePadding = 100;
      var svg = d3.select("#diagram3").append("svg").attr("width", width + sidePadding).attr("height", height + sidePadding);


      // Skalering 
      var xScale = d3.scaleBand().domain(d3.range(data_avg_hour3.length)).range([width, 51]).padding(0.05).paddingInner(0.12)
      var yScale = d3.scaleLinear().domain([0, d3.max(data_avg_hour3, (d) => ((d.SpotPriceDKK / 1000) + 1.01229) * 1.25) + 1]).range([height - bottomPadding, 125]);


      // Farver på bars 
      var color = d3.scaleLinear()
        .domain([1600, 4000])
        .range(["#FF00DD", "#8B43C0"]); 


      // Laver string (dateTime) der passer til JS  nuværende timetal til sammenligning i grafen, så vi kan finde den nuværende aktive time
      var today = new Date();
      var year = today.getFullYear();         // getMonth er 0-11 (januar starter i 0) så derfor tilføjes + 1
      var date = new Date().getDate();
      var dateuse = String(date).padStart(2, '0');  //tager datoen og tilføjer 0 foran hvis der ikke er 2 cifre f.eks. (7.12 = 07.12) så det passer med formaten de bruger hos energinets live API
      var month = today.getMonth() + 1;
      var monthuse = String(month).padStart(2, '0') + '-';
      var time = today.getHours();                                                // Henter den nuværende time
      var timeuse = String(time).padStart(2, '0') + ":" + '00' + ":" + '00';      // Det samme som i ovenstående "dateuse", laver til string og tilføjer tal så det passer med API
      var dateTime = year + '-' + monthuse + dateuse + 'T' + timeuse;                        // Her lægger vi vores værdier sammen i den passende format, så vi kan sammenligne den med EnergiNets

      console.log("Nuværende tidspunkt i egen variabel " + dateTime)

      // Funktion som laver paths for barchart, som gør at vi får barer med afrundede kanter 
      function bar(x, y, w, h, r, f) {
        // Flag for sweep:
        if (f == undefined) f = 1;

        // x koordinater for top arc 
        var x0 = x + r;
        var x1 = x + w - r;
        // y koordinater for bund arc 
        var y0 = y - h + r;
        
        var l = "L", a = "A";

        var parts = ["M", x, y, l, x, y0, a, r, r, 0, 0, f, x0, y - h, l, x1, y - h, a, r, r, 0, 0, f, x + w, y0, l, x + w, y, "Z"];
        return parts.join(" ");
      }

      // Toooltip element til mouseover funktion 
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


      //"container" for gradienter
      var defs = svg.append("defs");

      //Filter for glow-effekt 
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

      // Appender path til body og laver barer til barchart 
       svg.selectAll("body")
        .data(data_avg_hour3)
        .enter()
        .append("path")
        .attr("d", function (d) {
          return bar(xScale(d.id), yScale(0), xScale.bandwidth(), yScale(0) - yScale(0), 10);
        })
        .on("mouseover", function (event, d) {
          console.log(d);
          tooltip.text((((d.SpotPriceDKK / 1000) + 1.01229) * 1.25).toFixed(2) + " DKK kl. " + new Date(d.HourDK).getHours() + ':00').style("top", (event.y - 10) + "px")
            .style("left", (event.x + 10) + "px")
            .style("visibility", "visible")
        })
        .on("mouseout", function () {
          tooltip.html(``).style("visibility", "hidden")
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
        .attr("filter", "url(#glow)")     // Tilføjer glow effekt 
        .transition()
        .duration(4000) //varigheden af animationen (paths/bars der kommer op)
        .attr("d", function (d, i) {
          return bar(xScale(i), yScale(0), xScale.bandwidth(), yScale(0) - yScale(((d.SpotPriceDKK / 1000) + 1.01229) * 1.25), 10) 
        })

      // Laver akser 
      const xAxis = d3.axisBottom().scale(d3.scaleLinear()
        .domain([0, data_avg_hour3.length])
        .range([0, width - data_avg_hour3.length - 3.4])).ticks(data_avg_hour3.length).tickFormat((d, i) => tickLabels[i]); //xAkse baseret på datasætlængde, med tickLabels som vi definere nedenunder, for at få tidspunkterne


      //Definere labels til xAkse (48 tidspunkter)
      const tickLabels = [`0:00`, `1:00`, `2:00`, `3:00`, `4:00`, `5:00`, `6:00`, `7:00`, `8:00`, `9:00`,
        `10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`, `19:00`, `20:00`,
        `21:00`, `22:00`, `23:00`, `0:00`, `1:00`, `2:00`, `3:00`, `4:00`, `5:00`, `6:00`, `7:00`, `8:00`,
        `9:00`, `10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`, `19:00`,
        `20:00`, `21:00`, `22:00`, `23:00`]

    //Append og kalde xAksen for at placere og rotere vores text(labels)
      svg.append("g")     
        .attr("transform", "translate(51, " + (height - 20) + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-65)")
        .attr("y", "1.5em")
        .attr("x", "-2em");

      const yAxis = d3.axisLeft().scale(yScale).ticks();    

      // Append og kalde yAkse
      svg.append("g") 
        .attr("transform", "translate(51)")
        .attr("y", function (d) {
          console.log("live API datasæt", data_avg_hour3, yScale(data_avg_hour3));
          return yScale(data_avg_hour3);
        })
        .call(d3.axisLeft(yScale));


      // Y-akse labels
      svg.append('text')
        .attr('id', 'y-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(110,' + ((height / 4.8) + 17) + ')')
        .style('font-family', 'Work Sans, Sans-serif')
        .style('font-size', 14)
        .text('Pris (DKK)')
        .style('fill', 'white')


      // Laver legend  med tekst og cirkel 
      var legend_keys = [""]

      var lineLegend = svg.selectAll(".lineLegend").data(legend_keys)
        .enter().append("g")
        .attr("class", "lineLegend")

      lineLegend.append("text").text("Nuværende time")
        .attr("x", 210)
        .attr('y', 120)
        .style("fill", "#FFFFFF") // obs skifte farve 
        .style("font-family", "Work Sans, sans-serif")
        .style("font-size", "14px")

      lineLegend.append("circle")
        .attr("cx", 200)
        .attr('cy', 115)
        .attr("r", 6)
        .style("fill", "#3FF4EB")
        .style("opacity", "0.8")
        .style("stroke-width", 2)
      /* .attr("transform", "translate(40, 50)"); //align texts with boxes */

    })
}