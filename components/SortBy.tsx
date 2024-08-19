"use client";
import { ShuffleIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/button";
export const SortBy = ({
  setFilter,
}: {
  setFilter: (filter: string) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <ShuffleIcon className="mr-1" />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32 cursor-pointer bg-slate-950 p-2">
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setFilter("EDUCATION")}>
          <span>Education</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFilter("HEALTH")}>
          <span>Health</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFilter("FINANCE")}>
          <span>Finance</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFilter("MEETINGS")}>
          <span>Meetings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFilter("EVENTS")}>
          <span>Events</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFilter("SUBSCRIPTIONS")}>
          <span>Subscriptions</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
