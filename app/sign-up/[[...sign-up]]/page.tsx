import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "LoopAI - signup",
};
const signup = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignUp appearance={{ variables: { colorPrimary: "#0F172A" } }} />
    </div>
  );
};
export default signup;
