const Misc = (msg) => {
    //Load, Unload, Attach
    let Tag = msg.content.split(";");
    let id = msg.selected[0]._id;
    let action = Tag[1];
    let id2 = Tag[2];
    let unit = Units[id];
    let mpMax = parseInt(unit.token.get("bar3_max")) || 0;
    let mp = parseInt(unit.token.get("bar3_value")) || 0;
    let unit2 = Units[id2];
    let unit2MPMax = parseInt(unit2.token.get("bar3_max")) || 0;
    let unit2MP = parseInt(unit2.token.get("bar3_value")) || 0;
    let distance = unit.Distance(unit2);
    if (HexMap[unit.hexLabel].offboard && HexMap[unit2.hexLabel].offboard) {
        distance = 0;
    }    
    let errorMsg = [];

    if (action === "Unload") {
        if (unit2.id !== activeUnitID) {
            errorMsg.push("Not Active Unit");
        }
        if (!unit2) {errorMsg.push(
            "No Passenger"
        );
        if (unit.type === "Helicopter" && unit.HeloStatus() !== "Landed") {
            errorMsg.push("Can only Unload when Landed");
        }
        if (mpMax > 0 && mp > Math.floor(mpMax/2)) {
            errorMsg.push("Transport has moved too far to Load this turn");
        }
        if (unit.unloaded === true) {
            errorMsg.push("Already Loaded or Unloaded this Activation");
        }
    }
    if (action === "Load") {
        if (unit.token.get(SM.passenger)) {
            errorMsg.push("Already has a Passenger");
        }
        if (unit.formationID !== unit2.formationID) {
            errorMsg.push("Must be in same Formation");
        }
        if (unit.type === "Helicopter" && unit.HeloStatus() !== "Landed") {
            errorMsg.push("Can only Load when Landed");
        }
        if (unit.unloaded === true) {
            errorMsg.push("Already Loaded or Unloaded this Activation");
        }
        if (unit2MPMax > 0 && (unit2MPMax - unit2MP) > 1) {
            errorMsg.push("Passenger has moved too far to be Loaded");
        }
        if (mpMax > 0 && mp < Math.floor(mpMax/2)) {
            errorMsg.push("Transport has moved too far to Load this turn");
        }
        if (mp > 0 && unit2MP > 0 && unit2.type === "Towed") {
            errorMsg.push("Towed Weapons and Transports have to start in same Hex to Load");
        }
        if (unit.Disrupted()) {
            errorMsg.push("Disrupted Transports may not Load");
        }
        if (unit2.Disrupted()) {
            errorMsg.push("Disrupted Passengers may not Load");
        }
        if (distance > 0) {
            errorMsg.push("Must be in same Hex");
        }
    }
    if (action === "Attach") {
        if (unit2.formationID !== unit.formationID && unit2.type !== "Leader") {
            errorMsg.push("Must be in same Formation");
        }
        


    }






    switch(action) {





    }








}