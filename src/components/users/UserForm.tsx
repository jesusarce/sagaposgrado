import { useState, useEffect } from "react";
import type { User, CreateUserRequest, UpdateUserRequest } from "../../types/users/user.types";
import type { Role } from "../../types/roles/role.types";
import { getRoles } from "../../services/roles.service";
import Label from "../form/Label";
import InputField from "../form/input/InputField";

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  onCancel: () => void;
}

export default function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRoles().then(setAllRoles).catch(() => {});
  }, []);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPassword("");
    setPasswordConfirmation("");
    setError(null);
    if (user?.roles && allRoles.length > 0) {
      const matched = allRoles.filter((r) => user.roles!.includes(r.name)).map((r) => r.id);
      setSelectedRoleIds(matched);
    } else {
      setSelectedRoleIds([]);
    }
  }, [user, allRoles]);

  function toggleRole(id: number) {
    setSelectedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Nombre y correo son requeridos");
      return;
    }
    if (!user && !password) {
      setError("La contraseña es requerida para crear un usuario");
      return;
    }
    if (password && password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      if (user) {
        const payload: UpdateUserRequest = { id: user.id, name: name.trim(), email: email.trim(), roles: selectedRoleIds };
        if (password) {
          payload.password = password;
          payload.password_confirmation = passwordConfirmation;
        }
        await onSubmit(payload);
      } else {
        await onSubmit({
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
          roles: selectedRoleIds,
        });
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? "Error al guardar el usuario");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nombre <span className="text-error-500">*</span></Label>
        <InputField value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" />
      </div>
      <div>
        <Label>Correo electrónico <span className="text-error-500">*</span></Label>
        <InputField type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
      </div>
      <div>
        <Label>
          Contraseña{!user && <span className="text-error-500"> *</span>}
          {user && <span className="text-xs text-gray-400 ml-1">(dejar en blanco para no cambiar)</span>}
        </Label>
        <InputField type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <div>
        <Label>Confirmar contraseña</Label>
        <InputField type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} placeholder="••••••••" />
      </div>
      {allRoles.length > 0 && (
        <div>
          <Label>Roles</Label>
          <div className="mt-1 flex flex-wrap gap-3">
            {allRoles.map((role) => (
              <label key={role.id} className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                {role.name}
              </label>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-sm text-error-500">{error}</p>}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : user ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}
