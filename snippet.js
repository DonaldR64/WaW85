const Activate = (msg) => {
    let Tag = msg.content.split(";");
    let id = msg.selected[0]._id;
    let action = Tag[1];
    let mode = Tag[2] || "NA" //helicopter mode, blank for others
    let unit = Units[id];
    let errorMsg = [];

    let lastUnit = Units[state.WaW85.activeUnitID];
    if (lastUnit && lastUnit.token) {
        lastUnit.SetReady(false);
    } 




    if (unit.Active() === false) {
        if (unit.OOC()) {
            errorMsg.push("Unit is Out of Command");
        } else if (unit.formationID !== state.WaW85.activeFormationID) {
            errorMsg.push("Unit is not part of the Active Formation");
        } else {
            errorMsg.push("Unit has Activated");
        }
    }
    if (unit.Disrupted() && action === "Indirect Fire") {
        errorMsg.push("Disrupted Units may not Fire");
    }


    state.WaW85.activeUnitID = unit.id;
    SetupCard(unit.name,action,unit.nation);
    if (errorMsg.length > 0) {
        _.each(errorMsg,msg => {
            outputCard.body.push(msg);
        })
        PrintCard();
        return;
    }

    if (action === "Move/Direct Fire") {
        //move, move & fire, fire only or move to assault
        //calculate max MP based on weather, mud
        //display how far can move and still fire based on abilities
        //if transport note re load/unload
        if (unit.Disrupted()) {
            let inLOS = false;
            let keys = Object.keys(Units);
            for (let i=0;i<keys.length;i++) {
                let unit2 = Units[keys[i]];
                if (unit2.nation !== unit.nation) {
                    let los = LOS(unit,unit2);
                    if (los.los === true) {
                        inLOS = true;
                        break;
                    }
                }
            }
            if (inLOS === true) {
                outputCard.body.push("The Unit may not move closer to an enemy unit in LOS");
            } else {
                outputCard.body.push("The Unit must stop when entering a hex in LOS of an enemy and cannot end adjacent to an enemy unit");
            }
            outputCard.body.push("Disrupted Units may not Fire");
        }
        let mp = unit.movement;
        if (EventInfo === "Cautious Approach") {
            mp = Math.ceil(mp/2);
        }
        if (state.WaW85.weatherLevel === 4) {
            mp = Math.ceil(mp/2);
        }
        if (state.WaW85.mud && unit.movementType.includes("Ground")) {
            mp = Math.max(1,mp - 1);
        }
        if (unit.type === "HQ" || unit.type === "Leader" || unit.type === "Support") {
            mp = 100;
        }
        if (unit.type === "Helicopter") {
            let oldMode = unit.HeloStatus();
            if (oldMode !== mode) {
                outputCard.body.push("Changing Flying Mode allows Opp Fire");
            }
            unit.SetHeloStatus(mode);
            if (mode === "Flying") {mp = 1000};
            if (mode === "NOE") {mp = 12};
            if (mode === "Landed" || mode === "Hovering") {
                mp = 0;
            }
        }
        if (EventInfo === "High Rate of Fire") {
            mp = 0;
        }




        unit.token.set("bar3_value",mp);
        unit.token.set("bar3_max",mp);
        if (mp === 1000) {
            outputCard.body.push("The Unit may move anywhere on the Map");
        } else if (mp === 100) {
            outputCard.body.push("The Unit must move with its Parent Unit");
        } else if (mp > 0) {
            outputCard.body.push("The Unit has " + mp + " MP");
        } else if (mp === 0) {
            outputCard.body.push("The Unit is Stationary");
        }
    } else if (action === "Indirect Fire") {
        //create a token on top of unit, then move it, can check LOS/Range which will search for spotter - so modify FFE
        unit.token.set("bar3_value",0);
        unit.token.set("bar3_max",0);



    }










}




///Change Mode for Helos
//Load or Unload Passengers


