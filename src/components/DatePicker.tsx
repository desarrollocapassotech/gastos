import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar, type CalendarProps } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  id?: string;
  disabledDates?: CalendarProps["disabled"];
  fromYear?: number;
  toYear?: number;
  weekStartsOn?: CalendarProps["weekStartsOn"];
  captionLayout?: CalendarProps["captionLayout"];
}

const formatForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseFromInput = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const segments = value.split("-");
  if (segments.length !== 3) {
    return undefined;
  }

  const [year, month, day] = segments.map(Number);
  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  disabled,
  className,
  buttonClassName,
  id,
  disabledDates,
  fromYear,
  toYear,
  weekStartsOn = 1,
  captionLayout = "dropdown-buttons",
}: DatePickerProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => parseFromInput(value), [value]);

  const formattedValue = selectedDate
    ? format(selectedDate, "EEEE d 'de' MMMM yyyy", { locale: es })
    : placeholder;

  const handleSelect: CalendarProps["onSelect"] = (date) => {
    if (!date) {
      return;
    }

    onChange(formatForInput(date));
    setOpen(false);
  };

  const calendar = (
    <Calendar
      mode="single"
      selected={selectedDate}
      defaultMonth={selectedDate}
      onSelect={handleSelect}
      disabled={disabledDates}
      fromYear={fromYear}
      toYear={toYear}
      weekStartsOn={weekStartsOn}
      captionLayout={captionLayout}
      initialFocus
    />
  );

  const trigger = (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      id={id}
      className={cn(
        "h-11 w-full justify-start text-left font-normal",
        !selectedDate && "text-muted-foreground",
        buttonClassName
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {formattedValue}
    </Button>
  );

  return (
    <div className={className}>
      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
          <DrawerContent className="bg-background">
            <DrawerHeader className="text-left">
              <DrawerTitle>Selecciona una fecha</DrawerTitle>
              <DrawerDescription>Elige el día correspondiente a tu gasto.</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              {calendar}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {calendar}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
