module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverDisk extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            //this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
        //Calls the format disk from Disk.ts
        public format(){
            _Disk.init();
        }

        public createFile(name:string) {
            var pointerTSB;
            //check if name is available or too long
            if(name.length>60){
                _StdOut.putText("Error: File Name is Too Long!");
                return;
            }
            var isNameAvail = this.fileExist(name);
            if (isNameAvail) {
                //check if there is a valid directory
                for (let i = 0; i < _Disk.sectors; i++) {
                    for (let j = 0; j < _Disk.blocks; j++) {
                        if (i == 0 && j == 0) {
                            //ignore the Master Boot Record
                        }
                        else {
                            var tsb = "0" + ":" + i + ":" + j;
                            var block = sessionStorage.getItem(tsb);
                            if (block[0] == "0") {
                                //finds filespace and updates pointer
                                pointerTSB=this.findFileSpace();
                                //Create the File:
                                //Set availableBit/In use bit to 1
                                block = this.setCharAt(block, 0, "1");

                                //Set the Pointer to where we will store the file data
                                for(let x=0;x<pointerTSB.length;x++){

                                    block = this.setCharAt(block,(x+1),pointerTSB[x]);
                                }

                                //Convert the file name into hex and save in the block
                                let filename=this.asciiConvert(name);
                                let fileStr = filename.toString();
                                let final = fileStr.split(",").join("");
                                block = block.substring(0,4)+final.toUpperCase()+block.substring(4+filename.length,block.length);

                                //Tell user it was successful and update the session storage and gui display!
                                _StdOut.putText("File "+name+" was created!");
                                sessionStorage.setItem(tsb,block);
                                TSOS.Control.UpdateDiskDisplay();
                                return;

                            } else {
                                //_StdOut.putText("No Directories Left!");
                            }
                        }
                    }
                }


            }
            else{
                //Nothing, the name was taken, so try again, ha ha ha!
                _StdOut.putText("File "+name+" Already Exists!");
            }
        }
        //rolledIn determines if we are writing something from the Write Command or from Rolling In a program from Memory
        //True if Rolled In from Memory
        //False if From Write Command in OS
        public writeFile(filename, data:String,rolledIn:boolean){
            //Convert filename into Ascii Hex
            filename = this.asciiConvert(filename);

            //Check if data size is larger than 60 while splitting off the ""
            if(!rolledIn){
                data = data.substring(1,data.length-1);
            }
            if(data.length>60){
                let chainNum =Math.floor(data.length/60);
                //Check if we have as many TSBs available as we need Chains
                //If so find all pointers, put in array
            }



            //If so:
            //Look for file with name: If exists, grab TSB, If not Display File Not Found Error
            for(let i=0;i<_Disk.sectors;i++){
                for(let j=0;j<_Disk.blocks;j++){
                    var tsb = "0"+":"+i+":"+j;
                    var block = sessionStorage.getItem(tsb);
                    if(block[0]=="1"){
                        let existFileName = block.substring(4);
                        let checkName=existFileName.split("00");
                        var oldName = [];

                        for (var x = 0, charsLength = checkName[0].length; x < charsLength; x += 2) {
                            oldName.push(checkName[0].substring(x, x + 2));
                        }
                        let oldStr="";
                        let newStr="";
                        for(let z=0;z<oldName.length;z++) {
                            newStr=newStr.concat(filename[z]);
                            oldStr=oldStr.concat(oldName[z]);

                        }
                        newStr=newStr.toUpperCase();
                        //If names match, we found file. So now we write into it
                        if(oldStr==newStr){
                            //Get pointer from Value
                            //Write into first block
                            //get next pointer from pointer array
                            //set the current TSB's pointer to that pointer
                            //write into next block
                            //repeat until done, fill last one with 0s as needed
                        }
                    }
                }
            }

        }

        public findFileSpace(){
            //Go through disk starting at 1:0:0 looking for an available block.
            for (let i = 1; i < _Disk.tracks; i++) {
                for (let j = 0; j < _Disk.sectors; j++) {
                    for (let k = 0; k < _Disk.blocks; k++) {
                    var tsb =i+":"+j+":"+k;
                    var block = sessionStorage.getItem(tsb);
                    if(block[0]=="0"){
                        //get tsb(its the pointer). Save it into an array that we'll use to rewrite the values
                        let pointerTSB=[i,j,k];
                        //Set the available bit/ in use bit to 1
                       block = this.setCharAt(block,0,"1");
                       sessionStorage.setItem(tsb,block);
                       TSOS.Control.UpdateDiskDisplay();
                        //return the tsb of the filespace we found so we can save it as the pointer in the directory
                        return pointerTSB;

                    }
                    else{
                        //change so it doenst happen after every check, only when all is checked
                        //_StdOut.putText("No File Space Left!");
                    }
                    }
                }
            }
        }
        //Helper function that replaces part of a string with a new value
        public setCharAt(str,index,chr) {
            if(index > str.length-1){
                return str;
            }
            return str.substring(0,index) + chr + str.substring(index+1);
        }
        //Helper Function that converts a string into ASCII into Hexadecimal
        public asciiConvert(str){
            var arr=[];
            let val =String(str);
            for(let i=0;i<val.length;i++){
                var char=val.charCodeAt(i).toString(16);
                arr.push(char);
            }
            return arr;
        }
        //Checks if a file with the given name parameter exists, if it does it returns false if not it returns true
        public fileExist(name){
            var filename=this.asciiConvert(name);
            //Defaulted to true in case there is no files created
            var isAvail:boolean=true;
            for(let i=0;i<_Disk.sectors;i++){
                for(let j=0;j<_Disk.blocks;j++){
                    if(i==0 && j==0){
                        //ignore Master Boot Record
                    }
                    else{
                        var tsb = 0+":"+i+":"+j;
                        var block = sessionStorage.getItem(tsb);

                        if(block[0]=="1"){

                            //check if its name is equal to the one we want to make
                            let existFileName = block.substring(4);
                            let checkName=existFileName.split("00");
                            var oldName = [];

                            for (var x = 0, charsLength = checkName[0].length; x < charsLength; x += 2) {
                                oldName.push(checkName[0].substring(x, x + 2));
                            }
                            let oldStr="";
                            let newStr="";
                            for(let z=0;z<oldName.length;z++) {
                                newStr=newStr.concat(filename[z]);
                                oldStr=oldStr.concat(oldName[z]);

                            }
                            newStr=newStr.toUpperCase();

                                if(oldStr==newStr){ //if they equal each other we stop and return false
                                    isAvail=false;
                                    return isAvail;
                                }
                                else{ // if they differ, set the availability to still be true
                                    isAvail=true;

                            }

                        }
                    }
                }
            //Return isAvail, I put it here for when we have not created a file yet, and because I was only checking if the name was available if the file was in use
            return isAvail;
            }
        }
    }
}
