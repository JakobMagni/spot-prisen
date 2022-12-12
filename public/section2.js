//section 2 linjediagram

/* Graf variabler */
var width = (window.innerWidth * .6);
var height = 500
const margin = { top: 20, right: 20, bottom: 50, left: 50 };
var tooltip = { width: 100, height: 100, x: 10, y: -30 };


// Domene og range for akserne 
var xScale = d3.scaleLinear().domain([1, 53])
    .range([1, width - margin.left - margin.right - 10]);
var yScale = d3.scaleLinear().domain([, 100]).range([height - margin.top  - margin.bottom, 10]);

//Definerer parametre for linje-funktion
const line = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .curve(d3.curveMonotoneX);

const svg = d3.select("#diagram2")
    .append("svg")
    .attr("width", width + 10)
    .attr("height", height + margin.top ).append("g")
    .attr("transform", `translate(${margin.left -5},-15)`)

svg.append('text')
    .attr('id', 'x-label')
    .attr('x', width / 2)
    .attr('y', 30)
    .attr('text-anchor', 'middle')
    .style('font-family', 'Sans-serif')
    .style('font-size', 20)
    .text('Gennemsnitlig lavest og højest elpris pr. uge (2021) (DKK)')
    .style('fill', 'white');

// Y label
svg.append('text')
    .attr('id', 'y-label')
    .attr('text-anchor', 'middle')
    .attr('transform', 'translate(60,' + ((height / 6.5) - 30) + ')')
    .style('font-family', 'Sans-serif')
    .style('font-size', 14)
    .text('Kroner (DKK)')
    .style('fill', 'white');


// Render funktion som indeholder parametere for linjediagrammet - denne kaldes 1) når siden loader 2) og igen senere ved Submit1 funktionen (submitknappen)
// Funktion der kan tegne grafen og GENTEGNE grafen med en IF SÆTNING som afgør hvordan den skal tegnes på baggrund af data 
function render() {

    d3.json("/api/diagram2", {
        method: "POST",
    }).then(function (response) {

        const responseData = response.data // definerer et nyt datasæt til  responsen

        let minArray = [];
        let maxArray = [];

        if (!total_forbrug) {                       // Hvis total forbrug variablen er tom (ingen inputs fra form), så push rå el-pris data(min/max) i to forskellige arrays(som senere lægges sammen)
            console.log('Uændret forbrug')
            for (let dataPoint of responseData) {
                minArray.push({ x: dataPoint.week_nr, y: parseFloat(dataPoint.min_avg_weekly) });     // pusher rådata i to nye arrays (keys x og y)
                maxArray.push({ x: dataPoint.week_nr, y: parseFloat(dataPoint.max_avg_weekly) })
            }
        } else {                                                                        // Ved ændring i inputdata(altså variablen er ikke tom), så løbende opsummer min + max i to arrays
            console.log('Ændret forbrug')
            let minAvgWeeklySum = 0; // Ny variabel for forbrug + elpris samlet 
            let maxAvgWeeklySum = 0;
            for (let dataPoint of responseData) {
                minAvgWeeklySum = minAvgWeeklySum + parseFloat((dataPoint.min_avg_weekly * total_forbrug) * 1.25) //Ny variabler får værdiern af elpris + forbrug
                maxAvgWeeklySum = maxAvgWeeklySum + parseFloat((dataPoint.max_avg_weekly * total_forbrug) * 1.25)

                minArray.push({ x: dataPoint.week_nr, y: parseFloat(minAvgWeeklySum) }); // Pusher de nye værdier i nye arrays 
                maxArray.push({ x: dataPoint.week_nr, y: parseFloat(maxAvgWeeklySum) })
            }
            //Tager et element og tilføjer textContent og pris som vises under form
            /* document.getElementById('besparelse').textContent = "Din årlige besparelse: " + (parseFloat(maxAvgWeeklySum) - parseFloat(minAvgWeeklySum)).toFixed(2) + " DKK" */
            // FORSØG PÅ AT LAVE numbercounter i besparelsesfeltet (OPDATERING 08.12.22 )
            let moneySaved = (parseFloat(maxAvgWeeklySum) - parseFloat(minAvgWeeklySum)).toFixed(2)
            console.log("Besparelse " + moneySaved)


            // COUNTER funktion, som tæller op til besparelses-beløbet 
            let counts = setInterval(updated);
            let upto = 0.00;
            function updated() {
                var count = document.getElementById("counter")
                count.innerHTML = ++upto;
                if (upto == parseInt(moneySaved)) {
                    clearInterval(counts);
                    count.innerHTML = moneySaved
                }
            }
        }
        // 

        //Det nye datasæt, som afhænger af input values og som vi bruger nedenunder når vi tegner linjerne 
        const newDataArray = [minArray, maxArray]

        yScale = d3.scaleLinear().domain([0, d3.max(newDataArray[1], (d) => d.y) + 0.5]).range([height, 30]);

        // create axis scale
        const xAxis = d3.axisBottom().scale(xScale).ticks(52)
        const yAxis = d3.axisLeft().scale(yScale)


        // Hvis der ikke findes en y akse så laver vi en, ellers opdaterer vi den allerede eksisterende
        if (svg.selectAll(".y.axis").empty()) {
            svg.append("g")
                .attr("class", "y axis")
             /*    .attr("transform", "translate(1," + (-10) + ")") */
                .call(yAxis);
        } else {
            svg.selectAll(".y.axis")
                .transition().duration(1500)
                .call(yAxis);
        
        }

        // Hvis der ikke findes en x akse (if empty) så laver vi en, ELLER opdaterer den allerede eksisterende  
        if (svg.selectAll(".x.axis").empty()) {
            svg.append("g")
                .attr("class", "xAxis")
                .attr("transform", "translate(0," + (height) + ")")
                .call(xAxis);
        } else {
            svg.selectAll(".x.axis")
                .transition().duration(1500)
                .call(xAxis);
        }

        // Hvis total_forbrug er i spil tilføj tekst til y label (Skifter ved skift af diagram)
        if (total_forbrug) {
            svg.selectAll("#y-label")
                .transition().duration(1500)
                .text('Kroner (DKK)');
        }
        // Hvis total_forbrug er i spil tilføj tekst til x label (skifter ved skift af diagram)
        if (total_forbrug) {
            svg.selectAll("#x-label")
                .transition().duration(1500)
                .text('Estimeret årlig forbrug(DKK) ved lavest og højest gennemsnits el-pris');
        }

        // Function der skaber gradierende og glødende  farver 
        const createGradient = select => {
            const gradient = select
                .select('defs')
                .append('linearGradient')
                .attr('id', 'gradient')
                .attr('x1', '50%')
                .attr('y1', '100%')
                .attr('x2', '0%')
                .attr('y2', '0%');

            gradient
                .append('stop')
                .attr('offset', '0%')
                .attr('style', 'stop-color:#3FF4EB;stop-opacity:0.05');

            gradient
                .append('stop')
                .attr('offset', '100%')
                .attr('style', 'stop-color:#3FF4EB;stop-opacity:.5');
        }

        const createGlowFilter = select => {
            const filter = select
                .select('defs')
                .append('filter')
                .attr('id', 'glow')

            filter
                .append('feGaussianBlur')
                .attr('stdDeviation', '4')
                .attr('result', 'coloredBlur');

            const femerge = filter
                .append('feMerge');

            femerge
                .append('feMergeNode')
                .attr('in', 'coloredBlur');
            femerge
                .append('feMergeNode')
                .attr('in', 'SourceGraphic');
        }


        svg.append('defs');
        svg.call(createGradient);
        svg.call(createGlowFilter);




        // Funktion som laver "growing" linjer til diagrammet. Der tegnes en linje i form af en rect (ref. koordinater)
        function tweenDash() {
            var that = this;
            return function (t) {
                var l = that.getTotalLength();
                interpolate = d3.interpolateString("0," + l , l + "," + l);
                return interpolate(t);
            }
        }

        // Genererer paths til linjediagrammet 
        const lines = svg.selectAll(".line")
            .data(newDataArray)
            .attr("class", "line")


        // EXIT DATA 
        lines.exit()
            .remove();

        // TILFØRER EVT. NYE DATA 
        lines.enter()
            .append("path")
            .attr("class", "line")
            /* .attr("d", line) */
            .attr('d', d => {
                const lineValues = line(d).slice(1);
                const splitedValues = lineValues.split(',');

                return `M0,${height},${lineValues},l1,${height - splitedValues[splitedValues.length-1]}`
            })
            .style("stroke", () =>
                '#ffffff'
            )
            .style('fill', 'url(#gradient)')
            .style('filter', 'url(#glow)')

            // Update new data
            .merge(lines)
            .transition()
           /*  .attr("d", line) */
            .attr('d', d => {

                
                const lineValues = line(d).slice(1);
                const splitedValues = lineValues.split(',');

                console.log(splitedValues[splitedValues.length-2])

                return `M0,${height},${lineValues},l0,${height - splitedValues[splitedValues.length-1]}`
            })
            .duration(7000)
            .attrTween("stroke-dasharray", tweenDash) // Her bruger vi growing line funktionen som er defineret længere oppe 
            .style("stroke", () =>
                '#ffffff'
            ).attr("stroke-dashoffset", 2)

            if (svg.selectAll("#minLabel").empty()) {
                svg.append("text")
                .attr("id", "minLabel")
                .attr("transform", "translate("+(width-150)+","+yScale(newDataArray[0][newDataArray[0].length-1].y)+")")
                .attr("text-anchor", "start")
                .style("fill", "white")
          
                svg.append("text")
                .attr("id", "maxLabel")
                .attr("transform", "translate("+(width-150)+","+yScale(newDataArray[1][newDataArray[0].length-1].y)+")")
                .attr("text-anchor", "start")
                .style("fill", "white")
            } else {
                    let minToolTip = svg.selectAll("#minLabel")
                    .transition().duration(7000)
                    .attr("transform", "translate("+(width-150)+","+yScale(newDataArray[0][newDataArray[0].length-1].y)+")")
                    .text(newDataArray[0][newDataArray[1].length-1].y.toFixed(1) + ' DKK');
              
                    let maxToolTip = svg.selectAll("#maxLabel")
                    .transition().duration(7000)
                    .attr("transform", "translate("+(width-150)+","+yScale(newDataArray[1][newDataArray[0].length-1].y)+")")
                    .text(newDataArray[1][newDataArray[1].length-1].y.toFixed(1) + ' DKK');
                    
            }
    })



} // Her slutter render-funktionen 
// Nu kalder vi render funktionen ved page-load (Bliver også kaldt ved tryk på "beregn" knappen. 



render();


// Nedenunder beregninger for det samlede forbrug (total_forbrug) baseret på input-værdierne vi får fra "brugeren" via formularet 

/*  tørretumbler beregning*/
let total_forbrug;
let tør_alder_value = "ny"
let tør_gange_value = 0
let data_linjediagram;

document.addEventListener("DOMContentLoaded", () => {
    const select_tør_alder = document.querySelector('#tør_alder');
    select_tør_alder.addEventListener('change', (event) => {
        tør_alder_value = event.target.value
        console.log(event.target.value)
        tør_brug()
    });

    const select_tør_gange = document.querySelector('#tør_gange');
    select_tør_gange.addEventListener('change', (event) => {
        tør_gange_value = event.target.value
        console.log(event.target.value)
        tør_brug()
    });
});
//  Funktion beregner kwh per gang afhængig af alder på apparat 
function tør_brug() {
    if (tør_alder_value == "ny") {
        document.getElementById('tør_brug').value = (2.35 * tør_gange_value).toFixed(2)
    }
    else {
        document.getElementById('tør_brug').value = (2.65 * tør_gange_value).toFixed(2)
    }
}

/* vaskemaskine beregning */
let vask_alder_value = "ny"
let vask_gange_value = 0

document.addEventListener("DOMContentLoaded", () => {
    const select_vask_alder = document.querySelector('#vask_alder');
    select_vask_alder.addEventListener('change', (event) => {
        vask_alder_value = event.target.value
        console.log(event.target.value)
        vask_brug()
    });

    const select_vask_gange = document.querySelector('#vask_gange');
    select_vask_gange.addEventListener('change', (event) => {
        vask_gange_value = event.target.value
        console.log(event.target.value)
        vask_brug()
    });
});

//  Funktion beregner kwh per gang afhængig af alder på apparat 
function vask_brug() {
    if (vask_alder_value == "ny") {
        document.getElementById('vask_brug').value = (0.68 * vask_gange_value).toFixed(2)
    }
    else {
        document.getElementById('vask_brug').value = (0.89 * vask_gange_value).toFixed(2)
    }
}

/* Opvaskemaskine beregning */
let opvask_alder_value = "ny"
let opvask_gange_value = 0

document.addEventListener("DOMContentLoaded", () => {
    const select_opvask_alder = document.querySelector('#opvask_alder');
    select_opvask_alder.addEventListener('change', (event) => {
        opvask_alder_value = event.target.value
        console.log(event.target.value)
        opvask_brug()
    });

    const select_opvask_gange = document.querySelector('#opvask_gange');
    select_opvask_gange.addEventListener('change', (event) => {
        opvask_gange_value = event.target.value
        console.log(event.target.value)
        opvask_brug()
    });
});

//  Funktion beregner kwh per gang afhængig af alder på apparat 
function opvask_brug() {
    if (opvask_alder_value == "ny") {
        document.getElementById('opvask_brug').value = (0.85 * opvask_gange_value).toFixed(2)
    }
    else {
        document.getElementById('opvask_brug').value = (1.04 * opvask_gange_value).toFixed(2)
    }

}

// Funktion der tager inputværdierne vedr. og opsummerer dem til et det samlede forbrug(total_forbrug).Denne eksekveres ved tryk på "beregn" knappen
function submit1() {
    // Henter inputværdierne for de tre apparater (assigner nye variabler)
    var tør_strømforbrug = parseFloat(document.getElementById("tør_brug").value)
    var vask_strømforbrug = parseFloat(document.getElementById("vask_brug").value)
    var opvask_strømforbrug = parseFloat(document.getElementById("opvask_brug").value)
    // Endelig ligger vi værdierne sammen til det samlede forbrug 
    total_forbrug = (tør_strømforbrug + vask_strømforbrug + opvask_strømforbrug)

    document.getElementById('resultat').textContent = "Dit ugentlige forbrug " + total_forbrug.toFixed(2) + " kWh"  // Tilføjer dette til vors resultat-div/p og toFixed begrænser antal decimaler 
    render(); // Her kaldes endeligt render-funktionen, hver gang der trykkes submit! 
}


