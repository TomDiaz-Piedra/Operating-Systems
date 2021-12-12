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
                                let wipeData="";
                                for(let x=0;x<_Disk.dataSize;x++){
                                    wipeData=wipeData.concat("00");
                                }
                                wipeData = block.substring(0,4)+wipeData;
                                block = wipeData;

                                block = block.substring(0,4)+final.toUpperCase()+block.substring(4+filename.length,block.length);

                                //Tell user it was successful and update the session storage and gui display!

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

        public deleteFile(filename) {
            filename = this.asciiConvert(filename);
            for (let i = 0; i < _Disk.sectors; i++) {
                for (let j = 0; j < _Disk.blocks; j++) {
                    if (i == 0 && j == 0) {
                        //ignore Master Boot Record
                    } else {
                        var tsb = 0 + ":" + i + ":" + j;
                        var block = sessionStorage.getItem(tsb);

                        if (block[0] == "1") {

                            //check if its name is equal to the one we want to read
                            let existFileName = block.substring(4);
                            let checkName = existFileName.split("00");
                            var oldName = [];

                            for (var x = 0, charsLength = checkName[0].length; x < charsLength; x += 2) {
                                oldName.push(checkName[0].substring(x, x + 2));
                            }
                            let oldStr = "";
                            let newStr = "";
                            for (let z = 0; z < oldName.length; z++) {
                                newStr = newStr.concat(filename[z]);
                                oldStr = oldStr.concat(oldName[z]);

                            }
                            newStr = newStr.toUpperCase();

                            if (oldStr == newStr) { //if they equal each other we get all pointers set available bit to 0
                                let data = sessionStorage.getItem(tsb);
                                data = this.setCharAt(data,0,"0");
                                sessionStorage.setItem(tsb,data);
                                this.deleteBits(tsb);

                                TSOS.Control.UpdateDiskDisplay();
                                return;
                            }
                        }
                    }
                }
            }
            //If we have not completed a delete by now, we did not find the file
            _StdOut.putText("File Not Found");
        }
        public deleteBits(tsb){
            let pointer = tsb;
            while(pointer!=="0:0:0"){
                let block = sessionStorage.getItem(pointer);
                block = this.setCharAt(block,0,"0");
                sessionStorage.setItem(pointer,block);
                pointer=block[1]+":"+block[2]+":"+block[3];

            }
        }

        //Goes through each data block and adds it to a string, The string of all data in the file will be returned
        public readFile(filename) {
            filename = this.asciiConvert(filename);
            for (let i = 0; i < _Disk.sectors; i++) {
                for (let j = 0; j < _Disk.blocks; j++) {
                    if (i == 0 && j == 0) {
                        //ignore Master Boot Record
                    } else {
                        var tsb = 0 + ":" + i + ":" + j;
                        var block = sessionStorage.getItem(tsb);

                        if (block[0] == "1") {

                            //check if its name is equal to the one we want to read
                            let existFileName = block.substring(4);
                            let checkName = existFileName.split("00");
                            var oldName = [];

                            for (var x = 0, charsLength = checkName[0].length; x < charsLength; x += 2) {
                                oldName.push(checkName[0].substring(x, x + 2));
                            }
                            let oldStr = "";
                            let newStr = "";
                            for (let z = 0; z < oldName.length; z++) {
                                newStr = newStr.concat(filename[z]);
                                oldStr = oldStr.concat(oldName[z]);

                            }
                            newStr = newStr.toUpperCase();

                            if (oldStr == newStr) { //if they equal each other we get all pointers and read the file
                                let pointer = block[1]+":"+block[2]+":"+block[3];
                                return this.getPointers(pointer);
                            }
                        }
                    }
                }
            }
            //If we have not returned the read yet, that means we could not find anything
            _StdOut.putText("Error: File Not Found");
            return;
        }
        public  hex_to_ascii(data) {
            var hex  = data.toString();
            var str = '';
            for (var n = 0; n < hex.length; n+=2) {
                str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
            }
            return str;
        }

        public ascii_to_hex(data) {
            var ans = [];
            for (var n = 0, l = data.length; n < l; n ++)
            {
                var hex = Number(data.charCodeAt(n)).toString(16);
                ans.push(hex);
            }
            return ans.join('');
        }
        //Uses filename's pointer to find first TSB and all pointers after, if any and then read the data
        public getPointers(pointer){
            //Get first block's data
            let start = sessionStorage.getItem(pointer);
            //All data from file will combine into 1 string here
            var readData=[];
            readData=readData.concat(start.substring(4));
            //next if any
            let nextBlock = start[1]+":"+start[2]+":"+start[3];
            while(nextBlock!=="0:0:0"){
                let block = sessionStorage.getItem(nextBlock);
                nextBlock = block[1]+":"+block[2]+":"+block[3];
                readData.push(block.substring(4));

            }
            return readData;
        }

        //Helper Function to get a list of free blocks that we can write into
        public findAvailTSB(required){
            required=required-1; //Did this because we already have 1 block to save it into(the block allocated after creating the file)
            //used to compare to the required amount of blocks
            var avail=0;
            //List of TSBs we will use to write the file into the disk, if we have enough room
            var listOfTSBs = [];
            //Go through each block starting from 1:0:0 looking for available blocks
            for(let k = 1;k<_Disk.tracks;k++){
            for(let i=0;i<_Disk.sectors;i++){
                for(let j=0;j<_Disk.blocks;j++){
                    var tsb = k+":"+i+":"+j;
                    let block = sessionStorage.getItem(tsb);
                    //If it is available, add it to the listOfTSBs array and add 1 to the available blocks
                    if(block[0]=="0"){
                        listOfTSBs.push(tsb);
                        avail++;
                    }
                    //If the available blocks equals the amount required to write into the file, we return the list of pointers
                    if(avail==required){
                        //listOfTSBs.push("0:0:0");//Put the ending pointer at the end of the array
                        return listOfTSBs;
                    }
                }
            }
        }
            //If the number of available blocks is not enough for the required, we return false
            if(avail!=required){
                return false;
            }
        }

        public writeFile(filename, str:String){
            //Convert filename into Ascii Hex
            let asciiData = this.asciiConvert(str);
            let data="";
            for(let p=0;p<asciiData.length;p++){
                data=data.concat(asciiData[p]);
            }
            data=data.split(",").join("");
            filename = this.asciiConvert(filename);
            var listOfPointers;

            //Check if data size is larger than 60 while splitting off the ""
            //We only take off the "" if the file comes from the Write command
            //No need if it comes from Rolling In a Process from Memory
            if(data.length>60){
                let chainNum =Math.floor(data.length/60);
                //Check if we have as many TSBs available as we need Chains
                //If so find all pointers, put in array
                listOfPointers = this.findAvailTSB(chainNum);
                //If we do not have enough blocks return an error and stop writing
                if(!listOfPointers){
                    _StdOut.putText("Error: Cannot Write to File. Not Enough Space!");
                    return;
                }
                else{
                    //We continue with the array of pointers
                }
            }
            else{
                listOfPointers=["0:0:0"];
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
                            let firstPoint = block[1]+":"+block[2]+":"+block[3];
                            let pointer = firstPoint;
                            let pos=0;
                            while(pointer!=="0:0:0"){
                                //Get the block we are writing into
                                let tempBlock = sessionStorage.getItem(pointer);
                                let currentPointer=pointer;
                                //Rewrite 0's into the entire block to wipe it clean before writing:
                                let wipeData="";
                                for(let x=0;x<_Disk.dataSize;x++){
                                    wipeData=wipeData.concat("00");
                                }
                                //Available bit and Pointer bits
                                wipeData.concat("0000");
                                tempBlock=wipeData;
                                //Now that the block data has be reset to all 0's(124 to be exact) we will update the available bits, pointers, and data:
                                //Set its available bit to 1
                                tempBlock=this.setCharAt(tempBlock,0,"1");
                                //Get the pointer for this block
                                pointer=listOfPointers[pos];
                                if(data.length<=60){
                                    pointer="0:0:0";
                                }
                                //Split the string (in -:-:- format) into an array
                                let nums = pointer.split(":");
                                //Set the pointer bits to the pointer
                                tempBlock=this.setCharAt(tempBlock,1,nums[0]);
                                tempBlock=this.setCharAt(tempBlock,2,nums[1]);
                                tempBlock=this.setCharAt(tempBlock,3,nums[2]);
                                //Check if this blocks pointer is 0:0:0
                                if(pointer=="0:0:0"){
                                    //If this is the last block we are writing into, its possible it won't use the whole size of the block
                                    //So I just pushed 00's into it until we hit that size
                                    let temp = 120;//total characters in each block(60, but each is 00, so 120)
                                    while(data.length<temp){
                                        data = data.concat("00");
                                    }
                                }
                                //Write 60 into the block:
                                //Grab the first 60
                                let writeData = data.substring(0,120); //119
                                //Set the total data to be the data without the part we are writing in
                                data = data.substring(120);//120
                                //Put the all the block data together:
                                let newData = tempBlock.substring(0,4)+writeData.toUpperCase()+tempBlock.substring(4+writeData.length,tempBlock.length);
                                //Set the data at the pointer equal to the
                                sessionStorage.setItem(currentPointer,newData);
                                //update which pointer we will be on
                                pos++;


                            }
                            TSOS.Control.UpdateDiskDisplay();

                            return;

                        }
                    }
                }
            }
            //If we get here and haven't done the write, that means the file does not exist, or we couldn't find it
            _StdOut.putText("Error: File Not Found!");
            return;

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
                        //change so it doesn't happen after every check, only when all is checked
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
