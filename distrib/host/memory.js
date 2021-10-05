var TSOS;
(function (TSOS) {
    class Memory {
        constructor(mem = new Array(256)) {
            this.mem = mem;
            this.mem = mem;
        }
        init() {
            for (let i = 0; i < 255; i++) {
                this.mem.push(0x00);
            }
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map