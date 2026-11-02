const Assault = (msg) => {
    let activeUnit = Units[state.WaW85.activeUnitID];
    let involved = [[],[]];
    let attackingPlayer = activeUnit.player;
    let defendingPlayer = (attackingPlayer === 0) ? 1:0;

    let hex = HexMap[activeUnit.hexLabel];
    
    let noInfantry = [true,true];
    let heavyArmourOnly = [true,true];
    let crossBridge = false;

    let city = (hex.terrain.includes("City") || hex.terrain.includes("Town")) ? true:false;

    for (let i=0;i<hex.tokenIDs.length;i++) {
        let unit2 = Units[hex.tokenIDs[i]]; 
        involved[unit2.player] = unit2;
        if (unit2.type === "Infantry") {
            noInfantry[unit2.player] = false;
        }
        if (unit2.armourType !== "Heavy") {
            heavyArmourOnly[unit2.player] = false;
        }
        if (unit2.crossing === true) {
            crossBridge = true;
        }
    }

    SetupCard("Assault","",attackers[0].nation);
    let totalDamage = [0,0];

    //configure the for loop to go forwards if RedFor Assaulting, otherwise backwards (player 0 is RedFor)
    let direction = -1;
    if (attackingPlayer === 0) {
        direction = 1;
    }
    let start = (direction === 1) ? 0 : 1;
    let end = (direction === 1) ? 1 : 0;
    outputCard.body.push("[B]Hits[/b]");
    //go through each player, roll hits
    for (let p=start; direction === 1 ? p <= end: p >= end; p += direction) {
        if (p === 1) {outputCard.body.push("[hr]")};
        outputCard.body.push(Scenario.Red + " Units");
        let q = (p===0) ? 1:0;
        for (let i=0;i<involved[p].length;i++) {
            let notes = "";
            let unit = involved[p][i];
            let fp = unit.assaultFP || 0;
            let toHit = unit.assaultToHit || 6;
            if (unit.apWeapon === false && heavyArmourOnly[q]) {
                outputCard.body.push(unit.name + " has no AP Weapons");
                continue;
            }
            if (unit.Disrupted()) {
                notes += "<br>Disrupted TH = 6";
                toHit = 6;
            };
            //13.1.1 HQ
            let leaderInfo = unit.Leader();
            if (leaderInfo.type === "HQ") {
                fp += leaderInfo.command;
                notes += "<br>HQ +" + leaderInfo.command + "FP";
            }
            //13.1.2 Vehicles with No Infantry
            if (unit.type === "Infantry" && noInfantry[q] && unit.Disrupted() === false) {
                toHit--;
                notes += "<br>No Opposing Infantry -1 TH";
                if (city) {
                    fp++;
                    notes += "<br>In a City +1FP";
                }
            }
            //13.1.3 Cross Bridge or Cross River
            if (crossBridge === true && unit.Disrupted() === false) {
                if (p === attackingPlayer) {
                    toHit++;
                    notes += "<br>Assault Crossing -1FP, +1TH";
                } else {
                    toHit--;
                    notes += "<br>Defending Crossing -1TH";
                }
            }
            if (Scenario.night && unit.Disrupted() === false) {
                toHit--;
                notes += "<br>Night Time -1TH";
            }
            toHit = Math.min(toHit,6);
            fp = Math.max(0,fp);

            if (fp === 0) {
                outputCard.body.push(unit.name + " has No FP");
                continue;
            }

            let assaultRolls = [];
            let hits = 0;
            for (let h=0;h<fp;h++) {
                let roll = randomInteger(6);
                assaultRolls.push(roll);
                if (roll >= toHit) {
                    hits++;
                }
            }
            assaultRolls.sort().reverse();
            let tip = "Rolls: " + assaultRolls.toString() + " vs. " + toHit + "+" + "<br>Assault FP: " + fp + notes;
            tip = '[' + hits + '](#" class="showtip" title="' + tip + ')';
            outputCard.body(unit.name + " gets " + tip + " hits")
            totalDamage[p] += hits;
        }
    }

    outputCard.body.push("[hr]");
    outputCard.body.push("[B]Damage[/b]")
    outputCard.body.push("[hr]");

    //now apply hits
    for (let p=start; direction === 1 ? p <= end: p >= end; p += direction) {
        let q = (p==0) ? 1:0;
        let rnd = randomInteger(6);
        for (let i=0;i<involved[p].length;i++) {
            let unit = involved[p][i];
            let hits = Math.floor(totalDamage[q] / involved[p].length);
            let rem = totalDamage[q] - (hits * involved[p].length);
            if ((i===0 && rnd < 4) || (i===1 && rnd < 4)){
                hits += rem;
            } 
            


        }








    }












}


