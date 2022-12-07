


        //Get specified amount of data from specified dataset
        fetch('https://api.energidataservice.dk/dataset/Elspotprices?columns=SpotPriceDKK,HourDK,PriceArea&filter={%22PriceArea%22:[%22DK1%22]}&limit=48')
          .then(response => response.json())
          .then(data => {
            
            console.group("Data retrieved:");
            data.records.forEach(record => console.log(record));
            console.groupEnd()

            const data_avg_hour3 = data.records
            

        console.log("Timepris 24 timer", data_avg_hour3)
        console.log("Cons log 1", data_avg_hour3)
      
            
          

        //Definere højde, bredde og svg elements attributter 
        var width = 1000;
        var height = 500;
        var bottomPadding = 20;
        var sidePadding = 100;
        var svg = d3.select("#diagram3").append("svg").attr("width", width + sidePadding).attr("height", height + sidePadding);


        // Skalering 
        var xScale = d3.scaleBand().domain(d3.range(data_avg_hour3.length)).range([51, width]).paddingInner(0.05).padding(.0)
        var yScale = d3.scaleLinear().domain([0, d3.max(data_avg_hour3, (d) => d.SpotPriceDKK * 1.25)]).range([height - bottomPadding, 75]);

        var color = d3.scaleLinear() //farve skalering
          .domain([0, d3.max(data_avg_hour3)])
          .range(['#9ad97f', '#d97642']);

        // Lave og placere akser (Y aksen)

        // UDREGNINGER Elafgift + System tarif + Balance tarif + Transmission = 1.01229. (data_avg_hour3 / 1000 + 1,01229) * 1.25

        // Farver 
        var color = d3.scaleLinear()
          .domain([0, d3.max(data_avg_hour3, (d) => d.SpotPriceDKK)])
          .range(["#9ad97f", "#d97642"]);
          
  

        // Definere svg elementet som en variabel = bars og koble data og function for barer på 
        var bars = svg.selectAll()
          .data(data_avg_hour3)
          .enter()
          .append("path")
          .attr("d", function (d) {
            return bar(xScale(d.HourDK/* DET HER VIRKER IKKE, FORDI HourDK ER EN DATO OG IKKE EN TIME SOM I DEN ANDEN. DET ER DET SOM FUCKER ANIMATIONEN OP*/ ), yScale(0), xScale.bandwidth(), yScale(0) - yScale(0), 10);
          })
          .attr("fill", function (d) { return color(d.SpotPriceDKK) })
          .transition()
          .delay(function (d, i) {
            return i / data_avg_hour3.length * 8000
          })
          
          .attr("d", function (d, i) {
            return bar(xScale(i), yScale(0), xScale.bandwidth(), yScale(0) - yScale(data_avg_hour3[i].SpotPriceDKK * 1.25), 10)
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


        // Vi skal nok ikke bruge labels til denne hvis vi inkludere 48 timer, det skal dukke op ved mouseover (Joy arbejder på det)
        /*
        //Create labels
        svg.selectAll("text.label") // Alt tekst med class 'label'
          .data(data_avg_hour3)
          .enter()
          .append("text")
          .text(function (d) {
            return +(Math.round(d.SpotPriceDKK * 1.25 + "e+2") + "e-2");
          })
          .attr("x", function (d, i) {
            return i * (width / data_avg_hour3.length - 3.7) + 85;
          })
          .attr("y", function (d) {
            return height - (d.SpotPriceDKK / 9) - 60;
          })
          .attr("class", "label") // Husk class på nye labels
          .attr("font-family", "sans-serif")
          .attr("font-weight", 800)
          .attr("text-anchor", "middle")
          .attr("font-size", "11px")
          .attr("fill", data_avg_hour3 => color(data_avg_hour3.SpotPriceDKK * 1.25))
*/

        const xAxis = d3.axisBottom().scale(d3.scaleLinear().domain([0, data_avg_hour3.length]).range([0, width - data_avg_hour3.length - 3.4])).ticks(data_avg_hour3.length)
        svg.append("g")
          .attr("transform", "translate(51, " + (height - 20) + ")")
          .call(xAxis);

        const yAxis = d3.axisLeft().scale(yScale).ticks();
        svg.append("g")
          .attr("transform", "translate(51)")
          .attr("y", function (d) {
            console.log(data_avg_hour3, yScale(data_avg_hour3));
            return yScale(data_avg_hour3);
          })
          .call(d3.axisLeft(yScale));



        console.log("Loading complete")
     
      })

  
