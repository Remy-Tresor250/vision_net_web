"use client";

export type PermissionAction = "view" | "create" | "edit" | "delete";

const VIEW_IMPLYING_ACTIONS = new Set<PermissionAction>(["create", "edit", "delete"]);

function parsePermission(permission: string) {
  const [resource, action] = permission.split(".");

  if (!resource || !action) {
    return null;
  }

  return {
    action: action as PermissionAction,
    resource,
  };
}

export function expandPermissions(permissions: string[] | null | undefined) {
  const normalized = new Set<string>();

  for (const permission of permissions ?? []) {
    if (!permission) {
      continue;
    }

    normalized.add(permission);

    const parsed = parsePermission(permission);

    if (!parsed) {
      continue;
    }

    if (VIEW_IMPLYING_ACTIONS.has(parsed.action)) {
      normalized.add(`${parsed.resource}.view`);
    }
  }

  return [...normalized];
}

export function hasPermission(
  permissions: string[] | null | undefined,
  requiredPermission: string,
) {
  return expandPermissions(permissions).includes(requiredPermission);
}

export function hasAnyPermission(
  permissions: string[] | null | undefined,
  requiredPermissions: string[],
) {
  if (!requiredPermissions.length) {
    return true;
  }

  const resolved = new Set(expandPermissions(permissions));

  return requiredPermissions.some((permission) => resolved.has(permission));
}
