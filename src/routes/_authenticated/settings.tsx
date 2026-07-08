import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState, useRef } from 'react'
import { toast } from 'sonner'
import { Lock, EyeOff, Eye, User, Building, Briefcase, MapPin, Mail, Edit, Loader2, X, SlidersHorizontal } from 'lucide-react'
import JoditEditor from 'jodit-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/sections/page-header'
import { Field, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput, InputGroupButton } from '@/components/ui/input-group'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import imgProfile3D from '@/assets/profile_dummy.png'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import { staticContentApi } from '@/lib/settings'
import { useProfile, useUpdateProfile, useChangePassword } from '@/hooks/use-users'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_authenticated/settings')({
    component: SettingsPage,
})
interface PasswordFieldProps {
    label: string
    value: string
    onChange: (val: string) => void
    placeholder?: string
}

function PasswordField({ label, value, onChange, placeholder = '••••••••' }: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <InputGroup className="rounded-full bg-muted/50 border-transparent focus-within:ring-primary/20">
                <InputGroupAddon align="inline-start">
                    <InputGroupText>
                        <Lock className="size-5" />
                    </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                    type={showPassword ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </Field>
    )
}

function SecurityTab() {
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const changePasswordMutation = useChangePassword()

    const handleUpdate = () => {
        if (!oldPassword) {
            toast.error('Please enter your current password')
            return
        }
        if (!newPassword) {
            toast.error('Please enter a new password')
            return
        }
        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters')
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error('New password and confirmation password do not match')
            return
        }

        changePasswordMutation.mutate(
            {
                old_password: oldPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            },
            {
                onSuccess: () => {
                    toast.success('Password updated successfully')
                    setOldPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                },
                onError: (error: any) => {
                    toast.error(error.message || 'Failed to update password')
                },
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

function TermsAndConditionsTab() {
    const queryClient = useQueryClient()
    const [content, setContent] = useState<string>('')
    const [isInitialized, setIsInitialized] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    const { data, isLoading, error } = useQuery({
        queryKey: ['static-content', 'terms-and-conditions'],
        queryFn: () => staticContentApi.get('terms-and-conditions'),
    })

    const updateContent = useMutation({
        mutationFn: () =>
            staticContentApi.update('terms-and-conditions', {
                slug: data?.slug || 'terms-and-conditions',
                title: data?.title || 'Terms and Conditions',
                content: content,
            }),

        onSuccess: () => {
            toast.success('Terms & Conditions updated successfully')
            setIsEditing(false)

            queryClient.invalidateQueries({
                queryKey: ['static-content', 'terms-and-conditions'],
            })
        },

        onError: () => {
            toast.error('Failed to update Terms & Conditions')
        },
    })

    useEffect(() => {
        if (!isLoading) {
            setContent(data?.content ?? '')
            setIsInitialized(true)
        }
    }, [data, isLoading])

    const handleCancel = () => {
        if (data) {
            setContent(data.content ?? '')
        }
        setIsEditing(false)
    }

    const config = useMemo(
        () => ({
            height: 512,
            readonly: !isEditing,
            buttons: [
                'bold',
                'italic',
                'underline',
                'strike',
                'subscript',
                'superscript',
                '|',
                'font',
                'fontsize',
                'paragraph',
                '|',
                'align',
                'ul',
                'ol',
                'outdent',
                'indent',
                '|',
                'table',
                'hr',
                'link',
                '|',
                'undo',
                'redo',
            ],
            placeholder: 'Start typing...',
        }),
        [isEditing],
    )

    if (isLoading || !isInitialized) {
        return (
            <div className="flex flex-col justify-center items-center h-96 gap-4 text-muted-foreground">
                <Loader2 className="size-8 animate-spin" />
                <p>Loading Terms & Conditions...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-96">
                <p className="text-destructive font-medium">Error loading Terms & Conditions</p>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col gap-6 w-full mt-4">
            <div className="rounded-xl overflow-hidden border shadow-sm">
                <JoditEditor config={config} value={content} onChange={(value) => setContent(value)} />
            </div>

            <div className="flex flex-col gap-4 mt-2">
                <p className="text-sm font-medium text-foreground">Last updated: June 8, 2026 by Dianne Plummer.</p>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    {!isEditing ? (
                        <>
                            <Button
                                size="lg"
                                variant="secondary"
                                className="flex-1 rounded-full text-base h-12 bg-muted/50 hover:bg-muted shadow-none border"
                                onClick={() => setIsPreviewOpen(true)}
                            >
                                Preview
                            </Button>
                            <Button
                                size="lg"
                                variant="default"
                                className="flex-1 rounded-full text-base h-12"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex-1 rounded-full text-base h-12"
                                onClick={handleCancel}
                                disabled={updateContent.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="lg"
                                variant="default"
                                disabled={updateContent.isPending}
                                onClick={() => updateContent.mutate()}
                                className="flex-1 rounded-full text-base h-12"
                            >
                                {updateContent.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent
                    showCloseButton={false}
                    className="sm:max-w-5xl w-[92vw] h-[85vh] overflow-hidden flex flex-col p-0 rounded-3xl border-none shadow-2xl bg-slate-900 text-white outline-none"
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 text-primary p-2 rounded-xl">
                                <SlidersHorizontal className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold tracking-tight text-white">
                                    Terms & Conditions Preview
                                </DialogTitle>
                                <p className="text-xs text-white/50">Draft Version (Live View)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20 border-none font-semibold px-3 py-1 rounded-full text-xs">
                                Ready to Publish
                            </Badge>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                onClick={() => setIsPreviewOpen(false)}
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-900/60 p-6 md:p-10 overflow-y-auto flex justify-center">
                        <div className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-100 p-8 md:p-16 min-h-[60vh] h-fit relative">
                            <div className="w-12 h-1 bg-primary rounded-full mx-auto mb-8" />
                            <div className="prose prose-slate lg:prose-base max-w-none leading-relaxed text-slate-800">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            content || '<p className="text-muted-foreground italic text-center">No content available.</p>',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function PrivacyPolicyTab() {
    const queryClient = useQueryClient()
    const [content, setContent] = useState<string>('')
    const [isInitialized, setIsInitialized] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    const { data, isLoading, error } = useQuery({
        queryKey: ['static-content', 'privacy-policy'],
        queryFn: () => staticContentApi.get('privacy-policy'),
    })

    const updateContent = useMutation({
        mutationFn: () =>
            staticContentApi.update('privacy-policy', {
                slug: data?.slug || 'privacy-policy',
                title: data?.title || 'Privacy Policy',
                content: content,
            }),

        onSuccess: () => {
            toast.success('Privacy Policy updated successfully')
            setIsEditing(false)

            queryClient.invalidateQueries({
                queryKey: ['static-content', 'privacy-policy'],
            })
        },

        onError: () => {
            toast.error('Failed to update Privacy Policy')
        },
    })

    useEffect(() => {
        if (!isLoading) {
            setContent(data?.content ?? '')
            setIsInitialized(true)
        }
    }, [data, isLoading])

    const handleCancel = () => {
        if (data) {
            setContent(data.content ?? '')
        }
        setIsEditing(false)
    }

    const config = useMemo(
        () => ({
            height: 512,
            readonly: !isEditing,
            buttons: [
                'bold',
                'italic',
                'underline',
                'strike',
                'subscript',
                'superscript',
                '|',
                'font',
                'fontsize',
                'paragraph',
                '|',
                'align',
                'ul',
                'ol',
                'outdent',
                'indent',
                '|',
                'table',
                'hr',
                'link',
                '|',
                'undo',
                'redo',
            ],
            placeholder: 'Start typing...',
        }),
        [isEditing],
    )

    if (isLoading || !isInitialized) {
        return (
            <div className="flex flex-col justify-center items-center h-96 gap-4 text-muted-foreground">
                <Loader2 className="size-8 animate-spin" />
                <p>Loading Privacy Policy...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-96">
                <p className="text-destructive font-medium">Error loading Privacy Policy</p>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col gap-6 w-full mt-4">
            <div className="rounded-xl overflow-hidden border shadow-sm">
                <JoditEditor config={config} value={content} onChange={(value) => setContent(value)} />
            </div>

            <div className="flex flex-col gap-4 mt-2">
                <p className="text-sm font-medium text-foreground">Last updated: June 8, 2026 by Dianne Plummer.</p>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    {!isEditing ? (
                        <>
                            <Button
                                size="lg"
                                variant="secondary"
                                className="flex-1 rounded-full text-base h-12 bg-muted/50 hover:bg-muted shadow-none border"
                                onClick={() => setIsPreviewOpen(true)}
                            >
                                Preview
                            </Button>
                            <Button
                                size="lg"
                                variant="default"
                                className="flex-1 rounded-full text-base h-12"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex-1 rounded-full text-base h-12"
                                onClick={handleCancel}
                                disabled={updateContent.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="lg"
                                variant="default"
                                disabled={updateContent.isPending}
                                onClick={() => updateContent.mutate()}
                                className="flex-1 rounded-full text-base h-12"
                            >
                                {updateContent.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent
                    showCloseButton={false}
                    className="sm:max-w-5xl w-[92vw] h-[85vh] overflow-hidden flex flex-col p-0 rounded-3xl border-none shadow-2xl bg-slate-900 text-white outline-none"
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 text-primary p-2 rounded-xl">
                                <SlidersHorizontal className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold tracking-tight text-white">Privacy Policy Preview</DialogTitle>
                                <p className="text-xs text-white/50">Draft Version (Live View)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20 border-none font-semibold px-3 py-1 rounded-full text-xs">
                                Ready to Publish
                            </Badge>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                onClick={() => setIsPreviewOpen(false)}
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-900/60 p-6 md:p-10 overflow-y-auto flex justify-center">
                        <div className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-100 p-8 md:p-16 min-h-[60vh] h-fit relative">
                            <div className="w-12 h-1 bg-primary rounded-full mx-auto mb-8" />
                            <div className="prose prose-slate lg:prose-base max-w-none leading-relaxed text-slate-800">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            content || '<p className="text-muted-foreground italic text-center">No content available.</p>',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

interface FormInputProps {
    label: string
    icon: React.ElementType
    defaultValue?: string
    name?: string
    disabled?: boolean
    type?: string
}

function FormInput({ label, icon: Icon, defaultValue, name, disabled, type = 'text' }: FormInputProps) {
    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <InputGroup
                className={`rounded-full bg-muted/50 border-transparent focus-within:ring-primary/20 ${disabled ? 'opacity-70 pointer-events-none' : ''}`}
            >
                <InputGroupAddon align="inline-start">
                    <InputGroupText>
                        <Icon className="size-5" />
                    </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput type={type} name={name} defaultValue={defaultValue} disabled={disabled} className="font-medium" />
            </InputGroup>
        </Field>
    )
}

function ProfileTab() {
    const { data: user, isLoading } = useProfile()
    const updateMutation = useUpdateProfile()
    const [isEditing, setIsEditing] = useState(false)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
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

        const dataObj: any = {
            full_name: formData.get('full_name') as string,
        }

        let payload: any = dataObj
        if (selectedImage) {
            payload = new FormData()
            payload.append('full_name', dataObj.full_name)
            payload.append('profile_photo', selectedImage)
        }

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
            <div className="flex flex-col justify-center items-center h-96 gap-4 text-muted-foreground w-full">
                <Loader2 className="size-8 animate-spin" />
                <p>Loading Profile...</p>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col items-center flex-1">
            <div className="flex flex-col items-center gap-8 md:gap-10 w-full mt-4">
                {/* Avatar */}
                <div className="flex justify-center relative">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Avatar className="size-32 md:size-36 ring-4 ring-white shadow-sm">
                            <AvatarImage
                                src={previewUrl || user?.avatar || imgProfile3D}
                                alt="Profile Picture"
                                className="group-hover:scale-105 transition-transform duration-500 object-cover"
                            />
                            <AvatarFallback>{user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                        {/* Edit button */}
                        <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground size-10 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white group-hover:scale-110 transition-transform">
                            <Edit className="size-4" />
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                    </div>
                </div>

                {/* Form rows */}
                <form key={user?.email || 'loading'} onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-4xl">
                    {/* Row 1: Full Name + Organization */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                        <FormInput
                            label="Full Name"
                            name="full_name"
                            defaultValue={user?.full_name || ''}
                            icon={User}
                            disabled={!isEditing}
                        />
                        <FormInput label="Organization" defaultValue={'Stem Spark Solutions'} icon={Building} disabled />
                    </div>

                    {/* Row 2: Role + Licensed Territory */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                        <FormInput label="Role" defaultValue={user?.role || 'user'} icon={Briefcase} disabled />
                        <FormInput label="Licensed Territory" defaultValue={'Jamaica'} icon={MapPin} disabled />
                    </div>

                    {/* Email */}
                    <div className="w-full">
                        <FormInput label="Email" defaultValue={user?.email || ''} icon={Mail} disabled />
                    </div>

                    {/* Buttons */}
                    <div className="mt-4 w-full flex flex-col sm:flex-row gap-4">
                        {!isEditing ? (
                            <Button size="lg" className="w-full" type="button" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:flex-1"
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={updateMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button size="lg" className="w-full sm:flex-1" type="submit" disabled={updateMutation.isPending}>
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

function SettingsPage() {
    return (
        <>
            <PageHeader title="Settings" description="Manage your account & apps." lastUpdated="05:41:15 PM" />

            <Tabs defaultValue="profile" className="flex-1 flex flex-col w-full min-h-0">
                <TabsList className="inline-flex w-fit h-10 md:h-12 bg-muted p-1.5 rounded-full overflow-x-auto justify-start border-0">
                    <TabsTrigger
                        value="profile"
                        className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
                    >
                        My Profile
                    </TabsTrigger>
                    <TabsTrigger
                        value="security"
                        className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
                    >
                        Security
                    </TabsTrigger>
                    <TabsTrigger
                        value="privacy-policy"
                        className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
                    >
                        Privacy Policy
                    </TabsTrigger>
                    <TabsTrigger
                        value="terms-and-conditions"
                        className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
                    >
                        Terms & Conditions
                    </TabsTrigger>
                </TabsList>

                <div className="mt-2 flex-1 bg-white rounded-[12px] p-6 md:p-10 flex flex-col shadow-sm min-h-0 overflow-y-auto">
                    <TabsContent value="profile" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col">
                        <ProfileTab />
                    </TabsContent>
                    <TabsContent value="security" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col">
                        <SecurityTab />
                    </TabsContent>
                    <TabsContent value="privacy-policy" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col">
                        <PrivacyPolicyTab />
                    </TabsContent>
                    <TabsContent
                        value="terms-and-conditions"
                        className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col"
                    >
                        <TermsAndConditionsTab />
                    </TabsContent>
                </div>
            </Tabs>
        </>
    )
}
