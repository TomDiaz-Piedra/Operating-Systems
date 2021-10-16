var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() {
            this.memSegments = [{ "Start": 0, "size": SEGMENT_LENGTH, "isEmpty": true, "Current": 0, "End": 255 },];
        }
        checkValid(programLength) {
            //If the segment is available it will return the starting point for loading the program, and also set the segments availability to false
            if (this.memSegments[0].isEmpty) {
                return this.memSegments[0];
            }
            //If not available it will return false
            else {
                return this.memSegments[0].isEmpty = false;
            }
        }
        UpdateValid(segment) {
            this.memSegments[segment].isEmpty = true;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map