import { ButtonEntry } from './button_entry';

export class SelectionInfo {
  allEntries: ButtonEntry[];
  selectedEntries: ButtonEntry[];
  allSelectedEntries: ButtonEntry[];
  notSelectedEntries: ButtonEntry[];

  constructor(allEntries: ButtonEntry[]) {
    this.allEntries = [...allEntries];
    this.selectedEntries = [];
    this.allSelectedEntries = [];
    this.notSelectedEntries = [...allEntries];
  }

  select(selectedIds: string[]): void {
    if (!selectedIds || selectedIds.length === 0) {
      return;
    }
    const resultSelectedEntries: ButtonEntry[] = [];

    for (const selectedId of selectedIds) {
      if (this.allEntries.every((entry) => entry.uniqueId !== selectedId)) {
        continue;
      }
      if (this.selectedEntries.some((entry) => entry.uniqueId === selectedId)) {
        continue;
      }
      const selectedEntry = this.allEntries.find((entry) => entry.uniqueId === selectedId);

      this.allSelectedEntries.push(selectedEntry!);
      resultSelectedEntries.push(selectedEntry!);
      this.notSelectedEntries = this.notSelectedEntries.filter((entry) => entry !== selectedEntry);
    }
    this.selectedEntries = resultSelectedEntries;
  }
}
