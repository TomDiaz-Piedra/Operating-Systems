module TSOS{
    export class Disk {
        //Disk has 4 attributes: track, sector, blocks, and dataSize
         tracks:number;
         sectors:number;
         blocks:number;
         dataSize:number;
        constructor() {
            this.tracks=4;
            this.sectors=8;
            this.blocks=8;
            this.dataSize=60;
        }
        //Initializes all blocks in all tracks/sectors to 0's
        init(){
            for (let i = 0; i < this.tracks; i++) {
                for (let j = 0; j < this.sectors; j++) {
                    for (let k = 0; k < this.blocks; k++) {

                        var key = i + ":" + j + ":" + k; //i is the track, j is the sector, k is the block
                        var data = new Array();

                        for (let x = 0; x < this.dataSize; x++) {
                            data.push("00");


                        }
                        var availBitPointer = "0000";
                        //For some reason I was having a issue with storing just  string when trying it all in 1 pretty line
                        //so I split it and said aloud in anger "If it works this time I will keep the variable name frog
                        //It worked, so frog stays, welcome frog for frog is a nice variable.
                        let frog = data.toString();
                        let final = frog.split(",").join("");
                        let blockData=availBitPointer.concat(final);


                        sessionStorage.setItem(key, blockData);
                    }
                }
            }
        }



    }
    }