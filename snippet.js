const InCommand = (hq) => {
    let formation = state.WaW85.formationInfo[hq.formationID];
    let hqLevel = parseInt(hq.token.get("currentSide"));
    let morale = parseInt(formation.morale);
    let commandRange = parseInt(formation.commandRange[hqLevel]);
    let hqHex = HexMap[hq.hexLabel];
    //electronic warfare
    if (hq.token.get(SM.EW)) {
        commandRange = 0;
    }
    let hexes = {};
    let leaderHexLabels = formation.leaderIDs.map(id => Units[id].hexLabel);

    _.each(formation.unitIDs,unitID => {
        let hexLabel = Units[unitID].hexLabel;
        if (hexes[hexLabel]) {
            hexes[hexLabel].push(unitID);
        } else {
            hexes[hexLabel] = [unitID];
        }
    })

    let hexLabels = Object.keys(hexes);
    _.each(hexLabels,hexLabel => {
        let distance = HexMap[hexLabel].Distance(hqHex);
        let unitIDs = hexes[hexLabel];
        if (distance <= commandRange || leaderHexLabels.includes(hexLabel) || HexMap[hexLabel].offboard === true) {
            _.each(unitIDs,unitID => {
                Units[unitID].SetActive(true);
            })
        } else {
            let moraleRoll = randomInteger(6) + randomInteger(6);
            _.each(unitIDs,unitID => {
                let unit = Units[unitID];
                if (moraleRoll <= morale) {
                    unit.SetActive(true);
                } else {
                    let ic = false
                    if (unit.special.includes("Recon")) {
                        ic = true;
                    }
                    if (unit.special.includes("Helicopter")) {
                        ic = true;
                    }
                    if (ic === true) {
                        unit.SetActive(true);
                    } else {
                        unit.SetOOC();
                        outputCard.body.push(unit.name + " is OOC this turn");
                    }
                }
            })
        }
    })
}