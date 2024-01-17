function getAPIKey() {
    return "0501452af051a7c75928ab9775d5381bd4745a08";
}

function createNewMappool() {
    document.getElementById("mappoolTemplateGeneratorPage").style.display = "block";
    document.getElementById("bgAni").style.display = "none";
    document.getElementById("navBar").style.left = 0;
    document.getElementById("navBar").style.height = "100%";
    document.getElementById("sceneViewPage").style.display = "none";
}
function toSceneView() {
    document.getElementById("mappoolTemplateGeneratorPage").style.display = "none";
    document.getElementById("bgAni").style.display = "block";
    document.getElementById("navBar").style.left = "1920px";
    document.getElementById("navBar").style.height = "1080px";
    document.getElementById("sceneViewPage").style.display = "block";
}