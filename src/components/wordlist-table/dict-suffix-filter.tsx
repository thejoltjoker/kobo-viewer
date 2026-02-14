import {
  Badge,
  Button,
  Combobox,
  createListCollection,
  Popover,
  Portal,
  Stack,
  Wrap,
} from "@chakra-ui/react";
import * as React from "react";
import { useMemo, useState } from "react";
import { LuFilter } from "react-icons/lu";

export interface DictSuffixFilterProps {
  dictSuffixes: string[];
}

function FilterTrigger({ ref: _ref, onClick, ...props }: React.HTMLAttributes<HTMLSpanElement> & { ref?: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <Button
      size="sm"
      variant="outline"
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      <LuFilter />
      {" "}
      Filters
    </Button>
  );
}
FilterTrigger.displayName = "FilterTrigger";

const DictSuffixFilter: React.FC<DictSuffixFilterProps> = ({
  dictSuffixes,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedDictSuffixes, setSelectedDictSuffixes] = useState<string[]>(
    [],
  );

  const filteredItems = useMemo(
    () =>
      dictSuffixes.filter(item =>
        item.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    [dictSuffixes, searchValue],
  );

  const collection = useMemo(
    () => createListCollection({ items: filteredItems }),
    [filteredItems],
  );

  const handleValueChange = (details: Combobox.ValueChangeDetails) => {
    setSelectedDictSuffixes(details.value);
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <FilterTrigger />
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>
              <Stack gap="4">
                <Combobox.Root
                  multiple
                  closeOnSelect
                  value={selectedDictSuffixes}
                  collection={collection}
                  onValueChange={handleValueChange}
                  onInputValueChange={details =>
                    setSearchValue(details.inputValue)}
                >
                  <Wrap gap="2">
                    {selectedDictSuffixes.map(skill => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </Wrap>

                  <Combobox.Label>Select DictSuffixes</Combobox.Label>

                  <Combobox.Control>
                    <Combobox.Input />
                    <Combobox.IndicatorGroup>
                      <Combobox.Trigger />
                    </Combobox.IndicatorGroup>
                  </Combobox.Control>

                  <Portal>
                    <Combobox.Positioner>
                      <Combobox.Content>
                        <Combobox.ItemGroup>
                          <Combobox.ItemGroupLabel>
                            DictSuffixes
                          </Combobox.ItemGroupLabel>
                          {filteredItems.map(item => (
                            <Combobox.Item key={item} item={item}>
                              {item}
                              <Combobox.ItemIndicator />
                            </Combobox.Item>
                          ))}
                          <Combobox.Empty>No dictSuffixes found</Combobox.Empty>
                        </Combobox.ItemGroup>
                      </Combobox.Content>
                    </Combobox.Positioner>
                  </Portal>
                </Combobox.Root>
              </Stack>
            </Popover.Body>
            <Popover.CloseTrigger />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default DictSuffixFilter;
