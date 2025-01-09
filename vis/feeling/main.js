import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.3.0';

const classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');

let typingTimeout
let lineSentiments = []
let allTextSentiment = { label: "PENDING", score: 0.00 };
let averageLineScore = 0.0


const button = document.getElementById('text-button');
const clearButton = document.getElementById('clear-button');
const textArea = document.getElementById('text-area');
const toggleButton = document.getElementById('toggle-verbose');
const sentDisplay = document.getElementById('sentiment-display');

toggleButton.addEventListener('click', () => {
    sentDisplay.classList.toggle('hidden');

});


const svg = d3.select('#visualisation')
  .attr('width', 800)
  .attr('height', 400);

const width = +svg.attr('width');
const height = +svg.attr('height');
const outerRadius = height/2 - 10;
const innerRadius = outerRadius - 20;
const arcWidth = outerRadius - innerRadius;

const subRings = svg.append('g')
    .attr("class","subrings")
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

const sentimentRing = svg.append('g')
    .attr("class","sentimentring")
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

const averageRing = svg.append('g')
    .attr("class","averagering")
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

const colourScale = d3.scaleOrdinal()
  .domain(["POSITIVE", "NEGATIVE", "PENDING"])
  .range(["#4caf50", "#f44336", "#aaa"]);

  function drawRing(level, sentiment) {

    const ringWidth = 5;
    const buffer = 1;

    const outer = innerRadius - arcWidth - arcWidth/2 - ((level + 1) * (ringWidth + buffer));
    const inner = outer - ringWidth;

    const label = sentiment.sentiment;
    const score = sentiment.score;

    const tooltip = document.getElementById('tooltip');
    let certainty = (score * 100).toFixed(1) + "%";
    let tooltipText = `
    <div>
        Classification for Line ${level}<br><br>
        Classification: <strong>${label}</strong><br>
        Certainty: <strong>${certainty}</strong>
    </div>
`;    

    let realScore = label === "POSITIVE" 
        ? ((score * 100) + 100) / 2 
        : (-(score * 100) + 100) / 2;
    const percentage = Math.min(Math.max(realScore, 0), 100) / 100;

    const positiveAngle = (2 * Math.PI) * percentage;
    const negativeAngle = (2 * Math.PI) * (1 - percentage);

    const arc = d3.arc()
        .innerRadius(inner)
        .outerRadius(outer);

    if (sentiment.text.length > 0) {
        // Select or create positive arc for this level
        const positiveArc = subRings.selectAll(`.positive-arc.level-${level}`)
            .data([percentage]);

        positiveArc.enter()
            .append('path')
            .attr('class', `positive-arc level-${level}`)
            .merge(positiveArc)
            .attr('d', arc.startAngle(-(positiveAngle / 2)).endAngle(positiveAngle / 2))
            .attr('fill', colourScale("POSITIVE"))
            .on('mousemove', function (event) {
                tooltip.innerHTML = tooltipText;
                tooltip.style.display = 'block';
                tooltip.style.left = (event.pageX + 10) + 'px';
                tooltip.style.top = (event.pageY + 10) + 'px';
            })
            .on('mouseout', () => {
                tooltip.style.display = 'none';
            });

        // Select or create negative arc for this level
        const negativeArc = subRings.selectAll(`.negative-arc.level-${level}`)
            .data([1 - percentage]);

        negativeArc.enter()
            .append('path')
            .attr('class', `negative-arc level-${level}`)
            .merge(negativeArc)
            .attr('d', arc.startAngle(Math.PI + negativeAngle / 2).endAngle(Math.PI - negativeAngle / 2))
            .attr('fill', colourScale("NEGATIVE"))
            .on('mousemove', function (event) {
                tooltip.innerHTML = tooltipText;
                tooltip.style.display = 'block';
                tooltip.style.left = (event.pageX + 10) + 'px';
                tooltip.style.top = (event.pageY + 10) + 'px';
            })
            .on('mouseout', () => {
                tooltip.style.display = 'none';
            });
    }
}

function updateSentimentRing(sentiment) {

    const tooltip = document.getElementById('tooltip');
    const { label, score } = sentiment;
    let certainty = (score * 100).toFixed(1) + "%";
    let tooltipText = `
    <div>
        Whole Text Classification<br><br>
        Classification: <strong>${label}</strong><br>
        Certainty: <strong>${certainty}</strong>
    </div>
`;    
    let realScore = label === "POSITIVE" 
        ? ((score * 100) + 100) / 2 
        : (-(score * 100) + 100) / 2;
        
    const percentage = Math.min(Math.max(realScore, 0), 100) / 100;
    const positiveAngle = (2 * Math.PI) * percentage;  // Portion of the circle for POSITIVE
    const negativeAngle = (2 * Math.PI) * (1 - percentage);  // Remaining portion for NEGATIVE

    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

        


    // Update or create the positive arc
    const positiveArc = sentimentRing.selectAll('.positive-arc')
        .data([percentage]);

    positiveArc
        .enter()
        .append('path')
        .attr('class', 'positive-arc')
        .merge(positiveArc)
        .attr('d', arc.startAngle(-(positiveAngle / 2)).endAngle(positiveAngle / 2))
        .attr('fill', colourScale("POSITIVE"))
        .on('mousemove', function (event) {
            tooltip.innerHTML = tooltipText;
            tooltip.style.display = 'block';
            tooltip.style.left = (event.pageX + 10) + 'px';
            tooltip.style.top = (event.pageY + 10) + 'px';
        })
        .on('mouseout', () => {
            tooltip.style.display = 'none';
        });

    // Update or create the negative arc
    const negativeArc = sentimentRing.selectAll('.negative-arc')
        .data([1 - percentage]);

    negativeArc
        .enter()
        .append('path')
        .attr('class', 'negative-arc')
        .merge(negativeArc)
        .attr('d', arc.startAngle(Math.PI + negativeAngle / 2).endAngle(Math.PI - negativeAngle / 2))
        .attr('fill', colourScale("NEGATIVE"))
        .on('mousemove', function (event) {
            tooltip.innerHTML = tooltipText;
            tooltip.style.display = 'block';
            tooltip.style.left = (event.pageX + 10) + 'px';
            tooltip.style.top = (event.pageY + 10) + 'px';
        })
        .on('mouseout', () => {
            tooltip.style.display = 'none';
        });
}

  updateSentimentRing({label: "POSITIVE", score: 0.0})

  function drawAverageRing(value) {

    const tooltip = document.getElementById('tooltip');

    let tooltipText = `The average sentiment of the lines you have entered is ${value.toFixed(2)} with -1 being fully NEGATIVE and 1 being fully POSITIVE`;
    

    let realScore = ((value * 100) + 100) / 2;
    const percentage = Math.min(Math.max(realScore, 0), 100) / 100;
    const positiveAngle = (2 * Math.PI) * percentage;  // Portion of the circle for POSITIVE
    const negativeAngle = (2 * Math.PI) * (1 - percentage);  // Remaining portion for NEGATIVE

    let outer = innerRadius - arcWidth;
    let inner = outer - arcWidth/2;

    const arc = d3.arc()
        .innerRadius(inner)
        .outerRadius(outer);

    // Update or create the positive arc
    const positiveArc = averageRing.selectAll('.positive-arc')
        .data([percentage]);  // Use data binding to manage the arc

    positiveArc
        .enter()
        .append('path')
        .attr('class', 'positive-arc')
        .merge(positiveArc)  // Merge enter and update selections
        .attr('d', arc.startAngle(-(positiveAngle / 2)).endAngle(positiveAngle / 2))
        .attr('fill', colourScale("POSITIVE"))
        .attr('opacity', 0.5)
        .on('mousemove', function (event) {
            tooltip.innerText = tooltipText;
            tooltip.style.display = 'block';
            tooltip.style.left = (event.pageX + 10) + 'px';
            tooltip.style.top = (event.pageY + 10) + 'px';
        })
        .on('mouseout', () => {
            tooltip.style.display = 'none';
        });

    // Update or create the negative arc
    const negativeArc = averageRing.selectAll('.negative-arc')
        .data([1 - percentage]);

    negativeArc
        .enter()
        .append('path')
        .attr('class', 'negative-arc')
        .merge(negativeArc)
        .attr('d', arc.startAngle(Math.PI + negativeAngle / 2).endAngle(Math.PI - negativeAngle / 2))
        .attr('fill', colourScale("NEGATIVE"))
        .attr('opacity', 0.5)
        .on('mousemove', function (event) {
            tooltip.innerText = tooltipText;
            tooltip.style.display = 'block';
            tooltip.style.left = (event.pageX + 10) + 'px';
            tooltip.style.top = (event.pageY + 10) + 'px';
        })
        .on('mouseout', () => {
            tooltip.style.display = 'none';
        });

        setBodyBackground(percentage)
}

  drawAverageRing(averageLineScore)

  function setBodyBackground(percentage) {
    const startColour = d3.rgb(205, 141, 122); // Greyish red
    const middleColour = d3.rgb(144,178,148); // Greyish green
    const endColour = d3.rgb(83, 208, 102); // Greyish green


    const backgroundColour = percentage < 0.5 
        ? d3.interpolateRgb(startColour, middleColour)(percentage * 2)
        : d3.interpolateRgb(middleColour, endColour)((percentage - 0.5) * 2);

    textArea.style.backgroundColor = backgroundColour;
}



// Handle button click to activate typing mode
button.addEventListener('click', (event) => {
    event.stopPropagation();  // Prevent triggering the document click handler
    if (!textArea.hasAttribute('readonly')) {
        textArea.focus();  // Keep focus on textarea if already enabled
    } else {
        activateTypingMode();  // Activate typing if not already active
    }
});

clearButton.addEventListener('click', (event) => {
    clearContent();
});

async function clearContent(){
    textArea.value = ""
    await updateLineSentiments()
    await analyseWholeText()
    subRings.selectAll("*").remove()
    sentimentRing.selectAll("*").remove()
    averageRing.selectAll("*").remove()

    updateDisplay()

}
// Handle typing
textArea.addEventListener('input', async (event) => {
    textArea.value = event.target.value;

    clearTimeout(typingTimeout); // Clear existing timeout on input

    if (event.inputType === 'insertText') {
        await updateLineSentiments();  // Wait for line sentiment to update
        updateDisplay();  // Update display immediately after sentiment is ready
    } else if (event.inputType === 'insertLineBreak') {
        await updateLineSentiments();  // Handle new lines similarly
        await analyseWholeText();      // Analyze the entire text
        updateDisplay();
    }

    // Set timeout for 1-second delay after typing stops
    typingTimeout = setTimeout(async () => {
        await updateLineSentiments();
        await analyseWholeText();
        updateDisplay();
    }, 300);


});

async function updateLineSentiments() {
    const lines = textArea.value.split('\n');

    let newLineSentimentPromises = lines.map(async (line, index) => {
        if(line.trim()===""){
            return { text: "", sentiment: null, score: null }; 
        }
        else if (index < lineSentiments.length && line === lineSentiments[index].text) {
            // Return existing sentiment if line is unchanged
            return lineSentiments[index];
        } else if (line.trim()) {
            // Perform sentiment analysis for new or changed lines
            const sentimentResult = await analyseSentiment(line);  // Wait for result
            return {
                text: line,
                sentiment: sentimentResult.label,
                score: sentimentResult.score
            };
        } 
    });

    // Wait for all sentiment promises to resolve
    lineSentiments = await Promise.all(newLineSentimentPromises.filter(Boolean));

    const sentimentScores = lineSentiments
    .filter(sentiment => sentiment.score !== null)
    .map(sentiment => {
        return sentiment.sentiment === 'NEGATIVE' 
            ? -sentiment.score 
            : sentiment.score;
    });

averageLineScore = sentimentScores.length > 0
    ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length
    : 0;

console.log('Average Line Score:', averageLineScore); 

}

async function analyseWholeText(){
    const allText = textArea.value.trim();
    allTextSentiment = await analyseSentiment(allText);

}

async function analyseSentiment(line) {
    // console.log("Analysing: \"" + line + "\"");
    if (line.length == 0){
        return {label: "PENDING", score: 0.0}
    }
    const output = await classifier(line);
    return { label: output[0].label, score: output[0].score };
}

// Handle click outside to reset button and textarea
document.addEventListener('click', () => {
    deactivateTypingMode();
});



function activateTypingMode() {
    button.classList.add("button-active");
    button.classList.remove("button-inactive");
    button.innerHTML = '&#9679;';  // Small circular dot
    textArea.removeAttribute('readonly');  
    textArea.focus();  
}

function deactivateTypingMode() {
    button.innerHTML = 'Click Here to Type'; 
    button.classList.remove("button-active");
    button.classList.add("button-inactive");
    textArea.setAttribute('readonly', true);  
}

function updateDisplay() {
    console.log("Updating display")
    const sentimentDisplay = document.getElementById('sentiment-display');
    sentimentDisplay.innerHTML = '';  // Clear the previous content

    // Display overall sentiment for the entire text
    const wholeTextSentiment = `Whole Text: ${allTextSentiment.label}, ${allTextSentiment.score.toFixed(3)}`;
    const wholeTextElement = document.createElement('div');
    wholeTextElement.textContent = wholeTextSentiment;
    sentimentDisplay.appendChild(wholeTextElement);

    let avLabel
    let avScore
    if(averageLineScore == 0){
        avLabel = "PENDING"
        avScore = averageLineScore*-1
    }
    else if(averageLineScore<0)    {
        avLabel = "NEGATIVE"
        avScore = averageLineScore*-1
    }else{
        avLabel = "POSITIVE"
        avScore = averageLineScore
    }
    const averageLineText = `Average Line Score: ${avLabel}, ${avScore.toFixed(3)}`;
    const avLineTextElement = document.createElement('div');
    avLineTextElement.textContent = averageLineText;
    sentimentDisplay.appendChild(avLineTextElement);

    // Display sentiment for each line
    lineSentiments.forEach((lineSentiment, index) => {
        if (lineSentiment.text.trim()) {  // Skip empty lines
            const lineText = `Line ${index + 1}: ${lineSentiment.sentiment}, ${lineSentiment.score.toFixed(3)}`;
            const lineElement = document.createElement('div');
            lineElement.textContent = lineText;
            sentimentDisplay.appendChild(lineElement);
        }
        drawRing(index+1, lineSentiment)
    });

    updateSentimentRing(allTextSentiment)
    drawAverageRing(averageLineScore)
}

