import { Loader2 } from "lucide-react";
import { ButtonProps } from "./button";
import { Button } from "./button";
type loadingProps = {
  loading: boolean;
} & ButtonProps;
export const Loadingbutton = ({
  children,
  loading,
  ...props
}: loadingProps) => {
  return (
    <Button {...props} disabled={props.disabled || loading}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
};
