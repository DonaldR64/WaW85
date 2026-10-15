    const buttonlist = ["input","display"];
    buttonlist.forEach(button => {
        on(`clicked:${button}`, function() {
            setAttrs({
                sheetTab: button
            });
        });
    });

    on("sheet:opened", function() {
        setAttrs({sheetTab:"display"});
    });

    on("change:attrs sheet:opened", function() { 
        getAttrs(["nation","movementtype","type","special","character_name"], function(values) {
            let nation = values.nation;
            let charName = values.character_name;
            charName = charName.split("//")[0].trim();

            if (nation === "Soviet") {
                flag = "https://s3.amazonaws.com/files.d20.io/images/324272729/H0Ea79FLkZIn-3riEhuOrA/thumb.png?1674441877";
                charName = charName.replace("Soviet ","");
            }
           
            if (nation === "UK") {
                flag = "https://s3.amazonaws.com/files.d20.io/images/341534797/XqqtHf_6iRq2DKyTLFVNSQ/thumb.png?1683944363";
            }
            if (nation === "US Army") {
                flag = "https://s3.amazonaws.com/files.d20.io/images/327591694/wOEPfGDaGsOwSNTlLvC5VA/thumb.png?1676164120";
                charName = charName.replace("US ","");
            }
            if (nation === "US Marine Corps") {
                flag = "https://s3.amazonaws.com/files.d20.io/images/327770708/SxnQ76mw9gYbJZg1SJVAxw/thumb.png?1676241515";

            }
            if (nation === "West Germany") {
                flag = "https://s3.amazonaws.com/files.d20.io/images/329415788/ypEgv2eFi-BKX3YK6q_uOQ/thumb.png?1677173028";
            }

            let specialatt = values.special;
            let specials = specialatt.split(",").map((e) => e.trim());



            let type = values.type;
            let movetext0,movetext1,movetext2,movetext3;

            if (type === "Infantry") {
                movetext0 = "Clear, Cultivated, City, Woods = 1 MP";
                movetext1 = "Rough = 2 MP";
                movetext2 = "";
            }
            if (type === "Vehicle") {
                movetext0 = "Clear = 1 MP";
                movetext1 = "Cultivated, City, Woods = 2 MP";
                movetext2 = "Rough = 3 MP";
                if (specials.includes("Amphibious")) {
                    movetext3 = "Water = All MP",
                }
            }







            setAttrs({
                "flag": flag,
                "movetext0": movetext0,
                "movetext1": movetext1,
                "movetext2": movetext2,
                "movetext3": movetext3,
                "specials1": specials[0],
                "specials2": specials[1],
                "specials3": specials[2],
                "specials4": specials[3],
                "displayname": charName,
            });
        });    
    });  
