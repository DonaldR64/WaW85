const Attack = (weapon,shooter,target,losResult) => {

    let defDice = target.armour;
    let defBonusDice = 0; //capped at 2;
    let save = target.save;
    let shooterTips = "";
    let targetTips = "";
    let terrainTips = "";
    let toHit = weapon.toHit;
    let fp = weapon.fp;
    //10.6.1 AA Fire
    let aaFlag = false;


    //10.6.2 HQ or Leader Bonus
    let leaderBonus = 0;
    if (damageType !== "Artillery") {
        leaderBonus = shooter.Leader().command;
    }

    //10.6.3 - minimum range for ATGM already done above
    //10.6.4 Point Blank Range, 10.6.5 Long Range
    if (weapon.type !== "Artillery" || weapon.type !== "CAS") {
        if (losResult.distance > weapon.range || losResult.distance > 1 && Scenario.night === true) {
            if (state.WaW85.weatherLevel > 0 || state.WaW85.squall) {
                toHit += 2;
                shooterTips += "<br>Long Range/Weather +2 TH";
                if (Scenario.night) {
                    shooterTips += " [Night]"
                }
            } else {
                toHit++;
                shooterTips += "<br>Long Range +1 TH";
                if (Scenario.night) {
                    shooterTips += " [Night]"
                }
            }
        }
        if (((losResult.distance < Math.floor(weapon.range/2) && Scenario.night === false) || (losResult.distance === 1 && Scenario.night === true)) && state.WaW85.weatherLevel < 3) {
            toHit--;
            shooterTips += "<br>Point Blank Range -1 TH";
        }
    }
    //10.6.6 firing into adjacent smoke hex 10.6.6
    if (HexMap[target.hexLabel].smoke === true && losResult.distance === 1) {
        shooterTips += "<br>Smoke in Target Hex +1 TH";
        toHit++;
    }
    //10.6.7 firing out of a smoke filled hex into an adjacent hex
    if (HexMap[shooter.hexLabel].smoke === true && losResult.distance === 1) {
        shooterTips += "<br>Smoke in Shooter's Hex +1 TH";
        toHit++;
    }
    //10.6.8 Terrain
    let terBonus = 0;
    if (target.type === "Infantry" || target.type === "Towed") {
        terBonus = HexMap[target.hexLabel].defenseBonus.Troops;
    } 
    if (target.type === "Vehicle" || target.type === "Helicopter" && target.HeloStatus() === "Landed") {
        terBonus = HexMap[target.hexLabel].defenseBonus.Vehicles
    }
    if (losResult.delta < 0 && aaFlag === false) {
        terBonus += 1;
    }
    if (terBonus !== 0) {
        let sign = (terBonus > 0) ? "+":"";
        targetTips += "<br>Terrain Bonus: " + sign + terBonus + " Dice";
        defBonusDice += terBonus;
    }
    //10.6.9 Composite or Reactive Armour vs ATGM
    if (weapon.notes.includes("ATGM") && (target.special.includes("Composite") || target.special.includes("Reactive"))) {
        save--;
        targetTips += "<br>Composite/Reactive Armour +1 to Armour";
    }
    //10.6.10 Volley Fire - work this out in firing, inc. the weapon.fp by 1
    //10.6.11 Target is a Landed Helicopter
    if (target.type === "Helictoper" && target.HeloStatus() === "Landed") {
        fp++;
        toHit--;
        shooterTips.push("<br>Landed Helicopter -1TH & +1 FP");
    }
    //10.6.12 ATGM at a target in blocking terrain
    if (weapon.notes.includes("ATGM") && HexMap[target.hexLabel].los === "Blocks") {
        targetTips += "<br>ATGM vs Blocking Terrain +1 Dice";
        defBonusDice++;
    }
    //10.6.13 Concealment
    if (CheckConcealment(target) === true) {
        targetTips += "<br>Concealment +1 Dice";
        defBonusDice++;
    }
    //smoke for thermal imagers - anyone else will have no LOS
    if (losResult.smokeHexes > 0) {
        shooterTips += "<br>Smoke in Intervening Hexes -" + losResult.smokeHexes;
        toHit += losResult.smokeHexes;
    }
    //Night - factored into above PB and LR fire and in direct fire for morale checks
    //Weather - mostly factored into abvoe PB and LR fire, and prevent LR fire for weatherLevel 4
    if (state.WaW85.weatherLevel > 1) {
        defBonusDice++;
        targetTips += "<br>Weather +1 Dice";
    }
    if (state.WaW85.squall) {
        defBonusDice++;
        targetTips += "<br>Squall +1 Dice";
    }
    //10.6.14 Max Defensive Bonus
    if (target.armourType === "Heavy" || target.armourType === "Light") {
        if (defBonusDice > 2) {
            defBonusDice = 2;
            targetTips += "<br>Max of 2 Bonus Dice";
        }
    }
    //10.6.15 Max To Hit of 6
    toHit = Math.min(6,toHit);

    //11.0 Move and Fire Effects, direct fire will remove 'illegals'
    if (shooter.type !== "Helicopter" && weapon.type !== "Artillery") {
        let mpMax = parseInt(shooter.token.get("bar3_max"));
        let mpLeft = parseInt(shooter.token.get("bar3_value"));
        let fullMove = ((mpLeft/mpMax) < .5) ? true:false;
        if (weapon.notes.includes("Stabilized")) {
            if (shooter.player === 0) {
                if (fullMove) {
                    weapon.fp -= 2;
                    shooterTips += "<br>Movement -2 FP";
                } else {
                    weapon.fp--;
                    shooterTips += "<br>Movement -1 FP";
                }
            } else if (shooter.player === 1 && fullMove) {
                //if Nato and under half MP, then no effect
                weapon.fp--;
                shooterTips += "<br>Movement -1 FP";
            }
        } else {
            //over half MP has been screened out in direct fire
            weapon.fp -= 2;
            shooterTips += "<br>Movement -2 FP";
        }
    }
    //10.6.16 Min FP  of 1
    weapon.fp = Math.max(1,weapon.fp);
    //10.6.17 All Water Hex - done in direct fire
    //Weather level 4 overrides FP and To Hit
    if (state.WaW85.weatherLevel === 4) {
        weapon.fp = 1;
        toHit = 6;
        shooterTips = "<br>Severe Weather FP = 1, TH = 6";
    }






}

