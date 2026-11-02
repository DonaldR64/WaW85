   const Assault = (msg) => {
        let activeUnit = Units[state.WaW85.activeUnitID];
        let involved = [[],[]]
        let attackingPlayer = activeUnit.player;
        let defendingPlayer = (attackingPlayer === 0) ? 1:0;

        let hex = HexMap[activeUnit.hexLabel];

        let noInfantry = [true,true];
        let undisruptedDefenders = false;
        let crossRiver = false;

        for (let i=0;i<hex.tokenIDs.length;i++) {
            let unit2 = Units[hex.tokenIDs[i]]; 
            involved[unit2.player] = unit2;
        }
    
        SetupCard("Assault","",attackers[0].nation);
        let output = [[],[]];
        let totalDamage = [0,0];
/////
        for (let p=0;p<2;p++) {
            let q = (p===0) ? 1:0;
            for (let u=0;u<involved[p].length;u++) {
                let unit = involved[p][u];
                let tips = "";
                let fp = unit.assaultFP[0] || 0;
                if (fp === 0) {continue};
                let toHit = unit.assaultToHit[0];
                if (unit.health === "Reduced") {
                    fp = unit.assaultFP[1];
                    toHit = unit.assaultToHit[1];
                }
                
                let mods = 0;
                let apFlag = false;
                for (let w=0;w<unit.weapons.length;w++) {
                    if (unit.weapons[w].type === "AP") {apFlag = true};
                    if (unit.weapons[w].notes.includes("ATGM") && unit.token.get(SM.oom) === true) {
                        apFlag = false;
                    }
                    if (unit.weapons[w].notes.includes("HROF")) {apFlag === true};
                }

                //13.1.1
                if (unit.assaultCB > 0) {
                    tips += "<br>HQ Command Bonus +" + unit.assaultCB;
                    mods -= unit.assaultCB;
                }
                //13.1.2
                if (unit.type === "Infantry" && noInfantry[q] === true) {
                    mods--;
                    tips += "<br>Infantry vs Unsupported Vehicle +1 to Hit";
                    if (hex.terrain.includes("City")) {
                        fp++;
                        tips += "<br>Infantry vs Unsupported Vehicle in City +1 Dice";
                    }
                }
                //13.1.3
                if (undisruptedDefenders === true && crossRiver === true) {
                    if (unit.player === attackingPlayer) {
                        fp--;
                        tips += "<br>Cross River/Bridge Assault -1 FP";
                        mods++;
                        tips += "<br>Cross River/Bridge Assault -1 to Hit";   
                    }
                    if (unit.player === defendingPlayer) {
                        mods--;
                        tips += "<br>Cross River/Bridge Assault +1 to Hit";   
                    }
                }

                //13.1.4
                if (state.WaW85.daytime === false && unit.token.get("tint_color") !== "#ff0000") {
                    mods--;
                    tips += "<br>Night Assault +1 to Hit";
                }
                toHit = Math.min(6,toHit + mods);
                if (unit.token.get("tint_color") === "#ff0000") {
                    toHit = 6;
                    tips = "<br>Disrupted To Hit = 6";
                }
                let rolls = [];
                let damage = 0;
                for (let i=0;i<fp;i++) {
                    let roll = randomInteger(6);
                    rolls.push(roll);
                    if (roll >= toHit) {
                        damage++;
                    }
                }
                let appliedDamage = 0;
                dper = Math.floor(damage/involved[q].length);
                _.each(involved[q],uni => {
                    if (apFlag === true || uni.armourType !== "Heavy") {
                        uni.assaultDamage = dper;
                        totalDamage[p] += dper;
                        appliedDamage += dper;
                    } else {
                        tips += "<br>" + uni.name + " unaffected by HE";
                    }
                })
                rem = damage - (dper * involved[q].length);
                if (rem === 1) {
                    //will only occur if odd # of hits and even # of units taking hits
                    let u = randomInteger(2);
                    if (apFlag === true || involved[q][u].armourType !== "Heavy") {
                        involved[q][u].assaultDamage++;
                        totalDamage[p]++;
                        appliedDamage++;
                    }
                }

                tips = "Rolls: " + rolls.toString() + " vs. " + toHit + "+" + tips;
                tips = '[🎲](#" class="showtip" title="' + tips + ')';
                let line = tips + " " + unit.name + " causes " + appliedDamage + " Damage";
                output[unit.player].push(line);
            }
        }

        //display attacks
        outputCard.body.push("[U]Attacks[/u]");
        for (let i=0;i<output[attackingPlayer].length;i++) {
            outputCard.body.push(output[attackingPlayer][i]);
        }
        for (let i=0;i<output[defendingPlayer].length;i++) {
            outputCard.body.push(output[defendingPlayer][i]);
        }
        //apply damage results and display while doing so
        outputCard.body.push("[hr]");
        outputCard.body.push("[U]Damage[/u]");
        let attackersLeft = 0;
        let advancingVehicles = [];
        let defendersLeft = 0;
        for (let i=0;i<involved[attackingPlayer].length;i++) {
            let damage = involved[attackingPlayer][i].assaultDamage;
            if (damage > 0) {
                involved[attackingPlayer][i].ApplyDamage(damage,"Assault");
            };
            if (involved[attackingPlayer][i].health !== "Eliminated") {
                attackersLeft++;
                if (involved[attackingPlayer][i].type === "Vehicle" && involved[attackingPlayer][i].token.get("tint_color") !== "#ff0000") {
                    advancingVehicles.push(involved[attackingPlayer][i].name);
                }
            }
        }
        for (let i=0;i<involved[defendingPlayer].length;i++) {
            let damage = involved[defendingPlayer][i].assaultDamage;
            if (hex.improved === true) {
                outputCard.body.push("Improved Positions Protects " +involved[defendingPlayer][i].name);
                damage--;
            }
            if (damage > 0) {
                involved[defendingPlayer][i].ApplyDamage(damage,"Assault");
            };
            if (involved[defendingPlayer][i].health !== "Eliminated") {
                defendersLeft++;
            }
        }
        //final results
        outputCard.body.push("[hr]");
        outputCard.body.push("[U]Results[/u]");
        let defendersLost = false;
        if (defendersLeft === 0 && attackersLeft === 0) {
            outputCard.body.push("No Survivors, Draw");
        }
        if (attackersLeft > 0 && defendersLeft > 0 && totalDamage[attackingPlayer] <= totalDamage[defendingPlayer]) {
            outputCard.body.push("Surviving Attackers must retreat to their previous Hex");
        }
        if (defendersLeft > 0 && totalDamage[attackingPlayer] > totalDamage[defendingPlayer]) {
            outputCard.body.push("Surviving Defenders must retreat 1 Hex (13.2.2)");
            defendersLost = true;
        }
        if (defendersLeft === 0 && attackersLeft > 0) {
            outputCard.body.push("The Attackers Take the Hex!");
            defendersLost = true;
        }
        if (attackersLeft === 0 && defendersLeft > 0) {
            outputCard.body.push("The Defenders Hold the Hex!");
        }
        if (defendersLost === true && advancingVehicles.length > 0) {
            _.each(advancingVehicles,name => {
                outputCard.body.push(name + " may advance into an adjacent Hex, subject to Rule 13.1.5");
            })
        }
        PrintCard();
    }


