const Activate = (msg) => {
    let Tag = msg.content.split(";");
    let id = msg.selected[0]._id;
    let action = Tag[1];
    let unit = Units[id];
    let errorMsg = [];

    if (unit.Active() === false) {
        if (unit.OOC()) {
            errorMsg.push("Unit is Out of Command");
        } else if (unit.formationID !== state.WaW85.activeFormationID) {
            errorMsg.push("Unit is not part of the Active Formation");
        } else {
            errorMsg.push("Unit has Activated");
        }
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

    if (action === "Move/Fire") {





    } else if (action === "Fire") {





    } else if (action === "Move") {





    }










}




///Change Mode for Helos
//Load or Unload Passengers


