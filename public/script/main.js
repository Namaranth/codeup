let target = document.querySelector("#dynamic");
function randomString() {
    let stringArr = ["printf('Hello World');"];

    let selectString = stringArr[0];

    let selectStringArr = selectString.split("");

    return selectStringArr;
}

function dynamic(randomArr) {
    
    if(randomArr.length > 0) {
        target.textContent += randomArr.shift();
        
        setTimeout(function() {
            dynamic(randomArr);
        }, 150);
    }
}

dynamic(randomString());

function resetTyping() {
    target.textContent = "";

    dynamic(randomString());
}