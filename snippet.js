const MoveHex = (unit,startHex,endHex) => {
    RemoveMoveMarkers();
    let distance = startHex.Distance(endHex);
    let totalMove = unit.movement;
    let remainingMove = parseInt(unit.token.get("bar3_value"));
    let moveType = unit.MoveType();
    //skip movementmarkers and such if turn is 0 or if unit is aircraft or moving it offboard
//need to sort later how to bring on units, deploy transported units etc - maybe macros that place a marker or something?
//maybe transported units remain ? or move off/on with macro? ??

    if ((state.WaW85.turn > 0 && unit.type !== "Aircraft") && endHex.offboard !== true) {
        if (distance > 1 && remainingMove === 0) {
            endHex = startHex;
        } else {
            let cost = endHex.movementCosts[moveType] || 100;
            let dir = startHex.cube.whatDirection(endHex.cube);
            let edge = startHex.edges[dir];

            if (startHex.roadIDs.some(item => endHex.roadIDs.includes(item))) {
log("On the Road")
                cost = 1;
            }
            //rubble here, should override the road cost of 1 above
            if (endHex.rubble.length > 0) {
                if (moveType === "Troops") {stepHexCost = 2};
                if (moveType === "Vehicle" || moveType === "Helo NOE") {stepHexCost = 3};            
            }
            if (endHex.smoke.length > 0) {
                cost = Math.max(cost + 1, totalMove);
            }
            if (endHex.terrain.includes("Hill") && startHex.terrain.includes("Hill") === false) {
                cost++;
            }
            //Rivers then Water
            if (edge === "River") {
log("River")
                if (unit.special.includes("Amphibious")) {
                    cost = totalMove;
                } else {
                    cost = 100;
                }
            }
            if (endHex.terrain.includes("Water") && unit.special.includes("Amphibious")) {
log("Water / Amphibious")
                cost = totalMove;
            } 
            //fire hexes
            if (endHex.fire.length > 0) {
                cost = 100;
            }

            //Stacking
            if (endHex.tokenIDs.length > 0 && unit.Stackable() === false) {
                let friendly = 0;
                _.each(endHex.tokenIDs, tokenID => {
                    if (tokenID !== unit.id) {
                        let unit2 = Units[tokenID]
                        if (unit2.player === unit.player && unit2.Stackable() === false) {
                            friendly++;
                        }
                    }
                })
                if (friendly >= 2) {
                    cost = 100;
                }
            }

            if (cost <= remainingMove) {
                //place a move marker
                CreateMoveMarker(startHex,endHex,cost);
                //update remaining movement
                remainingMove -= cost;
                unit.token.set("bar3_value",remainingMove);
            } else {
                endHex = startHex;
            }
        }
    }

    unit.token.set({
        left: endHex.centre.x,
        top: endHex.centre.y,
    })
    let index = startHex.tokenIDs.indexOf(unit.id);
    if (index > -1) {
        startHex.tokenIDs.splice(index,1);
    }
    if (!endHex.tokenIDs.includes(unit.id)) {
        endHex.tokenIDs.push(unit.id);
    }

}