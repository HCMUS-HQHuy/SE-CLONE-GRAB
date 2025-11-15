import React, { useState } from 'react';
import { XIcon } from './Icons';

// FIX: Define explicit types for permissions to avoid index signature errors.
type PermissionSet = { view: boolean; create: boolean; edit: boolean; delete: boolean; };
type PermissionsMap = { [module: string]: PermissionSet };

type Role = {
  name: string;
  permissions: PermissionsMap;
};

type RoleEditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Role) => void;
  roleToEdit: Role | null;
};

const modules = ['Người dùng', 'Nhà hàng', 'Tài xế', 'Đơn hàng', 'Báo cáo'];
// FIX: Type the permissions array to ensure type safety when used as keys.
const permissions: (keyof PermissionSet)[] = ['view', 'create', 'edit', 'delete'];
const permissionLabels: { [key: string]: string } = { view: 'Xem', create: 'Tạo', edit: 'Sửa', delete: 'Xóa' };

const RoleEditorModal: React.FC<RoleEditorModalProps> = ({ isOpen, onClose, onSave, roleToEdit }) => {
  const [roleName, setRoleName] = useState(roleToEdit?.name || '');
  // FIX: Explicitly type the state and cast the initial value of the reducer to fix type inference. This resolves the "no index signature" error.
  const [perms, setPerms] = useState<PermissionsMap>(
    roleToEdit?.permissions ||
    modules.reduce((acc, module) => ({
      ...acc,
      [module]: { view: false, create: false, edit: false, delete: false }
    }), {} as PermissionsMap)
  );

  if (!isOpen) return null;

  // FIX: Improve type safety in the state update function and use non-null assertion as we can guarantee modulePerms exists.
  const handlePermissionChange = (module: string, permission: keyof PermissionSet) => {
    setPerms(prev => {
      const modulePerms = prev[module]!;
      return {
        ...prev,
        [module]: {
          ...modulePerms,
          [permission]: !modulePerms[permission]
        }
      };
    });
  };

  const handleSave = () => {
    // onSave({ name: roleName, permissions: perms });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-800 mb-4">{roleToEdit ? 'Chỉnh sửa vai trò' : 'Tạo vai trò mới'}</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XIcon className="h-6 w-6" /></button>
        
        <div className="flex-grow overflow-y-auto pr-2">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Tên vai trò</label>
                <input type="text" value={roleName} onChange={e => setRoleName(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2"/>
            </div>
            
            <h3 className="font-semibold text-gray-800 mb-2">Ma trận phân quyền</h3>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                            {permissions.map(p => <th key={p} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">{permissionLabels[p]}</th>)}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {modules.map(module => (
                            <tr key={module}>
                                <td className="px-6 py-4 font-medium text-gray-900">{module}</td>
                                {permissions.map(p => (
                                    <td key={p} className="px-6 py-4 text-center">
                                        <input type="checkbox" className="h-4 w-4 text-orange-600 border-gray-300 rounded"
                                            // FIX: Use optional chaining and correctly typed keys, removing the need for casting. This resolves the "no index signature" error.
                                            checked={perms[module]?.[p] || false}
                                            onChange={() => handlePermissionChange(module, p)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="pt-4 mt-4 border-t flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md">Hủy</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md">Lưu vai trò</button>
        </div>
      </div>
    </div>
  );
};

export default RoleEditorModal;
