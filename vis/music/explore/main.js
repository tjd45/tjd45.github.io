// Get today's date one year ago
const date = genDateFromDate(new Date());

date.setFullYear(date.getFullYear() - 1);
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const formattedDate = date.toLocaleDateString('en-GB', options);

var songplay_lib, day_data
var thisDay

function genDateFromDate(datetime){

    const year = datetime.getFullYear();
    const month = String(datetime.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(datetime.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`; // Example: "2024-10-20" (local date)

    return genDate(dateString)
}

function genDate(dateString){
    const dateParts = dateString.split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed in JavaScript
    const day = parseInt(dateParts[2], 10);

    return new Date(year,month,day)
}

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip") // Add a class for styling
    .style("position", "absolute")
    .style("background", "lightgrey")
    .style("padding", "5px")
    .style("border", "1px solid black")
    .style("border-radius", "5px")
    .style("visibility", "hidden"); // Hidden by default

// Set the small title above the SVG
// document.getElementById('svgTitle').textContent = `${formattedDate}`;
updateTitle(date)

// Optional: Set date picker default to today's date
document.getElementById('datePicker').value = date.toISOString().split('T')[0];

document.getElementById('datePicker').addEventListener('change', function (event) {
    console.log(event.target)

    const selectedDate = genDate(event.target.value)

    // Now, this will give you the start of the selected day in UTC
    thisDay = genDay(selectedDate);
    
    // Update the title based on the selected date
    updateTitle(selectedDate); // Ensure title reflects the correct date
    console.log("Selected Date: ", selectedDate); // Check the selected date

});

document.getElementById('randomButton').addEventListener('click', function () {
    const allDates = Object.keys(day_data.days);  // Get all available dates
    const randomIndex = Math.floor(Math.random() * allDates.length);  // Choose a random index
    const randomDate = genDate(allDates[randomIndex]) 
    thisDay = genDay(randomDate);  // Generate songplays for the random day
    document.getElementById('datePicker').value = randomDate.toISOString().split('T')[0];  // Update the date picker value
    drawDay(thisDay);  // Optionally draw or update the day view
});

function updateTitle(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-GB', options);
    document.getElementById('svgTitle').textContent = formattedDate; 
}


async function loadFiles(){
    songplay_lib = await d3.json("data/songplay_library.json")
    song_lib = await d3.json("data/song_library.json")
    artist_lib = await d3.json("data/artist_library.json")

    day_data = await d3.json("data/days_overview.json")
}

function genDay(fullDate){
    updateTitle(fullDate)
    const justDate = fullDate.toISOString().split('T')[0];

    const dayPlays = day_data.days[justDate];

    drawDay(dayPlays)

    return dayPlays
}

function drawDay(day) {
    // Clear the existing content in the SVG (if any)
    const svg = d3.select("svg"); // Assuming you have an SVG element in your HTML
    svg.selectAll("*").remove(); // Remove previous rectangles if they exist

    // const width = +svg.attr("width"); // Get the width of the SVG
    const width = parseInt(svg.style("width"), 10);; // Get the width of the SVG
    const height = parseInt(svg.style("height"), 10) || 100; // Default height if not set


    const playHeight = 350; // Set a fixed height for the rectangles (adjust as needed)
    
    // Get the max_sp_one_day from the overview
    const maxSongplays = day_data.overview.max_sp_one_day;
    
    // Calculate the width for each rectangle
    const rectWidth = width / maxSongplays; // Width of each rectangle

    const midHeight = height/2 - playHeight/2

    const scaleFactor = width / day_data.overview.max_ms_one_day;


    // // Draw rectangles based on constant width per song
    // svg.selectAll("rect")
    //     .data(day)
    //     .enter()
    //     .append("rect")
    //     .attr("x", (d, i) => i * rectWidth) // Position each rectangle
    //     .attr("y", midHeight) // Set the y position (top of SVG)
    //     .attr("width", rectWidth - 1) // Width of each rectangle (subtracting 1 for spacing)
    //     .attr("height", playHeight) // Set height
    //     .attr("fill", "lightgrey"); // Color of rectangles

    // Draw rectangles based on ms played
    svg.selectAll("rect")
    .data(day)
    .enter()
    .append("rect")
    .attr("x", (d, i) => {
        // Calculate the cumulative width for positioning
        const cumulativeWidth = day.slice(0, i).reduce((total, songplayId) => {
            return total + (songplay_lib[songplayId].ms_played * scaleFactor);
        }, 0);
        return cumulativeWidth; // Position each rectangle based on cumulative width
    })
    .attr("y", midHeight) // Set the y position (top of SVG)
    .attr("width", (d) => Math.max(songplay_lib[d].ms_played * scaleFactor, 2) - 1) // Width of each rectangle based on ms_played
    .attr("height", playHeight) // Set height
    .attr("fill", "lightgrey") // Color of rectangles
    .on("mouseover", function(event, d) {
        d3.select(this) // Select the hovered rectangle
            .attr("fill", "darkgrey"); // Change color on hover
        
        const duration = convertMS(songplay_lib[d].ms_played)
        
        const displayString = genDisplayString(d)
        // Update tooltip content

        tooltip.html(`${displayString}<br>Played for: ${duration}`)
            .style("visibility", "visible") // Show the tooltip
            .style("top", (event.pageY - 10) + "px") // Position it
            .style("left", (event.pageX + 10) + "px");
    })
    .on("mousemove", function(event) {
        // Update tooltip position on mouse move
        tooltip.style("top", (event.pageY - 10) + "px")
               .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
        d3.select(this) // Select the hovered rectangle
            .attr("fill", "lightgrey"); // Reset color

        tooltip.style("visibility", "hidden"); // Hide the tooltip
    });
}

function genDisplayString(sid){
    
    song = song_lib[songplay_lib[sid].song_id]
    songname = song.title
    artist=artist_lib[song.artist_ids[0]]
    artistname = artist.name

    return songname + " by " + artistname
}

function convertMS(ms){
    const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const duration = `${minutes}m${seconds < 10 ? '0' : ''}${seconds}s`; // Format duration

        return duration
}
async function main(){
    await loadFiles()

    thisDay = genDay(date)


}

main()

