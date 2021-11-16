var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        constructor() {
        }
        //Getters & Setters for MDR
        getMDR() {
            return this._MDR;
        }
        setMDR(newMDR) {
            this._MDR = newMDR;
        }
        //Getters & Setters for MAR
        getMAR() {
            return this._MAR;
        }
        setMAR(newMAR) {
            this._MAR = newMAR;
        }
        setLOB(lob) {
            this.lob = lob;
        }
        setHOB(hob) {
            this.hob = hob;
        }
        getLOB() {
            return this.lob;
        }
        getHOB() {
            return this.hob;
        }
        read() {
            //Sets a temp variable equal to the current MAR
            let temp = this.getMAR();
            //Sets the current MDR equal to the Memory at the location in the MAR
            this.setMDR(_Memory.mem[temp]);
        }
        //Writes the MDR into the memory position designated by the MAR
        write() {
            let tempMAR = this.getMAR();
            let tempMDR = this.getMDR();
            _Memory.mem[tempMAR] = tempMDR;
        }
        //Clears the newly Available Memory Segment, and then calls the MMU to update its status
        clearSegment(segment) {
            let memSeg = _MemoryManager.memSegments[segment].Start;
            //Clears the memory segment by rewriting each slot to 0x00, then updates memory display for GUI.
            for (let i = memSeg; i < memSeg + 255; i++) {
                this.setMAR(i);
                this.setMDR(0x00);
                this.write();
            }
            //Once the old program has been wiped, the Memory Manager can make the Segment Available Again!
            TSOS.Control.UpdateMemDisplay();
            _MemoryManager.UpdateValid(segment);
        }
        clearMem() {
            _CPU.killAll();
            for (let i = 0; i < 767; i++) {
                this.setMDR(0x00);
                this.setMAR(i);
                this.write();
            }
            for (let j = 0; j < _MemoryManager.memSegments.length; j++) {
                _MemoryManager.memSegments[j].isEmpty = true;
            }
        }
        checkBounds(adr) {
            //We check if the address we want to access or write into is within the segment boundaries
            //Each segment is 256 bytes(0 to 255, 256 to 511, 512 to 767)
            //We cant compare the  address plus the offset to the segments boundaries as this would only check for valid boundaries going forward
            //Forward meaning from Segment 0 to Segment 1 or Segment 1 to Segment 2
            //Going backwards would not work
            //Ex. if Segment 2(512 to 767) wanted to access the first record in memory(0) we know it shouldn't
            //but if I added the offset to check the base and limit it would check if(0+512) is a valid place for a process
            // in Segment 2 to access instead of 0. Since the start of Segment 2 is 512 this is will be valid, even though it should not
            // With that in mind I have it set up to instead check if the address is between 0 and 255
            //while always adding the offset of the Segment to the address so no matter what the process will only ever have access to its segment
            //Ex. if Segment 1(256 to 511) wanted to access 136 or 512 in memory it would have to either have a negative number or one larger than 255
            //To access 136 in Segment 1 we would need the operand to have the memory address of 88 hex(-120 in dec) and since its not allowed it would never
            // get access there. Same goes for 512, except the number we would use would be 256(256+256 is 512 of course) and that is not allowed either.
            //I had to change my way of checking boundaries as originally I thought you were going to give test programs where the addresses in the operands were outside
            //of the memory boundaries(ex. checking for Segment 1 (256-511) putting 8D 40 00 (which would load the accumulator from Memory position 64) would fail)
            //I then realized after testing multiple times and going through one OP code at a time, that the program you used to check memory boundaries, much like the other
            //programs would take the address of 64 and actually store it in 64+offset respectively. Once I figured that out It led me to this long statement.
            if (adr > 255 || adr < 0) {
                _StdOut.putText("Error: Memory Infraction! Prepare for Neurotoxin!");
                _Scheduler.programEnd(_CPU.currentProgram, false);
                return false;
            }
            else {
                return true;
            }
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map