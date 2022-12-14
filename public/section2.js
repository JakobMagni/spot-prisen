//section 2 linjediagram

// Definere variabler
var width = (window.innerWidth * .6);
var height = 500
const margin = { top: 20, right: 20, bottom: 50, left: 50 };
var tooltip = { width: 100, height: 100, x: 10, y: -30 };


// Skalering af akser 
var xScale = d3.scaleLinear().domain([1, 53])
    .range([1, width - margin.left - margin.right - 10]);
var yScale = d3.scaleLinear().domain([0, 100]).range([height - margin.top - margin.bottom, 10]);

//Definerer parametre for linje-funktion
const line = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .curve(d3.curveMonotoneX);

// Appende SVG 
const svg = d3.select("#diagram2")
    .append("svg")
    .attr("width", width + 10)
    .attr("height", height + margin.top).append("g")
    .attr("transform", `translate(${margin.left - 5},-15)`)

// Appender text (overskrift) til linjediagram
svg.append('text')
    .attr('id', 'x-label')
    .attr('x', width / 2)
    .attr('y', 30)
    .attr('text-anchor', 'middle')
    .style('font-family', 'Work Sans, Sans-serif')
    .style('font-size', 20)
    .text('Gennemsnitlig lavest og højest elpris pr. uge (2021) (DKK)')
    .style('fill', 'white');

// Appender text til Y-Aksen 
svg.append('text')
    .attr('id', 'y-label')
    .attr('text-anchor', 'middle')
    .attr('transform', 'translate(60,' + ((height / 6.5) - 30) + ')')
    .style('font-family', 'Work Sans, Sans-serif')
    .style('font-size', 14)
    .text('Kroner (DKK)')
    .style('fill', 'white');



// Render funktion som indeholder parametere for linjediagrammet - kaldes første gang når siden loader og igen senere når submit1 funktionen kaldes (Ved tryk på "Beregn" knap)

let total_weekly_consumption;    // Ny variabel for det samlede ugentlige forbrug 
let moms = 1.25;

function render() {

    d3.json("/api/diagram2", {
        method: "POST",
    }).then(function (response) {

        const responseData = response.data

        let minArray = []; // Laver tomt array til min-værdier
        let maxArray = []; // Laver tomt array til max-værdier 

        if (!total_weekly_consumption) {                       // Hvis total forbrug variablen er tom (ingen inputs fra formularen), push rå el-pris data(min/max) til to forskellige arrays
            console.log('Uændret forbrug')

            // For-loop som iterer over alle datapunkter i responsedata, for at skille datapunkterne ad. Pushes til hvert sit array 
            for (let dataPoint of responseData) {
                minArray.push({ x: dataPoint.week_nr, y: parseFloat(dataPoint.min_avg_weekly) });     // Vi tilskriver værdierne en x og y værdi - som vi skal bruge til at tegne linje
                maxArray.push({ x: dataPoint.week_nr, y: parseFloat(dataPoint.max_avg_weekly) })
            }
        } else {
            // Hvis ændring i inputdata(altså variablen er ikke tom), så løbende opsummer min + max i to arrays
            let minAvgWeeklySum = 0; // Ny variabel til summen af forbrug * ugentlig min pris (årlig forbrug i DKK)
            let maxAvgWeeklySum = 0; // Ny variable til summen af forbrug * ugentlig max pris (årlig forbrug i DKK)
            for (let dataPoint of responseData) {
                minAvgWeeklySum = minAvgWeeklySum + parseFloat((dataPoint.min_avg_weekly * total_weekly_consumption) * moms) //Gennemsnitspris * ugentlig forbrug + moms 
                maxAvgWeeklySum = maxAvgWeeklySum + parseFloat((dataPoint.max_avg_weekly * total_weekly_consumption) * moms)

                minArray.push({ x: dataPoint.week_nr, y: parseFloat(minAvgWeeklySum) }) // Pusher de nye værdier i nye arrays 
                maxArray.push({ x: dataPoint.week_nr, y: parseFloat(maxAvgWeeklySum) })
            }


            // Variable til optællingsfunktion 
            let moneySaved = (parseFloat(maxAvgWeeklySum) - parseFloat(minAvgWeeklySum)).toFixed(2)
            console.log("Besparelse " + moneySaved)

            // Optællingsfunktion til besparelsespotentiale 
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

        //Variabler for de to "nye" arrays (hvor dataen afhænger af hvorvidt der har været input i formularen
        const newDataArray = [maxArray, minArray]

        yScale = d3.scaleLinear().domain([0, d3.max(newDataArray[0], (d) => d.y) + 0.5]).range([height, 50]);

        // Lav akser 
        const xAxis = d3.axisBottom().scale(xScale).ticks(52)
        const yAxis = d3.axisLeft().scale(yScale)


        // Hvis der ikke findes en y akse så laves en, eller opdaterer vi den allerede eksisterende (anvender CSS klasser)
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

        // Hvis der ikke findes en x akse laves en ellers opdaterer vi den allerede eksisterende (anvender CSS klasser)
        if (svg.selectAll(".x.axis").empty()) {
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (height) + ")")
                .call(xAxis);
        } else {
            svg.selectAll(".x.axis")
                .transition().duration(1500)
                .call(xAxis);
        }


        // Hvis total_weekly_consumption- variablen eksisterer og har en værdi, ændrer vi x-akse tekst 
        if (total_weekly_consumption) {
            svg.selectAll("#x-label")
                .transition().duration(1500)
                .text('Estimeret årlig forbrug(DKK) ved lavest og højest gennemsnits el-pris');
        }

        // Gradient funktion 
        const createGradient = select => {
            const gradient = select
                .select('defs')
                .append('linearGradient')
                .attr('id', 'gradient')
                .attr('x1', '25%')
                .attr('y1', '100%')
                .attr('x2', '60%')
                .attr('y2', '0');

            gradient
                .append('stop')
                .attr('offset', '0%')
                .attr('style', 'stop-color:#3FF4EB;stop-opacity:0.3');

            gradient
                .append('stop')
                .attr('offset', '100%')
                .attr('style', 'stop-color:#FF00DD;stop-opacity:0.9');
        }

        // Glow funktion 
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

        // Kald gradient og glow funktion 
        svg.append('defs');
        svg.call(createGradient);
        svg.call(createGlowFilter);


        // Funktion som laver "growing" linjer til diagrammet. 
        function tweenDash() {
            var that = this;
            return function (t) {
                var l = that.getTotalLength();
                interpolate = d3.interpolateString("0," + l, l + "," + l);
                return interpolate(t);
            }
        }

        // Genererer paths til linjediagrammet 
        const lines = svg.selectAll(".line")
            .data(newDataArray)
            .attr("class", "line")


        // Fjerner eksisterende datapunkter hvis nye kommer til
        /*  lines.exit()
             .remove();
  */
        // Tilfører data igen og opdaterer 
        lines.enter()
            .append("path")
            .attr("class", "line")
            /* .attr("d", line) */
            .attr('d', d => {
                const lineValues = line(d).slice(1);
                const splitedValues = lineValues.split(',');

                return `M0,${height},${lineValues},l1,${height - splitedValues[splitedValues.length - 1]}`
            })
            .style("stroke", () =>
                '#ffffff'
            )
            .style('fill', 'url(#gradient)')
            .style('filter', 'url(#glow)')


            // Update new data
            .merge(lines)
            .transition()
            .attr('d', d => {

                const lineValues = line(d).slice(1);
                const splitedValues = lineValues.split(',');

                return `M0,${height},${lineValues},l0,${height - splitedValues[splitedValues.length - 1]}`
            })
            .duration(7000)
            .attrTween("stroke-dasharray", tweenDash) // Her bruger vi growing line funktionen som er defineret længere oppe 
            .style("stroke", () =>
                '#ffffff'
            ).attr("stroke-dashoffset", 2)

        // Labels med max og min sum til hver linje 
        if (svg.selectAll("#minLabel").empty()) {
            svg.append("text")
                .attr("id", "minLabel")
                .attr("transform", "translate(" + (0) + "," + height + ")")
                .attr("text-anchor", "start")
                .style("fill", "white")
            console.log(newDataArray)
            svg.append("text")
                .attr("id", "maxLabel")
                .attr("transform", "translate(" + (0) + "," + height + ")")
                .attr("text-anchor", "start")
                .style("fill", "white")
        } else {
            let minToolTip = svg.selectAll("#minLabel")
                .transition().duration(6000)
                .attr("transform", "translate(" + (width - 150) + "," + yScale(newDataArray[1][newDataArray[1].length - 1].y) + ")")
                .text(newDataArray[1][newDataArray[0].length - 1].y.toFixed(1) + ' DKK');

            let maxToolTip = svg.selectAll("#maxLabel")
                .transition().duration(6000)
                .attr("transform", "translate(" + (width - 150) + "," + yScale(newDataArray[0][newDataArray[1].length - 1].y) + ")")
                .text(newDataArray[0][newDataArray[0].length - 1].y.toFixed(1) + ' DKK');
        }
    })
}

// kalder render-funktion 
render();


// Nedenunder beregninger for det samlede forbrug (total_weekly_consumption) baseret på input-værdierne vi får fra "brugeren" via formularet vedr. apparater 
/*  tørretumbler beregning*/

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

// Funktion der tager inputværdierne vedr. og opsummerer dem til et det samlede forbrug(total_weekly_consumption).Denne eksekveres ved tryk på "beregn" knappen
function submit1() {
    // Henter inputværdierne for de tre apparater (assigner nye variabler)
    var tør_strømforbrug = parseFloat(document.getElementById("tør_brug").value)
    var vask_strømforbrug = parseFloat(document.getElementById("vask_brug").value)
    var opvask_strømforbrug = parseFloat(document.getElementById("opvask_brug").value)
    // Endelig ligger vi værdierne sammen til det samlede forbrug 
    total_weekly_consumption = (tør_strømforbrug + vask_strømforbrug + opvask_strømforbrug)

    document.getElementById('resultat').textContent = "Dit ugentlige forbrug " + total_weekly_consumption.toFixed(2) + " kWh"  // Tilføjer dette til vors resultat-div/p og toFixed begrænser antal decimaler 
    render(); // Her kaldes endeligt render-funktionen, hver gang der trykkes submit! 
}


