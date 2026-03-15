import type { PropsWithChildren } from "react";
import clsx from "clsx";

type ContainerProps = PropsWithChildren<{
  className?: string;
}>;

export function Container({ children, className }: ContainerProps) {
  return <div className={clsx("container", className)}>{children}</div>;
}
