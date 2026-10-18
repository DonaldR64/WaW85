const FFE = (msg) => {
    //!FFE;spotterID;targetID;artilleryID - onboard or offboard

    let Tag = msg.content.split(";");
    let spotter = Units[Tag[1]];
    let target = Units[Tag[2]];
    let artillery = Units[Tag[3]] //onboard or offboard
//? Minelets etc
//note for onboard, only have options of ready and in range (min/max) artillery units

    SetupCard(artillery.name,"FFE",spotter.nation);
    let losResult = LOS(spotter,target);
    let errorMsg = [];
    if (losResult.los === false) {
        errorMsg.push("Spotter cannot see Target Point");  
    }
    if (spotter.Active() === false) {
        errorMsg.push("Spotter is OPS Complete");
    }
    if (target.special.includes("Offboard") && spotter.type !== "HQ" && spotter.special.includes("Recon") === false) {
        errorMsg.push("Only HQ and Recon Units can call Offboard Artillery");
    }
    if (errorMsg.length > 0) {
        _.each(errorMsg,msg => {
            outputCard.body.push(msg);
        });
        PrintCard();
        return;
    }

    //spot check
    if (spotter.type !== "HQ" && sptter.special.includes("Recon") === false) {
        let bonus = spotter.Leader().command;
        let morale = state.WaW85.formationInfo[spotter.formationID].morale;
        let moraleRoll = randomInteger(6) + randomInteger(6) - bonus;
        let tip = "Roll: " + moraleRoll + " vs. " + moraleRoll;
        if (bonus !== 0) {
            tip += "<br>Leader Bonus: " + bonus;
        }
        if (moraleRoll <= morale) {
            result = "Passed";
        } else {
            result = "Failed";
        }
        tip = '[' + result + '](#" class="showtip" title="' + tip + ')';
        outputCard.body.push("Spotter Check: " + tip);
        if (moraleRoll > morale) {
            artillery.SetReady(false);
            outputCard.body.push(artillery.name + " is marked OPS Complete");
            PrintCard();
            return;
        } 
    }

    //scatter
    let scatterRoll1 = randomInteger(6);
    let scatterRoll2 = randomInteger(6);

    let fubarRoll = randomInteger(2);
    if (scatterRoll1 < 6) {
        outputCard.body.push("FFE is On Target");
    } else {
        if (scatterRoll2 === 6) {
            if (artillery.special.includes("Offboard")) {
                outputCard.body.push("The Offboard Artillery was retasked by Division HQ and is no longer available");
                artillery.token.remove();
                delete Units[artillery.id];
            } else {
                if (fubarRoll === 1) {
                    outputCard.body.push("The Fire is so Offtarget it is cancelled");
                } else {
                    outputCard.body.push("Communications issues causes the Mission to be cancelled");
                }
                artillery.SetReady(false);
                outputCard.body.push(artillery.name + " is marked OPS Complete");
            }
            PrintCard();
            return;
        } else {
            Scatter(target);
            if (scatterRoll2 > 4) {
                Scatter(target);
            }
            outputCard.body.push("FFE Scatters");
        }
    } 
    outputCard.body.push("[hr]");

    //Resolve FFE



//Sound, FX
    //remove or mark OPS Complete
    if (artillery.special.includes("Offboard")) {
        artillery.token.remove();
        delete Units[artillery.id];
    } else {
        artillery.SetReady(false);
    }
    PrintCard();
}

const Scatter = (target) => {
    let directionRoll = randomInteger(6) - 1;
    let direction = DIRECTIONS[directionRoll];
    let startHex = HexMap[target.hexLabel];
    let neighbourCube = HexMap[target.hexLabel].cube.neighbour(direction);
    let newLabel = neighbourCube.label();
    let newHex = HexMap[newLabel];
    target.token.set({
        left: newHex.centre.x,
        top: newHex.centre.y,
    })
    target.hexLabel = newLabel;
    let index = startHex.tokenIDs.indexOf(target.id);
    if (index > -1) {
        startHex.tokenIDs.splice(target.id);
    }
    newHex.tokenIDs.push(target.id);
}





