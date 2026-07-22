import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { resolveNavigationUrl } from "../lib/resolve-navigation-url";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";

type CommandMenuItem = { description?: string; title: string; url: string };

type CommandMenuProps = {
  emptyMessage?: string;
  groupHeading?: string;
  items: Array<CommandMenuItem>;
  placeholder?: string;
  title?: string;
};

const CommandMenu = ({
  emptyMessage = "No results.",
  groupHeading = "Posts",
  items,
  placeholder = "Search posts…",
  title = "Search posts",
}: CommandMenuProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button aria-label="Open search" size="icon" variant="ghost" />}>
        <Search />
      </DialogTrigger>
      <DialogContent className="p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup heading={groupHeading}>
              {items.map((item) => (
                <CommandItem
                  key={item.url}
                  onSelect={() => {
                    const destination = resolveNavigationUrl(item.url, window.location.href);
                    if (destination !== null && destination !== "") {
                      window.location.href = destination;
                    }
                  }}
                  value={item.title}
                >
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    {item.description !== undefined && item.description !== "" ? (
                      <span className="text-muted-foreground text-xs">{item.description}</span>
                    ) : null}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export { CommandMenu };
export type { CommandMenuItem, CommandMenuProps };
