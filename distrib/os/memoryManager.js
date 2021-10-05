var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() {
        }
        checkValid(programLength) {
            if (programLength > SEGMENT_LENGTH) {
                this.isAvailable = true;
                return this.isAvailable;
            }
            else {
                this.isAvailable = false;
                return this.isAvailable;
            }
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map