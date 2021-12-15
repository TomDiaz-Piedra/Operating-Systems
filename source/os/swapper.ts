module TSOS {
    export class swapper {
        constructor() {
        }
        //Take a Program From Disk:
        //-Give it a free Memory Segment
        //Change its PCB location from Disk to Memory
        //Load the sessionStorage values into Memory
        //Run it(this happens afterwards and is done via the scheduler/dispatcher
        public rollIn(nextProgram){ //nextProgram in Dispatcher(readyqueue.dequeue)
            //Read the file with PID name
            let filename = nextProgram.pid.toString();
            filename ="*"+filename;
            let data = _krnDiskDriver.readFile(filename);
            //Concat all data into 1 string (in array chunks of 60 right now)
            let finalData="";
            for(let i =0;i<data.length;i++){
                finalData=finalData.concat(_krnDiskDriver.hex_to_ascii(data[i]));

            }

            //Load into Memory similarly to load command in Shell:
            //Find Available Segment
            let seg =_MemoryManager.getValid();
            //Add Segment to PCB
            nextProgram.segment=seg;
            nextProgram.segment.isEmpty=false;
            nextProgram.init();
            //Use Memory Accessor to Read and Write Data from Disk into Memory
            let adr=0;
            finalData=finalData.substring(0,256);
            let len = finalData.length;
            let start=0;
            let end = 2;

            while (start<len) {
                let byte = finalData.substring(start,end);
                _MemoryAccessor.setMAR(adr+nextProgram.segment.offset);
                _MemoryAccessor.setMDR(parseInt(byte,16));
                _MemoryAccessor.write();
                start=start+2;
                end=end+2;
                adr++;
            }

            TSOS.Control.UpdateMemDisplay();
            //Change Location to Memory
            nextProgram.location="Memory";
            //Delete File on Disk(Will Just make all Available bits be 0 so they can be rewritten)
            _krnDiskDriver.deleteFile(filename);
            TSOS.Control.UpdateDiskDisplay();
            TSOS.Control.updatePCB(nextProgram);

        }
        //Take a Program From Memory:
        //-Save PCB state thats currently on CPU
        //Load it into Disk and change PCB location to Disk
        //Remove Segment from PCB and Clear Segment(Make available and wipe all values to 00's in Memory)
        public rollOut(){ //_CPU.currentProgram
            //Load it into Disk:
            //Create File with PID name
            let pid = _CPU.currentProgram.pid;
            let filename = pid.toString();
            filename="*"+filename;
            _krnDiskDriver.createFile(filename);
            //Write to it:
            //Get all data from the start of the current programs segment to the end and put it into a string
            let data = "";
            for(let i = _CPU.currentProgram.segment.Start;i<_CPU.currentProgram.segment.End;i++){
                //Set MAR to the current spot in Memory we need to move to the disk
                _MemoryAccessor.setMAR(i);
                _MemoryAccessor.read();
                let check0=_MemoryAccessor.getMDR().toString(16).toUpperCase();
                if(check0.length==1){
                    check0="0"+check0;

                }


                data = data+check0;
            }

            data=data.split(" ").join("");
            //Then write that string onto disk
            _krnDiskDriver.writeFile(filename,data);
            //Clear Seg
            _MemoryAccessor.clearSegment(_CPU.currentProgram.segment.Number);
            //Change Location and remove segment from the PCB
            //_CPU.currentProgram.segment=null;
            _CPU.currentProgram.location="Disk";
            //Update Displays using methods from the Control
            _CPU.updateCurrent();
            TSOS.Control.UpdateMemDisplay();
            TSOS.Control.UpdateDiskDisplay();
            TSOS.Control.updatePCB(_CPU.currentProgram);

        }

    }
}