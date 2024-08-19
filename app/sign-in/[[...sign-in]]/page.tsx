import { SignIn } from "@clerk/nextjs"
import { Metadata } from "next"
export const metadata:Metadata={
    title:"LoopAI - signin"
}
const signin=()=>{
    return(<div className="flex h-screen items-center justify-center">
        <SignIn appearance={{variables:{colorPrimary:"#0F172A"}}}/>
    </div>)
}
export default signin