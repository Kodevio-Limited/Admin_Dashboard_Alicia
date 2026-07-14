import { useState, useRef } from 'react'
import { User, Building, Briefcase, MapPin, Mail, Edit, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useProfile, useUpdateProfile } from '@/hooks/use-users'
import { resolveImage } from '@/lib/utils'
import { FormInput } from './FormInput'
import imgProfile3D from '@/assets/profile_dummy.png'

export function ProfileTab() {
    const { data: user, isLoading } = useProfile()
    const updateMutation = useUpdateProfile()
    const [isEditing, setIsEditing] = useState(false)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            setPreviewUrl(URL.createObjectURL(file))
            setIsEditing(true)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setSelectedImage(null)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const payload = new FormData()

        const fullName = formData.get('full_name') as string
        if (fullName) payload.append('full_name', fullName)
        if (selectedImage) payload.append('profile_photo', selectedImage)

        updateMutation.mutate(payload, {
            onSuccess: () => {
                toast.success('Profile changes saved')
                setIsEditing(false)
                setSelectedImage(null)
            },
            onError: (err) => toast.error(err.message || 'Failed to update profile'),
        })
    }

    if (isLoading || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4 text-muted-foreground w-full">
                <Loader2 className="size-8 animate-spin" />
                <p>Loading Profile...</p>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col items-center flex-1">
            <div className="flex flex-col items-center gap-8 md:gap-10 w-full mt-4">
                <div className="flex justify-center relative">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Avatar className="size-32 md:size-36 ring-4 ring-white shadow-sm">
                            <AvatarImage
                                src={previewUrl || (user?.profile_photo ? resolveImage(user.profile_photo) : imgProfile3D)}
                                alt="Profile Picture"
                                className="group-hover:scale-105 transition-transform duration-500 object-cover"
                            />
                            <AvatarFallback>{user?.full_name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground size-10 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white group-hover:scale-110 transition-transform">
                            <Edit className="size-4" />
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-4xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                        <FormInput label="Full Name" name="full_name" defaultValue={user?.full_name || ''} icon={User} disabled={!isEditing} />
                        <FormInput label="Organization" defaultValue="Stem Spark Solutions" icon={Building} disabled />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                        <FormInput label="Role" defaultValue={user?.role || 'user'} icon={Briefcase} disabled />
                        <FormInput label="Licensed Territory" defaultValue="Jamaica" icon={MapPin} disabled />
                    </div>
                    <FormInput label="Email" defaultValue={user?.email || ''} icon={Mail} disabled />

                    <div className="mt-4 w-full flex gap-4">
                        {!isEditing ? (
                            <Button size="lg" className="w-full" type="button" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button size="lg" variant="outline" className="flex-1" type="button" onClick={handleCancel} disabled={updateMutation.isPending}>
                                    Cancel
                                </Button>
                                <Button size="lg" className="flex-1" type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
