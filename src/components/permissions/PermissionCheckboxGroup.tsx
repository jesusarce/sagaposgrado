import type { PermissionGroup } from "../../types/permissions/permission.types";

interface PermissionCheckboxGroupProps {
  groups: PermissionGroup[];
  selected: number[];
  onChange: (ids: number[]) => void;
}

export default function PermissionCheckboxGroup({
  groups,
  selected,
  onChange,
}: PermissionCheckboxGroupProps) {
  function toggle(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  function toggleGroup(groupPermissionIds: number[]) {
    const allSelected = groupPermissionIds.every((id) => selected.includes(id));
    if (allSelected) {
      onChange(selected.filter((s) => !groupPermissionIds.includes(s)));
    } else {
      const newSelected = [...selected];
      groupPermissionIds.forEach((id) => {
        if (!newSelected.includes(id)) newSelected.push(id);
      });
      onChange(newSelected);
    }
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const groupIds = group.permissions.map((p) => p.id);
        const allChecked = groupIds.every((id) => selected.includes(id));
        const someChecked = groupIds.some((id) => selected.includes(id));

        return (
          <div key={group.group} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allChecked}
                ref={(el) => {
                  if (el) el.indeterminate = !allChecked && someChecked;
                }}
                onChange={() => toggleGroup(groupIds)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                {group.group}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {group.permissions.map((perm) => (
                <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(perm.id)}
                    onChange={() => toggle(perm.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {perm.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
