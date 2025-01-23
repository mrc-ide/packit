import { Settings2 } from "lucide-react";
import { Button } from "../../Base/Button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../../Base/DropdownMenu";
import { Dispatch, SetStateAction } from "react";

interface ToggleParamColumnsDropdownColumnsProps {
  allParametersKeys: Set<string>;
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: Dispatch<SetStateAction<Record<string, boolean>>>;
}
export const ToggleParamColumnsDropdownColumns = ({
  allParametersKeys,
  columnVisibility,
  setColumnVisibility
}: ToggleParamColumnsDropdownColumnsProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild disabled={allParametersKeys.size === 0}>
      <Button variant="outline" size="sm" className="ml-auto flex gap-1">
        <Settings2 className="h-5 w-5" />
        Parameter Columns
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {Array.from(allParametersKeys, (param, idx) => (
        <DropdownMenuCheckboxItem
          key={`param-${idx}`}
          checked={columnVisibility[`parameters_${param}`]}
          onCheckedChange={(value) =>
            setColumnVisibility((previousVisibility) => ({
              ...previousVisibility,
              [`parameters_${param}`]: value
            }))
          }
        >
          {param}
        </DropdownMenuCheckboxItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);
