

function chart3(){
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
        var width = 1000;
        var height = 500;
        var bottomPadding = 20;
        var sidePadding = 100;
        var svg = d3.select("#diagram3").append("svg").attr("width", width + sidePadding).attr("height", height + sidePadding);


        // Skalering 
        var xScale = d3.scaleBand().domain(d3.range(data_avg_hour3.length)).range([width, 51]).padding(.05)
        var yScale = d3.scaleLinear().domain([0, d3.max(data_avg_hour3, (d) => d.SpotPriceDKK / 1000)]).range([height - bottomPadding, 75]);

        var color = d3.scaleLinear() //farve skalering
          .domain([0, d3.max(data_avg_hour3)])
          .range(['#9ad97f', '#d97642']);

        // Lave og placere akser (Y aksen)

        // UDREGNINGER Elafgift + System tarif + Balance tarif + Transmission = 1.01229. (data_avg_hour3 / 1000 + 1,01229) * 1.25
      


        // Farver 
        var color = d3.scaleLinear()
          .domain([0, d3.max(data_avg_hour3, (d) => d.SpotPriceDKK)])
          .range(["#9ad97f", "#d97642"]);
          
          var today = new Date()

        // Laver string der passer til nuværende timetal til sammenligning i grafen 
        var today = new Date();
        var lol = new Date().getDate();
        var datedate = String(lol).padStart(2, '0');
        var date = today.getFullYear()+'-'+(today.getMonth()+1);
        var time = today.getHours();
        var timeuse = String(time).padStart(2, '0') + ":" + '00' + ":" + '00';


        var dateTime = date+'-'+datedate+'T'+timeuse;
       
        // Definere svg elementet som en variabel = bars og koble data og function for barer på 
        var bars = svg.selectAll()
          .data(data_avg_hour3)
          .enter()
          .append("path")
          .attr("d", function (d) {
            return bar(xScale(d.id), yScale(0), xScale.bandwidth(), yScale(0) - yScale(0), 10);
          })
          .attr("fill", function (d) { return color(d.SpotPriceDKK) })
          .style("fill", function(d) {
            if(d.HourDK == dateTime){
              return "green"
            }
          })

          
          .transition()
          .duration(4000)
          
          .attr("d", function (d, i) {
            return bar(xScale(i), yScale(0), xScale.bandwidth(), yScale(0) - yScale(data_avg_hour3[i].SpotPriceDKK / 1000), 10)
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

        const tickLabels = [`0:00`, `1:00`, `2:00`, `3:00`, `4:00`,`5:00`, `6:00`, `7:00`, `8:00`, `9:00`,`10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`,`18:00`, `19:00`, `20:00`, `21:00`, `22:00`, `23:00`, `0:00`, `1:00`, `2:00`, `3:00`, `4:00`,`5:00`, `6:00`, `7:00`, `8:00`, `9:00`,`10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`,`18:00`, `19:00`, `20:00`, `21:00`, `22:00`, `23:00`]


        const xAxis = d3.axisBottom().scale(d3.scaleLinear().domain([0, data_avg_hour3.length]).range([0, width - data_avg_hour3.length - 3.4])).ticks(data_avg_hour3.length).tickFormat((d,i) => tickLabels[i]);

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



        console.log("Loading complete");
        console.log(timeuse);
     
      })
    }