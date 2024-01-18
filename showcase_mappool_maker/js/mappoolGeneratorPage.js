var modAbbArray;
var modNumArray;
let beatmaps = [];
var downloadedMaps = false;

function mappoolGeneratorPageDisplay(modAbb, modNum) {
    modAbbArray = modAbb;
    modNumArray = modNum;

    let mappoolGeneratorPage = document.getElementById("mappoolGeneratorPage");
    mappoolGeneratorPage.innerHTML = "";
    let mappoolTemplateGeneratorPage = document.getElementById("mappoolTemplateGeneratorPage");

    // Show template to add the number, removing the one to add the mod.
    mappoolGeneratorPage.style.display = "block";
    mappoolTemplateGeneratorPage.style.display = "none";

    // Make a div for the buttons below
    let indivInputsDiv = document.createElement("div");
    indivInputsDiv.classList.add("mappoolGeneratorPageButtonDiv")

    mappoolGeneratorPage.append(indivInputsDiv);

    // Text Area to put answers into
    let textAreaDiv = document.createElement("div");
    let textAreaText = document.createElement("p");
    textAreaText.innerText = `Paste in the osu! id of the map in order (nm1, nm2, nm3) line by line. On the right, paste the pooler's comments for the map, separated by //.`
    let textAreaBox = document.createElement("textarea");
    textAreaBox.setAttribute("class","templateContentPosition");
    textAreaBox.setAttribute("id","textAreaBox");
    textAreaBox.style.marginBottom = "10px";
    textAreaDiv.append(textAreaText);
    textAreaDiv.append(textAreaBox);
    mappoolGeneratorPage.append(textAreaDiv);

    let apiKeyInput = document.createElement("input")
    apiKeyInput.setAttribute("id", "apiKeyInput")
    apiKeyInput.setAttribute("placeholder", "API Key")
    apiKeyInput.classList.add("templateContentPosition")
    textAreaDiv.append(apiKeyInput)

    // Previous Page Button
    let previousPageButton = generatePreviousPageButton("backToMappoolModGeneratorPage()");
    previousPageButton.style.marginRight = "10px";

    // Next Page Button 2
    let nextPageButton2 = generateNextPageButton("validateTextAreaMappoolGenerator()");
    nextPageButton2.style.marginLeft = "10px";

    // Make a div for the buttons below
    let bulkInputsDiv = document.createElement("div");
    bulkInputsDiv.classList.add("mappoolGeneratorPageButtonDiv")    

    bulkInputsDiv.append(previousPageButton);
    bulkInputsDiv.append(nextPageButton2);
    mappoolGeneratorPage.append(bulkInputsDiv);
}

function generatePreviousPageButton(onclickString) {
    let previousPageButton = document.createElement("button");   
    previousPageButton.setAttribute("class","templateGeneratorButtons nextPageButton")
    previousPageButton.setAttribute("onclick",onclickString);
    previousPageButton.innerText = "Previous Page";   
    return previousPageButton;
}

function generateNextPageButton(onclickString) {
    let nextPageButton = document.createElement("button");
    nextPageButton.setAttribute("class","templateGeneratorButtons nextPageButton")
    nextPageButton.setAttribute("onclick",onclickString);
    nextPageButton.innerText = "Next Page";
    return nextPageButton;
}

function backToMappoolModGeneratorPage() {
    let mappoolGeneratorPage = document.getElementById("mappoolGeneratorPage");
    let mappoolTemplateGeneratorPage = document.getElementById("mappoolTemplateGeneratorPage");

    mappoolTemplateGeneratorPage.style.display = "block";
    mappoolGeneratorPage.style.display = "none";
}

function backToMappoolGeneratorPage() {
    let mappoolGeneratorPage = document.getElementById("mappoolGeneratorPage");
    let mappoolDownloadPage = document.getElementById("mappoolDownloadPage");

    mappoolGeneratorPage.style.display = "block";
    mappoolDownloadPage.style.display = "none";

    document.getElementById("mappoolDownloadPageLinks").parentNode.removeChild(document.getElementById("mappoolDownloadPageLinks"));
    document.getElementById("mappoolDownloadPagePreviousPageButton").parentNode.removeChild(document.getElementById("mappoolDownloadPagePreviousPageButton"))
    downloadedMaps = false; 
    beatmaps = [];
}

function validateTextAreaMappoolGenerator() {
    let textAreaBox = document.getElementById("textAreaBox");

    // error handling
    if (textAreaBox.value.trim() == "") return alert("You have not placed anything inside the text area! If you are using the individual input form, plase click the button above.")
    
    let textAreaBoxSplit = textAreaBox.value.split("\n");
    let notANum = 0;
    let notReplay = 0;
    let arrayOfModIDs = new Array();
    let arrayOfMapIDs = new Array();
    let arrayOfReplays = new Array();

    // Mod Array
    for (var i = 0; i < modAbbArray.length; i++) {
        for (var j = 0; j < modNumArray[i].value; j++) {
            arrayOfModIDs.push(`${modAbbArray[i].value}${j + 1}`)
        }
    }

    // Map Array and Comment Array
    for (var i = 0; i < textAreaBoxSplit.length; i++) {
        if (textAreaBoxSplit[i].trim() == "") { continue; } 
        let IDAndReplaySplit = textAreaBoxSplit[i].split("//");
        if (isNaN(parseInt(IDAndReplaySplit[0].trim()))) { notANum++; }
        else if (IDAndReplaySplit[1] == undefined || IDAndReplaySplit[1].trim() == "") { notReplay++ } 
        else {
            arrayOfMapIDs.push(parseInt(IDAndReplaySplit[0].trim()));
            arrayOfReplays.push(IDAndReplaySplit[1].trim())
        }
    }

    if (notANum != 0) return alert(`There are ${notANum} value(s) that are not a number.`)
    if (notReplay != 0) return alert(`There are ${notReplay} missing replayer names`)

    turnIntoJSONAndDownload(arrayOfMapIDs, arrayOfReplays, arrayOfModIDs)
}

function turnIntoJSONAndDownload(mapIDArray, mapReplayArray, modIDArray) {
    let apiKey = document.getElementById("apiKeyInput").value;

    for (var i = 0; i < mapIDArray.length; i++) requestMapData(mapIDArray[i], apiKey, modIDArray[i], mapReplayArray[i])

    const mappoolDL = "data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(beatmaps));
    let mappoolAnchorElem = document.createElement("a");
    mappoolAnchorElem.setAttribute("id", "downloadMappool");
    mappoolAnchorElem.setAttribute("href", mappoolDL);
    mappoolAnchorElem.setAttribute("download", "showcaseBeatmaps.json");

    let mappoolDownloadPage = document.getElementById("mappoolDownloadPage");
    let mappoolGeneratorPage = document.getElementById("mappoolGeneratorPage");

    // Previous Page Button
    let previousPageButton = generatePreviousPageButton("backToMappoolGeneratorPage()");  
    previousPageButton.classList.add("templateContentPosition");
    previousPageButton.setAttribute("id","mappoolDownloadPagePreviousPageButton");

    // make a new paragraph to append everything into
    let mappoolDownloadPageLinks = document.createElement("p");
    mappoolDownloadPageLinks.setAttribute("id","mappoolDownloadPageLinks")
    mappoolDownloadPageLinks.style.marginBottom = "0";

    let mappoolDownloadPageLinksBr = document.createElement("br");
    mappoolDownloadPageLinks.append(mappoolAnchorElem);
    mappoolDownloadPageLinks.append(mappoolDownloadPageLinksBr);

    mappoolGeneratorPage.style.display = "none";
    mappoolDownloadPage.style.display = "block";

    mappoolAnchorElem.innerText = "Download Mappool";
    mappoolAnchorElem.click();

    mappoolDownloadPage.append(previousPageButton);
    mappoolDownloadPage.append(mappoolDownloadPageLinks);
}

function requestMapData(mapid, api, modid, replay) {

    let request = new XMLHttpRequest();
    let mapMod = modid.toLowerCase();
    let modNum
    let singleMap = {}

    if (mapMod.includes("hr")) modNum = 16
    else if (mapMod.includes("dt")) modNum = 64
    else if (mapMod.includes("ez")) modNum = 2
    else modNum = 0

    request.open("GET",`https://osu.ppy.sh/api/get_beatmaps?k=${api}&b=${mapid}&mods=${modNum}`,false)
    request.onload = function() {
        let mapData = JSON.parse(this.response)
        if (request.status == 200) {
            singleMap = {};
            mapData.forEach(map => {
                singleMap.songName = map.title
                singleMap.difficulty = map.version
                singleMap.artist = map.artist
                singleMap.mapper = map.creator
                singleMap.modid = modid
                singleMap.replayer = replay
                singleMap.sr = map.difficultyrating
                singleMap.cs = map.diff_size
                singleMap.ar = map.diff_approach
                singleMap.od = map.diff_overall
                singleMap.bpm = map.bpm
                singleMap.len = map.total_length
                if (mapMod.includes("dt")) {
                    singleMap.bpm = map.bpm * 1.5
                    if (map.diff_approach <= 5) {singleMap.ar = (1800-((1800 - map.diff_approach)*2/3))/120;}
                    else {singleMap.ar = ((1200-((1200-(map.diff_approach-5)*150)*2/3))/150)+5;}
                    if (map.diff_overall <= 5) {singleMap.od = (1800-((1800 - map.diff_overall)*2/3))/120;}
                    else {singleMap.od = ((1200-((1200-(map.diff_overall-5)*150)*2/3))/150)+5;}
                    singleMap.len = Math.round(map.total_length / 3 * 2)
                } else if (mapMod.includes("hr")) {
                    singleMap.cs = map.diff_size * 1.3;
                    singleMap.ar = map.diff_approach * 1.4; 
                    if (singleMap.ar > 10) {singleMap.ar = 10;}
                    singleMap.od = map.diff_overall * 1.4;
                    if (singleMap.od > 10) {singleMap.od = 10;}
                }
                beatmaps.push(singleMap)
            })
        }
    }
    request.send()
}