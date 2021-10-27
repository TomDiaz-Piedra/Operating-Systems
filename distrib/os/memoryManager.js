var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() {
            this.memSegments = [
                { "Number": 0, "Start": 0, "size": SEGMENT_LENGTH, "isEmpty": true, "offset": 0, "End": 255 },
                { "Number": 1, "Start": 256, "size": SEGMENT_LENGTH, "isEmpty": true, "offset": 256, "End": 511 },
                { "Number": 2, "Start": 512, "size": SEGMENT_LENGTH, "isEmpty": true, "offset": 512, "End": 767 }
            ];
        }
        //Checks if there is an empty Segment in memory
        checkValid(programLength) {
            //If the segment is available it will return the starting point for loading the program, and also set the segments availability to false
            for (let i = 0; i < this.memSegments.length; i++) {
                if (this.memSegments[i].isEmpty) { //&& programLength<=SEGMENT_LENGTH
                    return true;
                }
            }
            //If not available it will return false
            return false;
        }
        //Returns the first available segment in Memory
        getValid() {
            for (let i = 0; i < this.memSegments.length; i++) {
                if (this.memSegments[i].isEmpty) {
                    return this.memSegments[i];
                }
            }
        }
        UpdateValid(segment) {
            this.memSegments[segment].isEmpty = true;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map