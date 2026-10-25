const Attack = (weapon,shooter,target,losResult) => {

    let defDice = target.armour;
    let defBonusDice = 0; //capped at 2;
    let save = target.save;
    let shooterTips = "";
    let targetTips = "";
    let terrainTips = "";
    let toHit = weapon.toHit;
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
            toHit++;
            if (Scenario.night === true) {
                shooterTips += "<br>Night +1 TH";
            } else {
                shooterTips += "<br>Long Range +1 TH";
            }
        }
        if (losResult.distance < Math.floor(weapon.range/2) && Scenario.night === false || losResult.distance === 1 && Scenario.night === true) {
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
        terrainTips += "<br>Terrain Bonus: " + sign + terBonus + " Dice";
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
        weapon.fp++;
        toHit--;
        shooterTips.push("<br>Landed Helicopter -1TH & +1 FP");
    }
    //10.6.12 ATGM at a target in blocking terrain
    if (weapon.notes.includes("ATGM") && HexMap[target.hexLabel].los === "Blocks") {
        terrainTips += "<br>ATGM vs Blocking Terrain +1 Dice";
        defBonusDice++;
    }
    //10.6.13 Concealment
    if (CheckConcealment(target) === true) {
        terrainTips += "<br>Concealment +1 Dice";
        defBonusDice++;
    }
    //smoke for thermal imagers - anyone else will have no LOS
    if (losResult.smokeHexes > 0) {
        shooterTips += "<br>Smoke in Intervening Hexes -" + losResult.smokeHexes;
        toHit += losResult.smokeHexes;
    }
    //Night - factored into above PB and LR fire and in direct fire for morale checks
    //Weather

    //Night







}

