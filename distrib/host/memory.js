var TSOS;
(function (TSOS) {
    class Memory {
        constructor() {
            this.mem = [];
            this.mem = this.mem;
        }
        init() {
            for (let i = 0; i < 767; i++) {
                this.mem.push(0x00);
            }
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map