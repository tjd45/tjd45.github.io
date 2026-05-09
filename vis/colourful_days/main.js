const SVG_WIDTH = 800;
const SVG_HEIGHT = 500;

const x_buffer = 5;
const y_buffer = 5;

let COLOUR_MODE = "average";

function toggleColourMode(){
    if (COLOUR_MODE == "quantised"){
        COLOUR_MODE = "average"
    }else{
        COLOUR_MODE = "quantised"
    }
    redraw()
}

const bandHeight = (SVG_HEIGHT - (2*y_buffer))/(17*24);

const calendarSvg = d3.select(".calendar-container")
    .append("svg");

const stripsSvg = d3.select(".strips-container")
    .append("svg");

function rgbString(rgb) {

    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

}

function getDayColour(day) {
    if (COLOUR_MODE === "quantised") {
        return rgbString(day.average_quantised_lvl3_rgb);
    }

    return rgbString(day.average_rgb);
}

function getHourColour(hourData) {
    if (hourData === null) {
        return "";
    }

    if (COLOUR_MODE === "quantised") {
        return rgbString(hourData.dominant_quantised_lvl3_rgb);
    }

    return rgbString(hourData.average_rgb);
}

async function loadFiles(){
    days_lib = await d3.json("data/days_plus.json")
    return days_lib
}

function drawHourStrip(target, day, hour, colour, layout){
    x = layout.x
    width = layout.width

    y = layout.y + ((day*24)+(hour))*layout.bandHeight;

    target.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", width)
        .attr("height", layout.bandHeight)
        .attr("fill", colour);
    
}

function getStripLayout(target, days=true) {
    const { width, height } = target.node().getBoundingClientRect();

    const xpadding = days ? 30 : 50;
    const ypadding = 30;

    const stripWidth = width - xpadding * 2;
    const stripHeight = height - ypadding * 2;

    return {
        x: xpadding,
        y: ypadding,
        width: stripWidth,
        height: stripHeight,
        bandHeight: stripHeight / (17 * 24)
    };
}

function drawDayStrip(target, day, colour, layout){
    x = layout.x
    width = layout.width

    y = layout.y + (day*24)*layout.bandHeight

    target.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", width)
        .attr("height", layout.bandHeight*24)
        .attr("fill", colour);
    
}

const day_labels=
[
    "21st April",
    "22nd April",
    "23rd April",
    "24th April",
    "25th April",
    "26th April",
    "27th April",
    "28th April",
    "29th April",
    "30th April",
    "1st May",
    "2nd May",
    "3rd May",
    "4th May",
    "5th May",
    "6th May",
    "7th May"

]

// for (i = 0; i<17; i++){
//     for(j=0; j<24;j++){
//         drawHour(svg, i, j, "blue")
//     }
    
// }

// drawHour(svg, 5, 12)
function drawHourStrips(target, days){

    const layout = getStripLayout(target,false)

    for (let i = 0; i < days.length; i++) {
        const day = days[i];
        const dayIndex = day.day_index;
        for (let hour = 0; hour < 24; hour++) {
            const hourData = day.hours[String(hour)];
            const colour = getHourColour(hourData)
            drawHourStrip(target,dayIndex, hour, colour,layout)
            
            
        }
    }
    
}

function drawDayStrips(target, days){

    target.selectAll("*").remove()

    // console.log(days)
    const layout = getStripLayout(target);
   

    for (let i = 0; i < days.length; i++) {
        const day = days[i];
        const dayIndex = day.day_index;

        // console.log(day)
        colour = getDayColour(day)
        drawDayStrip(target, dayIndex, colour, layout)

        
    }
    
}

function drawCalendarDay(target, day, xPos, yPos, size=100){

    const ringPositions = [
    [3, 6], // 0 bottom middle
    [2, 6], // 1
    [1, 6], // 2
    [0, 6], // 3 bottom left corner
    [0, 5], // 4
    [0, 4], // 5
    [0, 3], // 6
    [0, 2], // 7
    [0, 1], // 8
    [0, 0], // 9 top left corner
    [1, 0], // 10
    [2, 0], // 11
    [3, 0], // 12
    [4, 0], // 13
    [5, 0], // 14 top right-ish
    [6, 0], // 15 top right corner
    [6, 1], // 16
    [6, 2], // 17
    [6, 3], // 18
    [6, 4], // 19
    [6, 5], // 20
    [6, 6], // 21 bottom right corner
    [5, 6], // 22
    [4, 6], // 23
];
    const day_colour = getDayColour(day)

    const day_holder = target.append("g").attr("transform", `translate(${xPos}, ${yPos})`);

    const day_box = day_holder.append("rect")
                                .attr("x",0)
                                .attr("y",0)
                                .attr("width",size)
                                .attr("height",size)
                                .attr("stroke", "white")
                                .attr("stroke-width", 1)

    const hour_holder = day_holder.append("g")


    let hour_box_size = size/7

    // console.log(day)

    const day_average = day_holder.append("rect")
                                    .attr("x",hour_box_size)
                                    .attr("y",hour_box_size)
                                    .attr("width",size-(2*hour_box_size))
                                    .attr("height",size-(2*hour_box_size))
                                    .attr("fill",day_colour)
                                    // .attr("stroke", "white")
                                    // .attr("stroke-width", 2)

    const day_label = day_holder.append("text")
                                    .attr("x", 0) 
                                    .attr("y", -hour_box_size/2)
                                    .attr("text-anchor", "left") 
                                    .attr("dominant-baseline", "middle") 
                                    .style("font-family", "Avenir")
                                    .attr("fill", "#666")
                                    .style("font-size",hour_box_size+"px")
                                    .text(day_labels[day.day_index]);

    for (i = 0;i<24;i++){

        const [gridX,gridY]= ringPositions[i]

        const hourData = day.hours[i]
        const hourColour = getHourColour(hourData)

        let x = gridX*hour_box_size
        let y = gridY*hour_box_size
        const hour_box = hour_holder.append("rect")
                                .attr("x",x)
                                .attr("y",y)
                                .attr("width",hour_box_size)
                                .attr("height",hour_box_size)
                                .attr("fill",hourColour)
                                // .attr("stroke", "white")
                                // .attr("stroke-width", 1)
    }
    

}

function drawCalendar(target,days){
    const gridPosition = [
    [1, 0], // 0 offset by 1 for Tuesday
    [2, 0], // 1
    [3, 0], // 2
    [4, 0], // 3 
    [5, 0], // 4
    [6, 0], // 5
    [0, 1], // 6
    [1, 1], // 7
    [2, 1], // 8
    [3, 1], // 9 
    [4, 1], // 10
    [5, 1], // 11
    [6, 1], // 12
    [0, 2], // 13
    [1, 2], // 14 
    [2, 2], // 15 
    [3, 2], // 16
];

    target.selectAll("*").remove()

 const weekdayLabels = [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ];

    const {width,height} = target.node().getBoundingClientRect()

    const padding = 20

    const availableWidth = width - (padding*2)
    const availableHeight = height - (padding*2)

    const gapRatio = 0.18

    const cellSize = Math.min(availableWidth/7,availableHeight/3)
    const daySize = cellSize/(1+gapRatio)
    const dayGap = daySize * gapRatio
    
    const labelHeight = daySize / 7

    // const cellSize = daySize + dayGap

    let gridWidth = cellSize*7
    let gridHeight = cellSize*3 + labelHeight

    let topCornerX = (width - gridWidth)/2
    let topCornerY = (height - gridHeight)/2

    const grid_holder = target.append("g").attr("transform", `translate(${topCornerX}, ${topCornerY})`);

    const grid_box = grid_holder.append("rect")
                                .attr("x",0)
                                .attr("y",0)
                                .attr("width",gridWidth)
                                .attr("height",gridHeight)
                                // .attr("stroke", "white")
                                // .attr("stroke-width", 2);


    // for (let col = 0; col < 7; col++) {

    //     grid_holder.append("text")
    //         .attr("x", (col * cellSize) + (cellSize / 2))
    //         .attr("y", 10)
    //         .attr("text-anchor", "middle")
    //         .attr("fill", "#AAA")
    //         .style("font-family", "Avenir")
    //         .style("font-size", "13px")
    //         .style("font-weight", "400")
    //         .text(weekdayLabels[col])
    // }

    for (let i=0;i<17;i++){
        // console.log(days[i])
        const [gridX,gridY] = gridPosition[i]

        let x = (gridX * cellSize) + dayGap/2
        let y = labelHeight + (gridY * cellSize) + dayGap/2

        drawCalendarDay(grid_holder,days[i],x,y,daySize)
      
                                

    }

    
}

d3.selectAll("h1,h2")
    .on("click", () => {toggleColourMode()})

function draw(){
    drawCalendar(calendarSvg,days)
    drawDayStrips(stripsSvg,days)
    drawHourStrips(stripsSvg,days)
}

function redraw(){
    draw()

}
async function main(){
    days = await loadFiles()

    draw()

}

window.addEventListener("resize", redraw);

main()

