const addMappoolModTemplateButton = document.getElementById("addMappoolModTemplate");
addMappoolModTemplateButton.onclick = addNewMappoolModTemplate;

function addNewMappoolModTemplate(mod) {
    // make mappool mod abbreviation
    let mappoolModAbbreivationCreate = document.createElement("input");
    mappoolModAbbreivationCreate.setAttribute("type","text");
    mappoolModAbbreivationCreate.setAttribute("class","mappoolModAbbreviation");
    mappoolModAbbreivationCreate.setAttribute("placeholder","Abbreviation");

    // make mappool mod number
    let mappoolModNumberCreate = document.createElement("input");
    mappoolModNumberCreate.setAttribute("type","number");
    mappoolModNumberCreate.setAttribute("class","mappoolModNumber");
    mappoolModNumberCreate.setAttribute("placeholder","Number of Maps");
    // make delete button
    let mappoolModDeleteModCreate = document.createElement("button");
    mappoolModDeleteModCreate.setAttribute("onclick","this.parentNode.parentNode.removeChild(this.parentNode);")
    mappoolModDeleteModCreate.classList.add("mappoolRemoveMod")
    mappoolModDeleteModCreate.classList.add("templateGeneratorButtons")
    mappoolModDeleteModCreate.innerText = "Remove Mod"
    // make surrouding container
    let mappoolModTemplateGeneratorCreate = document.createElement("div")
    mappoolModTemplateGeneratorCreate.setAttribute("class","mappoolModTemplateGenerator");

    // Add values for mods
    mappoolModAbbreivationCreate.setAttribute("value", mod);

    // bind everything together
    mappoolModTemplateGeneratorCreate.appendChild(mappoolModAbbreivationCreate);
    mappoolModTemplateGeneratorCreate.appendChild(mappoolModNumberCreate);
    mappoolModTemplateGeneratorCreate.appendChild(mappoolModDeleteModCreate);
    
    // insert before the button.
    addMappoolModTemplate.parentNode.parentNode.insertBefore(mappoolModTemplateGeneratorCreate,addMappoolModTemplate.parentNode);
}

const removeMappoolModTemplateButton = document.getElementById("removeMappoolModTemplate");
removeMappoolModTemplateButton.onclick = removeLastMappoolModTemplate;

function removeLastMappoolModTemplate() {
    let mappoolModTemplateGenerator = document.getElementsByClassName("mappoolModTemplateGenerator");
    if (mappoolModTemplateGenerator.length > 0) mappoolModTemplateGenerator[mappoolModTemplateGenerator.length - 1].remove()
}

const removeAllMappoolModTemplateButton = document.getElementById("removeAllMappoolModTemplate");
removeAllMappoolModTemplateButton.onclick = removeAllMappoolModTemplate;
function removeAllMappoolModTemplate() {
    let mappoolModTemplateGenerator = document.getElementsByClassName("mappoolModTemplateGenerator");
    if (mappoolModTemplateGenerator.length > 0) {
        for (var i = 0; mappoolModTemplateGenerator.length; i++) mappoolModTemplateGenerator[0].remove()
    } 
}

function validateMappolModGenerator() {
    let mappoolModTemplateGenerator = document.getElementsByClassName("mappoolModTemplateGenerator");
    let errMsg = "";

    if (mappoolModTemplateGenerator.length > 0) {

        var mappoolModAbbreviation = document.getElementsByClassName("mappoolModAbbreviation");
        var mappoolModNumber = document.getElementsByClassName("mappoolModNumber");
        for (var i = 0; i < mappoolModTemplateGenerator.length; i++) {
            // check mod abbreviation for blank, and then more than 5 characters
            let modAbb = mappoolModAbbreviation[i].value.trim();
            if (modAbb == "") errMsg += `Entry ${i + 1} has no abbreviation\n`
            else if (modAbb.split(" ").length > 1) errMsg += `Entry ${i + 1}'s abbreivation has a space in it. Please remove the space.\n`
            else if (modAbb.length > 10) errMsg += `Entry ${i + 1}'s abbreivation is too long\n`

            // check number of maps. 
            let modNum = mappoolModNumber[i].value;
            if (modNum == "") errMsg += `Entry ${i + 1} has no number of maps!\n`
            else if (modNum <= 0) errMsg += `You cannot have 0 or less number of maps! (Entry ${i + 1})\n`
            else if (modNum > 15) errMsg += `Woah... that is a lot of maps on entry ${i + 1}...\n`
        }
    } else {
        errMsg += "Please add some mods!";
    }

    if (errMsg != "") {
        alert(errMsg);
    } else {
        document.getElementById("mappoolTemplateGeneratorPage").style.display = "none";
        mappoolGeneratorPageDisplay(mappoolModAbbreviation, mappoolModNumber)
    }
}   