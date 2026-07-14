import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useChangePassword } from '@/hooks/use-users'
import { PasswordField } from './PasswordField'

export function SecurityTab() {
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const changePasswordMutation = useChangePassword()

    const handleUpdate = () => {
        if (!oldPassword) return void toast.error('Please enter your current password')
        if (!newPassword) return void toast.error('Please enter a new password')
        if (newPassword.length < 8) return void toast.error('New password must be at least 8 characters')
        if (newPassword !== confirmPassword) return void toast.error('New password and confirmation do not match')

        changePasswordMutation.mutate(
            { old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword },
            {
                onSuccess: () => {
                    toast.success('Password updated successfully')
                    setOldPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                },
                onError: (error: any) => toast.error(error.message || 'Failed to update password'),
            },
        )
    }

    return (
        <div className="flex flex-col items-center gap-4 w-full pb-4 flex-1">
            <div className="flex flex-col gap-4 w-full max-w-2xl mt-8">
                <PasswordField label="Current Password" value={oldPassword} onChange={setOldPassword} />
                <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} />
                <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} />
                <div className="mt-8">
                    <Button variant="default" className="w-full" onClick={handleUpdate} disabled={changePasswordMutation.isPending}>
                        {changePasswordMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Update Password
                    </Button>
                </div>
            </div>
        </div>
    )
}
