import { useState, useEffect } from "react";
import type { User, CreateUserRequest, UpdateUserRequest } from "../../types/users/user.types";
import type { Role } from "../../types/roles/role.types";
import { getRoles } from "../../services/roles.service";
import Label from "../form/Label";
import InputField from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox.tsx";
import Button from "../ui/button/Button.tsx";
import CheckboxSkeleton from "../animation/CheckboxSkeleton.tsx";

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

  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    setLoadingRoles(true);

    getRoles()
        .then((data) => setAllRoles(data))
        .catch(() => {})
        .finally(() => setLoadingRoles(false));
  }, []);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPassword("");
    setPasswordConfirmation("");
    setError(null);
    if (user?.roles && allRoles.length > 0) {
      const matched = allRoles.filter((r) => user.roles!.some(ur => ur.name === r.name)).map((r) => r.id);
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

          <div>
            <Label>Roles</Label>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
              {loadingRoles ? (
                  <CheckboxSkeleton items={3} />
              ) : allRoles.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-gray-400">
                    No hay roles registrados
                  </div>
              ) : (
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {allRoles.map((role) => (
                        <Checkbox
                            key={role.id}
                            label={role.name}
                            checked={selectedRoleIds.includes(role.id)}
                            onChange={() => toggleRole(role.id)}
                            size="md"
                        />
                    ))}
                  </div>
              )}
            </div>
          </div>

      {error && <p className="text-sm text-error-500">{error}</p>}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
        >
          Cancelar
        </Button>

        <Button
            type="submit"
            disabled={isSubmitting}
        >
          {isSubmitting
              ? "Guardando..."
              : user
                  ? "Actualizar"
                  : "Crear"}
        </Button>
      </div>
    </form>
  );
}
