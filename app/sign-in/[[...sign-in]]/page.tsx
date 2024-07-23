import { SignIn } from "@clerk/nextjs"
import { Metadata } from "next"
export const metadata:Metadata={
    title:"note-gpt - signin"
}
const signin=()=>{
    return(<div className="flex h-screen items-center justify-center">
        {/* <SignIn/> */}
        <SignIn appearance={{variables:{colorPrimary:"#0F172A"}}}/>
    </div>)
}
export default signin