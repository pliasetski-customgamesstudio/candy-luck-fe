import { Machine } from '@cgs/network';

export class MachineExtensions {
  static KnownTypes: Set<string> = new Set(['1x1', '1x2', '2x1', '2x2']);

  static LabelNew: string = 'new';
  static LabelHot: string = 'hot';
  static LabelFeatured: string = 'featured';
  static LabelComingSoon: string = 'coming_soon';
  static LabelMaintenance: string = 'maintenance';
  static LabelSubscription: string = 'subscription';
  static LabelUpdateRequired: string = 'update_required';

  static VIPHighLimit: string = 'vip_high_limit';
  static VIPExclusive: string = 'vip_exclusive';
  static VIPFreeSpins: string = 'vip_free_spins';
  static WoFIcon: string = 'wof_icon';
  static EarlyAccess: string = 'early_access';
  static OneTimeEntry: string = 'one_time_entry';
  static OpenToday: string = 'open_today';

  static isNew(machine: Machine): boolean {
    return MachineExtensions.hasLabel(machine, MachineExtensions.LabelNew);
  }

  static isVIPHighLimit(machine: Machine): boolean {
    return MachineExtensions.hasLabel(machine, MachineExtensions.VIPHighLimit);
  }

  static isVIPExclusive(machine: Machine): boolean {
    return MachineExtensions.hasLabel(machine, MachineExtensions.VIPExclusive);
  }

  static isVIPFreeSpins(machine: Machine): boolean {
    return MachineExtensions.hasLabel(machine, MachineExtensions.VIPFreeSpins);
  }

  static isWoFIcon(machine: Machine): boolean {
    return MachineExtensions.hasLabel(machine, MachineExtensions.WoFIcon);
  }

  static isEarlyAccess(machine: Machine): boolean {
    return MachineExtensions.hasLabel(machine, MachineExtensions.EarlyAccess);
  }

  static isOneTimeEntry(machine: Machine): boolean {
    return MachineExtensions.hasLabel(machine, MachineExtensions.OneTimeEntry);
  }

  static isHot(machine: Machine): boolean {
    return MachineExtensions.hasLabel(machine, MachineExtensions.LabelHot);
  }

  static isOpenToday(machine: Machine): boolean {
    return MachineExtensions.hasLabel(machine, MachineExtensions.OpenToday);
  }

  static isFeatured(machine: Machine): boolean {
    return MachineExtensions.hasLabel(machine, MachineExtensions.LabelFeatured);
  }

  static isComingSoon(machine: Machine): boolean {
    return MachineExtensions.hasLabel(machine, MachineExtensions.LabelComingSoon);
  }

  static isMaintenance(machine: Machine): boolean {
    return MachineExtensions.hasLabel(machine, MachineExtensions.LabelMaintenance);
  }

  static isSubscription(machine: Machine): boolean {
    return MachineExtensions.hasLabel(machine, MachineExtensions.LabelSubscription);
  }

  static isUpdateRequired(machine: Machine): boolean {
    return MachineExtensions.hasLabel(machine, MachineExtensions.LabelUpdateRequired);
  }

  static hasLabel(machine: Machine, label: string): boolean {
    return !!machine.labels?.includes(label);
  }

  static isEmpty(machine: Machine): boolean {
    return machine.id === 'empty';
  }

  static getSizeType(machine: Machine): string {
    return machine.sizeType && MachineExtensions.KnownTypes.has(machine.sizeType)
      ? machine.sizeType
      : '1x1';
  }

  static tryGetParamString(machine: Machine, parName: string, def: string): string {
    if (!machine.actionParams) {
      return def;
    }
    const pars = MachineExtensions.extractParameters(machine);
    if (!pars[parName]) {
      return def;
    }
    return pars[parName];
  }

  static extractParameters(machine: Machine): Record<string, string> {
    const pars: Record<string, string> = {};
    for (const par of machine.actionParams || []) {
      pars[par.key] = par.value;
    }
    return pars;
  }
}
