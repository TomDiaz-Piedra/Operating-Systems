module TSOS{

    export class MemoryManager{
        private  readyqueue = [];
        private  isAvailable: boolean;
        private  residentqueue: any[];
        memSegments:any [];
        constructor(){
            this.memSegments = [{ "Start": 0, "size": SEGMENT_LENGTH, "isEmpty": true },]
        }

        public  checkValid(programLength:number){
            //If the segment is available it will return the starting point for loading the program, and also set the segments availability to false
            if(programLength<=SEGMENT_LENGTH && this.memSegments[0].isEmpty){
                return this.memSegments[0];
            }
            //If not available it will return false
            else{
                return this.memSegments[0];
            }
    }
        public UpdateValid(segment:number){
            this.memSegments[segment].isEmpty=true;

        }





    }


}