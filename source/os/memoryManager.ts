module TSOS{

    export class MemoryManager{
        public isAvailable:boolean;
        constructor(){

        }

        public checkValid(programLength:number){
            if(programLength<SEGMENT_LENGTH){
                this.isAvailable=true;
                return this.isAvailable
            }
            else{
                this.isAvailable=false;
                return this.isAvailable;
            }
    }



    }


}