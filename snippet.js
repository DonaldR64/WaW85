const Spot = (msg) => {
    //for onboard only, for offboard, uses token itself
    //checks for available artillery - ready, in range etc
    let spotter = Units[msg.selected[0]._id];
    SetupCard(spotter.name,"Spot",unit.nation);

    if (spotter.Active() === false) {
        outputCard.body.push("Spotter is OPS Complete");
        PrintCard();
        return;
    }

    let available = [];
    let formation = state.WaW85.formationInfo[spotter.formationID];

    _.each(formation.unitIDs, unitID => {
        let unit = Units[unitID];
        if (unit.artUnit && unit.Active() && unit.Disrupted() === false) {
            available.push(unitID);
        } 
    })

    if (available.length === 0) {
        outputCard.body.push("No Available Artillery Units");
    } else {
        //create target icon, use wildshape routine, place on spotter
        //player moves, selects the artillery, then if calls FFE
        //place macro with !FFE and call HE or Smoke







    }
    PrintCard();
}