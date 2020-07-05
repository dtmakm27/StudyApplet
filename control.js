let studystack, todoStack, moduleArray, hours, maxHours, finishedstack;
const moduleKeys = ["id", "Name", "Hours", "StartDate", "EndDate", "Notes", "CurrentlyStudying", "Finished", "HoursPerWeek"]
const moduleDefaults = { "id": "", "Name": "", "Hours": "10", "StartDate": "N/A", "EndDate": "N/A", "Notes": "", "CurrentlyStudying": "False", "Finished": "False", "HoursPerWeek": "5" }
maxHours = 10;
moduleArray = [];


function onLoad() {
    loadStatic();
    loadDynamic();
}

function loadDynamic() {
    d3.csv("modules.csv", loadModule);
}


function addModuleForm(modl) {

    let form = modl.append("form").attr("id", "form");
    //content
    moduleKeys.forEach(k => {
        if (k == "id") return;
        form.append("label").attr("for", k).text(k)
        form.append("input").attr("type", "text").attr("name", k)
            .attr("value", moduleDefaults[k]);
        console.log(moduleDefaults[k]);
        // .attr("required","true");

    });


    form.append("input").attr("type", "submit");

    //action
    $("#form").submit(function (e) {
        e.preventDefault(); // avoid to execute the actual submit of the form.

        var form = $(this);
        // var url = form.attr('action');

        let newModule = {};
        $("form#form :input").each(function () {
            var input = $(this);
            newModule[input[0].name] = input[0].value;
        });
        newModule["id"] = generateUID();
        console.log(newModule);

        let r = confirm("are you sure you want to add " + newModule.Name);
        if (r == true) {
            alert("submitted");
            if (!d3.select("#myModal").empty())
                d3.select("#myModal").remove();
            loadModule(newModule);
        }

    });

}

function modifyModule(id) {
    let module = moduleArray.filter((mod) =>
        mod.id == id
    )[0];


    //process module change
    let fill = (modl) => {

        let form = modl.append("form").attr("id", "form");
        //content
        moduleKeys.forEach(k => {
            if (k == "id") return;
            form.append("label").attr("for", k).text(k)
            form.append("input").attr("type", "text").attr("name", k)
                // .attr("required","true")
                .attr("value", module[k]);
        });


        form.append("input").attr("type", "submit");

        //action
        $("#form").submit(function (e) {
            e.preventDefault(); // avoid to execute the actual submit of the form.

            var form = $(this);
            // var url = form.attr('action');

            let newModule = {};
            $("form#form :input").each(function () {
                var input = $(this);
                newModule[input[0].name] = input[0].value;
            });
            console.log(newModule);
            newModule["id"] = module.id;

            let r = confirm("are you sure you want to change " + newModule.Name);
            if (r == true) {
                removeModule(id);
                module = newModule;
                loadModule(module);
                alert("submitted");
                if (!d3.select("#myModal").empty())
                    d3.select("#myModal").remove();
            }

        });
    }

    createModal(fill);

}

function moduleInfoModal(id) {
    let module = moduleArray.filter((mod) =>
        mod.id == id
    )[0];
    let fill = function (modl) {
        modl.append("h3").text(module.Name);
        let info = modl.append("div").attr("class", "moduleInfo");
        moduleKeys.forEach(k => {
            info.append("p").attr("name", k)
                // .attr("required","true")
                .text(k + ": " + module[k]);
        });
    }
    createModal(fill);
}



function loadStatic() {

    let genStacks = function () {

        let wrapper1 = d3.select("body").append("div").attr("id", "wr1").
            style("width", "100%").style("display", "table");
        let wrapper2 = wrapper1.append("div").
            style("display", "table-row");


        todoStack = wrapper2.append("div").attr("id", "todoStack")
            .style("width", "300px").style("display", "table-cell");
        todoStack.append("h2").text("To Do:");



        todoStack.append("button").text("Add New Module").on("click",
            () => {
                createModal(addModuleForm);
            });


        studystack = wrapper2.append("div").attr("id", "studyStack")
            .style("display", "table-cell");
        studystack.append("h2").text("Study Stack:");
        hours = studystack.append("h3").attr("id", "hours").text("0/0 hours");


        finishedstack = wrapper2.append("div").attr("id", "finished")
            .style("display", "table-cell");
        finishedstack.append("h2").text("Finished:");
    };

    d3.select("body").append("h1").text("Study Stuff");
    d3.select("body").append("button").text("save")
        .on("click", saveCurrentData);
    d3.select("body").append("button").text("refresh")
        .on("click", function () {
            location.reload()
        });
    genStacks();


}

//takes in callback function to fillin modal
function createModal(fill) {

    if (!d3.select("#myModal").empty())
        d3.select("#myModal").remove();
    let myModal = d3.select("body").append("div").attr("id", "myModal")
        .attr("class", "modal").append("div").attr("class", "modal-content");

    var modal = document.getElementById("myModal");
    window.onclick = function (event) {
        if (event.target == modal) {
            d3.select("#myModal").style("display", "none");
        }
    }

    fill(myModal);
    d3.select("#myModal").style("display", "block");

}



function loadModule(module) {
    moduleArray.push(module);
    updateHours();

    if (module.Finished != "True") {
        stack = module.CurrentlyStudying == "True" ? studystack : todoStack;
        let modBox = stack.
            append("div").attr("class", "moduleBox")
            .attr("id", "mod" + module.id);
        modBox.append("p").text(module.Name)
            .on("click", () => moduleInfoModal(module.id));

        modBox.append("button").text("delete")
            .on("click", () => {
                if (confirm("are you sure you want to remove " + module.Name))
                    removeModule(module.id)
            });

        modBox.append("button").text("finish").on("click",
            () => {
                if (confirm("are you sure you want to finish " + module.Name))
                    finishModule(module.id)
            })
        modBox.append("button").text("modify").on("click",
            () => modifyModule(module.id));
        modBox.append("button").text("move stacks")
            .on("click", () => moveStacks(module.id));
    } else {

        stack = finishedstack;
        let modBox = stack.
            append("div").attr("class", "moduleBox")
            .attr("id", "mod" + module.id);
        modBox.append("p").text(module.Name)
            .on("click", () => moduleInfoModal(module.id));
        modBox.append("button").text("delete")
            .on("click", () => {
                if (confirm("are you sure you want to remove " + module.Name))
                    removeModule(module.id)
            });
        modBox.append("button").text("modify").on("click",
            () => modifyModule(module.id));
    }
}

function removeModule(id) {
    moduleArray = moduleArray.filter((mod) =>
        mod.id != id
    );
    updateHours();

    d3.select("#mod" + id).remove();
}

function moveStacks(id) {
    let module = moduleArray.filter((mod) =>
        mod.id == id
    )[0];
    removeModule(id);

    let rev =
        module.CurrentlyStudying == "True" ? "False" : "True";

    module.CurrentlyStudying = rev;
    loadModule(module);

}

function finishModule(id) {
    let module = moduleArray.filter((mod) =>
        mod.id == id
    )[0];
    removeModule(id);
    module.Finished = "True";
    loadModule(module);
}

function saveCurrentData(data) {
    if (confirm("do you want to overwrite current data?")) {
        const reducer = (accumulator, module) => {
            let nval = '';
            moduleKeys.forEach(k => {
                nval += module[k] + ",";
            });
            if (nval.length > 0) {
                nval = nval.substring(0, nval.length - 1);
                nval = nval + "\n";
            }
            return accumulator + nval;
        };

        let modulesStr = moduleArray.reduce(reducer, "");

        $.ajax({
            type: "POST",
            url: 'write.php',
            dataType: 'json',
            data: { modules: modulesStr },
            success: function (obj, textstatus) {
                if (!('error' in obj)) {
                    alert('error!');
                }
                else {
                    alert("Saved!")
                }
            }
        });
    }
}

function updateHours() {
    let hr = 0;
    moduleArray.forEach(module => {
        if (module.CurrentlyStudying == "True") {
            hr += parseInt(module.HoursPerWeek);
        }
    });
    hours.text(hr + "/" + maxHours + " hours")
}



function generateUID() {
    // I generate the UID from two parts here 
    // to ensure the random number provide enough bits.
    let firstPart, secondPart = undefined;
    let doesntExist = function (e) {
        return moduleArray.every(
            (mod) => mod.id.toString() != e.toString()
        );
    };

    while ((firstPart == undefined || secondPart == undefined)
        && doesntExist(firstPart + secondPart)) {
        firstPart = (Math.random() * 46656) | 0;
        secondPart = (Math.random() * 46656) | 0;
        firstPart = ("000" + firstPart.toString(36)).slice(-3);
        secondPart = ("000" + secondPart.toString(36)).slice(-3);
    }

    return firstPart + secondPart;
}

