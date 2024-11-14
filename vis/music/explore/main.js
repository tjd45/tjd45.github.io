// Get today's date one year ago
var date = genDateFromDate(new Date());
var year = 2024

date.setFullYear(date.getFullYear() - 1);
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const formattedDate = date.toLocaleDateString('en-GB', options);

var songplay_lib, day_data
var thisDay
var snake = []

var currentView = "day"

var minYear, maxYear

var firstTimeLoad = true

var colours = ["#eaf0ce", "#89aae6", "#DA9644", "#15a0a2", "#f4998d"]

var yearAnimation = false;

// Select the elements
const infoButton = document.getElementById("infoButton");
const infoModal = document.getElementById("infoModal");
const closeButton = document.getElementById("closeButton");
const infoParaDay = document.getElementById("day-info");
const infoParaYear = document.getElementById("year-info");

// Show the modal when the info button is clicked
infoButton.addEventListener("click", () => {

  infoModal.style.display = "flex";  // Use flex to center modal content
  if(currentView=="day"){
    infoParaDay.style.display = "block"
    infoParaYear.style.display = "none"
  }else{
    infoParaDay.style.display = "none"
    infoParaYear.style.display = "block"
  }
  
});

// Close the modal when the close button (X) is clicked
closeButton.addEventListener("click", () => {
  infoModal.style.display = "none";
});

// Close the modal when clicking outside the modal content
window.addEventListener("click", (event) => {
  if (event.target === infoModal) {
    infoModal.style.display = "none";
  }
});

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

document.getElementById('dayButton').addEventListener('click', function () {
    toggleView('day');
});

document.getElementById('yearButton').addEventListener('click', function () {
    toggleView('year');
});

function toggleView(view) {
    currentView = view
    const dayButton = document.getElementById('dayButton');
    const yearButton = document.getElementById('yearButton');
    const dayControls = document.getElementById('dayControls');
    const yearControls = document.getElementById('yearControls');
    const svgDay = document.getElementById('svgDay');
    const svgYear = document.getElementById('svgYear');

    if (view === 'day') {
        // Show day-specific elements
        dayButton.classList.add('active');
        yearButton.classList.remove('active');
        dayControls.style.display = 'inline-block';
        yearControls.style.display = 'none';
        svgDay.style.display = 'block';
        svgYear.style.display = 'none';

        updateTitle(date); // Reset title to current date format

    } else if (view === 'year') {
        // Show year-specific elements
        dayButton.classList.remove('active');
        yearButton.classList.add('active');
        
        dayControls.style.display = 'none';
        yearControls.style.display = 'inline-block';
        svgDay.style.display = 'none';
        svgYear.style.display = 'block';

        if(firstTimeLoad){
            year = 2024

            showSpinner()
            drawYear(year)
            hideSpinner()
            
            firstTimeLoad = false

        }

        if(year == "all"){
            document.getElementById('svgTitle').textContent = "All Years";
        }else{
            document.getElementById('svgTitle').textContent = year;
        }
        

    
    }
}


document.getElementById("toggleAnimationSwitch").addEventListener("change", function () {
    yearAnimation = this.checked; // Update based on the switch state
    showSpinner();

    setTimeout(function () {
        drawYear(year);
        hideSpinner();
    }, 0); // Short delay to allow the spinner to render

});

function populateYearDropdown(minYear, maxYear) {
    const yearDropdown = document.getElementById('yearDropdown');
    yearDropdown.innerHTML = '';  // Clear any existing options

    // Add "All" option
    const allOption = document.createElement('option');
    allOption.value = "all";
    allOption.textContent = "All";
    yearDropdown.appendChild(allOption);

    // Add options for each year from minYear to maxYear
    for (let year = maxYear; year >= minYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearDropdown.appendChild(option);
    }

    // Set default selection to max year
    yearDropdown.value = maxYear;
    year = maxYear;
}

document.getElementById('yearDropdown').addEventListener('change', function (event) {
    // console.log(event.target.value)
    selYear = event.target.value

    if(selYear!="all"){
        year = parseInt(selYear)
        document.getElementById('svgTitle').textContent = selYear;

    }else{
        console.log("All Years Selected")
        year = selYear
        document.getElementById('svgTitle').textContent = "All Years";

    }

    
    showSpinner();

    setTimeout(function () {
        drawYear(year);
        hideSpinner();
    }, 0); // Short delay to allow the spinner to render


});

document.getElementById('randomYearButton').addEventListener('click', function () {
    const yearDropdown = document.getElementById('yearDropdown');

    const yearOptions = Array.from(yearDropdown.options).filter(option => option.value !== "all");

    const randomYear = yearOptions[Math.floor(Math.random() * yearOptions.length)].value;

    // Set the dropdown to the randomly selected year
    yearDropdown.value = randomYear;
    // Update the title
    document.getElementById('svgTitle').textContent = randomYear;

    year = randomYear

    setTimeout(function () {
        drawYear(year);
        hideSpinner();
    }, 0); // Short delay to allow the spinner to render
});

document.getElementById('backYearButton').addEventListener('click', function () {
    year = Math.max(year-1,minYear)
    const yearDropdown = document.getElementById('yearDropdown');

    yearDropdown.value = year

    document.getElementById('svgTitle').textContent = year;
    showSpinner()
    setTimeout(function () {
        drawYear(year);
        hideSpinner();
    }, 0); // Short delay to allow the spinner to render   
});

document.getElementById('forwardYearButton').addEventListener('click', function () {
    year = Math.min(year+1,maxYear)
    const yearDropdown = document.getElementById('yearDropdown');

    yearDropdown.value = year

    document.getElementById('svgTitle').textContent = year;

    showSpinner()
     setTimeout(function () {
        drawYear(year);
        hideSpinner();
    }, 0); // Short delay to allow the spinner to render
});


// Optional: Set date picker default to today's date
document.getElementById('datePicker').value = date.toISOString().split('T')[0];

document.getElementById('datePicker').addEventListener('change', function (event) {
    console.log(event.target)

    const selectedDate = genDate(event.target.value)
    date = selectedDate

    // Now, this will give you the start of the selected day in UTC
    thisDay = genDay(selectedDate);
    
    // Update the title based on the selected date
    updateTitle(selectedDate); // Ensure title reflects the correct date
    console.log("Selected Date: ", selectedDate); // Check the selected date

});

document.getElementById('randomDayButton').addEventListener('click', function () {
    const allDates = Object.keys(day_data.days);  // Get all available dates
    const randomIndex = Math.floor(Math.random() * allDates.length);  // Choose a random index
    const randomDate = genDate(allDates[randomIndex]) 
    date = randomDate
    thisDay = genDay(randomDate);  // Generate songplays for the random day
    document.getElementById('datePicker').value = randomDate.toISOString().split('T')[0];  // Update the date picker value
    showSpinner()
    setTimeout(function () {
        drawDay(thisDay);
        hideSpinner();
    }, 0)
    // drawDay(thisDay);  // Optionally draw or update the day view
});

document.getElementById('backDayButton').addEventListener('click', function () {
    console.log(date)
    date.setDate(date.getDate() - 1);
    thisDay = genDay(date);  
    document.getElementById('datePicker').value = date.toISOString().split('T')[0];  // Update the date picker value
    showSpinner()
    setTimeout(function () {
        drawDay(thisDay);
        hideSpinner();
    }, 0)
});

document.getElementById('forwardDayButton').addEventListener('click', function () {
    console.log(date)
    date.setDate(date.getDate() + 1);
    thisDay = genDay(date);  
    document.getElementById('datePicker').value = date.toISOString().split('T')[0];  // Update the date picker value
    showSpinner()
    setTimeout(function () {
        drawDay(thisDay);
        hideSpinner();
    }, 0) 
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

function genSnake(artist, plays){
    console.log("Generating the snake data")

    let direction = 0;  // 0 = right, 1 = down, 2 = left, 3 = up
    let x1 = 0, y1 = 0, x2 = 0, y2 = 0;  // Initialize starting coordinates
    let lastNewID = null;

    let cnt = 0

    for (const sp of Object.values(songplay_lib)) {

        const spid = sp.id;  
        const ms_played = sp.ms_played;
        const timestamp = sp.ts_start;

        // Set start coordinates for the current segment
        x1 = x2;
        y1 = y2;

        if (sp.firstArtistPlay && cnt>0) { // Add caveat so the direction stays to the right for the first item even if it satisfies the new value
            direction = (direction + 1) % 4;  // Rotate direction 90 degrees to the right
        }

        // Determine end coordinates based on current direction
        if (direction === 0) {  // Right
            x2 = x1 + ms_played;
            y2 = y1;
        } else if (direction === 1) {  // Down
            x2 = x1;
            y2 = y1 + ms_played;
        } else if (direction === 2) {  // Left
            x2 = x1 - ms_played;
            y2 = y1;
        } else if (direction === 3) {  // Up
            x2 = x1;
            y2 = y1 - ms_played;
        }

        // Create the snake segment object
        const snakeSegment = {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            spid: spid,
            last_new: lastNewID,
            year: timestamp.slice(0,4)
        };

        // Add the segment to the snake array
        snake.push(snakeSegment);
        // console.log(snakeSegment)
        // Check if this songplay is a new "first artist play"
        if (sp.firstArtistPlay) {
            lastNewID = spid;  // Update last_new with the current songplay ID
        }
        cnt++

    }


    // console.log("Generated snake data:", snake);

}

function genDay(fullDate){
    updateTitle(fullDate)
    const justDate = fullDate.toISOString().split('T')[0];

    const dayPlays = day_data.days[justDate];

    showSpinner()
    setTimeout(function () {
        drawDay(dayPlays);
        hideSpinner();
    }, 0)

    return dayPlays
}

function drawDay(day) {

    const dayMS = calcDayMS(day)
    // Clear the existing content in the SVG (if any)
    const svg = d3.select("#svgDay"); // Assuming you have an SVG element in your HTML
    svg.selectAll("*").remove(); // Remove previous rectangles if they exist

    // const width = +svg.attr("width"); // Get the width of the SVG
    const width = parseInt(svg.style("width"), 10);; // Get the width of the SVG
    const height = parseInt(svg.style("height"), 10) || 100; // Default height if not set

    const yScale = d3.scaleLinear()
    .domain([0, 100])  // Input range (0 to 100)
    .range([0, height]); // Output range (0 to SVG height)



    const playHeight = 350; // Set a fixed height for the rectangles (adjust as needed)
    
    // Get the max_sp_one_day from the overview
    const maxSongplays = day_data.overview.max_sp_one_day;
    
    // Calculate the width for each rectangle
    const rectWidth = width / maxSongplays; // Width of each rectangle

    const midHeight = height/2 
    console.log(day.length)
    const scaleFactor = width / dayMS;


    svg.selectAll("rect")
    .data(day)
    .enter()
    .each(function(d, i) {
        // Get popularities for the current data point
        const pops = getPopularities(d);
        
        // Calculate rectangle widths and heights
        const width = Math.max(songplay_lib[d].ms_played * scaleFactor, 2) - 1;
        const songHeight = yScale(pops.song);
        const artistHeight = yScale(pops.artist);

        var firstHeight = artistHeight
        var secondHeight = songHeight
        var firstColour = "darkgrey"
        var secondColour = "lightgrey"

        const maxHeight = Math.max(songHeight,artistHeight)

        if(songHeight > artistHeight){
            firstHeight = songHeight
            secondHeight = artistHeight
            firstColour = "lightgrey"
            secondColour = "darkgrey"
        }
        

        // Calculate cumulative width for positioning
        const cumulativeWidth = day.slice(0, day.indexOf(d)).reduce((total, songplayId) => {
            return total + (songplay_lib[songplayId].ms_played * scaleFactor);
        }, 0);

        const bounceTransition = d3.transition()
        .duration(1000)  // Duration of each rectangle animation
        .delay(i * 10)  // Sequential delay to create ripple effect
        .ease(d3.easeElasticOut);  // Bounce effect
        
        // Draw the song popularity rectangle
        d3.select(this)
            .append("rect")
            .attr("x", cumulativeWidth) // Position based on cumulative width
            .attr("y", midHeight) // Center vertically
            .attr("width", width) // Width of the rectangle
            .attr("height", 0)
            .attr("fill", firstColour) // Color for song popularity
            .transition(bounceTransition)
            .attr("height", firstHeight) // Height based on song popularity
            .attr("y", midHeight - (firstHeight / 2))
        
        // Draw the artist popularity rectangle
        d3.select(this)
            .append("rect")
            .attr("x", cumulativeWidth) // Position based on cumulative width
            .attr("y", midHeight) // Center vertically
            .attr("width", width) // Width of the rectangle
            .attr("height", 0) // Height based on artist popularity
            .attr("fill", secondColour) // Color for artist popularity
            .transition(bounceTransition)
            .attr("y", midHeight - (secondHeight / 2))
            .attr("height", secondHeight)

        // Draw a holder to have as the hover rectangle
        d3.select(this)
            .append("rect")
            .attr("x", cumulativeWidth) // Position based on cumulative width
            .attr("y", midHeight - (maxHeight / 2)) // Center vertically
            .attr("width", width) // Width of the rectangle
            .attr("height", maxHeight) // Height based on max popularity
            .attr("fill", "lightgrey") // Color for max popularity
            .attr("fill-opacity",0.0)
            .on("mouseover", function(event) {
                d3.select(this)
                    .attr("fill-opacity", 0.5)

                    const duration = convertMS(songplay_lib[d].ms_played)
                const displayString = genDisplayString(d)
//         // Update tooltip content

         tooltip.html(`${displayString}<br>Played for: ${duration}`)
                    .style("visibility", "visible")
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .attr("fill-opacity", 0.0)
                tooltip.style("visibility", "hidden");
            });


    });
}

function drawYear(year){


    let filteredSnake = snake

    if (year == "all"){
        console.log("Drawing All Years")

    }else{
        console.log("Drawing year: " + year);

        // Find start and end indices for the specified year
        const startIdx = snake.findIndex((segment) => segment.year == year);
        const endIdx = snake.findIndex((segment, index) => 
            segment.year > year && index > startIdx
        ) - 1;

        // If startIdx is -1, the year is not in the data
        if (startIdx !== -1) {
            filteredSnake = snake.slice(startIdx, endIdx + 1);
        } else {
            console.log("Year not found in data");
            filteredSnake = [];  // Clear filteredSnake if year is not found
        }

    }


    const svg = d3.select("#svgYear");
    svg.selectAll("*").remove();  // Clear previous drawings

    const width = parseInt(svg.style("width"), 10);
    const height = parseInt(svg.style("height"), 10);
    const padding = 0.05;  // 5% padding


    // Calculate inner drawing area dimensions
    const innerWidth = width * (1 - 2 * padding);
    const innerHeight = height * (1 - 2 * padding);

    const xExtent = d3.extent(filteredSnake.flatMap(d => [d.x1, d.x2]));
    const yExtent = d3.extent(filteredSnake.flatMap(d => [d.y1, d.y2]));

    const xScale = d3.scaleLinear()
    .domain([xExtent[0], xExtent[1]])
    .range([padding * width, width - padding * width]);

    const yScale = d3.scaleLinear()
    .domain([yExtent[0], yExtent[1]])
    .range([height - padding * height, padding * height]);  // SVG y is top to bottom, so invert the range

    if(yearAnimation){

        let totalDuration = 5000

        if(year == 2011){
            totalDuration = 1000
        }else if (year == "all"){
            totalDuration = 10000
        }

        let thisDelay = totalDuration/filteredSnake.length
        console.log(thisDelay)

        filteredSnake.forEach((segment, index) => {
            const colourIndex = (segment.year - minYear) % colours.length;

            svg.append("line")
                .attr("x1", xScale(segment.x1))
                .attr("y1", yScale(segment.y1))
                .attr("x2", xScale(segment.x1))  // Start the line at x1 to animate
                .attr("y2", yScale(segment.y1))  // Start the line at y1 to animate
                .attr("stroke", colours[colourIndex])  // Line color
                .attr("stroke-width", 2)  // Line width
                .transition()  // Start the transition
                .duration(0.1)  // Duration of each segment drawing (Basically instant)
                .delay(index * thisDelay)  // Delay each segment by 100ms times its index
                .attr("x2", xScale(segment.x2))  // Draw to the final x2 position
                .attr("y2", yScale(segment.y2));  // Draw to the final y2 position
        });
    }else{
        filteredSnake.forEach(segment => {
            colourIndex = (segment.year - minYear) % colours.length
       
    
            svg.append("line")
                .attr("x1", xScale(segment.x1))
                .attr("y1", yScale(segment.y1))
                .attr("x2", xScale(segment.x2))
                .attr("y2", yScale(segment.y2))
                .attr("stroke", colours[colourIndex])  // Line color
                .attr("stroke-width", 2);  // Line width
        });
    }

    
   

    // Draw the pale green dot at the start of the snake
    if (filteredSnake.length > 0) {
        const firstSegment = filteredSnake[0];
        svg.append("circle")
            .attr("cx", xScale(firstSegment.x1))
            .attr("cy", yScale(firstSegment.y1))
            .attr("r", 5)  // Radius of the dot
            .attr("fill", "lightgreen");  // Pale green color
    }

    // Draw the pale red dot at the end of the snake
    const lastSegment = filteredSnake[filteredSnake.length - 1];
    svg.append("circle")
        .attr("cx", xScale(lastSegment.x2))
        .attr("cy", yScale(lastSegment.y2))
        .attr("r", 5)  // Radius of the dot
        .attr("fill", "lightcoral");  // Pale red color
}




function getPopularities(sid){
    song = song_lib[songplay_lib[sid].song_id]
    song_pop = song.personal_pop

    artist=artist_lib[song.artist_ids[0]]
    artist_pop = artist.personal_pop

    if (!song.title) {
        // If it's the null song, return 0 for both song and artist popularity
        return {
            song: 1,
            artist: 1
        };
    }

    return {
        song: song_pop,
        artist: artist_pop
    };
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

function calcDayMS(day){
    totalMS = 0

    day.forEach(sp => {
        totalMS += songplay_lib[sp].ms_played;
    });

    return totalMS
}

function showSpinner() {
    const spinner = document.getElementById("spinner-2");

    console.log(currentView)
    if(currentView == "day"){
        currentSvg = document.getElementById("svgDay");
    }else{
        currentSvg = document.getElementById("svgYear");
    }
    

    // Ensure the SVG is displayed and calculate its position
    if (currentSvg.style.display !== "none") {
        const rect = currentSvg.getBoundingClientRect();


        spinner.style.display = "block";
        const spinnerbb = spinner.getBoundingClientRect();

        console.log(rect)
        console.log(spinnerbb)

        // Position the spinner in the center of the SVG
        spinner.style.top = `${rect.top + window.scrollY + rect.height/2 - spinnerbb.height/2}px`;
        spinner.style.left = `${rect.left + window.scrollX + rect.width/2 - spinnerbb.width/2 }px`;

        // Display the spinner

    }
}
  
  function hideSpinner() {
    // document.getElementById("spinner").style.display = "none";
    document.getElementById("spinner-2").style.display = "none";
  }


async function main(){
    showSpinner()
    await loadFiles()

    thisDay = genDay(date)
    minYear = 2011
    maxYear = 2024
    populateYearDropdown(minYear,maxYear)

    genSnake(true,true)
    hideSpinner()

}

let timeoutId;

function redrawSVG() {
  // Your logic to redraw the SVG goes here
  if(currentView == "year"){
    let temp = yearAnimation 
    yearAnimation = false
    showSpinner()
    setTimeout(function () {
        drawYear(year);
        hideSpinner();
    }, 0); // Short delay to allow the spinner to render
    yearAnimation = temp
  }else{
    showSpinner()
    setTimeout(function () {
        drawDay(thisDay);
        hideSpinner();
    }, 0); // Short delay to allow the spinner to render
  }
  console.log('Redrawing SVG...');
}

function debounce(func, delay) {
  return function() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(func, delay);
  };
}

// Attach the resize event listener with debouncing
window.addEventListener('resize', debounce(redrawSVG, 200)); // Adjust the delay as needed



main()

